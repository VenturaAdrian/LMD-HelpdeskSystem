import { useEffect, useState } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';
import config from 'config';

export default function UsersView() {
    const user_id = new URLSearchParams(window.location.search).get('id');

    const [userInfo, setUserInfo] = useState([]);
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get(`${config.baseApi}/authentication/get-by-id`, {
                    params: { user_id: user_id }
                });
                setUserInfo(response.data);
                console.log(response.data); // Now this will log the actual user data
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo();
    }, []);
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

        </Container>
    )
}