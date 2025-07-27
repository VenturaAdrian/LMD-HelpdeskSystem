import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Card, Button, Alert } from 'react-bootstrap';
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
    const template = 'Steps taken:\nResolution:'
    const [notes, setNotes] = useState(template)
    const [allnotes, setAllNotes] = useState([]);
    const [notesofhduser, setnoteofhduser] = useState('')

    const [error, setError] = useState('');
    const [successful, setSuccessful] = useState('');

    const ticket_id = new URLSearchParams(window.location.search).get('id');

    const subCategoryOptions = {
        hardware: ['Computer', 'Laptop', 'Monitor', 'Printer/Scanner', 'Peripherals', 'Fax', 'Others'],
        network: ['Internet Connectivity', 'Wi-Fi', 'Email/Server Access', 'Network Printer/Scanner', 'Firewall', 'Others'],
        software: ['Application Not Responding', 'Installation/Uninstallation', 'System Updates', 'Login Issue', 'Outlook', 'Security', 'Others'],
    };
    //Alerts timeout
    useEffect(() => {
        if (error || successful) {
            const timer = setTimeout(() => {
                setError('');
                setSuccessful('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, successful]);

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
            if (formData.ticket_status === 're-opened') {
                setIsEditable(true);
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
            if (formData.ticket_status === 're-opened') {
                setIsEditable(true);
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
            if (formData.ticket_status === 're-opened') {
                setIsEditable(true);
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

    //Note checker availability
    useEffect(() => {
        const empInfo = JSON.parse(localStorage.getItem('user'));
        const fetchNotes = async () => {
            if (formData.ticket_status === 'in-progress' && formData.assigned_to === empInfo.user_name) {
                setHDNotesState(true)
            }

            try {
                const response = await axios.get(`${config.baseApi}/ticket/get-all-notes/${ticket_id}`);
                setAllNotes(response.data);

                const usernames = response.data.map(note => note.created_by)

                const responses = await axios.get(`${config.baseApi}/authentication/get-all-notes-usernames`, {
                    params: { user_name: JSON.stringify(usernames) }
                });

                console.log('HD NOTE USERDATA: ', responses.data)
                const userMap = {}
                responses.data.forEach(user => {
                    userMap[user.user_name] = `${user.emp_FirstName} ` + ' ' + `${user.emp_LastName}`;
                });
                setnoteofhduser(userMap)
            } catch (err) {
                console.log('UNABLE TO FETCH ALL NOTES: ', err)
            }
        }
        fetchNotes();
    }, [formData.ticket_status, ticket_id])

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
                ticket_id: ticket_id,
                ticket_status: formData.ticket_status
            });
            console.log(formData.ticket_status)
            window.location.reload();
            setIsEditable(true)
            setShowAcceptButton(false)

        } catch (err) {
            console.log(err)
        }


    }

    const handleSubmitNote = async (e) => {
        e.preventDefault();
        const empInfo = JSON.parse(localStorage.getItem('user'));
        try {
            if (notes === template) {
                setNoteAlert(true)
            } else {
                await axios.post(`${config.baseApi}/ticket/note-post`, {
                    notes,
                    current_user: empInfo.user_name,
                    ticket_id: ticket_id
                });
                setNotes('');
                console.log('Submitted a note succesfully');
                window.location.reload();
            }
        } catch (err) {
            console.log('Unable to submit note: ', err)
        }

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedForm = { ...prev, [name]: value };
            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'ticket_category', 'ticket_SubCategory'];
            const changed = fieldsToCheck.some(field => updatedForm[field] !== originalData[field]);
            setHasChanges(changed);

            return updatedForm;
        });
    };

    const handleSave = async () => {
        try {
            //Check changes
            const empInfo = JSON.parse(localStorage.getItem('user'));
            const changedFields = [];
            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'ticket_category', 'ticket_SubCategory', 'Description', 'Attachments'];
            fieldsToCheck.forEach(field => {
                const original = originalData[field];
                const current = formData[field];
                if ((original ?? '') !== (current ?? '')) {
                    changedFields.push(` ${empInfo.user_name} Changed '${field}' from '${original}' to '${current}'`)
                }
            });
            console.log('Changed Fields:', changedFields);
            const changesMade = changedFields.length > 0 ? changedFields.join('; ') : '';

            const dataToSend = new FormData();
            dataToSend.append('ticket_id', formData.ticket_id);
            dataToSend.append('ticket_subject', formData.ticket_subject);
            dataToSend.append('ticket_type', formData.ticket_type);
            dataToSend.append('ticket_status', formData.ticket_status);
            dataToSend.append('ticket_category', formData.ticket_category);
            dataToSend.append('ticket_SubCategory', formData.ticket_SubCategory);
            dataToSend.append('ticket_urgencyLevel', formData.ticket_urgencyLevel);
            dataToSend.append('Description', formData.Description);
            dataToSend.append('updated_by', empInfo.user_name)
            dataToSend.append('changes_made', changesMade);

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

            setSuccessful('Ticket updated successfully.');
            setOriginalData(formData);
            setHasChanges(false);

            window.location.reload();
        } catch (err) {
            console.error("Error updating ticket:", err);
            setError('Failed to update ticket. Please try again later.');
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
        <Container
            fluid
            className="pt-100 pb-4"
            style={{
                background: 'linear-gradient(to bottom, #ffe798, #b8860b)',
                minHeight: '100vh',
                paddingTop: '50px',
            }}
        >
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

            <Container className="bg-white p-4 rounded-3 shadow-sm">
                <Row>
                    <Col lg={8}>
                        <Row className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="fw-bold text-dark mb-0">Ticket Details</h3>
                                <div className="d-flex gap-2">
                                    {showAcceptButton && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            style={{ width: '200px', minHeight: '40px' }}
                                            onClick={HandleAcceptButton}
                                        >
                                            Accept
                                        </Button>
                                    )}
                                    {hasChanges && (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            style={{ width: '200px', minHeight: '40px' }}
                                            onClick={handleSave}
                                        >
                                            Save Changes
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Row>

                        {/* DATES */}
                        <h6 className="text-muted fw-semibold mb-2">Dates</h6>
                        <Row>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Created at</Form.Label>
                                <Form.Control
                                    value={
                                        formData.created_at
                                            ? new Date(formData.created_at).toLocaleString()
                                            : '-'
                                    }
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Updated at</Form.Label>
                                <Form.Control
                                    name="updated_at"
                                    value={
                                        formData.updated_at
                                            ? new Date(formData.updated_at).toLocaleString()
                                            : '-'
                                    }
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Responded at</Form.Label>
                                <Form.Control
                                    name="responded_at"
                                    value={
                                        formData.responded_at
                                            ? new Date(formData.responded_at).toLocaleString()
                                            : '-'
                                    }
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Resolved at</Form.Label>
                                <Form.Control
                                    name="resolved_at"
                                    value={
                                        formData.resolved_at
                                            ? new Date(formData.resolved_at).toLocaleString()
                                            : '-'
                                    }
                                    disabled
                                />
                            </Form.Group>
                        </Row>

                        {/* USER DETAILS */}
                        <h6 className="text-muted fw-semibold mt-4 mb-2">Details</h6>
                        <Row>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Created By</Form.Label>
                                <Form.Control
                                    name="created_by"
                                    value={formData.created_by ?? '-'}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Employee</Form.Label>
                                <Form.Control
                                    value={
                                        createdByData.emp_FirstName
                                            ? `${createdByData.emp_FirstName} ${createdByData.emp_LastName}`
                                            : '-'
                                    }
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Department</Form.Label>
                                <Form.Control
                                    value={createdByData.emp_department ?? '-'}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Position</Form.Label>
                                <Form.Control
                                    value={createdByData.emp_position ?? ''}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Assigned To</Form.Label>
                                <Form.Control
                                    name="assigned_to"
                                    value={
                                        hdUser?.emp_FirstName && hdUser?.emp_LastName
                                            ? `${hdUser.emp_FirstName} ${hdUser.emp_LastName}`
                                            : '-'
                                    }
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Assigned Group</Form.Label>
                                <Form.Control name="assigned_group" value={tier ?? '-'} disabled />
                            </Form.Group>
                        </Row>

                        {/* TICKET INFO */}
                        <h6 className="text-muted fw-semibold mt-4 mb-2">Request Info</h6>
                        <Row>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket ID</Form.Label>
                                <Form.Control
                                    name="ticket_id"
                                    value={formData.ticket_id ?? ''}
                                    disabled
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket Subject</Form.Label>
                                <Form.Control
                                    name="ticket_subject"
                                    value={formData.ticket_subject ?? ''}
                                    onChange={handleChange}
                                    disabled={!isEditable}
                                />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket Type</Form.Label>
                                <Form.Select
                                    name="ticket_type"
                                    value={formData.ticket_type ?? ''}
                                    onChange={handleChange}
                                    required
                                    disabled={!isEditable}
                                >
                                    <option value="incident">Incident</option>
                                    <option value="request">Request</option>
                                    <option value="inquiry">Inquiry</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    name="ticket_status"
                                    value={formData.ticket_status ?? ''}
                                    onChange={handleChange}
                                    required
                                    disabled={!isEditable}
                                >
                                    <option value="open" hidden>Open</option>
                                    <option value="assigned" hidden>Assigned</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="escalate2">Escalate Tier II</option>
                                    <option value="escalate3">Escalate Tier III</option>
                                    <option value="resolved">Resolve</option>
                                    <option value="closed">Close</option>
                                    <option value="re-opened" hidden>Re Open</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Urgency</Form.Label>
                                <Form.Select
                                    name="ticket_urgencyLevel"
                                    value={formData.ticket_urgencyLevel ?? ''}
                                    onChange={handleChange}
                                    required
                                    disabled={!isEditable}
                                >
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
                                    value={formData.ticket_category ?? ''}
                                    onChange={handleChange}
                                    required
                                    disabled={!isEditable}
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
                                    value={formData.ticket_SubCategory ?? ''}
                                    onChange={handleChange}
                                    required
                                    disabled={!isEditable}
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
                                <Form.Control
                                    name="asset_number"
                                    value={formData.asset_number ?? ''}
                                    disabled
                                />
                            </Form.Group>

                            <Form.Group as={Col} md={12} className="mb-2">
                                <Form.Label>Attachments</Form.Label>
                                {renderAttachment()}
                            </Form.Group>
                        </Row>

                        <h6 className="text-muted fw-semibold mt-4 mb-2">Description</h6>
                        <Form.Group className="mb-3">
                            <Form.Control
                                as="textarea"
                                rows={7}
                                name="Description"
                                value={formData.Description ?? ''}
                                disabled
                            />
                        </Form.Group>
                    </Col>

                    {/* HELP DESK NOTES */}
                    <Col lg={4}>
                        <h6 className="text-muted fw-semibold mb-2">Helpdesk Notes</h6>
                        <Card className="shadow-sm border-0 h-100">
                            <Card.Body>
                                <Form.Group className="mb-3">
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

                                {hdnotesState && (
                                    <>
                                        <Form.Group>
                                            <Form.Label className="fw-semibold text-muted">
                                                Add a Note
                                            </Form.Label>
                                            {noteAlert && (
                                                <Form.Label className="fw-semibold  ms-2 text-danger">
                                                    Unable to save empty note
                                                </Form.Label>
                                            )}
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                name="notes"
                                                placeholder="Type your note here..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                disabled={!hdnotesState}
                                                style={{ resize: 'none', fontSize: '0.95rem' }}
                                            />
                                        </Form.Group>

                                        <div className="d-flex justify-content-end mt-3">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={handleSubmitNote}
                                            >
                                                Save Note
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
}