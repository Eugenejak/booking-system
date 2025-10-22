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
    const [filter, setFilter] = useState("all"); // "all", "Badminton", "Futsal"

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
            // Create a booking document
            const bookingRef = await addDoc(collection(db, "bookings"), {
                creator_id: request.created_by,
                accepter_id: currentUser.uid,
                match_request_id: request.id,
                sport_type: request.sport,
                status: "confirmed",
                created_at: serverTimestamp(),
            });
            const chatChannelId = `match_${bookingRef.id.slice(0, 10)}`;

            // Update the match request to "accepted"
            await updateDoc(bookingRef, { chat_channel_id: chatChannelId });

            await updateDoc(doc(db, "matchRequests", request.id), {
                status: "accepted",
                chat_channel_id: chatChannelId
            });

            setMessage("✅ Match accepted!");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error accepting match:", error);
            setMessage("❌ Failed to accept match. Please try again.");
        }
    };

    // Format date nicely
    const formatDate = (dateString) => {
        if (!dateString) return "Flexible";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    // Format time like "19:00"
    const formatTime = (time) => {
        if (!time) return null;
        return time.slice(0, 5);
    };

    return (
        <div className="container mt-4">
            <h3>Find a Match</h3>

            {/* Filter Buttons */}
            <div className="btn-group mb-3">
                <button
                    className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilter("all")}
                >
                    All Sports
                </button>
                <button
                    className={`btn ${filter === "Badminton" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilter("Badminton")}
                >
                    Badminton
                </button>
                <button
                    className={`btn ${filter === "Futsal" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilter("Futsal")}
                >
                    Futsal
                </button>
            </div>

            {/* Message Display */}
            {message && (
                <div className={`alert ${message.includes("✅") ? "alert-success" : "alert-danger"}`}>
                    {message}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : matchRequests.length === 0 ? (
                <div className="alert alert-info">No open match requests now. Check back later!</div>
            ) : (
                <div className="row">
                    {matchRequests.map((request) => (
                        <div key={request.id} className="col-md-6 col-lg-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {request.sport}{" "}
                                        <span className="badge bg-success ms-2">Open</span>
                                    </h5>

                                    <p className="card-text">
                                        <strong>Date:</strong> {formatDate(request.date)}
                                    </p>

                                    {request.start_time && (
                                        <p className="card-text">
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
                                        className="btn btn-primary w-100"
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
