import { useEffect, useState } from "react";
import axios from "axios";
import config from "config";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function AllTicketsByStatus() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/ticket/get-all-ticket`);
                const revRes = await axios.get(`${config.baseApi}/ticket/get-all-feedback`);
                const tickets = res.data || [];
                const feedback = revRes.data || [];

                // Get counts per status
                const resolvedCount = tickets.filter(t => t.ticket_status === "resolved").length;
                const closedCount = tickets.filter(t => t.ticket_status === "closed").length;
                const openCount = tickets.filter(t => t.ticket_status === "open").length;

                const uniqueIds = [...new Set(feedback.map(a => a.ticket_id))];
                const reviewedCount = uniqueIds.length;

                console.log('reviewed: ', reviewedCount, ' resolved: ', resolvedCount, ' closed: ', closedCount, 'open: ', openCount)
                // X-axis labels (just "Resolved" and "Closed" for now)

                const labels = ["Reviewed", "Resolved", "Closed", "Open"];
                setChartData({
                    labels,
                    datasets: [
                        {
                            label: "Tickets",
                            data: [reviewedCount, resolvedCount, closedCount, openCount],
                            borderColor: "rgba(13, 127, 0, 1)",
                            backgroundColor: "rgba(30, 150, 0, 0.5)",
                            tension: 0.3
                        }
                    ]
                });
            } catch (err) {
                console.log("Unable to fetch data: ", err);
            }
        };
        fetch();
    }, []);

    return (
        <div style={{ width: "80%", paddingTop: '200px' }}>
            {chartData && (
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: "top" },
                            title: { display: true, text: "Resolved vs Closed Tickets" },
                        },
                        scales: {
                            y: { beginAtZero: true },
                        },
                    }}
                />
            )}
        </div>
    );
}
