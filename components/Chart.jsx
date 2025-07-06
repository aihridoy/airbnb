"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ChartComponent = ({ type, data, dataKey, xAxisKey, nameKey, color = '#3B82F6' }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (type === 'pie') {
              return `${context.label}: ${context.parsed}`;
            }
            return `${context.dataset.label}: ${context.parsed.y || context.parsed}`;
          }
        }
      }
    },
    scales: type !== 'pie' ? {
      y: {
        beginAtZero: true,
      },
    } : {},
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}`;
          }
        }
      }
    },
  };

  if (type === 'bar') {
    const chartData = {
      labels: data.map(item => item[xAxisKey]),
      datasets: [
        {
          label: 'Bookings',
          data: data.map(item => item[dataKey]),
          backgroundColor: `${color}80`, // Add transparency
          borderColor: color,
          borderWidth: 1,
        },
      ],
    };

    return <Bar data={chartData} options={chartOptions} />;
  }

  if (type === 'line') {
    const chartData = {
      labels: data.map(item => item[xAxisKey]),
      datasets: [
        {
          label: 'Amount ($)',
          data: data.map(item => item[dataKey]),
          borderColor: color,
          backgroundColor: `${color}20`,
          tension: 0.4,
          fill: true,
        },
      ],
    };

    return <Line data={chartData} options={chartOptions} />;
  }

  if (type === 'pie') {
    const chartData = {
      labels: data.map(item => item[nameKey]),
      datasets: [
        {
          data: data.map(item => item[dataKey]),
          backgroundColor: [
            'rgba(34, 197, 94, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(168, 85, 247, 0.6)',
            'rgba(59, 130, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(236, 72, 153, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return <Pie data={chartData} options={pieOptions} />;
  }

  return null;
};

export default ChartComponent;