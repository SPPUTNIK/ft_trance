
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';

import { Doughnut } from 'react-chartjs-2';
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function Chart(props:{won: number, lose:number , cancled: number}) {
  const data = {
    labels: ["Total Of Won Matches", "Total Of Lose Matches", "Total Canceled Matches"],
    datasets: [
      {
        data: [props.won, props.lose, props.cancled],
        backgroundColor: [
          "#ffc4008c",
          "#00a3ff82",
          "#ff00004f",
        ],
        hoverBackgroundColor: ["#ffc4008c", "#00a3ff82", "#ff00004f"],
        borderRadius: 4,
        borderWidth: 0.5,
      },
    ],
  };

  const options :ChartOptions<'doughnut'> = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#F8F8F8",
          padding: 18,
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

export default Chart;
