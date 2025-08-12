import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AllTicketsByUser() {
    const [alluser, setAllUser] = useState([]);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const getalluser = await axios.get(`${config.baseApi}/authentication/get-all-users`);
                const a = getalluser.data || [];

                const tiers = ["tier1", "tier2", "tier3"];
                const filtertiers = a.filter(hd => tiers.includes(hd.emp_tier));
                setAllUser(filtertiers);
                console.log(filtertiers)
            } catch (err) {
                console.log("Unable to fetch users: ", err);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const FetchData = async () => {
            const ticketRes = await axios.get(`${config.baseApi}/ticket/get-all-ticket`);
            const allTickets = ticketRes.data;

            const notesRes = await axios.get(`${config.baseApi}/authentication/get-all-notes`);
            const notes = notesRes.data || [];

            const userTicketCount = {};

            alluser.forEach(user => {
                const username = user.user_name;

                const createdNotes = notes.filter(note => note.created_by === username);
                const uniqueIds = [...new Set(createdNotes.map(note => note.ticket_id))];

                const worked = allTickets.filter(ticket => {
                    const isUniqueId = uniqueIds.includes(ticket.ticket_id);
                    const isCollaborator = ticket.assigned_collaborators
                        ?.split(',')
                        .map(name => name.trim())
                        .includes(username);

                    const isAssignedOrCreatedByUser =
                        ticket.assigned_to === username ||
                        ticket.created_by === username ||
                        ticket.updated_by === username;

                    return (
                        isUniqueId ||
                        isCollaborator ||
                        ((isUniqueId || isCollaborator || isAssignedOrCreatedByUser) && ticket.is_reviewed === true)
                    );
                });

                userTicketCount[username] = worked.length;
            });

            // Convert counts to chart.js format
            setChartData({
                labels: Object.keys(userTicketCount),
                datasets: [
                    {
                        label: 'Tickets per User',
                        data: Object.values(userTicketCount),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
            });
        };

        if (alluser.length > 0) {
            FetchData();
        }
    }, [alluser]);

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',   // Center horizontally
                alignItems: 'center',       // Center vertically
                height: '100vh',            // Full screen height
                width: '100vh'
            }}
        >
            <div style={{ width: "80%" }}>
                {chartData && (
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' },
                                title: { display: true, text: 'All Worked Tickets by User' }
                            },
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
}
