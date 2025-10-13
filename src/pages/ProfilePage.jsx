import { useContext, useEffect } from "react";
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

    // Check if currentUser is logged in
    useEffect(() => {
        if (!currentUser) {
            navigate("/login"); // Redirect to login if user not logged in
        }
    }, [currentUser, navigate]);

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
                <MyBookings />
                <BookingPage />
            </Container>
        </>
    );
}


