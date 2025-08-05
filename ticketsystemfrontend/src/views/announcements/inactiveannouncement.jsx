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

    const [currentPage, setCurrentPage] = useState(1);
    const announcementsPerPage = 5;

    // Pagination logic
    const indexOfLast = currentPage * announcementsPerPage;
    const indexOfFirst = indexOfLast - announcementsPerPage;
    const currentAnnouncements = announcementsList.slice(indexOfFirst, indexOfLast);

    const totalPages = Math.ceil(announcementsList.length / announcementsPerPage);

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

    const handleEditClick = async (announcement) => {
        console.log(announcement.announcements_id)
        const empInfo = JSON.parse(localStorage.getItem("user"));
        try {
            await axios.post(`${config.baseApi}/announcements/reactivate-anc`, {
                announcement_id: announcement.announcements_id,
                updated_by: empInfo.user_name
            });

            setSuccess("Announcement Re-activated successfully!");

            setAnnouncementText('');
            setShowCard(false);
            setIsEditing(false);
            setEditId(null);

            window.location.reload();
        } catch (err) {
            console.log('Unable to update announcement:', err);
            setError("Failed to update announcement.");
        }


        console.log("Editing announcement:", announcement);

        setAncId(null);
    };



    const handleDelete = async (announcementId) => {
        const empInfo = JSON.parse(localStorage.getItem("user"));
        if (!window.confirm("Are you sure you want to delete this announcement?")) {
            return;
        }
        try {
            await axios.post(`${config.baseApi}/announcements/perma-delete-anc`, {
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

    const HandleAnnouncements = () => {
        window.location.replace('/ticketsystem/announcements');
    }

    return (
        <Container
            fluid
            className="pt-100"
            style={{
                background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                minHeight: '100vh',
                paddingTop: '100px',
                paddingBottom: '20px'
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
                        <Button variant="secondary" onClick={HandleAnnouncements}>Announcements</Button>
                    </div>
                </Col>
            </Row>


            <div className="mt-4">
                {currentAnnouncements.map((item) => (
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
                                                Re activate
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


                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                        <Button
                            variant="miColor"
                            size="sm"
                            className="me-2"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </Button>
                        <span className="align-self-center">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="miColor"
                            size="sm"
                            className="ms-2"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>


        </Container>
    );
}
