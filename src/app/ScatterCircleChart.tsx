import React from "react";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrement des composants Chart.js
ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ScatterCirclePlotProps {
  matrix: number[][]; // Matrice d'entrée
}

// Fonction pour générer une forme circulaire
const generateCircleOutline = (xData: number[], yData: number[], steps = 100) => {
  const centerX = xData.reduce((a, b) => a + b, 0) / xData.length;
  const centerY = yData.reduce((a, b) => a + b, 0) / yData.length;
  const radius = Math.sqrt(
    xData.map((x, i) => (x - centerX) ** 2 + (yData[i] - centerY) ** 2).reduce((a, b) => a + b, 0) / xData.length
  );

  return Array.from({ length: steps + 1 }, (_, i) => {
    const theta = (i / steps) * 2 * Math.PI;
    return { x: centerX + radius * Math.cos(theta), y: centerY + radius * Math.sin(theta) };
  });
};

const ScatterCirclePlot: React.FC<ScatterCirclePlotProps> = ({ matrix }) => {
  const numCols = matrix[0]?.length || 0;
  if (numCols < 2) return <p>La matrice doit contenir au moins 2 colonnes.</p>;

  const pairs: [number, number][] = [];
  for (let i = 0; i < numCols; i++) {
    for (let j = i + 1; j < numCols; j++) {
      pairs.push([i, j]);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {pairs.map(([colX, colY], index) => {
        const xData = matrix.map(row => row[colX]);
        const yData = matrix.map(row => row[colY]);
        const circleOutline = generateCircleOutline(xData, yData);

        const data = {
          datasets: [
            {
              label: `Points (${colX + 1},${colY + 1})`,
              data: xData.map((x, i) => ({ x, y: yData[i] })),
              backgroundColor: "rgba(255, 99, 132, 1)",
              pointRadius: 6,
            },
            {
              label: "Cercle",
              data: circleOutline,
              borderColor: "blue",
              borderWidth: 2,
              fill: false,
              pointRadius: 0,
              showLine: true,
            },
          ],
        };

        const options: any = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { type: "linear", position: "bottom" },
            y: { position: "left" },
          },
          plugins: { legend: { display: false } },
        };

        return (
          <div key={index} style={{ width: "100%", aspectRatio: 1 }}>
            <Scatter data={data} options={options} />
          </div>
        );
      })}
    </div>
  );
};

export default ScatterCirclePlot;
