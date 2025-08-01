import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Card, Button, Modal, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';

export default function ViewTicket() {
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [ticketForData, setTicketForData] = useState({});
    const [currentUserData, setCurrentUserData] = useState({});
    const ticket_id = new URLSearchParams(window.location.search).get('id');

    const [allnotes, setAllNotes] = useState([]);
    const [notesofhduser, setnoteofhduser] = useState('')

    const [showCloseReasonModal, setShowCloseReasonModal] = useState(false);
    const [close, setClose] = useState(false);
    const [closureReason, setClosureReason] = useState('');

    const [error, setError] = useState('');
    const [successful, setSuccessful] = useState('');

    const subCategoryOptions = {
        hardware: ['Computer', 'Laptop', 'Monitor', 'Printer/Scanner', 'Peripherals', 'Fax', 'Others'],
        network: ['Internet Connectivity', 'Wi-Fi', 'Email/Server Access', 'Network Printer/Scanner', 'Firewall', 'Others'],
        software: ['Application Not Responding', 'Installation/Uninstallation', 'System Updates', 'Login Issue', 'Outlook', 'Security', 'Others'],
    };

    //Alert timeout effect
    useEffect(() => {
        if (error || successful) {
            const timer = setTimeout(() => {
                setError('');
                setSuccessful('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, successful]);

    // Check if ticket status is closed
    useEffect(() => {
        if (formData.ticket_status === 'closed') {
            setClose(false)
        } else {
            setClose(true)
        }
    }, [formData.ticket_status])

    // Fetch all notes for the ticket
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const getTicket = await axios.get(`${config.baseApi}/ticket/get-all-notes/${ticket_id}`);
                setAllNotes(getTicket.data);

                const usernames = getTicket.data.map(note => note.created_by);

                const response = await axios.get(`${config.baseApi}/authentication/get-all-notes-usernames`, {
                    params: { user_name: JSON.stringify(usernames) }
                });

                console.log('HD notes userdata: ', response.data);
                const userMap = {}
                response.data.forEach(user => {
                    userMap[user.user_name] = `${user.emp_FirstName} ` + ' ' + `${user.emp_LastName}`;
                });
                setnoteofhduser(userMap)

            } catch (err) {
                console.log('Unable to fetch data: ', err)
            }
        }
        fetchNotes();
    }, [])

    // Fetch ticket data by ID
    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchticket = await axios.get(`${config.baseApi}/ticket/ticket-by-id`, {
                    params: { id: ticket_id }
                });
                const ticket = Array.isArray(fetchticket.data) ? fetchticket.data[0] : fetchticket.data;
                setFormData(ticket);
                setOriginalData(ticket);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        };
        fetchData();
    }, [ticket_id]);

    // Fetch current user data from local storage
    useEffect(() => {
        const empInfo = JSON.parse(localStorage.getItem('user'));
        setCurrentUserData(empInfo);
    }, []);

    // Fetch created by user data
    useEffect(() => {
        if (formData.ticket_for) {
            const fetchCreatedby = async () => {
                try {
                    const response = await axios.get(`${config.baseApi}/authentication/get-by-username`, {
                        params: { user_name: formData.ticket_for }
                    });
                    setTicketForData(response.data);
                } catch (err) {
                    console.log(err);
                }
            };
            fetchCreatedby();
        }
    }, [formData.ticket_for]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedForm = { ...prev, [name]: value };
            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'ticket_category', 'ticket_SubCategory', 'Description', 'Attachments'];
            const changed = fieldsToCheck.some(field => updatedForm[field] !== originalData[field]);
            setHasChanges(changed);
            return updatedForm;
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const filePaths = files.map(file => `uploads/${file.name}`);
            const updatedForm = {
                ...formData,
                Attachments: filePaths.join(','),
                attachmentFiles: files
            };
            setFormData(updatedForm);

            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'ticket_category', 'ticket_SubCategory', 'Description', 'Attachments'];
            const changed = fieldsToCheck.some(field => updatedForm[field] !== originalData[field]);
            setHasChanges(changed);
        }
    };

    const HandleCheckerFields = async (e) => {
        if (formData.ticket_status === 'closed') {
            setShowCloseReasonModal(true);
        } else {

            await handleSave();
        }
    }

    //Close tikcet function
    const handleConfirmClosure = async (e) => {
        e.preventDefault();
        const empInfo = JSON.parse(localStorage.getItem('user'));
        if (!closureReason.trim()) return;
        try {
            //place a note
            await axios.post(`${config.baseApi}/ticket/note-post`, {
                notes: closureReason,
                current_user: empInfo.user_name,
                ticket_id: ticket_id
            });

            //Send app notifcation 
            await axios.post(`${config.baseApi}/ticket/notified-true`, {
                ticket_id: ticket_id,
                user_id: empInfo.user_id
            })
            setShowCloseReasonModal(false);
            setClosureReason('');
            setClose(false);

            await handleSave();
            setSuccessful('Ticket closed successfully.');
        } catch (err) {
            console.log(err);
            setError('Failed to close ticket. Please try again.');
            setShowCloseReasonModal(false);
            setClosureReason('');

        }
    }
    //Save updated fields
    const handleSave = async () => {
        try {
            //check any changes to save logs
            const changedFields = [];
            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'ticket_category', 'ticket_SubCategory', 'Description', 'Attachments'];
            fieldsToCheck.forEach(field => {
                const original = originalData[field];
                const current = formData[field];
                if ((original ?? '') !== (current ?? '')) {
                    changedFields.push(` ${currentUserData.user_name} Changed '${field}' from '${original}' to '${current}'`)
                }
            });
            console.log('Changed Fields:', changedFields);
            const changesMade = changedFields.length > 0 ? changedFields.join('; ') : '';

            console.log(changesMade)
            const dataToSend = new FormData();
            dataToSend.append('ticket_id', formData.ticket_id);
            dataToSend.append('ticket_subject', formData.ticket_subject);
            dataToSend.append('ticket_type', formData.ticket_type);
            dataToSend.append('ticket_status', formData.ticket_status);
            dataToSend.append('ticket_category', formData.ticket_category);
            dataToSend.append('ticket_SubCategory', formData.ticket_SubCategory);
            dataToSend.append('ticket_urgencyLevel', formData.ticket_urgencyLevel);
            dataToSend.append('Description', formData.Description);
            dataToSend.append('changes_made', changesMade);
            dataToSend.append('updated_by', currentUserData.user_name);

            if (formData.attachmentFiles && formData.attachmentFiles.length > 0) {
                formData.attachmentFiles.forEach(file => {
                    dataToSend.append('attachments', file);
                });
            } else {
                dataToSend.append('Attachments', formData.Attachments || '');
            }
            console.log(dataToSend)
            //save note if user re-opened the ticket
            if (formData.ticket_status === 're-opened') {
                await axios.post(`${config.baseApi}/ticket/note-post`, {
                    notes: `${currentUserData.user_name} re opened the ticket.`,
                    current_user: currentUserData.user_name,
                    ticket_id: ticket_id
                });
            }

            // Send notification to HD
            await axios.post(`${config.baseApi}/ticket/notified-true`, {
                ticket_id: ticket_id,
                user_id: currentUserData.user_id
            })

            await axios.post(`${config.baseApi}/ticket/update-ticket`, dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccessful('Ticket updated successfully.');
            setOriginalData(formData);
            setHasChanges(false);
            window.location.reload()



        } catch (err) {
            console.error("Error updating ticket:", err);
            setError('Failed to update ticket.');
        }
    };

    //Display the files uploaded
    const renderAttachment = () => {
        if (!formData.Attachments) return <div className="text-muted fst-italic">No attachments</div>;

        const filePaths = formData.Attachments.split(',');

        const getFileIcon = (filename) => {
            const ext = filename.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FaFileImage size={28} className="text-primary" />;
            if (['pdf'].includes(ext)) return <FaFilePdf size={28} className="text-danger" />;
            if (['doc', 'docx'].includes(ext)) return <FaFileWord size={28} className="text-info" />;
            return <FaFileAlt size={28} className="text-secondary" />;
        };

        return (
            <div className="d-flex flex-column">
                {filePaths.map((filePath, idx) => {
                    const fileName = filePath.split('\\').pop().split('/').pop();
                    const shortName = fileName.length > 25 ? fileName.slice(0, 25) + '...' : fileName;
                    const fileUrl = `${config.baseApi}/${filePath.replace(/\\/g, '/')}`;

                    return (
                        <Card key={idx} className="shadow-sm border-0 mb-1" style={{ backgroundColor: '#fdedd3ff' }}>
                            <Card.Body className="d-flex align-items-center justify-content-between p-2">
                                <div className="d-flex align-items-center">
                                    <div className="me-3">{getFileIcon(fileName)}</div>
                                    <div className="text-truncate" style={{ maxWidth: '250px' }}>{shortName}</div>
                                </div>
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline-primary" size="sm">View</Button>
                                </a>
                            </Card.Body>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <Container fluid className="pt-100 pb-4" style={{ background: 'linear-gradient(to bottom, #ffe798, #b8860b)', minHeight: '100vh', paddingTop: '100px' }}>
            {/* ALERT BAR */}
            {error && (
                <div
                    className="position-fixed start-50 l translate-middle-x"
                    style={{ top: '100px', zIndex: 9999, minWidth: '300px' }}
                >
                    <Alert variant="danger" onClose={() => setError('')} dismissible>
                        {error}
                    </Alert>
                </div>
            )}
            {successful && (
                <div
                    className="position-fixed start-50 l translate-middle-x"
                    style={{ top: '100px', zIndex: 9999, minWidth: '300px' }}
                >
                    <Alert variant="success" onClose={() => setSuccessful('')} dismissible>
                        {successful}
                    </Alert>
                </div>
            )}
            <Container className="bg-white p-4 rounded-3 shadow-sm">
                <Row>
                    <Col lg={8}>
                        <Row className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="fw-bold text-dark mb-0">Ticket Details</h3>
                                <div className="d-flex gap-2">
                                    {hasChanges && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            style={{ width: '200px', minHeight: '40px' }}
                                            onClick={HandleCheckerFields}
                                        >
                                            Save Changes
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Row>

                        <h6 className="text-muted fw-semibold mb-2">Dates</h6>
                        <Row>
                            {['created_at', 'updated_at', 'responded_at', 'resolved_at'].map((field, index) => (
                                <Form.Group as={Col} md={6} className="mb-2" key={index}>
                                    <Form.Label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>
                                    <Form.Control name={field} value={formData[field] ? new Date(formData[field]).toLocaleString() : '-'} disabled />
                                </Form.Group>
                            ))}
                        </Row>

                        <h6 className="text-muted fw-semibold mt-4 mb-2">Details</h6>
                        <Row>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Created By</Form.Label>
                                <Form.Control name="created_by" value={formData.created_by || '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Employee</Form.Label>
                                <Form.Control value={ticketForData.emp_FirstName + " " + ticketForData.emp_LastName || ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Department</Form.Label>
                                <Form.Control value={ticketForData.emp_department || ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Position</Form.Label>
                                <Form.Control value={ticketForData.emp_position || ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Assigned To</Form.Label>
                                <Form.Control name="assigned_to" value={formData.assigned_to || '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Assigned Group</Form.Label>
                                <Form.Control name="assigned_group" value={formData.assigned_group || '-'} disabled />
                            </Form.Group>
                        </Row>

                        <h6 className="text-muted fw-semibold mt-4 mb-2">Request Info</h6>
                        <Row>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket ID</Form.Label>
                                <Form.Control name="ticket_id" value={formData.ticket_id || ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket Subject</Form.Label>
                                <Form.Control name="ticket_subject" value={formData.ticket_subject || ''} onChange={handleChange} disabled={!close} />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket Type</Form.Label>
                                <Form.Select name="ticket_type" value={formData.ticket_type || ''} onChange={handleChange} required disabled={!close}>
                                    <option value="incident">Incident</option>
                                    <option value="request">Request</option>
                                    <option value="inquiry">Inquiry</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="ticket_status" value={formData.ticket_status || ''} onChange={handleChange} required>
                                    <option value="open" hidden>Open</option>
                                    <option value="closed">Close</option>
                                    <option value="re-opened">Re open</option>

                                    <option value="assigned" hidden>Assigned</option>
                                    <option value="in-progress" hidden>In Progress</option>
                                    <option value="escalate2" hidden>Escalate Tier II</option>
                                    <option value="escalate3" hidden>Escalate Tier III</option>
                                    <option value="resolved" hidden>Resolve</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Urgency</Form.Label>
                                <Form.Select name="ticket_urgencyLevel" value={formData.ticket_urgencyLevel || ''} onChange={handleChange} required disabled={!close}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    name="ticket_category"
                                    value={formData.ticket_category || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={!close}
                                >
                                    <option value="hardware">Hardware</option>
                                    <option value="network">Network</option>
                                    <option value="software">Software</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Sub Category</Form.Label>
                                <Form.Select
                                    name="ticket_SubCategory"
                                    value={formData.ticket_SubCategory || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={!close}
                                >
                                    {subCategoryOptions[formData.ticket_category]?.map(
                                        (subcat, idx) => (
                                            <option key={idx} value={subcat}>
                                                {subcat}
                                            </option>
                                        )
                                    )}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-3">
                                <Form.Label>Asset Tag</Form.Label>
                                <Form.Control name="asset_number" value={formData.asset_number || ''} disabled />
                            </Form.Group>

                            <Form.Group as={Col} md={12} className="mb-2">
                                <Form.Label>Attachments</Form.Label>
                                {renderAttachment()}
                                <Form.Control type="file" multiple onChange={handleFileChange} className="mt-1" disabled={!close} />
                            </Form.Group>
                        </Row>

                        <h6 className="text-muted fw-semibold mt-4 mb-2">Description</h6>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={7}
                                name="Description"
                                value={formData.Description || ''}
                                onChange={handleChange}
                                disabled={!close}
                            />
                        </Form.Group>
                    </Col>

                    <Col lg={4}>
                        <h6 className="text-muted fw-semibold mb-2">Helpdesk Notes</h6>
                        <Card className="shadow-sm border-0">
                            <Card.Body>
                                <Form.Group>
                                    <div
                                        style={{
                                            maxHeight: '600px',
                                            overflowY: 'auto',
                                            paddingRight: '5px',
                                        }}
                                    >
                                        {allnotes && allnotes.length > 0 ? (
                                            [...allnotes]
                                                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                                .map((note, index) => (
                                                    <div
                                                        key={index}
                                                        className="mb-3 p-3 rounded-3 shadow-sm bg-body-tertiary border border-light-subtle"
                                                    >
                                                        <div
                                                            className="text-dark"
                                                            style={{
                                                                fontSize: '0.95rem',
                                                                whiteSpace: 'pre-wrap',
                                                            }}
                                                        >
                                                            {note.note}
                                                        </div>
                                                        <div className="d-flex justify-content-between align-items-center mt-2">
                                                            <small className="text-muted fst-italic">
                                                                {notesofhduser[note.created_by] || note.created_by || 'Unknown'}
                                                            </small>
                                                            <small className="text-muted">
                                                                {note.created_at
                                                                    ? new Date(
                                                                        note.created_at
                                                                    ).toLocaleString()
                                                                    : ''}
                                                            </small>
                                                        </div>
                                                    </div>
                                                ))
                                        ) : (
                                            <div className="text-muted fst-italic">
                                                No notes available.
                                            </div>
                                        )}
                                    </div>

                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Modal show={showCloseReasonModal} onHide={() => setShowCloseReasonModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Reason for Closing Ticket</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="closureReason">
                            <Form.Label>Please provide a reason:</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={closureReason}
                                onChange={(e) => setClosureReason(e.target.value)}
                                placeholder="Enter reason for closing the ticket"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCloseReasonModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirmClosure}
                            disabled={closureReason.trim() === ''}
                        >
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </Container>
    );
}
