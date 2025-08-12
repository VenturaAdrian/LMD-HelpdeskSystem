import { useEffect, useState } from "react";
import axios from "axios";
import config from "config";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function LocationTicketsChart() {
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const getAll = await axios.get(`${config.baseApi}/ticket/get-all-ticket`);
                console.log('GET ALL DATA: ', getAll.data);

                const locationCounts = getAll.data.reduce((acc, ticket) => {
                    const location = ticket.assigned_location?.trim() || "Unknown";
                    acc[location] = (acc[location] || 0) + 1;
                    return acc;
                }, {});

                console.log('Tickets per assigned_location:', locationCounts);

                setChartData({
                    labels: Object.keys(locationCounts),
                    datasets: [
                        {
                            label: "Tickets",
                            data: Object.values(locationCounts),
                            backgroundColor: "rgba(54, 162, 235, 0.6)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1
                        }
                    ]
                });
            } catch (err) {
                console.log('Unable to fetch all Tickets: ', err);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ width: "80%", paddingTop: '200px' }}>
            {chartData && (
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        indexAxis: 'y', // horizontal bars
                        plugins: {
                            legend: { position: 'top' },
                            title: { display: true, text: 'Tickets per Site' }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }}
                />
            )}
        </div>
    );
}
