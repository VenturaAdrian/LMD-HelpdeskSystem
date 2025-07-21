import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Container, Table } from 'react-bootstrap';

export default function Myticket() {
    const [allticket, setAllTicket] = useState([]);
    const [userFullName, setUserFullName] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const Fullname = user.emp_FirstName + ' ' + user.emp_LastName;
            setUserFullName(Fullname);
        }
    }, []);

    useEffect(() => {
        if (!userFullName) return;

        axios.get(`${config.baseApi}/ticket/get-all-ticket`)
            .then((res) => {
                const userTickets = res.data.filter(
                    (ticket) => ticket.created_by === userFullName
                );
                setAllTicket(userTickets);
            })
            .catch((err) => console.error("Error fetching tickets:", err));
    }, [userFullName]);

    return (
        <Container
            fluid
            className="pt-100"
            style={{
                background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                minHeight: '100vh',
            }}
        >
            <h3 style={{ fontWeight: 600, marginBottom: '30px' }}>My Tickets</h3>
            <Container style={{ padding: ' 20px' }}>
                {allticket.length === 0 ? (
                    <p>No tickets found for this user.</p>
                ) : (
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                        padding: '20px',
                        overflowX: 'auto'
                    }}>
                        <Table hover borderless responsive className="mb-0">
                            <thead style={{ borderBottom: '2px solid #eee', fontSize: '14px', textTransform: 'uppercase', color: '#555' }}>
                                <tr>
                                    <th>Ticket Number </th>
                                    <th>Subject</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Urgency</th>
                                    <th>Description</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody style={{ fontSize: '15px', color: '#333' }}>
                                {allticket.map((ticket, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s ease' }}>
                                        <td>{index + 1}</td>
                                        <td>{ticket.ticket_subject}</td>
                                        <td>{ticket.ticket_type}</td>
                                        <td>{ticket.ticket_status}</td>
                                        <td>{ticket.ticket_urgencyLevel}</td>
                                        <td>{ticket.Description}</td>
                                        <td>View</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}
            </Container>
        </Container>
    );
}
