import React from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Knowledgebase() {
    const items = [
        {
            title: 'Hardware',
            desc: 'Everything you need to know to get started and get to work in Slack.',
            src: 'src/assets/images/hardware.png',
            link: '/hardware',
        },
        {
            title: 'Network',
            desc: 'From channels to search, learn how Slack works from top to bottom.',
            src: 'src/assets/images/network.png',
            link: '/network',
        },
        {
            title: 'Software',
            desc: 'Adjust your profile and preferences to make Slack work just for you.',
            src: 'src/assets/images/software.png',
            link: '/software',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Top 50% - Yellow Section */}
            <div
                style={{
                    background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                    minHeight: '50vh',
                    paddingTop: '10vh',
                    paddingBottom: '5vh',
                    color: 'white',
                    textAlign: 'center',
                }}
            >
                <Container style={{ maxWidth: '1000px', paddingTop: '10vh' }}>
                    <h1 className="pulse-heading" style={{ paddingBottom: '10px' }}>Hi. How can we help?</h1>

                    {/* Search Box */}
                    <div
                        style={{
                            marginTop: '30px',
                            width: '100%',
                            maxWidth: '700px',
                            margin: '0 auto',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        }}
                    >
                        <FaSearch style={{ color: '#999', marginRight: '10px' }} />
                        <Form.Control
                            type="text"
                            placeholder="Find anything (ex. slow internet, request new mouse or unable to access)"
                            style={{
                                border: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                                fontSize: '1rem',
                                flex: 1,
                            }}
                        />
                    </div>

                    {/* Troubleshooting Links */}
                    <div
                        style={{
                            marginTop: '20px',
                            fontSize: '0.95rem',
                            flexWrap: 'wrap',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '10px',
                        }}
                    >
                        <span>Common troubleshooting topics:</span>
                        <a href="#" style={{ color: '#fff', textDecoration: 'underline' }}>notifications</a>
                        <a href="#" style={{ color: '#fff', textDecoration: 'underline' }}>connecting to Slack</a>
                        <a href="#" style={{ color: '#fff', textDecoration: 'underline' }}>Slack Calls</a>
                    </div>
                </Container>
            </div>

            {/* Bottom 50% - Green Section */}
            <div
                style={{
                    backgroundColor: '#003e03ff',
                    minHeight: '50vh',
                    paddingTop: '40px',
                    paddingBottom: '40px',
                }}
            >
                <Container fluid="lg">
                    <Row className="text-center justify-content-center">
                        {items.map((item, idx) => (
                            <Col
                                key={idx}
                                xs={12}
                                sm={6}
                                md={4}
                                lg={3}
                                className="mb-4 d-flex flex-column align-items-center"
                            >
                                <Link
                                    to={item.link}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <img
                                        src={item.src}
                                        alt={item.title}
                                        style={{
                                            width: 'clamp(100px, 10vw, 150px)',
                                            height: 'auto',
                                            cursor: 'pointer',
                                        }}
                                    />
                                    <h4
                                        className="mt-3"
                                        style={{
                                            color: '#fff',
                                            fontSize: 'calc(1rem + 0.3vw)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <b>{item.title}</b>
                                    </h4>
                                    <p style={{ color: '#fff', maxWidth: '90%' }}>{item.desc}</p>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
        </div>
    );
}
