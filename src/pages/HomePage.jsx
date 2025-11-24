import React from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function HomePage() {
    const handleLogin = () => {
        window.location.href = '/login';
    };

    const handleSignUp = () => {
        window.location.href = '/login?mode=signup';
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a1930 0%, #142850 100%)'
        }}>

            <Navbar
                style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}
                variant="dark"
            >
                <Container>
                    <Navbar.Brand style={{ color: "#a8ff60", fontSize: '1.875rem', fontWeight: 'bold' }}>
                        SPORTLY
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Button
                            variant="link"
                            onClick={handleLogin}
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                marginRight: '1rem'
                            }}
                            className="hover-lime"
                        >
                            Login
                        </Button>
                        <Button
                            onClick={handleSignUp}
                            style={{
                                backgroundColor: "#a8ff60",
                                color: "#0a1930",
                                border: 'none',
                                fontWeight: '600'
                            }}
                        >
                            Sign Up
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            <Container className="text-center" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
                <h2 style={{
                    fontSize: '3.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '1.5rem'
                }}>
                    Your Complete Sports
                    <div style={{ color: "#a8ff60", marginTop: '0.5rem' }}>
                        Booking Platform
                    </div>
                </h2>
                <p style={{
                    fontSize: '1.25rem',
                    color: '#cbd5e1',
                    marginBottom: '2.5rem',
                    maxWidth: '800px',
                    margin: '0 auto 2.5rem'
                }}>
                    Book courts, create matches, and manage your sports schedule all in one place.
                    From futsal to badminton, we've got you covered.
                </p>
                <Button
                    onClick={handleSignUp}
                    size="lg"
                    style={{
                        backgroundColor: "#a8ff60",
                        color: "#0a1930",
                        border: 'none',
                        fontWeight: 'bold',
                        padding: '1rem 2.5rem',
                        fontSize: '1.125rem'
                    }}
                >
                    Get Started Now
                </Button>
            </Container>

            <Container style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
                <h3 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: '4rem'
                }}>
                    Everything You Need
                </h3>
                <Row className="g-4">
                    <Col md={6} lg={3}>
                        <FeatureCard
                            icon={<i className="bi bi-calendar-check" style={{ fontSize: '3rem', color: "#a8ff60" }}></i>}
                            title="Book a Court"
                            description="Reserve futsal, badminton, and other sports courts instantly"
                        />
                    </Col>
                    <Col md={6} lg={3}>
                        <FeatureCard
                            icon={<i className="bi bi-trophy" style={{ fontSize: '3rem', color: "#a8ff60" }}></i>}
                            title="Create Matches"
                            description="Organize and schedule matches with friends and teammates"
                        />
                    </Col>
                    <Col md={6} lg={3}>
                        <FeatureCard
                            icon={<i className="bi bi-people" style={{ fontSize: '3rem', color: "#a8ff60" }}></i>}
                            title="Join Open Matches"
                            description="Find and join matches in your area looking for players"
                        />
                    </Col>
                    <Col md={6} lg={3}>
                        <FeatureCard
                            icon={<i className="bi bi-clock" style={{ fontSize: '3rem', color: "#a8ff60" }}></i>}
                            title="Manage Bookings"
                            description="Track all your bookings and matches in one dashboard"
                        />
                    </Col>
                </Row>
            </Container>

            <footer style={{
                backgroundColor: '#0f172a',
                color: '#94a3b8',
                padding: '2rem 0',
                borderTop: '1px solid #1e293b',
                marginTop: '5rem'
            }}>
                <Container className="text-center">
                    <p style={{ color: "#a8ff60", fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        SPORTLY
                    </p>
                    <p style={{ margin: 0 }}>&copy; 2025 Sportly. All rights reserved.</p>
                </Container>
            </footer>

            <style>{`
        .hover-lime:hover {
          color: #a8ff60 !important;
        }
      `}</style>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <Card
            style={{
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                border: '1px solid #475569',
                padding: '2rem',
                height: '100%',
                transition: 'all 0.3s ease'
            }}
            className="feature-card"
        >
            <Card.Body className="text-center">
                <div style={{ marginBottom: '1rem' }}>
                    {icon}
                </div>
                <Card.Title style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'white',
                    marginBottom: '0.75rem'
                }}>
                    {title}
                </Card.Title>
                <Card.Text style={{ color: '#cbd5e1' }}>
                    {description}
                </Card.Text>
            </Card.Body>
            <style>{`
        .feature-card:hover {
          border-color: #a8ff60 !important;
          transform: scale(1.05);
        }
      `}</style>
        </Card>
    );
}