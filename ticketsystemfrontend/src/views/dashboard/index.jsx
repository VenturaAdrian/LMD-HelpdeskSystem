import { Form, Button, Card, Row, Col, Container, Alert } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';
import { useEffect } from 'react';

export default function Dashboard() {

    return (
        <Container
            fluid
            className="pt-100"
            style={{
                background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                minHeight: '100vh',
            }}
        >
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>

            </div>
        </Container>
    );
}