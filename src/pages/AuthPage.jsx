import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile
} from "firebase/auth";
import { useContext, useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../components/AuthProvider";
import { API_URL } from "../config";

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const auth = getAuth();
    const { currentUser, setCurrentUser } = useContext(AuthContext);

    useEffect(() => {
        if (currentUser) navigate("/profile");
    }, [currentUser, navigate]);

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = res.user;

            await updateProfile(user, { displayName: name });
            console.log("After updateProfile:", user.displayName);
            setCurrentUser({ ...user, displayName: name });

            if (user) {
                const token = await user.getIdToken();
                localStorage.setItem("authToken", token);

                await fetch(`${API_URL}/users`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: user.uid,
                        name: name || "New User",
                        email: user.email,
                        role: "user",
                    }),
                });
            }
            console.log("✅ User registered:", user.email);
        } catch (error) {
            console.error("SignUp Error:", error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            const user = res.user;
            if (user) {
                const token = await user.getIdToken();
                localStorage.setItem("authToken", token);
                await fetch(`${API_URL}/users`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        id: user.uid,
                        name: user.displayName || name || "Existing User",
                        email: user.email,
                        role: "user",
                    }),
                });
            }
            console.log("✅ User logged in:", user.email);
        } catch (error) {
            console.error("Login Error:", error);
        }
    };

    const provider = new GoogleAuthProvider();

    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user) {
                const token = await user.getIdToken();
                localStorage.setItem("authToken", token);

                await fetch(`${API_URL}/users`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id: user.uid,
                        name: user.displayName || "Google User",
                        email: user.email,
                    }),
                });
            }
        } catch (error) {
            console.error("Google login error:", error);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Row className="w-100">
                <Col md={{ span: 6, offset: 3 }} lg={{ span: 4, offset: 4 }}>
                    <Card className="shadow-sm">
                        <Card.Body className="p-4">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold">Sports Booking System</h2>
                                <p className="text-muted">
                                    {isSignUp ? "Create your account" : "Welcome"}
                                </p>
                            </div>

                            <Form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                                {isSignUp && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control
                                            onChange={(e) => setName(e.target.value)}
                                            type="text"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        onChange={(e) => setEmail(e.target.value)}
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        onChange={(e) => setPassword(e.target.value)}
                                        type="password"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </Form.Group>

                                <Button className="w-100 mb-3" type="submit" variant="primary">
                                    {isSignUp ? "Sign Up" : "Log In"}
                                </Button>
                            </Form>

                            <div className="position-relative mb-3">
                                <hr />
                                <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted">
                                    or
                                </span>
                            </div>

                            <Button
                                className="w-100 mb-3"
                                variant="outline-dark"
                                onClick={handleGoogleLogin}
                            >
                                <i className="bi bi-google me-2"></i>
                                Continue with Google
                            </Button>

                            <div className="text-center">
                                <small>
                                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                                    <Button
                                        variant="link"
                                        className="p-0 text-decoration-none"
                                        onClick={() => setIsSignUp(!isSignUp)}
                                    >
                                        {isSignUp ? "Log in" : "Sign up"}
                                    </Button>
                                </small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}