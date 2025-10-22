import { useContext, useEffect, useState } from "react";
import { Navbar, Container, Button, Tabs, Tab } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import BookingForm from "../components/BookingForm";
import { AuthContext } from "../components/AuthProvider";
import MyBookings from "../components/MyBookings";
import { getAuth, signOut } from "firebase/auth";
import { API_URL } from "../config";
import CreateMatch from "../components/CreateMatch";
import MatchRequestsList from "../components/MatchRequestsList";
import MyMatches from "../components/MyMatches";
import { disconnectStreamChat } from "../utilities/streamChat";

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

    const handleLogout = async () => {
        await disconnectStreamChat();
        try {
            console.log("Logging out...");

            await signOut(auth);

            console.log("✅ User signed out successfully");

            navigate("/login");
        } catch (error) {
            console.error("❌ Error during logout:", error);
            alert("Failed to log out. Please try again.");
        }
    };

    return (
        <>
            <Navbar bg="light">
                <Container>
                    <Navbar.Collapse className="justify-content-end">
                        <div className="container mt-2">
                            <h5>Profile</h5>
                            <p>Signed in as {auth.currentUser?.email}</p>
                        </div>
                        <Button
                            variant="primary"
                            className="btn btn-danger mt-3"
                            onClick={handleLogout}>
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

                    <Tab eventKey="open" title="Open Matches">
                        <MatchRequestsList currentUser={currentUser} />
                    </Tab>

                    <Tab eventKey="myMatches" title="My Matches">
                        <MyMatches currentUser={currentUser} />
                    </Tab>
                </Tabs>
            </Container>
        </>
    );
}


