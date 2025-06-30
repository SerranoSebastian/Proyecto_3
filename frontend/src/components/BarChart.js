import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const BarChart = ({ data }) => {
  if (!data || data.length === 0) return <p>No hay datos para mostrar</p>;
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [{
      label: 'Total de Ventas',
      data: data.map(d => d.sales_amount),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }]
  };
  return <Bar data={chartData} />;
};


export default BarChart;
