import { useContext, useEffect, useState } from "react";
import { Navbar, Container, Button, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import BookingForm from "../components/BookingForm";
import { AuthContext } from "../components/AuthProvider";
import MyBookings from "../components/MyBookings";
import { getAuth } from "firebase/auth";
import { API_URL } from "../config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function ProfilePage() {
    const auth = getAuth();
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);

    const [myMatch, setMyMatch] = useState([]);
    const [sport, setSport] = useState("");
    const [note, setNote] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

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

    useEffect(() => {
        if (!currentUser) return;
        const userQuery = query(collection(db, "matchRequests"), where("created by", "==", "currentUser.uid"));
        const unsubscribe = onSnapshot(userQuery, (snap) => {
            setMyMatch(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        });
        return unsubscribe;
    }, [currentUser]);

    const handleCreatMatch = async (event) => {
        event.preventDefault();
        try {
            await addDoc(collection(db, "matchRequests"), {
                created_by: currentUser.uid,
                sport,
                note,
                start_time: new Date(startTime),
                end_time: new Date(endTime),
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
                <BookingForm onBookingSuccess={handleBookingSuccess} />

                <hr />

                <h3>Create a Match Request</h3>
                <form onSubmit={handleCreatMatch}>
                    <input
                        type="text"
                        placeholder="Sport (e.g. Badminton"
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                    />
                    <textarea
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                    <Button type="submit" className="mt-2">Create Match</Button>
                </form>

                <h3 className="mt-4">My Match Request</h3>
                <Row>
                    {myMatch.map((m) => (
                        <Col key={m.id} md={4} className="mb-3">
                            <Card>
                                <Card.Body>
                                    <Card.Title>{m.sport}</Card.Title>
                                    <Card.Text>{m.note}</Card.Text>
                                    <Card.Text>Status: {m.status}</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
}


