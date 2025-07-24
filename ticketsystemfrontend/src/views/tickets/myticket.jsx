import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Container, Table } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";

export default function Myticket() {
    const [allticket, setAllTicket] = useState([]);
    const [userName, setUserName] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            const Fullname = user.user_name;
            setUserName(Fullname);
        }
    }, []);

    useEffect(() => {
        if (!userName) return;

        axios.get(`${config.baseApi}/ticket/get-all-ticket`)
            .then((res) => {
                const userTickets = res.data.filter(
                    (ticket) => ticket.created_by === userName
                );
                setAllTicket(userTickets);
            })
            .catch((err) => console.error("Error fetching tickets:", err));


    }, [userName]);
    //-------------------STATUS DESIGN----------------------//
    const renderStatusBadge = (status) => {
        const baseStyle = {
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '50px',
            border: '0.1px solid',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            textAlign: 'center',
            minWidth: '60px',

        };

        let style = {};
        let label = status;

        switch (status.toLowerCase()) {
            case 'open':
                style = { ...baseStyle, backgroundColor: '#dcffdeff', color: '#404040ff' };
                label = 'Open';
                break;
            case 'in-progress':
                style = { ...baseStyle, backgroundColor: '#033f00ff', color: '#ffffffff' };
                label = 'In Progress';
                break;
            case 'assigned':
                style = { ...baseStyle, backgroundColor: '#ffcb5aff', color: '#404040ff' };
                label = 'Assigned';
                break;
            case 'escalated':
                style = { ...baseStyle, backgroundColor: '#ff7d7dff', color: '#404040ff' };
                label = 'Escalated';
                break;
            case 'resolved':
                style = { ...baseStyle, backgroundColor: '#91c6ffff', color: '#404040ff' };
                label = 'Resolved';
                break;
            case 're-opened':
                style = { ...baseStyle, backgroundColor: '#28a745', color: '#ffffffff' };
                label = 'Re Opened';
                break;
            case 'closed':
                style = { ...baseStyle, backgroundColor: '#767676ff', color: '#000000ff' };
                label = 'Closed';
                break;
            default:
                style = { ...baseStyle, backgroundColor: '#6c757d' };
                break;
        }

        return <span style={style}>{label}</span>;
    };


    //--------------URGENCY DESGIN--------------------//
    const renderUrgencyBadge = (urgency) => {
        const baseStyle = {
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '50px',
            border: '0.1px solid',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            textAlign: 'center',
            minWidth: '60px',
        };

        let style = {};
        let label = urgency;

        switch (urgency.toLowerCase()) {
            case 'low':
                style = { ...baseStyle, backgroundColor: '#003006ff', color: '#ffffffff' };
                label = 'Low';
                break;
            case 'medium':
                style = { ...baseStyle, backgroundColor: '#9e8600ff', color: '#ffffffff' };
                label = 'Medium';
                break;
            case 'high':
                style = { ...baseStyle, backgroundColor: '#720000ff', color: '#ffffffff' };
                label = 'High';
                break;
            case 'critical':
                style = { ...baseStyle, backgroundColor: '#fd0000ff', color: '#fefefeff' };
                label = 'Critical';
                break;
            default:
                style = { ...baseStyle, backgroundColor: '#6c757d' };
                break;
        }

        return <span style={style}>{label}</span>;
    };

    const HandleView = (ticket) => {
        const params = new URLSearchParams({ id: ticket.ticket_id })
        navigate(`/view-ticket?${params.toString()}`)
    }

    return (
        <Container
            fluid
            className="pt-100"
            style={{
                background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                minHeight: '100vh',
            }}
        >
            <h3 style={{ fontWeight: 600, marginBottom: '5px' }}>My Tickets</h3>
            <Container style={{ padding: ' 20px' }}>
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
                        {allticket.length === 0 ? (
                            <tbody style={{ fontSize: '15px', color: '#333' }}>
                                <tr style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s ease' }}>
                                    <td colSpan={7} style={{ textAlign: 'center' }}> No Open Ticket for now.</td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody style={{ fontSize: '15px', color: '#333' }}>
                                {allticket.map((ticket, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background 0.2s ease' }}>
                                        <td>{ticket.ticket_id}</td>
                                        <td>{ticket.ticket_subject}</td>
                                        <td>{ticket.ticket_type}</td>
                                        <td>{renderStatusBadge(ticket.ticket_status)}</td>
                                        <td>{renderUrgencyBadge(ticket.ticket_urgencyLevel)}</td>
                                        <td>{ticket.Description}</td>
                                        <td onClick={() => HandleView(ticket)} style={{ cursor: 'pointer', color: '#003006ff' }}>View</td>
                                    </tr>
                                ))}
                            </tbody>
                        )}
                    </Table>
                </div>

            </Container>
        </Container>
    );
}
