import React from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

interface ScatterPlotProps {
  matrix: number[][];
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({ matrix }) => {
  if (matrix.length === 0 || matrix[0].length < 2) {
    return <p>Not enough columns to generate scatter plots.</p>;
  }

  const numColumns = matrix[0].length;
  const scatterPlots = [];

  for (let i = 0; i < numColumns - 1; i++) {
    for (let j = i + 1; j < numColumns; j++) {
      const data = {
        datasets: [
          {
            label: `Column ${i + 1} vs Column ${j + 1}`,
            data: matrix.map((row) => ({ x: row[i], y: row[j] })),
            backgroundColor: "rgba(75, 192, 192, 1)",
            pointRadius: 6,
          },
        ],
      };

      const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            title: { display: true, text: `Composant principale ${i + 1}` },
          },
          y: {
            title: { display: true, text: `Composant principale ${j + 1}` },
          },
        },
        plugins: {
          legend: { display: false },
        },
      };

      scatterPlots.push(
        <div key={`${i}-${j}`} style={{ width: "100%", height: "400px", marginBottom: "20px" }}>
          <Scatter data={data} options={options} />
        </div>
      );
    }
  }

  return <div>{scatterPlots}</div>;
};

export default ScatterPlot;
