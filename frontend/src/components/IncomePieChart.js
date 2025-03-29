import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const IncomePieChart = ({ incomes }) => {
    const categoryData = incomes.reduce((acc, income) => {
        const category = income.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + parseFloat(income.amount);
        return acc;
    }, {});

    const labels = Object.keys(categoryData);
    const dataValues = Object.values(categoryData);

    const data = {
        labels: labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#E7E9ED', '#C9CBCE', '#F7464A', '#46BFBD',
                    '#FDB45C', '#949FB1'
                ].slice(0, labels.length),
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 8, // Adds a slight pop-out effect on hover
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
                <Pie data={data} options={options} />
            ) : (
                <p className="no-chart-data">No incoming income to display</p>
            )}
        </div>
    );
};

export default IncomePieChart;
