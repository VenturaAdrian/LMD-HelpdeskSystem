import { NavLink } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  InputGroup,
  Form,
  Container,
  Alert
} from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import logoDark from 'assets/images/logo-dark.svg';
import newLogo from 'assets/images/new-logo.png';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from 'config';

export default function SignUp1() {
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [successful, setSuccessful] = useState('');

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const roleRef = useRef();
  const departmentRef = useRef();
  const positionRef = useRef();

  useEffect(() => {
    if (error || successful) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessful('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successful]);

  const Register = (e) => {
    e.preventDefault();

    if(
      !firstname.trim() &&
      !lastname.trim() &&
      !username.trim()&&
      !email.trim() &&
      !password &&
      !confirmpassword &&
      !role &&
      !department &&
      !position){
      setError('All fields are required!') 
      }

    if (!firstname.trim()) {
      setError('First Name is required!');
      firstNameRef.current.focus();
      return;
    }
    if (!lastname.trim()) {
      setError('Last Name is required!');
      lastNameRef.current.focus();
      return;
    }
    if (!username.trim()) {
      setError('Username is required!');
      userNameRef.current.focus();
      return;
    }
    if (!email.trim()) {
      setError('Email is required!');
      emailRef.current.focus();
      return;
    }
    if (!password) {
      setError('Password is required!');
      passwordRef.current.focus();
      return;
    }
    if (!confirmpassword) {
      setError('Confirm Password is required!');
      confirmPasswordRef.current.focus();
      return;
    }
    if (password !== confirmpassword) {
      setError('Passwords do not match!');
      confirmPasswordRef.current.focus();
      return;
    }
    if (!role) {
      setError('Role is required!');
      roleRef.current.focus();
      return;
    }
    if (!department.trim()) {
      setError('Department is required!');
      departmentRef.current.focus();
      return;
    }
    if (!position.trim()) {
      setError('Position is required!');
      positionRef.current.focus();
      return;
    }

    axios
      .post(`${config.baseApi}/authentication/register`, {
        emp_firstname: firstname,
        emp_lastname: lastname,
        user_name: username,
        emp_email: email,
        pass_word: password,
        emp_role: role,
        emp_department: department,
        emp_position: position
      })
      .then((res) => {
          setSuccessful(
          'Registered ' +
            `${username.charAt(0).toUpperCase() + 
              username.slice(1).toLowerCase()}` +' successfully!'
        );
        setFirstName('');
        setLastName('');
        setUserName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('');
        setDepartment('');
        setPosition('');

        console.log(`User ${username} was successfully registered` )
     
        

      })
      .catch((err) => {
        if(err === 404){
          setError('Unable to register user! Please try again.');
          console.log(`Unable to register ${username}` + err)
        }else{
          setError('Unable to register user! Please try again.');
        console.log(`Unable to register ${username}` + err)
        }
        
      });
  };

  return (
    <div
      className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
        padding: '20px'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={11} md={10} lg={8} xl={7}>
            <Card className="shadow-lg border-0" style={{ borderRadius: '1rem' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <img
                    src={newLogo}
                    alt="logo"
                    className="img-fluid mb-3"
                    style={{ maxWidth: '120px' }}
                  />
                  <h4 className="fw-bold">Create an Account</h4>
                </div>

                {error && (
                  <div
                    className="position-fixed top-0 start-50 translate-middle-x mt-3"
                    style={{ zIndex: 9999, minWidth: '300px' }}
                  >
                    <Alert variant="danger" onClose={() => setError('')} dismissible>
                      {error}
                    </Alert>
                  </div>
                )}
                {successful && (
                  <div
                    className="position-fixed top-0 start-50 translate-middle-x mt-3"
                    style={{ zIndex: 9999, minWidth: '300px' }}
                  >
                    <Alert variant="success" onClose={() => setSuccessful('')} dismissible>
                      {successful}
                    </Alert>
                  </div>
                )}

                <Form onSubmit={Register}>
                  <Row>
                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FeatherIcon icon="user" />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="First Name"
                          value={firstname}
                          onChange={(e) => setFirstName(e.target.value)}
                          ref={firstNameRef}
                        />
                      </InputGroup>
                    </Col>
                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FeatherIcon icon="user" />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Last Name"
                          value={lastname}
                          onChange={(e) => setLastName(e.target.value)}
                          ref={lastNameRef}
                        />
                      </InputGroup>
                    </Col>
                  </Row>

                  <Form.Label>Username</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="user" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                      ref={userNameRef}
                    />
                  </InputGroup>

                  <Form.Label>Email Address</Form.Label>
                  <InputGroup className="mb-1">
                    <InputGroup.Text>
                      <FeatherIcon icon="mail" />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      ref={emailRef}
                    />
                  </InputGroup>
                  <Form.Text muted className="mb-3">
                    Only emails ending in <strong>@lepantomining.com</strong> are accepted.
                  </Form.Text>

                  <Row>
                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FeatherIcon icon="lock" />
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          ref={passwordRef}
                        />
                      </InputGroup>
                    </Col>
                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FeatherIcon icon="lock" />
                        </InputGroup.Text>
                        <Form.Control
                          type="password"
                          placeholder="Confirm"
                          value={confirmpassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          ref={confirmPasswordRef}
                        />
                      </InputGroup>
                    </Col>
                  </Row>

                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    ref={roleRef}
                  >
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Select>

                  <Form.Label>Department</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="briefcase" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      ref={departmentRef}
                    />
                  </InputGroup>

                  <Form.Label>Position</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="activity" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      ref={positionRef}
                    />
                  </InputGroup>

                  <Button type="submit" className="btn btn-block btn-primary mt-4 w-100 mb-3">
                    Sign Up
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
