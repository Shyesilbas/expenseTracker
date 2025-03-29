import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryColors = {
    'SHOPPING': '#FF6384',
    'RENT': '#36A2EB',
    'INVESTMENT': '#FFCE56',
    'EDUCATION': '#4BC0C0',
    'DEBT_PAYMENT': '#9966FF',
    'SALARY': '#FF9F40',
    'TRAVEL': '#E7E9ED',
    'OTHER': '#C9CBCE',
    'BET': '#F7464A',
    'TELECOMMUNICATION': '#46BFBD',
    'TRANSPORTATION': '#FDB45C',
    'TAX': '#949FB1',
    'Uncategorized': '#D3D3D3'
};

const PieChart = ({ data, title }) => {
    const categoryData = data.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + parseFloat(item.amount);
        return acc;
    }, {});

    const labels = Object.keys(categoryData);
    const dataValues = Object.values(categoryData);

    const backgroundColors = labels.map(label => categoryColors[label] || '#D3D3D3');

    const chartData = {
        labels: labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 20,
                    padding: 15,
                    font: {
                        size: 14,
                        family: "'Inter', sans-serif",
                    },
                    color: '#1f2937',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleFont: { size: 14, family: "'Inter', sans-serif" },
                bodyFont: { size: 12, family: "'Inter', sans-serif" },
                padding: 10,
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value.toFixed(2)} USD (${percentage}%)`;
                    },
                },
            },
        },
        animation: {
            duration: 1000,
            easing: 'easeOutQuart',
        },
    };

    return (
        <div className="pie-chart-wrapper">
            {labels.length > 0 ? (
                <Pie data={chartData} options={options} />
            ) : (
                <p className="no-chart-data">No data to display for {title}</p>
            )}
        </div>
    );
};

export default PieChart;