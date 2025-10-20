// src/components/shared/MatchFormBase.jsx
import { useState } from "react";
import { createTimeSlots } from "../utilities/timeSlots";

export default function MatchFormBase({
    title,
    sports = ["Badminton", "Futsal"],
    showCourt = false,
    courts = [],
    onSubmit,
    submitLabel,
    showNote = false,
}) {
    const [selectedSport, setSelectedSport] = useState("");
    const [selectedCourt, setSelectedCourt] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [note, setNote] = useState("");

    const startTimeSlots = createTimeSlots(8, 23, true);
    const endTimeSlots = createTimeSlots(8, 23);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            sport: selectedSport,
            court_id: selectedCourt,
            date,
            startTime,
            endTime,
            note,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm mt-4">
            <h4>{title}</h4>

            <div className="mb-3">
                <label>Sport Type</label>
                <select
                    className="form-control"
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    required
                >
                    <option value="">Select a sport</option>
                    {sports.map((sport) => (
                        <option key={sport} value={sport}>
                            {sport}
                        </option>
                    ))}
                </select>
            </div>

            {showCourt && (
                <div className="mb-3">
                    <label>Court</label>
                    <select
                        className="form-control"
                        value={selectedCourt}
                        onChange={(e) => setSelectedCourt(e.target.value)}
                        required
                    >
                        <option value="">Select court</option>
                        {courts.map((court) => (
                            <option key={court.id} value={court.id}>
                                {court.court_no}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="mb-3">
                <label>Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
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
                        <option key={time} value={time}>
                            {time}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label>End Time</label>
                <select
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                >
                    <option value="">Select end time</option>
                    {endTimeSlots
                        .filter((time) => !startTime || time > startTime)
                        .map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                </select>
            </div>

            {showNote && (
                <div className="mb-3">
                    <label>Note</label>
                    <textarea
                        className="form-control"
                        placeholder="e.g. Looking for 1 more player..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
            )}

            <button type="submit" className="btn btn-primary w-100">
                {submitLabel}
            </button>
        </form>
    );
}
