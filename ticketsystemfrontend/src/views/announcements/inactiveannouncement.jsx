import { useEffect, useState } from 'react';
import { Table, Container, Button, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import config from 'config';

export default function InActiveAnnouncement() {
    const [announcementText, setAnnouncementText] = useState('');
    const [announcementsList, setAnnouncementsList] = useState([]);
    const [fullname, setFullname] = useState({});

    const [showCard, setShowCard] = useState(false);
    const [ancId, setAncId] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/announcements/get-all-anc`);


                const active = res.data.filter(data => data.is_active === false);
                setAnnouncementsList(active);

                const usernames = res.data.map(data => data.created_by);

                const getUsernames = await axios.get(`${config.baseApi}/authentication/get-all-notes-usernames`, {
                    params: { user_name: JSON.stringify(usernames) }
                });

                const userMap = {}
                getUsernames.data.forEach(user => {
                    userMap[user.user_name] = `${user.emp_FirstName} ${user.emp_LastName}`;
                });
                setFullname(userMap);
            } catch (error) {
                console.error("Failed to fetch announcements:", error);
            }
        };

        fetchAnnouncements();
    }, []);

    const HandleAdd = () => {
        setShowCard(true);
        setIsEditing(false);
        setAnnouncementText('');
    };

    const HandleSave = async () => {
        const empInfo = JSON.parse(localStorage.getItem("user"));

        if (!announcementText.trim()) {
            alert("Announcement cannot be empty.");
            return;
        }
        try {
            await axios.post(`${config.baseApi}/announcements/add-anc`, {
                announcements: announcementText,
                created_by: empInfo.user_name,
            });
            setSuccess("Announcement created successfully!");
            setAnnouncementText('');
            setShowCard(false);
            window.location.reload();
        } catch (error) {
            console.error("Error saving announcement:", error);
            setError("Failed to create announcement.");
        }
    };

    const handleEditClick = (announcement) => {
        console.log("Editing announcement:", announcement);
        setAnnouncementText(announcement.announcements);
        setEditId(announcement.announcements_id);
        setIsEditing(true);
        setShowCard(true);
        setAncId(null);
    };

    const handleUpdate = async () => {
        const empInfo = JSON.parse(localStorage.getItem("user"));
        console.log("Updating announcement with ID:", editId, "Text:", announcementText, "User:", empInfo.user_name);
        try {
            await axios.post(`${config.baseApi}/announcements/update-anc`, {
                announcement_id: editId,
                announcements: announcementText,
                updated_by: empInfo.user_name
            });

            setSuccess("Announcement updated successfully!");

            setAnnouncementText('');
            setShowCard(false);
            setIsEditing(false);
            setEditId(null);

            window.location.reload();
        } catch (err) {
            console.log('Unable to update announcement:', err);
            setError("Failed to update announcement.");
        }
    };

    const handleDelete = async (announcementId) => {
        const empInfo = JSON.parse(localStorage.getItem("user"));
        if (!window.confirm("Are you sure you want to delete this announcement?")) {
            return;
        }
        try {
            await axios.post(`${config.baseApi}/announcements/delete-anc`, {
                announcement_id: announcementId,
                updated_by: empInfo.user_name
            });
            setSuccess("Announcement deleted successfully!");
            setAnnouncementsList(announcementsList.filter(item => item.announcements_id !== announcementId));
            setAncId(null);

            window.location.reload();
        } catch (error) {
            console.error("Error deleting announcement:", error);
            setError("Failed to delete announcement.");
        }
    }

    const HandleArchive = () => {
        window.location.replace('/ticketsystem/inactive-announcements');
    }

    return (
        <Container
            fluid
            className="pt-100"
            style={{
                background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                minHeight: '100vh',
                paddingTop: '100px',
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

            <Row className="mb-3">
                <Col>
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={HandleArchive}>Archive</Button>
                        <Button variant="primary" onClick={HandleAdd}>+ Create Post</Button>
                    </div>
                </Col>
            </Row>


            <div className="mt-4">
                {announcementsList.map((item) => (
                    <Card key={item.announcements_id} className="mb-4 shadow-sm" style={{ borderRadius: '15px' }}>
                        <Card.Body>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <div className="d-flex align-items-center">
                                    <img
                                        src="src/assets/images/user/avatar-2.jpg"
                                        alt="Profile"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            marginRight: '10px'
                                        }}
                                    />
                                    <div>
                                        <strong>
                                            {fullname[item.created_by] || item.created_by || 'Unknown'}
                                        </strong>
                                        <br />
                                        <small className="text-muted">
                                            {new Date(item.created_at).toLocaleString()}
                                        </small>
                                    </div>
                                </div>

                                <div onClick={() => {
                                    setAncId(item.announcements_id === ancId ? null : item.announcements_id);
                                }}>
                                    <i className="bi bi-three-dots" style={{ cursor: 'pointer' }}></i>

                                    {ancId === item.announcements_id && (
                                        <div
                                            className="position-absolute bg-white border rounded shadow-sm"
                                            style={{ top: '20px', right: '0', zIndex: 1000, minWidth: '100px' }}
                                        >
                                            <div
                                                className="p-2 text-dark border-bottom"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleEditClick(item)}
                                            >
                                                Edit
                                            </div>
                                            <div
                                                className="p-2 text-danger"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    handleDelete(item.announcements_id);
                                                }}
                                            >
                                                Delete
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Card.Text style={{ fontSize: '1.1rem' }}>
                                {item.announcements}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            {showCard && (
                <Card className='announcement-card p-4 shadow' style={{ borderRadius: '15px', maxWidth: '600px', margin: '0 auto' }}>
                    <Card.Title className="mb-3">
                        {isEditing ? "Edit Announcement" : "Create Announcement"}
                    </Card.Title>
                    <Form>
                        <Form.Group controlId="announcementText">
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={announcementText}
                                onChange={(e) => setAnnouncementText(e.target.value)}
                                placeholder="What's on your mind?"
                            />
                        </Form.Group>

                        <div className="mt-3 d-flex justify-content-end">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setShowCard(false);
                                    setIsEditing(false);
                                    setEditId(null);
                                    setAnnouncementText('');
                                }}
                                className="me-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={isEditing ? handleUpdate : HandleSave}
                            >
                                {isEditing ? "Update" : "Post"}
                            </Button>
                        </div>
                    </Form>
                </Card>
            )}
        </Container>
    );
}
