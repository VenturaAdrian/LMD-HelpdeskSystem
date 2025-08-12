import { Container } from "react-bootstrap";
import AllTicketsByUser from "./allticketsbyuser";


export default function Report() {
    return (
        <Container
            fluid
            className="pt-100 px-3 px-md-5"
            style={{
                background: 'linear-gradient(to bottom, #ffe798ff, #b8860b)',
                minHeight: '100vh',
                paddingTop: '100px',
                paddingBottom: '20px',
            }}
        >
            <div style={{ height: '50%', width: '50%' }}>
                <AllTicketsByUser />
            </div>


        </Container>
    );
}
