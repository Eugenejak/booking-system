import { useEffect, useState } from "react";
import { and, collection, doc, getDoc, getDocs, or, query, updateDoc, where } from "firebase/firestore";
import { db } from "../firebase";
import { connectStreamChat } from "../utilities/streamChat";

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
                // Get all confirmed matches where the user is creator or accepter
                const q = query(
                    collection(db, "bookings"),
                    and(
                        or(
                            where("creator_id", "==", currentUser.uid),
                            where("accepter_id", "==", currentUser.uid)
                        ),
                        where("status", "==", "confirmed")
                    )
                );

                const snapshot = await getDocs(q);
                const matchesList = [];

                // Get its linked matchRequest data for each booking
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

                // Sort newest first
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

    // Loading
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

    const handleCancelMatch = async (matchId) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this match?");
        if (!confirmCancel) return;

        try {
            const bookingRef = doc(db, "bookings", matchId);
            await updateDoc(bookingRef, {
                status: "cancelled",
            });

            alert("❌ Match cancelled successfully!");

            setMatches((prev) => prev.filter((m) => m.id !== matchId));
        } catch (error) {
            console.error("Error cancelling match:", error);
            alert("Failed to cancel match. Please try again");
        }
    };

    const createValidChannelId = (creatorId, accepterId) => {
        const sortedIds = [creatorId, accepterId].sort();
        let channelId = `${sortedIds[0]}_${sortedIds[1]}`;

        if (channelId.length > 64) {
            // Truncate Firebase UIDs to fit
            const id1 = sortedIds[0].substring(0, 30);
            const id2 = sortedIds[1].substring(0, 30);
            channelId = `${id1}_${id2}`;
        }

        return channelId;
    };

    const handleOpenChat = async (match) => {
        try {
            console.log("🔍 Match data:", match);
            console.log("🔍 Channel ID:", match.chat_channel_id);
            console.log("🔍 Channel ID length:", match.chat_channel_id?.length);

            let channelId = match.chat_channel_id;

            // Fallback: generate valid ID if stored one is invalid
            if (!channelId || channelId.length > 64) {
                console.warn("❌ Invalid channel ID, generating new one");
                channelId = createValidChannelId(match.creator_id, match.accepter_id);
                console.log("✅ New channel ID:", channelId, "Length:", channelId.length);
            }

            const chatClient = await connectStreamChat(currentUser);
            if (chatClient) {
                const uniqueMembers = [...new Set([
                    currentUser.uid,
                    match.creator_id,
                    match.accepter_id
                ].filter(Boolean))];

                console.log("👥 Members:", uniqueMembers);

                const channel = chatClient.channel("messaging", channelId, {
                    members: uniqueMembers,
                });
                await channel.watch();
                console.log("✅ Chat ready:", channel.id);
            }
        } catch (error) {
            console.error("Error opening chat", error);
        }
    };

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

                                    <p className="card-text">
                                        <strong>Status:</strong> {match.status}
                                    </p>

                                    <div className="d-flex justigy-content-between mt-3">
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleOpenChat(match)}
                                        >
                                            💬 Chat
                                        </button>
                                        {(currentUser.uid === match.creator_id || currentUser.uid === match.accepter_id) && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleCancelMatch(match.id)}>
                                                Cancel Match
                                            </button>
                                        )}

                                    </div>

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
