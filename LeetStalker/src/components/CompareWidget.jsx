import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CompareWidget = ({ myStats, friends }) => {
  const [selectedFriend, setSelectedFriend] = useState("");
  const [chartData, setChartData] = useState(null);
  // src/components/CompareWidget.jsx

  useEffect(() => {
    if (!myStats || !selectedFriend) {
      setChartData(null);
      return;
    }

    const opponent = friends.find((f) => f.username === selectedFriend);

    if (opponent) {
      setChartData({
        labels: ["Easy", "Medium", "Hard"], // This order matters!
        datasets: [
  {
    label: "Me (" + myStats.username + ")",
    data: [myStats.easy, myStats.medium, myStats.hard],
    // SOLID VIBRANT COLORS (LeetCode Standard)
    backgroundColor: [
      "#00b8a3", // Easy (Teal)
      "#ffc01e", // Medium (Yellow)
      "#ff375f", // Hard (Red)
    ],
    borderColor: [
      "#00b8a3",
      "#ffc01e",
      "#ff375f",
    ],
    borderWidth: 1,
  },
  {
    label: opponent.username,
    data: [opponent.easy, opponent.medium, opponent.hard],
    // TRANSPARENT "GHOST" COLORS
    // We add '33' to the hex code to make it 20% opacity
    backgroundColor: [
      "#00b8a333", // Easy (Teal with transparency)
      "#ffc01e33", // Medium (Yellow with transparency)
      "#ff375f33", // Hard (Red with transparency)
    ],
    // Solid borders so they are still visible
    borderColor: [
      "#00b8a3",
      "#ffc01e",
      "#ff375f",
    ],
    borderWidth: 2, // Slightly thicker border for the ghost bars
    borderDash: [5, 5], // Optional: Dashed line for opponent makes it look very cool
  },
],
      });
    }
  }, [myStats, selectedFriend, friends]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "white" } },
    },
    scales: {
      x: { ticks: { color: "#ccc" }, grid: { color: "#444" } },
      y: { ticks: { color: "#ccc" }, grid: { color: "#444" } },
    },
  };

  return (
    <div
      className="card"
      style={{ marginBottom: "30px", border: "1px solid #444" }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "15px" }}>⚔️ Compare Yourself </h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        {/* PLAYER 1: LOCKED AS YOU */}
        <div
          style={{
            flexGrow: 1,
            background: "#222",
            color: "#00b8a3",
            padding: "10px",
            borderRadius: "6px",
            textAlign: "center",
            fontWeight: "bold",
            border: "1px solid #333",
          }}
        >
          {myStats ? myStats.username : "Loading..."}
        </div>

        <span style={{ fontWeight: "900", color: "#666", fontSize: "1.2rem" }}>
          VS
        </span>

        {/* PLAYER 2: SELECT OPPONENT */}
        <select
          className="dark-select"
          value={selectedFriend}
          onChange={(e) => setSelectedFriend(e.target.value)}
        >
          <option value="">Select your competitor</option>
          {friends
            .filter((f) => f.username !== myStats?.username) // Prevent comparing with self
            .map((f) => (
              <option key={f.username} value={f.username}>
                {f.username}
              </option>
            ))}
        </select>
      </div>

      {chartData ? (
        <div style={{ height: "250px" }}>
          <Bar options={options} data={chartData} />
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "#666", padding: "20px" }}>
          Select an opponent to start the battle
        </div>
      )}
    </div>
  );
};

export default CompareWidget;
