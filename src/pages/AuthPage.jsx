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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

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

                await setDoc(doc(db, "users", user.uid), {
                    name: name,
                    email: user.email,
                    role: "user",
                    createdAt: new Date(),
                });

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

                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    await setDoc(userDocRef, {
                        name: user.displayName || "User",
                        email: user.email,
                        role: "user",
                        createdAt: new Date(),
                    });
                }

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

                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    await setDoc(userDocRef, {
                        name: user.displayName || "Google User",
                        email: user.email,
                        role: "user",
                        createdAt: new Date(),
                    });
                }

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
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #0a1930 0%, #142850 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >

            <Container fluid className="px-3 px-sm-5">
                <Row className="justify-content-center">
                    <Col xs={12} sm={18} md={8} lg={5} xl={4}>
                        <Card
                            className="shadow-lg border-0"
                            style={{
                                borderRadius: "1rem",
                                background: "rgba(255, 255, 255, 0.05)",
                                backdropFilter: "blur(10px)",
                                color: "#fff",
                            }}
                        >
                            <Card.Body className="p-4 p-sm-5">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold text-uppercase"
                                        style={{ color: "#a8ff60", fontSize: "1.8rem" }}
                                    >
                                        Sportly
                                    </h2>
                                    <p className="text-secondary mb-8"
                                        style={{ fontSize: "0.95rem" }}
                                    >
                                        {isSignUp ? "Create your account" : "Welcome"}
                                    </p>
                                </div>

                                <Form onSubmit={isSignUp ? handleSignUp : handleLogin}>
                                    {isSignUp && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="text-light">Name</Form.Label>
                                            <Form.Control
                                                onChange={(e) => setName(e.target.value)}
                                                type="text"
                                                placeholder="Enter your name"
                                                required
                                            />
                                        </Form.Group>
                                    )}

                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-light">Email</Form.Label>
                                        <Form.Control
                                            onChange={(e) => setEmail(e.target.value)}
                                            type="email"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-light">Password</Form.Label>
                                        <Form.Control
                                            onChange={(e) => setPassword(e.target.value)}
                                            type="password"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </Form.Group>

                                    <Button
                                        type="submit"
                                        className="w-100 fw-semibold py-2"
                                        style={{
                                            backgroundColor: "#a8ff60",
                                            color: "#0a1930",
                                            border: "none",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        {isSignUp ? "Sign Up" : "Log In"}
                                    </Button>
                                </Form>

                                <div className="position-relative my-4">
                                    <hr className="text-secondary" />
                                    <span className="position-absolute top-50 start-50 translate-middle bg-transparent px-2 text-secondary">
                                        or
                                    </span>
                                </div>

                                <Button
                                    variant="outline-light"
                                    className="w-100 mb-3 fw-semibold py-2"
                                    onClick={handleGoogleLogin}
                                >
                                    <i className="bi bi-google me-2"></i>
                                    Continue with Google
                                </Button>

                                <div className="text-center mt-2">
                                    <small className="text-secondary">
                                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                                        <Button
                                            variant="link"
                                            className="p-0 text-decoration-none fw-semibold"
                                            style={{ color: "#a8ff60" }}
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
        </div>
    );
}