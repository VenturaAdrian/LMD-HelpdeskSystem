import { useEffect, useState } from 'react';
import { Table, Container } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

export default function Tickets() {
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
                defaultActiveKey="home"
                transition={false}
                id="noanim-tab-example"
                className="mb-3"
            >
                <Tab eventKey="open" title="Open Tickets">
                    OPEN TICKETS HD
                </Tab>
                <Tab eventKey="my" title="My Tickets">
                    OPEN TICKETS HD
                </Tab>
                <Tab eventKey="all" title="tickets">
                    Tab content for Profile
                </Tab>
                {/* <Tab eventKey="contact" title="Contact" disabled>
                    Tab content for Contact
                </Tab> */}
            </Tabs>


        </Container>
    )

}