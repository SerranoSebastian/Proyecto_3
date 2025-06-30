import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

const PieChart = ({ data, labelKey = 'label', dataKey = 'value', title = '' }) => {
    if (!data || data.length === 0) return <p>No hay datos que mostrar</p>;

    const chartData = {
        labels: data.map(d => d[labelKey]),
        datasets: [{
            label: title,
            data: data.map(d => parseFloat(d[dataKey])),
            backgroundColor: [
                'rgba(54, 162, 235, 0.7)',   // azul
                'rgba(255, 99, 132, 0.7)',   // rojo
                'rgba(255, 206, 86, 0.7)',   // amarillo
                'rgba(75, 192, 192, 0.7)',   // verde agua
                'rgba(153, 102, 255, 0.7)',  // morado
                'rgba(255, 159, 64, 0.7)',   // naranja
                'rgba(100, 221, 23, 0.7)',   // verde
                'rgba(220, 53, 69, 0.7)'     // rojo oscuro
            ]

        }]
    };

    return <Pie data={chartData} />;
};

export default PieChart;
