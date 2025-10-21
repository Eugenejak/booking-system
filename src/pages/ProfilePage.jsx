import { useContext, useEffect, useState } from "react";
import { Navbar, Container, Button, Row, Col, Card, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import BookingForm from "../components/BookingForm";
import { AuthContext } from "../components/AuthProvider";
import MyBookings from "../components/MyBookings";
import { getAuth } from "firebase/auth";
import { API_URL } from "../config";
import CreateMatch from "../components/CreateMatch";
import MatchRequestsList from "../components/MatchRequestsList";

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
                `${API_URL}/bookings/currentUser/${currentUser.uid}`,
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

                <Tabs defaultActiveKey="bookings" className="mt-3">
                    <Tab eventKey="bookings" title="Book a Court">
                        <MyBookings bookings={bookings} setBookings={setBookings} />
                        <BookingForm onBookingSuccess={handleBookingSuccess} />
                    </Tab>

                    <Tab eventKey="matchmaking" title="Create a Match">
                        <CreateMatch currentUser={currentUser} />
                    </Tab>

                    <Tab eventKey="matchrequests" title="Match Requests">
                        <MatchRequestsList currentUser={currentUser} />
                    </Tab>
                </Tabs>
            </Container>
        </>
    );
}


