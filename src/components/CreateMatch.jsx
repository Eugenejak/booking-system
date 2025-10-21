import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import MatchFormBase from "./MatchFormBase";

export default function CreateMatch({ currentUser }) {
    const [message, setMessage] = useState("");

    const handleCreateMatch = async (formData) => {

        if (!currentUser?.uid) {
            setMessage("❌ You must be logged in to create a match.");
            return;
        }

        const { sport, note, start_time, end_time, booking_date } = formData;

        if (!sport) {
            setMessage("❌ Please select a sport!");
            return;
        }

        const matchData = {
            created_by: currentUser.uid,
            sport: sport,
            note: note || "",
            date: booking_date || null,
            start_time: start_time || null,
            end_time: end_time || null,
            status: "open",
            created_at: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, "matchRequests"), matchData);

            setMessage("✅ Match request created successfully!");

            setTimeout(() => {
                setMessage("");
            }, 3000);

        } catch (error) {
            console.error("Error creating match:", error);

            if (error.code === "permission-denied") {
                setMessage("❌ Permission denied. Check Firestore rules.");
            } else {
                setMessage(`❌ Failed: ${error.message}`);
            }
        }
    };

    return (
        <>
            <MatchFormBase
                title="Create Match Request"
                onSubmit={handleCreateMatch}
                submitLabel="Create Match"
                showNote={true}
                resetAfterSubmit={true}
            />

            {message && (
                <p className="mt-3 text-center">{message}</p>
            )}
        </>
    );
}