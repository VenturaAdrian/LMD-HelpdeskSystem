import { useEffect, useState } from "react";
import { Card, Container, Row, Col, Spinner } from "react-bootstrap";

export default function Profile() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const empInfo = JSON.parse(localStorage.getItem("user"));
    setUserData(empInfo);
  }, []);

  if (!userData) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="p-4 border-0 shadow rounded-4">
            <h2 className="text-center mb-4">My Profile</h2>
            <Row className="mb-3">
              <Col sm={4} className="fw-semibold text-muted">Full Name:</Col>
              <Col sm={8}>{userData.emp_FirstName} {userData.emp_LastName}</Col>
            </Row>
            <Row className="mb-3">
              <Col sm={4} className="fw-semibold text-muted">Username:</Col>
              <Col sm={8}>{userData.user_name}</Col>
            </Row>
            <Row className="mb-3">
              <Col sm={4} className="fw-semibold text-muted">Email:</Col>
              <Col sm={8}>{userData.emp_email}</Col>
            </Row>
            <Row className="mb-3">
              <Col sm={4} className="fw-semibold text-muted">Role:</Col>
              <Col sm={8} className="text-capitalize">{userData.emp_role}</Col>
            </Row>
            <Row className="mb-3">
              <Col sm={4} className="fw-semibold text-muted">Department:</Col>
              <Col sm={8}>{userData.emp_department}</Col>
            </Row>
            <Row>
              <Col sm={4} className="fw-semibold text-muted">Position:</Col>
              <Col sm={8}>{userData.emp_position}</Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
