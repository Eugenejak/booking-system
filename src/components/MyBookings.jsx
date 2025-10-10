import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../components/AuthProvider";

export default function MyBookings() {
    const { currentUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [message, setMessage] = useState("");
    const [editBookingId, setEditBookingId] = useState(null);
    const [editData, setEditData] = useState({ booking_date: "", start_time: "", end_time: "" });

    const hours = [];
    for (let i = 8; i <= 23; i++) {
        hours.push(i);
    }

    useEffect(() => {
        if (!currentUser) return;

        const token = localStorage.getItem("authToken");
        fetch(`https://36da2f3f-0646-437a-b0b3-41d43b7682db-00-2bbdx267zl8kv.pike.replit.dev/bookings/currentUser/${currentUser.id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setBookings(data))
            .catch(err => console.error(err));
    }, [currentUser]);

    async function handleDelete(id) {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`https://36da2f3f-0646-437a-b0b3-41d43b7682db-00-2bbdx267zl8kv.pike.replit.dev/bookings/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        });

        if (res.ok) {
            setBookings(bookings.filter(b => b.id !== id));
            setMessage("Booking deleted ✅");
            setTimeout(() => setMessage(""), 2000);
        }
    }

    const handleEditClick = (b) => {
        setEditBookingId(b.id);
        setEditData({
            booking_date: b.booking_date.slice(0, 10),
            start_time: b.start_time.slice(0, 5),
            end_time: b.end_time.slice(0, 5)
        });
    };

    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleEditSave = async (b) => {
        const token = localStorage.getItem("authToken");

        const res = await fetch(`https://36da2f3f-0646-437a-b0b3-41d43b7682db-00-2bbdx267zl8kv.pike.replit.dev/bookings/${b.id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(editData)
        });

        const data = await res.json();
        if (res.ok) {
            setBookings(bookings.map(bk => bk.id === b.id ?
                { ...bk, ...data.booking }
                : bk
            ));
            setMessage("Booking updated ✅");
            setEditBookingId(null);
            setTimeout(() => setMessage(""), 3000);
        } else {
            setMessage("❌ Failed: " + data.error);
        }
    };

    const handleEditCancel = () => {
        setEditBookingId(null);
    };

    return (
        <div className="mt-4">
            <h4>My Bookings</h4>
            {message && <p>{message}</p>}

            <ul className="list-group">
                {[...bookings]
                    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
                    .map(b => {
                        const formattedDate = new Date(b.booking_date).toLocaleDateString("en-GB");
                        const formattedStart = b.start_time.slice(0, 5);
                        const formattedEnd = b.end_time.slice(0, 5);

                        return (
                            <li key={b.id} className="list-group-item">
                                {editBookingId === b.id ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <input
                                            type="date"
                                            name="booking_date"
                                            value={editData.booking_date}
                                            onChange={handleEditChange}
                                        />
                                        <select
                                            name="start_time"
                                            value={editData.start_time}
                                            onChange={handleEditChange}
                                        >
                                            <option value="">Start</option>
                                            {hours.map(h => (
                                                <option key={h} value={`${h}:00`}>{h}:00</option>
                                            ))}
                                        </select>
                                        <select
                                            name="end_time"
                                            value={editData.end_time}
                                            onChange={handleEditChange}
                                        >
                                            <option value="">End</option>
                                            {hours.map(h => (
                                                <option
                                                    key={h}
                                                    value={`${h}:00`}
                                                    disabled={editData.start_time && h <= parseInt(editData.start_time)}
                                                >
                                                    {h}:00
                                                </option>
                                            ))}
                                        </select>
                                        <button className="btn btn-success btn-sm" onClick={() => handleEditSave(b)}>Save</button>
                                        <button className="btn btn-secondary btn-sm" onClick={handleEditCancel}>Cancel</button>
                                    </div>
                                ) : (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>
                                            <b>{b.sport_type ? b.sport_type.toUpperCase() : ""}</b> - Court {b.court_no}
                                            <br />
                                            {formattedDate} — {formattedStart} to {formattedEnd}
                                        </span>
                                        <div>
                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() => handleEditClick(b)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(b.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
