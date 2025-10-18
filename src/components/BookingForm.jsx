import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../config";
import { createTimeSlots } from "../utilities/timeSlots";

export default function BookingForm({ bookingToEdit, onBookingSuccess }) {
    const sports = ["Badminton", "Futsal"];
    const [selectedSport, setSelectedSport] = useState("");
    const [courts, setCourts] = useState([]);
    const [selectedCourt, setSelectedCourt] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [message, setMessage] = useState("");
    const startTimeSlots = createTimeSlots(8, 23, true);
    const endTimeSlots = createTimeSlots(8, 23);

    useEffect(() => {
        if (bookingToEdit) {
            setSelectedSport(bookingToEdit.sport_type || "");
            setSelectedCourt(bookingToEdit.court_id || "");
            setDate(bookingToEdit.booking_date?.split("T")[0] || "");
            setStartTime(bookingToEdit.start_time?.slice(0, 5) || "");
            setEndTime(bookingToEdit.end_time?.slice(0, 5) || "");
        }
    }, [bookingToEdit]);

    // Fetch courts when a sport is selected
    useEffect(() => {
        if (!selectedSport) return;

        fetch(`${API_URL}/courts?sport_type=${selectedSport.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
                console.log("Fetched courts:", data);
                setCourts(data.courts)
            })
            .catch(error => console.error(error));
    }, [selectedSport]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("authToken");
        if (!token || typeof token !== "string") {
            setMessage("Authentication error: Please log in again.");
            return;
        }
        let decoded;
        try {
            decoded = jwtDecode(token);
        } catch {
            setMessage("Invalid token. Please log in again.");
            return;
        }
        const user_id = decoded.uid || decoded.sub || decoded.user?.id || decoded.id;

        const bookingData = {
            user_id,
            sport_type: selectedSport,
            court_id: selectedCourt,
            booking_date: date,
            start_time: startTime,
            end_time: endTime,
        };
        console.log("Booking data:", bookingData);

        const isEditing = !!bookingToEdit;
        const url = isEditing
            ? `${API_URL}/bookings/${bookingToEdit.id}`
            : `${API_URL}/bookings`;
        const method = isEditing ? "PUT" : "POST";


        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(bookingData),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage(isEditing ? "✅ Booking updated!" : "✅ Booking successful!");
                setSelectedCourt("");
                setDate("");
                setStartTime("");
                setEndTime("");

                if (onBookingSuccess) {
                    onBookingSuccess();
                }

                setTimeout(() => {
                    setMessage("");
                }, 5000);
            } else {
                setMessage("❌ Failed: " + data.error);
            }
        } catch (error) {
            console.error(error)
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 border rounded shadow-sm mt-4">
            <h4>{bookingToEdit ? "Edit Booking" : "Book a Court"}</h4>

            <div className="mb-3">
                <label>Sport Type</label>
                <select
                    className="form-control"
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    required
                    disabled={!!bookingToEdit}
                >
                    <option value="">Select a sport</option>
                    {sports.map((sport, index) => (
                        <option key={index} value={sport}>{sport}</option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label>Court</label>
                <select
                    className="form-control"
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    required
                    disabled={!!bookingToEdit}
                >
                    <option value="">Select court</option>
                    {courts.map((court) => (
                        <option key={court.id} value={court.id}>
                            {court.court_no}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-3">
                <label>Date</label>
                <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onFocus={(e) => e.target.showPicker && e.target.showPicker()}
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

            <button type="submit" className="btn btn-primary w-100">
                {bookingToEdit ? "Save Changes" : "Book Now"}
            </button>

            {message && <p className="mt-3 text-center">{message}</p>}
        </form>
    );
};
