import { useContext, useEffect, useState } from "react";
import { Nav, Navbar, Container, Button, Tabs, Tab } from "react-bootstrap";
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
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0a1930 0%, #142850 100%)",
                color: "#fff",
            }}
        >
            <Navbar
                expand="lg"
                variant="dark"
                style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
            >
                <Container fluid className="px-4">
                    <Navbar.Brand
                        onClick={() => navigate("/")}
                        style={{
                            color: "#a8ff60",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            cursor: "pointer",
                        }}
                    >
                        Sportify<span className="text-light">Book</span>
                    </Navbar.Brand>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto align-items-center">
                            <span className="me-3 text-light small">
                                Signed in as <strong>{auth.currentUser?.email}</strong>
                            </span>
                            <Button
                                variant="light"
                                size="sm"
                                onClick={handleLogout}
                                style={{
                                    backgroundColor: "#a8ff60",
                                    color: "#0a1930",
                                    border: "none",
                                    fontWeight: "600",
                                }}
                            >
                                Logout
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className="mt-4">
                <h3 className="fw-bold mb-3">
                    Welcome, {currentUser?.displayName || "Guest"}
                </h3>

                <div
                    className="p-3 rounded"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "1rem",
                    }}
                >
                    <Tabs
                        defaultActiveKey="bookings"
                        className="mt-3 justify-content-center"
                        fill
                        variant="pills"
                    >
                        {[
                            {
                                key: "bookings", title: "Book a Court", content: (
                                    <>
                                        <MyBookings bookings={bookings} setBookings={setBookings} />
                                        <BookingForm onBookingSuccess={handleBookingSuccess} />
                                    </>
                                )
                            },
                            { key: "matchmaking", title: "Create a Match", content: <CreateMatch currentUser={currentUser} /> },
                            { key: "open", title: "Open Matches", content: <MatchRequestsList currentUser={currentUser} /> },
                            { key: "myMatches", title: "My Matches", content: <MyMatches currentUser={currentUser} /> },
                        ].map((tab) => (
                            <Tab
                                key={tab.key}
                                eventKey={tab.key}
                                title={tab.title}
                                tabClassName="sporty-tab"
                            >
                                <div
                                    className="p-3 rounded-3 mt-3"
                                    style={{ background: "rgba(255,255,255,0.05)" }}
                                >
                                    {tab.content}
                                </div>
                            </Tab>
                        ))}
                    </Tabs>
                </div>
            </Container>
        </div>
    );
}


