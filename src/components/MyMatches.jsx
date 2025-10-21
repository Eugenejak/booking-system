import { useEffect, useState } from "react";
import { collection, getDocs, query, where, or, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function MyMatches({ currentUser }) {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!currentUser) return;

        const fetchMyMatches = async () => {
            setLoading(true);
            setError("");

            try {
                // 1️⃣ Get all confirmed matches where the user is either the creator or accepter
                const q = query(
                    collection(db, "bookings"),
                    or(
                        where("creator_id", "==", currentUser.uid),
                        where("accepter_id", "==", currentUser.uid)
                    )
                );

                const snapshot = await getDocs(q);
                const matchesList = [];

                // 2️⃣ For each booking, also get its linked matchRequest data
                for (const matchDoc of snapshot.docs) {
                    const matchData = matchDoc.data();

                    let matchRequestData = null;
                    if (matchData.match_request_id) {
                        try {
                            const matchRequestRef = doc(db, "matchRequests", matchData.match_request_id);
                            const matchRequestSnap = await getDoc(matchRequestRef);
                            if (matchRequestSnap.exists()) {
                                matchRequestData = matchRequestSnap.data();
                            }
                        } catch (error) {
                            console.warn("Could not load match request for:", matchDoc.id, error);
                        }
                    }

                    matchesList.push({
                        id: matchDoc.id,
                        ...matchData,
                        matchRequest: matchRequestData, // link added here
                    });
                }

                // 3️⃣ Sort newest first
                matchesList.sort((a, b) => {
                    if (!a.created_at || !b.created_at) return 0;
                    return b.created_at.seconds - a.created_at.seconds;
                });

                setMatches(matchesList);
            } catch (err) {
                console.error("Error loading matches:", err);
                setError("Failed to load your matches.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyMatches();
    }, [currentUser]);

    // Loading and error handling
    if (loading) {
        return (
            <div className="text-center mt-4">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger mt-3">{error}</div>;
    }

    if (!currentUser) {
        return (
            <div className="alert alert-warning mt-3">
                Please log in to view your matches.
            </div>
        );
    }

    // UI Rendering
    return (
        <div className="container mt-4">
            <h3>My Matches</h3>

            {matches.length === 0 ? (
                <div className="alert alert-info mt-3">
                    You don’t have any confirmed matches yet.
                </div>
            ) : (
                <div className="row">
                    {matches.map((match) => (
                        <div key={match.id} className="col-md-6 col-lg-4 mb-3">
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">
                                        {match.matchRequest?.sport || match.sport_type}
                                    </h5>

                                    {/* Match Request Details */}
                                    {match.matchRequest && (
                                        <>
                                            <p className="card-text">
                                                <strong>Date:</strong> {match.matchRequest.date || "TBA"}
                                            </p>
                                            <p className="card-text">
                                                <strong>Time:</strong>{" "}
                                                {match.matchRequest.start_time
                                                    ? `${match.matchRequest.start_time} - ${match.matchRequest.end_time}`
                                                    : "Flexible"}
                                            </p>
                                            {match.matchRequest.note && (
                                                <p className="card-text">
                                                    <strong>Note:</strong> {match.matchRequest.note}
                                                </p>
                                            )}
                                        </>
                                    )}

                                    {/* Basic Info */}
                                    <p className="card-text">
                                        <strong>Status:</strong> {match.status}
                                    </p>

                                    <p className="card-text">
                                        <strong>Creator:</strong>{" "}
                                        {match.creator_id === currentUser.uid ? "You" : match.creator_id}
                                    </p>

                                    <p className="card-text">
                                        <strong>Opponent:</strong>{" "}
                                        {match.accepter_id === currentUser.uid
                                            ? match.creator_id
                                            : match.accepter_id}
                                    </p>

                                    <p className="card-text">
                                        <small className="text-muted">
                                            Created on{" "}
                                            {match.created_at
                                                ? new Date(match.created_at.seconds * 1000).toLocaleString()
                                                : "N/A"}
                                        </small>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
