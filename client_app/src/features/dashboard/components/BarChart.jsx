import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';

import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChart() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const getOverallStatistics = async () => {
    let res = await axios({
      method: 'POST',
      url: 'user/getOverallStatistics',
      data: {
        barangay: null
      }
    }).then(res => {
      setDashboardData(res.data.data);

      return res;
    });
  };
  useEffect(() => {
    getOverallStatistics();
    setIsLoaded(true);
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const labels = ['PAWA', 'DAYAP'];

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Children',
        data: labels.map(index => {
          return 1 + 1 * 5;
        }),
        backgroundColor: 'rgba(255, 99, 132, 1)'
      }
    ]
  };

  return (
    <TitleCard title={''}>
      <Bar options={options} data={data} />
    </TitleCard>
  );
}

export default BarChart;
