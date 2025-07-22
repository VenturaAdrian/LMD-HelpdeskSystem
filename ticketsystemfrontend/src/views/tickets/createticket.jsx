import { useEffect, useState } from 'react';
import { Form, Button, Card, Row, Col, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';

export default function CreateTicket() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    ticket_subject: '',
    ticket_type: '',
    ticket_status: '',
    ticket_urgencyLevel: '',
    ticket_category: '',
    ticket_SubCategory: '',
    asset_number: '',
    Attachments: [],
    Description: '',
    created_by: '',
  });

  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  useEffect(() => {
    const empInfo = JSON.parse(localStorage.getItem('user'));
    const Fullname = empInfo.user_name;
    setCurrentUser(Fullname);
  }, []);

  const subCategoryOptions = {
    hardware: ['Computer', 'Laptop', 'Monitor', 'Printer/Scanner', 'Peripherals', 'Fax', 'Others'],
    network: ['Internet Connectivity', 'Wi-Fi', 'Email/Server Access', 'Network Printer/Scanner', 'Firewall', 'Others'],
    software: ['Application Not Responding', 'Installation/Uninstallation', 'System Updates', 'Login Issue', 'Outlook', 'Security', 'Others'],
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'ticket_category' || name === 'ticket_type') {
      const updatedFormData = { ...formData, [name]: value };
      if (name === 'ticket_category') updatedFormData.ticket_SubCategory = '';

      const selectedType = name === 'ticket_type' ? value : formData.ticket_type;
      const selectedCategory = name === 'ticket_category' ? value : formData.ticket_category;

      if (
        selectedType === 'incident' &&
        selectedCategory === 'hardware' &&
        formData.Description.trim() === ''
      ) {
        updatedFormData.Description =
          'Issue:\nWhen did it start?:\nHave you tried any troubleshooting steps?:\nAdditional notes:';
      }

      setFormData(updatedFormData);
    } else if (name === 'Attachments') {
      setFormData({ ...formData, Attachments: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = {};

    if (!formData.ticket_subject.trim()) errors.ticket_subject = 'Subject is required';
    if (!formData.ticket_type) errors.ticket_type = 'Type is required';
    if (!formData.ticket_urgencyLevel) errors.ticket_urgencyLevel = 'Urgency level is required';
    if (!formData.ticket_category) errors.ticket_category = 'Category is required';
    if (!formData.ticket_SubCategory) errors.ticket_SubCategory = 'Subcategory is required';
    if (!formData.Description.trim()) errors.Description = 'Description is required';

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstField = document.querySelector(`[name="${Object.keys(errors)[0]}"]`);
      if (firstField) {
        firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const data = new FormData();

      for (const key in formData) {
        if (key === 'Attachments') {
          for (let i = 0; i < formData.Attachments.length; i++) {
            data.append('Attachments', formData.Attachments[i]);
          }
        } else {
          data.append(key, formData[key]);
        }
      }

      data.set('created_by', currentUser);

      const response = await axios.post(`${config.baseApi}/ticket/create-ticket`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Submitted ticket successfully!');
      setFormData({
        ticket_subject: '',
        ticket_type: '',
        ticket_status: '',
        ticket_urgencyLevel: '',
        ticket_category: '',
        ticket_SubCategory: '',
        asset_number: '',
        Attachments: [],
        Description: '',
        created_by: '',
      });
      setValidationErrors({});
    } catch (error) {
      setError('Error submitting your ticket. Please try again');
      console.error('Error submitting ticket:', error);
    }
  };

  return (
    <Container fluid className="pt-100" style={{ background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)', minHeight: '100vh' }}>
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

      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Card className="p-4 shadow-sm">
            <h4 className="mb-3">Create Ticket</h4>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Ticket Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="ticket_subject"
                      value={formData.ticket_subject}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.ticket_subject}
                    />
                    <Form.Control.Feedback type="invalid">{validationErrors.ticket_subject}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Ticket Type</Form.Label>
                    <Form.Select
                      name="ticket_type"
                      value={formData.ticket_type}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.ticket_type}
                    >
                      <option value="">Select</option>
                      <option value="incident">Incident</option>
                      <option value="request">Request</option>
                      <option value="inquiry">Inquiry</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{validationErrors.ticket_type}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Status</Form.Label>
                    <Form.Control type="text" name="ticket_status" value="Open" disabled />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Urgency Level</Form.Label>
                    <Form.Select
                      name="ticket_urgencyLevel"
                      value={formData.ticket_urgencyLevel}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.ticket_urgencyLevel}
                    >
                      <option value="">Select</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{validationErrors.ticket_urgencyLevel}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="ticket_category"
                      value={formData.ticket_category}
                      onChange={handleChange}
                      isInvalid={!!validationErrors.ticket_category}
                    >
                      <option value="">Select</option>
                      <option value="hardware">Hardware</option>
                      <option value="network">Network</option>
                      <option value="software">Software</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{validationErrors.ticket_category}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Subcategory</Form.Label>
                    <Form.Select
                      name="ticket_SubCategory"
                      value={formData.ticket_SubCategory}
                      onChange={handleChange}
                      disabled={!formData.ticket_category}
                      isInvalid={!!validationErrors.ticket_SubCategory}
                    >
                      <option value="">Select</option>
                      {subCategoryOptions[formData.ticket_category]?.map((subcat, idx) => (
                        <option key={idx} value={subcat}>{subcat}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{validationErrors.ticket_SubCategory}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col xs={12} md={6}>
                  <Form.Group>
                    <Form.Label>Asset Number <span className="fw-light">(optional)</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="asset_number"
                      value={formData.asset_number}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Attachments <span className="fw-light">(optional)</span></Form.Label>
                <Form.Control
                  type="file"
                  name="Attachments"
                  multiple
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.Description}
                />
                <Form.Control.Feedback type="invalid">{validationErrors.Description}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Created By</Form.Label>
                <Form.Control
                  type="text"
                  name="created_by"
                  value={currentUser}
                  disabled
                />
              </Form.Group>

              <div className="text-end">
                <Button variant="primary" type="submit">Submit Ticket</Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
