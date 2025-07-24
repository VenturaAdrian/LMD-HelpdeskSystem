import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';

export default function ViewHDTicket() {
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [createdByData, setCreatedByData] = useState({});
    const [hdUser, setHDUser] = useState({});
    const [tier, setTier] = useState('');
    const [isEditable, setIsEditable] = useState(false);
    const [showAcceptButton, setShowAcceptButton] = useState(false);
    const [hdnotesState, setHDNotesState] = useState(false)
    const [noteAlert, setNoteAlert] = useState(false)
    const [notes, setNotes] = useState(false)


    const ticket_id = new URLSearchParams(window.location.search).get('id');

    const subCategoryOptions = {
        hardware: ['Computer', 'Laptop', 'Monitor', 'Printer/Scanner', 'Peripherals', 'Fax', 'Others'],
        network: ['Internet Connectivity', 'Wi-Fi', 'Email/Server Access', 'Network Printer/Scanner', 'Firewall', 'Others'],
        software: ['Application Not Responding', 'Installation/Uninstallation', 'System Updates', 'Login Issue', 'Outlook', 'Security', 'Others'],
    };
    //buttons validation
    useEffect(() => {
        const empInfo = JSON.parse(localStorage.getItem('user'));

        //Tier1
        if (empInfo.emp_tier === 'tier1') {
            if (formData.ticket_status === 'open') {
                if (isEditable === true) {
                    setShowAcceptButton(false)
                } else {
                    setShowAcceptButton(true)
                }
            }
            if (formData.assigned_group === 'tier2' || formData.assigned_group === 'tier3') {
                setIsEditable(false);
            } else if (formData.ticket_status === 'in-progress' || formData.ticket_status === 'assigned') {
                if (formData.assigned_to !== empInfo.user_name) {
                    setIsEditable(false)
                    setShowAcceptButton(true)
                } else {
                    setIsEditable(true)
                }

            }

            if (formData.ticket_status === 'escalate2' || formData.ticket_status === 'escalate3' ||
                formData.ticket_status === 'resolved' || formData.ticket_status === 'closed') {
                setIsEditable(false);
                if (isEditable === true) {
                    setShowAcceptButton(false)
                } else {
                    setShowAcceptButton(true)

                }
            }

        }
        //Tier 2
        if (empInfo.emp_tier === 'tier2') {
            if (formData.ticket_status === 'escalate2' || formData.ticket_status === 'open') {
                if (isEditable === true) {
                    setShowAcceptButton(false)
                } else {
                    setShowAcceptButton(true)
                }
            }
            if (formData.assigned_group === 'escalate3') {
                setIsEditable(false);
            } else if (formData.ticket_status === 'in-progress' || formData.ticket_status === 'assigned') {
                if (formData.assigned_to !== empInfo.user_name) {
                    setIsEditable(false)
                    setShowAcceptButton(true)
                } else {
                    setIsEditable(true)
                }
            }

            if (formData.ticket_status === 'escalate3' ||
                formData.ticket_status === 'resolved' || formData.ticket_status === 'closed') {
                setIsEditable(false);
                if (isEditable === true) {
                    setShowAcceptButton(false)
                } else {
                    setShowAcceptButton(true)
                }
            }

            if (formData.assigned_group === 'tier3' && (formData.ticket_status === 'in-progress' || formData.ticket_status === 'assigned')) {
                setIsEditable(false)
                setShowAcceptButton(false)
            }
        }
        //Tier 3
        if (empInfo.emp_tier === 'tier3') {
            if (formData.ticket_status === 'escalate3' || formData.ticket_status === 'open') {
                if (isEditable === true) {
                    setShowAcceptButton(false)
                } else {
                    setShowAcceptButton(true)
                }
            }
            if (formData.ticket_status === 'in-progress' || formData.ticket_status === 'assigned') {
                if (formData.assigned_to !== empInfo.user_name) {
                    setIsEditable(false)
                    setShowAcceptButton(true)
                } else {
                    setIsEditable(true)
                }

            }

            if (formData.ticket_status === 'escalate2' || formData.ticket_status === 'escalate3' ||
                formData.ticket_status === 'resolved' || formData.ticket_status === 'closed') {
                setIsEditable(false);
                if (isEditable === true) {
                    setShowAcceptButton(false)
                } else {
                    setShowAcceptButton(true)
                }
            }
        }

    }, [formData.ticket_status, formData.assigned_group])

    useEffect(() => {
        if (formData.ticket_status === 'in-progress') {
            setHDNotesState(true)
        }
    }, [formData.ticket_status])

    //Get user from ticket
    useEffect(() => {
        if (formData.created_by) {
            const fetchCreatedby = async () => {
                try {
                    const response = await axios.get(`${config.baseApi}/authentication/get-by-username`, {
                        params: { user_name: formData.created_by }
                    });
                    setCreatedByData(response.data);
                } catch (err) {
                    console.log(err);
                }
            };
            fetchCreatedby();
        }
        if (formData.assigned_to !== "") {
            const fetchHDUser = async () => {
                try {
                    const response = await axios.get(`${config.baseApi}/authentication/get-by-username`, {
                        params: { user_name: formData.assigned_to }
                    });
                    setHDUser(response.data);
                } catch (err) {
                    console.log(err);
                }
            };
            fetchHDUser();
        }
        if (formData.assigned_group === 'tier1') {
            setTier('Tier 1')
        } else if (formData.assigned_group === 'tier2') {
            setTier('Tier 2')
        } else if (formData.assigned_group === 'tier3') {
            setTier('Tier 3')
        }





    }, [formData.created_by, formData.assigned_to, formData.assigned_group, formData.ticket_status]);

    //Get the ticket 
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

    const HandleAcceptButton = async () => {
        const empInfo = JSON.parse(localStorage.getItem('user'));

        try {
            axios.post(`${config.baseApi}/ticket/update-accept-ticket`, {
                user_id: empInfo.user_id,
                ticket_id: ticket_id
            });
            window.location.reload();
            setIsEditable(true)
            setShowAcceptButton(false)

        } catch (err) {
            console.log(err)
        }


    }

    const handleSubmitNote = (e) => {
        e.preventDefault();

        if (notes === '') {
            set
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedForm = { ...prev, [name]: value };
            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'ticket_category', 'ticket_SubCategory', 'notes'];
            const changed = fieldsToCheck.some(field => updatedForm[field] !== originalData[field]);
            setHasChanges(changed);
            return updatedForm;
        });
    };

    const handleSave = async () => {
        try {
            const changedFields = {};
            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'ticket_category', 'ticket_SubCategory', 'notes'];
            fieldsToCheck.forEach(field => {
                if (formData[field] !== originalData[field]) {
                    changedFields[field] = {
                        from: originalData[field],
                        to: formData[field]
                    };
                }
            });

            const dataToSend = new FormData();
            dataToSend.append('ticket_id', formData.ticket_id);
            dataToSend.append('ticket_subject', formData.ticket_subject);
            dataToSend.append('ticket_type', formData.ticket_type);
            dataToSend.append('ticket_status', formData.ticket_status);
            dataToSend.append('ticket_category', formData.ticket_category);
            dataToSend.append('ticket_SubCategory', formData.ticket_SubCategory);
            dataToSend.append('ticket_urgencyLevel', formData.ticket_urgencyLevel);
            dataToSend.append('Description', formData.Description);
            dataToSend.append('notes', formData.notes || '');

            if (formData.attachmentFiles && formData.attachmentFiles.length > 0) {
                formData.attachmentFiles.forEach(file => {
                    dataToSend.append('attachments', file);
                });
            } else {
                dataToSend.append('Attachments', formData.Attachments || '');
            }

            await axios.post(`${config.baseApi}/ticket/update-ticket`, dataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Ticket updated successfully.');
            setOriginalData(formData);
            setHasChanges(false);

            window.location.reload();
        } catch (err) {
            console.error("Error updating ticket:", err);
            alert('Failed to update ticket.');
        }
    };

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
        <Container fluid className="pt-100 pb-4" style={{ background: 'linear-gradient(to bottom, #ffe798, #b8860b)', minHeight: '100vh' }}>
            <Container className="bg-white p-4 rounded-3 shadow-sm">
                <Row>
                    <Col lg={8}>
                        <Row className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="fw-bold text-dark mb-0">Ticket Details</h3>
                                {showAcceptButton && (
                                    <Button variant="primary" size="sm" style={{ width: '200px', minHeight: '40px' }} onClick={HandleAcceptButton}>
                                        Accept
                                    </Button>
                                )}
                                {hasChanges && (
                                    <Button variant="primary" size="sm" style={{ width: '200px', minHeight: '40px' }} onClick={handleSave}>Save Changes</Button>
                                )}
                            </div>
                        </Row>

                        <h6 className="text-muted fw-semibold mb-2">Dates</h6>
                        <Row>

                            <Form.Group as={Col} md={6} className="mb-2" >
                                <Form.Label>Created at</Form.Label>
                                <Form.Control value={formData.created_at ? new Date(formData.created_at).toLocaleString() : '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Updated at</Form.Label>
                                <Form.Control name="updated_at" value={formData.updated_at ? new Date(formData.updated_at).toLocaleString() : '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Responded at</Form.Label>
                                <Form.Control name="responded_at" value={formData.responded_at ? new Date(formData.responded_at).toLocaleString() : '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Resolved at</Form.Label>
                                <Form.Control name="resolved_at" value={formData.resolved_at ? new Date(formData.resolved_at).toLocaleString() : '-'} disabled />
                            </Form.Group>
                        </Row>

                        <h6 className="text-muted fw-semibold mt-4 mb-2">Details</h6>
                        <Row>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Created By</Form.Label>
                                <Form.Control name="created_by" value={formData.created_by ? formData.created_by : '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Employee</Form.Label>
                                <Form.Control value={createdByData.emp_FirstName ? createdByData.emp_FirstName + " " + createdByData.emp_LastName : '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Department</Form.Label>
                                <Form.Control value={createdByData.emp_department ? createdByData.emp_department : '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Position</Form.Label>
                                <Form.Control value={createdByData.emp_position ? createdByData.emp_position : ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Assigned To</Form.Label>
                                <Form.Control name="assigned_to" value={hdUser?.emp_FirstName && hdUser?.emp_LastName ? `${hdUser.emp_FirstName}` + " " + `${hdUser.emp_LastName}` : '-'} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Assigned Group</Form.Label>
                                <Form.Control name="assigned_group" value={tier ? tier : '-'} disabled />
                            </Form.Group>
                        </Row>

                        <h6 className="text-muted fw-semibold mt-4 mb-2">Request Info</h6>
                        <Row>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket ID</Form.Label>
                                <Form.Control name="ticket_id" value={formData.ticket_id ? formData.ticket_id : ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket Subject</Form.Label>
                                <Form.Control name="ticket_subject" value={formData.ticket_subject ? formData.ticket_subject : ''} onChange={handleChange} disabled={!isEditable} />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket Type</Form.Label>
                                <Form.Select name="ticket_type" value={formData.ticket_type ? formData.ticket_type : ''} onChange={handleChange} required disabled={!isEditable}>
                                    <option value="incident">Incident</option>
                                    <option value="request">Request</option>
                                    <option value="inquiry">Inquiry</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="ticket_status" value={formData.ticket_status ? formData.ticket_status : ''} onChange={handleChange} required disabled={!isEditable}>
                                    <option value="open">Open</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="escalate2">Escalate Tier II</option>
                                    <option value="escalate3">Escalate Tier III</option>
                                    <option value="resolved">Resolve</option>
                                    <option value="closed">Close</option>
                                    <option value="re-Opened">Re Open</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Urgency</Form.Label>
                                <Form.Select name="ticket_urgencyLevel" value={formData.ticket_urgencyLevel ? formData.ticket_urgencyLevel : ''} onChange={handleChange} required disabled={!isEditable}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Category</Form.Label>
                                <Form.Select name="ticket_category" value={formData.ticket_category ? formData.ticket_category : ''} onChange={handleChange} required disabled={!isEditable} >
                                    <option value="hardware">Hardware</option>
                                    <option value="network">Network</option>
                                    <option value="software">Software</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Sub Category</Form.Label>
                                <Form.Select name="ticket_SubCategory" value={formData.ticket_SubCategory ? formData.ticket_SubCategory : ''} onChange={handleChange} required disabled={!isEditable}>
                                    {subCategoryOptions[formData.ticket_category]?.map((subcat, idx) => (
                                        <option key={idx} value={subcat}>{subcat}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-3">
                                <Form.Label>Asset Tag</Form.Label>
                                <Form.Control name="asset_number" value={formData.asset_number ? formData.asset_number : ''} disabled />
                            </Form.Group>

                            <Form.Group as={Col} md={12} className="mb-2">
                                <Form.Label>Attachments</Form.Label>
                                {renderAttachment()}
                            </Form.Group>
                        </Row>

                        <h6 className="text-muted fw-semibold mt-4 mb-2">Description</h6>
                        <Form.Group className="mb-3">
                            <Form.Control as="textarea" rows={7} name="Description" value={formData.Description ? formData.Description : ''} disabled />
                        </Form.Group>


                    </Col>

                    <Col lg={4}>
                        <h6 className="text-muted fw-semibold mb-2">Helpdesk Notes</h6>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <Form.Group>
                                    <Form.Label className="fw-semibold text-muted">Notes</Form.Label>

                                    <Form.Control
                                        as="textarea"
                                        rows={12}
                                        name="notes"
                                        placeholder="Add notes here..."
                                        value={notes}
                                        onChange={handleChange}
                                        disabled={!hdnotesState}
                                        style={{ resize: 'none' }}
                                    />
                                </Form.Group>

                                {hdnotesState && (
                                    <div className="d-flex justify-content-end mt-3">
                                        <Button variant="primary" size="sm" onClick={handleSubmitNote}>
                                            Save Note
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                </Row>
            </Container>
        </Container>
    );
}
