import { useEffect, useState } from 'react';
import { Table, Container } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Openticket from './openticket';
import Alltickets from './alltickets';
import Myticket from './myticket';
import History from './history';

export default function Tickets() {

    const [adminaccess, setadminAccess] = useState(false);
    const [hdaccess, sethdAccess] = useState(false);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('user'));
        if (['tier1', 'tier2', 'tier3'].includes(userInfo.emp_tier)) {
            sethdAccess(true);
        } if (userInfo.emp_tier === 'none' && userInfo.emp_role === 'admin') {
            setadminAccess(true)
        }
    }, [])
    return (
        <Container
            fluid
            className="pt-100"
            style={{
                background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                minHeight: '100vh',
                paddingTop: '100px',
            }}
        >
            <Tabs
                defaultActiveKey="my"
                transition={false}
                id="justify-tab-example"
                className="mb-3"
                justify
            >
                <Tab eventKey="my" title={<span style={{ color: '#5d3600ff', fontWeight: 'bold' }}>My Tickets</span>} >
                    <Myticket />
                </Tab>
                {hdaccess && (
                    <Tab eventKey="open" title={<span style={{ color: '#5d3600ff', fontWeight: 'bold' }}>Open Tickets</span>} >
                        <Openticket />
                    </Tab>
                )}
                {adminaccess && (
                    <Tab eventKey="all" title={<span style={{ color: '#5d3600ff', fontWeight: 'bold' }}>All Tickets</span>} >
                        <Alltickets />
                    </Tab>
                )}
                {hdaccess && (
                    <Tab eventKey="all" title={<span style={{ color: '#5d3600ff', fontWeight: 'bold' }}>All Tickets</span>} >
                        <Alltickets />
                    </Tab>
                )}
                <Tab eventKey="history" title={<span style={{ color: '#5d3600ff', fontWeight: 'bold' }}>History</span>} >
                    <History />
                </Tab>
                {/* <Tab eventKey="contact" title="Contact" disabled>
                    Tab content for Contact
                </Tab> */}
            </Tabs>


        </Container>
    )

}