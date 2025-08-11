import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import config from "config";
import { Container, Card, Accordion, ListGroup, Modal, Button, Form, ButtonGroup } from "react-bootstrap";

import { useNavigate } from 'react-router';

export default function HardwareArchive() {
    const [loaded] = useState(true);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const contentRef = useRef(null);
    const [faqData, setFaqData] = useState([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const all = await axios.get(`${config.baseApi}/knowledgebase/all-knowledgebase`);
                // Map backend data into faqData array format
                if (all.data && Array.isArray(all.data)) {
                    setFaqData(all.data.map(item => ({
                        question: item.kb_title,
                        answer: item.kb_desc
                    })));
                }
            } catch (err) {
                console.error("Error fetching FAQ data:", err);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {

        if (newTitle === ' ') {
            setError("Please fill in both title and content.");
        } else {
            const empInfo = JSON.parse(localStorage.getItem("user"));
            try {
                await axios.post(`${config.baseApi}/knowledgebase/add-knowledgebase`, {
                    kb_title: newTitle,
                    kb_desc: newContent,
                    created_by: empInfo.user_name,
                    kb_category: "hardware"
                });
                setSuccess("Hardware saved successfully");
                console.log("Hardware saved successfully");
            } catch (err) {
                console.error("Error saving Hardware:", err);
            }

            setFaqData([...faqData, { question: newTitle, answer: newContent }]);
            setNewTitle("");
            setNewContent("");
            setShowModal(false);
        }


    };

    const handleContentChange = () => {
        setNewContent(contentRef.current.innerHTML);
    };

    // Toolbar formatting commands
    const applyFormat = (command) => {
        document.execCommand(command, false, null);
        contentRef.current.focus();
    };

    const applyLink = () => {
        const url = prompt("Enter the link URL:");
        if (url) {
            document.execCommand("createLink", false, url);
            contentRef.current.focus();
        }
    };

    return (
        <Container
            fluid
            className="pt-100 px-3 px-md-5"
            style={{
                background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                minHeight: '100vh',
                paddingTop: '100px',
                paddingBottom: '20px',
            }}
        >
            {error && (
                <div className="position-fixed start-50 translate-middle-x" style={{ top: '100px', zIndex: 9999, minWidth: '300px' }}>
                    <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>
                </div>
            )}
            {success && (
                <div className="position-fixed start-50 translate-middle-x" style={{ top: '100px', zIndex: 9999, minWidth: '300px' }}>
                    <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>
                </div>
            )}
            <Container>
                <Card className="p-4 shadow-lg" style={{ borderRadius: "20px", backgroundColor: "#fff" }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="fw-bold text-dark mb-0">Hardware Frequently Asked Questions</h2>
                        <div className="d-flex gap-2">
                            <Button variant="primary" onClick={() => navigate('/hardwarearchive')}>Archive</Button>
                            <Button variant="primary" onClick={() => setShowModal(true)}>Add</Button>
                        </div>
                    </div>

                    <hr />

                    <Accordion defaultActiveKey="0" flush>
                        {faqData.map((faq, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                                <Accordion.Header>{faq.question}</Accordion.Header>
                                <Accordion.Body>
                                    {Array.isArray(faq.answer) ? (
                                        <ListGroup variant="flush">
                                            {faq.answer.map((item, idx) => (
                                                <ListGroup.Item key={idx} className="ps-3 text-muted">
                                                    {item}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <div
                                            className="text-muted"
                                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                                        />
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>

                    <hr className="my-4" />
                    <p className="text-muted text-center">
                        Have more questions? Email us at{" "}
                        <span className="fw-semibold text-primary">
                            adrian.ventura@lepantomining.com
                        </span>
                    </p>
                </Card>
            </Container>

            {/* Floating Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Hardware Troubleshooting Steps</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title question"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label>Content</Form.Label>

                            {/* Formatting Toolbar */}
                            <ButtonGroup size="sm" className="mb-2">
                                <Button variant="outline-secondary" onClick={() => applyFormat("bold")}><b>B</b></Button>
                                <Button variant="outline-secondary" onClick={() => applyFormat("italic")}><em>I</em></Button>
                                <Button variant="outline-secondary" onClick={() => applyFormat("underline")}><u>U</u></Button>
                                <Button variant="outline-secondary" onClick={() => applyFormat("insertUnorderedList")}>• List</Button>
                                <Button variant="outline-secondary" onClick={() => applyFormat("insertOrderedList")}>1. List</Button>
                                <Button variant="outline-secondary" onClick={applyLink}>🔗 Link</Button>
                            </ButtonGroup>

                            <div
                                ref={contentRef}
                                contentEditable
                                onInput={handleContentChange}
                                style={{
                                    border: "1px solid #ced4da",
                                    borderRadius: "5px",
                                    padding: "10px",
                                    minHeight: "150px",
                                    outline: "none"
                                }}
                                required
                                placeholder="Enter FAQ content..."
                            ></div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
