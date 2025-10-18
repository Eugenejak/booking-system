import { useState } from "react";
import { createTimeSlots } from "../utilities/timeSlots";
import { db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function CreateMatch({ currentUser }) {
    const startTimeSlots = createTimeSlots(8, 23, true);
    const endTimeSlots = createTimeSlots(8, 23);
    const [sport, setSport] = useState("");
    const [note, setNote] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const handleCreateMatch = async (event) => {
        event.preventDefault();
        try {
            await addDoc(collection(db, "matchRequests"), {
                created_by: currentUser.uid,
                sport,
                note,
                start_time: startTime,
                end_time: endTime,
                status: "open",
                created_at: serverTimestamp(),
            });
            alert("Match request created!");
            setSport("");
            setNote("");
            setStartTime("");
            setEndTime("");
        } catch (error) {
            console.error("Error creating match:", error);
        }
    };

    return (
        <form onSubmit={handleCreateMatch} className="mt-4">
            <div className="mb-3">
                <label>Sport</label>
                <input
                    type="text"
                    className="form-control"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    required
                />
            </div>

            <div className="mb-3">
                <label>Note</label>
                <input
                    type="text"
                    className="form-control"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Need 1 more player/team..."
                />
            </div>

            <div className="mb-3">
                <label>Start Time</label>
                <select
                    className="form-control"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                >
                    <option value="">Select start time</option>
                    {startTimeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label>End Time</label>
                <select
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                >
                    <option value="">Select end time</option>
                    {endTimeSlots
                        .filter((time) => !startTime || time > startTime)
                        .map((time) => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                </select>
            </div>

            <button className="btn btn-success w-100">Create Match</button>
        </form>
    );
}



