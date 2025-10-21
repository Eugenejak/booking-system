import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../config";
import MatchFormBase from "./MatchFormBase";

export default function BookingForm({ bookingToEdit, onBookingSuccess }) {
    const [courts, setCourts] = useState([]);
    const [message, setMessage] = useState("");

    const initialData = bookingToEdit ? {
        sport: bookingToEdit.sport_type,
        court_id: bookingToEdit.court_id,
        booking_date: bookingToEdit.booking_date?.split("T")[0],
        start_time: bookingToEdit.start_time?.slice(0, 5),
        end_time: bookingToEdit.end_time?.slice(0, 5),
        note: bookingToEdit.note || "",
    } : {};

    useEffect(() => {
        if (bookingToEdit?.sport_type) {
            fetchCourts(bookingToEdit.sport_type);
        }
    }, [bookingToEdit]);

    // Fetch courts when a sport is selected
    const fetchCourts = async (sport) => {
        if (!sport) return;
        try {
            const response = await fetch(`${API_URL}/courts?sport_type=${sport.toLowerCase()}`)
            const data = await response.json();
            setCourts(data.courts || []);
        } catch (error) {
            console.error("Error fetching courts:", error);
            setMessage("❌ Failed to load courts");
        }
    };

    const handleBookingSubmit = async (formData) => {
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
            sport_type: formData.sport,
            court_id: formData.court_id,
            booking_date: formData.booking_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
        };

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
                onBookingSuccess?.();

                setTimeout(() => {
                    setMessage("");
                }, 3000);
            } else {
                setMessage("❌ Failed: " + data.error);
            }
        } catch (error) {
            console.error("Booking error:", error)
            setMessage("❌ Network error. Please try again.");
        }
    };

    return (
        <>
            <MatchFormBase
                title={bookingToEdit ? "Edit Booking" : "Book a Court"}
                showCourt={true}
                courts={courts}
                submitLabel={bookingToEdit ? "Save Changes" : "Book Now"}
                onSubmit={handleBookingSubmit}
                onSportSelect={fetchCourts}
                initialData={initialData}
                resetAfterSubmit={!bookingToEdit}
            />

            {message && <p className="mt-3 text-center">{message}</p>}
        </>
    );
}
