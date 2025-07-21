import { useEffect, useState } from 'react';
import { Form, Button, Card, Row, Col, Container } from 'react-bootstrap';

export default function CreateTicket() {
  const [formData, setFormData] = useState({
    ticket_subject: '',
    ticket_type: '',
    ticket_status: '',
    ticket_urgencyLevel: '',
    ticket_category: '',
    ticket_SubCategory: '',
    asset_number: '',
    Attachments: null,
    Description: '',
    created_by: '',
  });

  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    const empInfo = JSON.parse(localStorage.getItem('user'));
    const Fullname = empInfo.emp_FirstName + ' ' + empInfo.emp_LastName;
    console.log('CURRENT USER DATA: ' + Fullname);
    setCurrentUser(Fullname);
  }, []);

  const subCategoryOptions = {
    hardware: [
      'Computer',
      'Laptop',
      'Monitor',
      'Printer/Scanner',
      'Peripherals',
      'Fax',
      'Others',
    ],
    network: [
      'Internet Connectivity',
      'Wi-Fi',
      'Email/Server Access',
      'Network Printer/Scanner',
      'Firewall',
      'Others',
    ],
    software: [
      'Application Not Responding',
      'Installation/Uninstallation',
      'System Updates',
      'Login Issue',
      'Outlook',
      'Security',
      'Others',
    ],
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'ticket_category' || name === 'ticket_type') {
      const updatedFormData = {
        ...formData,
        [name]: value,
      };

      if (name === 'ticket_category') {
        updatedFormData.ticket_SubCategory = '';
      }

      // Check if both category and type meet the condition
      const selectedType =
        name === 'ticket_type' ? value : formData.ticket_type;
      const selectedCategory =
        name === 'ticket_category' ? value : formData.ticket_category;

      if (
        selectedType === 'incident' &&
        selectedCategory === 'hardware' &&
        formData.Description.trim() === ''
      ) {
        updatedFormData.Description =
          'Issue:\nWhen did it start?:\nHave you tried any troubleshooting steps?:\nAdditional notes:';
      }

      setFormData(updatedFormData);
    } else {
      setFormData({
        ...formData,
        [name]: files ? files[0] : value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    // Submit logic here
    console.log('Form submitted:', formData);
  };

  return (
    <Container className="py-4">
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
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Ticket Type</Form.Label>
                <Form.Select
                  name="ticket_type"
                  value={formData.ticket_type}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="incident">Incident</option>
                  <option value="request">Request</option>
                  <option value="inquiry">Inquiry</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  type="text"
                  name="ticket_status"
                  value="Open"
                  disabled
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>Urgency Level</Form.Label>
                <Form.Select
                  name="ticket_urgencyLevel"
                  value={formData.ticket_urgencyLevel}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Form.Select>
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
                >
                  <option value="">Select</option>
                  <option value="hardware">Hardware</option>
                  <option value="network">Network</option>
                  <option value="software">Software</option>
                </Form.Select>
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
                >
                  <option value="">Select</option>
                  {subCategoryOptions[formData.ticket_category]?.map(
                    (subcat, idx) => (
                      <option key={idx} value={subcat}>
                        {subcat}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12} md={6}>
              <Form.Group>
                <Form.Label>
                  Asset Number <span className="fw-light">(optional)</span>
                </Form.Label>
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
            <Form.Label>
              Attachment <span className="fw-light">(optional)</span>
            </Form.Label>
            <Form.Control
              type="file"
              name="Attachments"
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
            />
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
            <Button variant="primary" type="submit">
              Submit Ticket
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
