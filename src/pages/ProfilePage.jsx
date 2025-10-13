import { useContext, useEffect, useState } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import BookingPage from "../components/BookingForm";
import { AuthContext } from "../components/AuthProvider";
import MyBookings from "../components/MyBookings";
import { getAuth } from "firebase/auth";

export default function ProfilePage() {
    const auth = getAuth();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);

    // Check if currentUser is logged in
    useEffect(() => {
        if (!currentUser) {
            navigate("/login"); // Redirect to login if user not logged in
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        if (!currentUser) return;
        fetchBookings();
    }, [currentUser]);

    const fetchBookings = async () => {
        const token = localStorage.getItem("authToken");
        try {
            const res = await fetch(
                `https://36da2f3f-0646-437a-b0b3-41d43b7682db-00-2bbdx267zl8kv.pike.replit.dev/bookings/currentUser/${currentUser.uid}`,
                { headers: { "Authorization": `Bearer ${token}` } }
            );
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBookingSuccess = () => {
        fetchBookings();
    };

    const handleLogout = () => {
        auth.signOut();
    };

    return (
        <>
            <Navbar bg="light">
                <Container>
                    <Navbar.Collapse className="justify-content-end">
                        <Button variant="primary" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-3">
                <h2>Hello {currentUser?.displayName || "Guest"}, </h2>
                <MyBookings bookings={bookings} setBookings={setBookings} />
                <BookingPage onBookingSuccess={handleBookingSuccess} />
            </Container>
        </>
    );
}


