import { FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from 'react-icons/fa';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';

export default function ViewTicket() {
    const [formData, setFormData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);
    const [createdByData, setCreatedByData] = useState({});
    const [currentUserData, setCurrentUserData] = useState({});
    const ticket_id = new URLSearchParams(window.location.search).get('id');

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

    useEffect(() => {
        const empInfo = JSON.parse(localStorage.getItem('user'));
        setCurrentUserData(empInfo);
    }, []);

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
    }, [formData.created_by]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedForm = { ...prev, [name]: value };
            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'Description', 'Attachments'];
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

            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'Description', 'Attachments'];
            const changed = fieldsToCheck.some(field => updatedForm[field] !== originalData[field]);
            setHasChanges(changed);
        }
    };

    const handleSave = async () => {
        try {
            const changedFields = {};
            const fieldsToCheck = ['ticket_subject', 'ticket_type', 'ticket_status', 'ticket_urgencyLevel', 'Description', 'Attachments'];
            fieldsToCheck.forEach(field => {
                if (formData[field] !== originalData[field]) {
                    changedFields[field] = {
                        from: originalData[field],
                        to: formData[field]
                    };
                }
            });

            console.log('Changed Fields:', changedFields);

            const dataToSend = new FormData();
            dataToSend.append('ticket_id', formData.ticket_id);
            dataToSend.append('ticket_subject', formData.ticket_subject);
            dataToSend.append('ticket_type', formData.ticket_type);
            dataToSend.append('ticket_status', formData.ticket_status);
            dataToSend.append('ticket_urgencyLevel', formData.ticket_urgencyLevel);
            dataToSend.append('Description', formData.Description);

            if (formData.attachmentFiles && formData.attachmentFiles.length > 0) {
                formData.attachmentFiles.forEach(file => {
                    dataToSend.append('attachments', file);
                });
            } else {
                dataToSend.append('Attachments', formData.Attachments || '');
            }
            console.log(dataToSend)
            await axios.post(`${config.baseApi}/ticket/update-ticket`, dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Ticket updated successfully.');
            setOriginalData(formData);
            setHasChanges(false);
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
            <div className="d-flex flex-column gap-2">
                {filePaths.map((filePath, idx) => {
                    const fileName = filePath.split('\\').pop().split('/').pop();
                    const shortName = fileName.length > 25 ? fileName.slice(0, 25) + '...' : fileName;
                    const fileUrl = `${config.baseApi}/${filePath.replace(/\\/g, '/')}`;

                    return (
                        <Card key={idx} className="shadow-sm border-0" style={{ backgroundColor: '#fdedd3ff' }}>
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
                        <h5 className="fw-bold text-dark mb-3">Edit Ticket</h5>

                        <h6 className="text-muted fw-semibold mb-2">Dates</h6>
                        <Row>
                            {['created_at', 'updated_at', 'responded_at', 'resolved_at'].map((field, index) => (
                                <Form.Group as={Col} md={6} className="mb-2" key={index}>
                                    <Form.Label>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>
                                    <Form.Control name={field} value={formData[field] || '-'} disabled />
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
                                <Form.Control value={createdByData.emp_FirstName + " " + createdByData.emp_LastName || ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Department</Form.Label>
                                <Form.Control value={createdByData.emp_department || ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Position</Form.Label>
                                <Form.Control value={createdByData.emp_position || ''} disabled />
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
                                <Form.Control name="ticket_subject" value={formData.ticket_subject || ''} onChange={handleChange} />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Ticket Type</Form.Label>
                                <Form.Select name="ticket_type" value={formData.ticket_type || ''} onChange={handleChange} required>
                                    <option value="incident">Incident</option>
                                    <option value="request">Request</option>
                                    <option value="inquiry">Inquiry</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Status</Form.Label>
                                <Form.Select name="ticket_status" value={formData.ticket_status || ''} onChange={handleChange} required>
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                    <option value="re-Opened">Re-Opened</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Urgency</Form.Label>
                                <Form.Select name="ticket_urgencyLevel" value={formData.ticket_urgencyLevel || ''} onChange={handleChange} required>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </Form.Select>
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Category</Form.Label>
                                <Form.Control name="ticket_category" value={formData.ticket_category || ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Sub Category</Form.Label>
                                <Form.Control name="ticket_SubCategory" value={formData.ticket_SubCategory || ''} disabled />
                            </Form.Group>
                            <Form.Group as={Col} md={6} className="mb-2">
                                <Form.Label>Asset Tag</Form.Label>
                                <Form.Control name="asset_number" value={formData.asset_number || ''} disabled />
                            </Form.Group>

                            <Form.Group as={Col} md={12} className="mb-2">
                                <Form.Label>Attachments</Form.Label>
                                {renderAttachment()}
                                <Form.Control type="file" multiple onChange={handleFileChange} className="mt-1" />
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
                            />
                        </Form.Group>

                        {hasChanges && (
                            <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                        )}
                    </Col>

                    <Col lg={4}>
                        <h6 className="text-muted fw-semibold mb-2">Helpdesk Notes</h6>
                        <Card className="shadow-sm border-0">
                            <Card.Body>
                                <Form.Group>
                                    <Form.Label className="fw-semibold text-muted">Notes</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={12}
                                        name="notes"
                                        placeholder="Add notes here..."
                                        value={formData.notes || ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </Container>
    );
}
