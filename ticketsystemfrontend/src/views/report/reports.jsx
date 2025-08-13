import { Container, Form } from "react-bootstrap";
import { useState } from "react";
import AllTicketsByUser from "./allticketsbyuser";
import AllTicketBySite from "./allticketbysite";
import AllTicketbyType from "./allticketbytype";
import AllTicketsByStatus from "./allticketsbystatus";
import GetAllByCategory from "./getallbycategory";
import "./bento-layout-new.css";

export default function Report() {
    const [filterType, setFilterType] = useState("all"); // default

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
            <div>
                {/* Filter Control at the bottom */}
                <div className="bento-filter">
                    <Form.Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ maxWidth: "250px" }}
                    >
                        <option value="all">All</option>
                        <option value="today">Today</option>
                        <option value="thisWeek">This Week</option>
                        <option value="lastWeek">Last Week</option>
                        <option value="thisMonth">This Month</option>
                        <option value="perMonth">Per Month</option>
                        <option value="perYear">Per Year</option>
                    </Form.Select>
                </div>
            </div>
            {/* Bento Grid Layout - Updated to match provided image */}
            <div className="bento-container">

                {/* Top Left: Tickets by User - Large chart (spans 2 rows) */}
                <div className="bento-item bento-users">
                    <div className="bento-chart-container">
                        <h3 className="bento-chart-title">Tickets by User</h3>
                        <div className="bento-chart-wrapper">
                            <AllTicketsByUser filterType={filterType} />
                        </div>
                    </div>
                </div>

                {/* Top Right Top: Tickets by Site - Medium chart */}
                <div className="bento-item bento-sites">
                    <div className="bento-chart-container">
                        <h3 className="bento-chart-title">Tickets by Site</h3>
                        <div className="bento-chart-wrapper">
                            <AllTicketBySite filterType={filterType} />
                        </div>
                    </div>
                </div>

                {/* Top Right Bottom: Tickets by Type - Medium chart */}
                <div className="bento-item bento-types">
                    <div className="bento-chart-container">
                        <h3 className="bento-chart-title">Tickets by Type</h3>
                        <div className="bento-chart-wrapper">
                            <AllTicketbyType filterType={filterType} />
                        </div>
                    </div>
                </div>

                {/* Bottom Left: Tickets by Status - Medium chart */}
                <div className="bento-item bento-status">
                    <div className="bento-chart-container">
                        <h3 className="bento-chart-title">Tickets by Status</h3>
                        <div className="bento-chart-wrapper">
                            <AllTicketsByStatus filterType={filterType} />
                        </div>
                    </div>
                </div>

                {/* Bottom Right: Tickets by Category - Medium chart */}
                <div className="bento-item bento-category">
                    <div className="bento-chart-container">
                        <h3 className="bento-chart-title">Tickets by Category</h3>
                        <div className="bento-chart-wrapper">
                            <GetAllByCategory filterType={filterType} />
                        </div>
                    </div>
                </div>



            </div>
        </Container>
    );
}

