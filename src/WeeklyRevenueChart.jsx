import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import axios from "axios";

function WeeklyRevenueChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("https://localhost:5007/api/admin/dashboard/weekly", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }).then(res => {
      setData(res.data);
    });
  }, []);

  const chartData = {
    labels: data.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: "Revenue",
        data: data.map(d => d.revenue),
        borderColor: "blue",
        fill: false
      }
    ]
  };

  return <Line data={chartData} />;
}

export default WeeklyRevenueChart;
