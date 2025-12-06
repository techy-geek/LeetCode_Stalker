// src/components/SolvedCircle.jsx
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const SolvedCircle = ({ easy, medium, hard, total }) => {
  // 1. Data for the Ring segments
  const data = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [easy, medium, hard], // e.g., [20, 40, 5]
        backgroundColor: [
          '#00b8a3', // Teal (Easy)
          '#ffc01e', // Yellow (Medium)
          '#ff375f', // Red (Hard)
        ],
        borderWidth: 0, // No white borders between segments
        hoverOffset: 0, // Disable hover expansion
      },
    ],
  };

  // 2. Options to make it look like a thin ring
  const options = {
    cutout: '85%', // Makes the ring thin (LeetCode style)
    plugins: {
      legend: { display: false }, // Hide the color boxes
      tooltip: { enabled: false }, // No annoying popups
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div style={{ position: 'relative', width: '100px', height: '100px' }}>
      {/* The Ring Chart */}
      <Doughnut data={data} options={options} />
      
      {/* The Text in the Center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 'bold', lineHeight: '1' }}>
          {total}
        </div>
        <div style={{ color: '#888', fontSize: '0.65rem', marginTop: '4px' }}>
          Solved
        </div>
      </div>
    </div>
  );
};

export default SolvedCircle;