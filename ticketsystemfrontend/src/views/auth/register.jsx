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
  const [tier, setTier] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('')
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [successful, setSuccessful] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const userNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const tierRef = useRef();
  const roleRef = useRef();
  const phoneRef = useRef();
  const locationRef = useRef();
  const departmentRef = useRef();
  const positionRef = useRef();

  const departmentOptions = {
    lmd: ['MISD', 'HR', 'IOSD', 'SMED', 'Mill', 'IMD', 'PCES', 'MOG', 'Accounting', 'Expolartion', 'Assay'],
    corp: ['Legal', 'Accounting', 'Executive', 'HRAD', 'Treasury', 'MISD']
  };

  useEffect(() => {
    if (error || successful) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessful('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successful]);

  useEffect(() => {
    const empInfo = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(empInfo?.user_name);
  })

  const Register = (e) => {
    e.preventDefault();

    if (
      !firstname.trim() &&
      !lastname.trim() &&
      !username.trim() &&
      !email.trim() &&
      !password &&
      !confirmpassword &&
      !tier &&
      !role &&
      !phone &&
      !location &&
      !department &&
      !position) {
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
    const lepantoEmailPattern = /^[a-zA-Z0-9._%+-]+@lepantomining\.com$/;
    if (!lepantoEmailPattern.test(email)) {
      setError('Email must end with @lepantomining.com');
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
    if (!tier) {
      setError('Tier is required!');
      tierRef.current.focus();
      return;
    }
    if (!phone) {
      setError('Phone Number is required!');
      phoneRef.current.focus();
      return;
    }
    if (!role) {
      setError('Role is required!');
      roleRef.current.focus();
      return;
    }
    if (!location.trim()) {
      setError('Location is required!');
      locationRef.current.focus();
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
        emp_tier: tier,
        emp_role: role,
        emp_phone: phone,
        emp_location: location,
        emp_department: department,
        emp_position: position,
        current_user: currentUser
      })
      .then((res) => {
        setSuccessful(
          'Registered ' +
          `${username.charAt(0).toUpperCase() +
          username.slice(1).toLowerCase()}` + ' successfully!'
        );
        setFirstName('');
        setLastName('');
        setUserName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTier('')
        setRole('');
        setPhone('');
        setLocation('')
        setDepartment('');
        setPosition('');
        window.location.reload()
        console.log(`User ${username} was successfully registered`)



      })
      .catch((err) => {
        if (err === 404) {
          setError('Unable to register user! Please try again.');
          console.log(`Unable to register ${username}` + err)
        } else {
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
        padding: '20px',
        paddingTop: '100px'
      }}
    >
      <Container >
        <Row className="justify-content-center">
          <Col xs={12} sm={11} md={10} lg={8} xl={7}>
            <Card className="shadow-lg border-0" style={{ borderRadius: '1rem' }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <h4 className="fw-bold">Create an Account</h4>
                </div>

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
                  <InputGroup className="mb-3">
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

                  <Row>
                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Label>Tier</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text>
                          <FeatherIcon icon="users" />
                        </InputGroup.Text>
                        <Form.Select
                          value={tier}
                          onChange={(e) => setTier(e.target.value)}
                          ref={tierRef}
                        >
                          <option value="">Select Tier</option>
                          <option value="tier1">Tier 1</option>
                          <option value="tier2">Tier 2</option>
                          <option value="tier3">Tier 3</option>
                          <option value="none">None</option>
                        </Form.Select>
                      </InputGroup>
                    </Col>
                    <Col xs={12} sm={6} className="mb-3">
                      <Form.Label>Local Phone</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FeatherIcon icon="phone" />
                        </InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="Local Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          ref={phoneRef}
                        />
                      </InputGroup>
                    </Col>
                  </Row>


                  <Form.Label>Role</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="users" />
                    </InputGroup.Text>
                    <Form.Select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      ref={roleRef}
                    >
                      <option value="">Select Role</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </InputGroup>

                  <Row>
                    <Col xs={12} sm={6} className="mb-2">
                      <Form.Label>Location</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text>
                          <FeatherIcon icon="globe" />
                        </InputGroup.Text>
                        <Form.Select
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          ref={locationRef}
                        >
                          <option value="">Select Location</option>
                          <option value="lmd">LMD</option>
                          <option value="corp">Corp</option>
                        </Form.Select>
                      </InputGroup>
                    </Col>
                    <Col xs={12} sm={6} className="mb-2">
                      <Form.Label>Department</Form.Label>
                      <InputGroup className="mb-3">
                        <InputGroup.Text>
                          <FeatherIcon icon="briefcase" />
                        </InputGroup.Text>
                        <Form.Select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          ref={departmentRef}
                        >
                          <option value="">Select Department</option>
                          {departmentOptions[location]?.map((dept, idx) => (
                            <option key={idx} value={dept}>{dept}</option>
                          ))}
                        </Form.Select>
                      </InputGroup>
                    </Col>
                  </Row>

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
