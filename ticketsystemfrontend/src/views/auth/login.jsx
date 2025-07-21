import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import config from 'config';

// react-bootstrap
import { Card, Row, Col, Button, Form, InputGroup, Alert } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// assets
import logoDark from 'assets/images/logo-dark.svg';
import newLogo from 'assets/images/new-logo.png'

export default function SignIn1() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
      if (loginError) {
        const timer = setTimeout(() => {
          setLoginError('');

        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [loginError]);
  

  const Auth = async (e) => {
    e.preventDefault();
    console.log('USER: ', username, password);

    if(!password.trim()){
      setLoginError('Password is required!');
      return;
    }
    if(!username.trim()){
      setLoginError('Password is required!');
      return;
    }

    try {
      const response = await axios.get(`${config.baseApi}/authentication/login`, {
        params: {
          user_name: username,
          pass_word: password,
        },
      })
        if(!response.data.error){
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('status',JSON.stringify([{id:0,value: 'Login'}]));
            window.location.replace(`ticketsystem/dashboard/sales`);
            console.log('Login success:', response.data);
        } 
    } catch (err) {
      if(err.response){
        if(err.response.status === 401){
        setLoginError('Incorrect password! Try again...');
        console.log(`User ${username} entered incorrect password` + err.response.data.message);
        }
        else if(err.response.status === 404){
          setLoginError('Invalid username or password. Please try again.');
          console.log(`Username and password is invalid, ${username} ${password}` + err.response.data.message);
        }else{
          setLoginError('Invalid username or password. Please try again.');
          console.log(`Username and password is invalid, ${username} ${password}` + err.response.data.message);
        }
      }else {
        setLoginError('Unable to connect to server. Please check your internet or try again later.');
        console.log('No response received:', err.message);
      }
      
      
    }
  };

  return (
    <div
      className="auth-wrapper"
      style={{
        background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="auth-content text-center">
        <Card className="borderless">
          <Row className="align-items-center text-center">
            <Col>
              <Card.Body className="card-body">
                <img src={newLogo} alt="" className="img-fluid mb-4" />
                <h4 className="mb-3 f-w-400">Log in</h4>

                {/* ALERT BAR */}
                {loginError && (
                  <div 
                    className="position-fixed top-0 start-50 translate-middle-x mt-3"
                    style={{ zIndex: 9999, minWidth: '300px' }}
                  >
                    <Alert variant="danger" onClose={() => setLoginError('')} dismissible>
                      {loginError}
                    </Alert>
                  </div>
                )}

                <Form onSubmit={Auth}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="mail" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup className="mb-3">
                    <InputGroup.Text>
                      <FeatherIcon icon="lock" />
                    </InputGroup.Text>
                    <Form.Control
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </InputGroup>

                  <Button type="submit" className="btn btn-block btn-primary mb-4 mt-4 w-100" >
                    Signin
                  </Button>
                </Form>

              </Card.Body>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
