import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    orderBy
} from "firebase/firestore";

export default function MatchRequestsList({ currentUser }) {
    const [matchRequests, setMatchRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!currentUser) return;

        // Reference to Firestore collection
        const matchRequestsRef = collection(db, "matchRequests");

        // Build query based on filter
        let q;
        if (filter === "all") {
            q = query(
                matchRequestsRef,
                where("status", "==", "open"),
                orderBy("created_at", "desc")
            );
        } else {
            q = query(
                matchRequestsRef,
                where("status", "==", "open"),
                where("sport", "==", filter),
                orderBy("created_at", "desc")
            );
        }

        // Listen to data changes in real time
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const requests = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();

                    // Don’t show your own requests
                    if (data.created_by !== currentUser.uid) {
                        requests.push({
                            id: doc.id,
                            ...data
                        });
                    }
                });

                setMatchRequests(requests);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching match requests:", error);
                setMessage("❌ Failed to load match requests");
                setLoading(false);
            }
        );

        // Stop listening when component unmounts
        return () => unsubscribe();
    }, [filter, currentUser]);

    // Accept match function
    const handleAcceptMatch = async (request) => {
        if (!currentUser?.uid) {
            setMessage("❌ You must be logged in to accept a match.");
            return;
        }

        try {
            console.log("Creating booking...");
            // Create a booking document
            const bookingRef = await addDoc(collection(db, "bookings"), {
                creator_id: request.created_by,
                accepter_id: currentUser.uid,
                match_request_id: request.id,
                sport_type: request.sport,
                status: "confirmed",
                created_at: serverTimestamp(),
            });
            console.log("Updating booking...");
            const sortedIds = [request.created_by, currentUser.uid].sort();
            let chatChannelId = `${sortedIds[0]}_${sortedIds[1]}`;

            // Verify it's under 64 characters
            if (chatChannelId.length > 64) {
                console.error("Channel ID too long:", chatChannelId.length);

                const id1 = sortedIds[0].substring(0, 30);
                const id2 = sortedIds[1].substring(0, 30);
                chatChannelId = `${id1}_${id2}`;
            }
            // Update the match request to "accepted"
            await updateDoc(bookingRef, { chat_channel_id: chatChannelId });
            console.log("Updating matchRequest...");

            const matchRequestRef = doc(db, "matchRequests", request.id);
            console.log("Updating matchRequest at path:", matchRequestRef.path);
            console.log("Current user UID:", currentUser.uid);

            await updateDoc(matchRequestRef, {
                status: "accepted",
                chat_channel_id: chatChannelId,
                accepted_by: currentUser.uid,
            });

            setMessage("✅ Match accepted!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error accepting match:", error);
            setMessage("❌ Failed to accept match. Please try again.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Flexible";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const formatTime = (time) => {
        if (!time) return null;
        return time.slice(0, 5);
    };

    return (
        <div className="find-match-container">
            <h3 className="section-title mb-4">Find a Match</h3>

            <div className="d-flex justify-content-center gap-2 mb-4 flex-wrap">
                {["all", "Badminton", "Futsal"].map((type) => (
                    <button
                        key={type}
                        className={`btn ${filter === type ? "btn-filter-active" : "btn-filter"
                            }`}
                        onClick={() => setFilter(type)}
                    >
                        {type === "all" ? "All Sports" : type}
                    </button>
                ))}
            </div>

            {message && (
                <div
                    className={`alert ${message.includes("✅") ? "alert-success" : "alert-danger"
                        } text-center fw-semibold`}
                >
                    {message}
                </div>
            )}

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : matchRequests.length === 0 ? (
                <div className="alert alert-info text-center no-match-alert">
                    No open match requests now. Check back later!
                </div>
            ) : (
                <div className="row g-4">
                    {matchRequests.map((request) => (
                        <div key={request.id} className="col-md-6 col-lg-4">
                            <div className="card match-card h-100">
                                <div className="card-body">
                                    <h5 className="card-title text-accent">
                                        {request.sport}
                                        <span className="badge bg-success ms-2">Open</span>
                                    </h5>

                                    <p className="card-text mb-1">
                                        <strong>Date:</strong> {formatDate(request.date)}
                                    </p>

                                    {request.start_time && (
                                        <p className="card-text mb-1">
                                            <strong>Time:</strong>{" "}
                                            {formatTime(request.start_time)} – {formatTime(request.end_time)}
                                        </p>
                                    )}

                                    {request.note && (
                                        <p className="card-text">
                                            <strong>Note:</strong> {request.note}
                                        </p>
                                    )}

                                    <button
                                        className="btn btn-accept w-100 mt-3"
                                        onClick={() => handleAcceptMatch(request)}
                                    >
                                        Accept Match
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
