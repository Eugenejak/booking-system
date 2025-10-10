import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { useContext, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../components/AuthProvider";

export default function AuthPage() {
    const [modalShow, setModalShow] = useState(null);
    const handleShowSignUp = () => setModalShow("SignUp");
    const handleShowLogin = () => setModalShow("Login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const auth = getAuth();
    const { currentUser } = useContext(AuthContext);

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
            console.log(res.user);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error(error);
        }
    };

    const provider = new GoogleAuthProvider();
    const handleGoogleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
        }
    }

    const handleClose = () => setModalShow(null);

    return (
        <>
            <h2>Sports Booking System</h2>
            <Row>
                <Col sm={4}>
                    <Button className="rounded-pill" onClick={handleShowSignUp}>
                        Get Started
                    </Button>
                </Col>
                <Modal show={modalShow !== null}
                    onHide={handleClose}
                    animation={false}
                    centered>
                    <Modal.Body>
                        <h2 className="mb-4" style={{ fontWeight: "bold" }}>
                            {modalShow === "SignUp"
                                ? "Create your account"
                                : "Log in to your account"}
                        </h2>
                        <Form className="d-grid gap-2 px-5"
                            onSubmit={modalShow === "SignUp" ? handleSignUp : handleLogin}>
                            {modalShow === "SignUp" && (
                                <Form.Group className="mb-3" controlId="formName">
                                    <Form.Control
                                        onChange={(e) => setName(e.target.value)}
                                        type="name"
                                        placeholder="Enter name" />
                                </Form.Group>
                            )}

                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Control
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="Enter email" />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Control
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder='Password' />
                            </Form.Group>

                            <Button className="rounded-pill" type="submit">
                                {modalShow === "SignUp" ? "Sign up" : "Log in"}
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

                <Col sm={4}>
                    <Button className="rounded-pill"
                        variant="outline-primary"
                        onClick={handleShowLogin}
                    >Sign In
                    </Button>
                </Col>

                <Col sm={4} className="d-grid gap-2">
                    <Button
                        className="rounded-pill"
                        variant="outline-dark"
                        onClick={handleGoogleLogin}
                    >
                        <i className="bi bi-google"></i>
                        Sign in with Google
                    </Button>
                </Col>
            </Row>
        </>
    );
}

