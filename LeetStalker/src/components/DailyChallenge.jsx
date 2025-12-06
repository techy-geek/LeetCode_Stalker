import React, { useEffect, useState } from "react";
import axios from "axios";

const DailyChallenge = () => {
  const [daily, setDaily] = useState(null);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const res = await axios.get("http://localhost:3000/daily-question");
        setDaily(res.data);
      } catch (error) {
        console.error("Error fetching daily");
      }
    };
    fetchDaily();
  }, []);

  if (!daily) return null;

  const { question, date } = daily;

  // 1. Color coding for difficulty
  const color =
    question.difficulty === "Easy"
      ? "#00b8a3"
      : question.difficulty === "Medium"
      ? "#ffc01e"
      : "#ff375f";

  // 2. Determine Text Color for contrast (Black text on Yellow, White on Red/Teal)
  const btnTextColor = question.difficulty === "Medium" ? "#000" : "#fff";

  return (
    <div
      className="card"
      style={{
        marginBottom: "30px",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
        border: "1px solid #ffffff20",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 30px",
      }}
    >
      <div>
        <div
          style={{
            color: "#9ca1b2",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "5px",
          }}
        >
          📅 Daily Challenge • {date}
        </div>
        <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "white" }}>
          {question.title}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div
          style={{
            color: color,
            fontWeight: "bold",
            background: `${color}20`, // 20% opacity background
            padding: "5px 12px",
            borderRadius: "20px",
            display: "inline-block",
            marginBottom: "10px",
          }}
        >
          {question.difficulty}
        </div>
        <div>
          <a
            href={`https://leetcode.com${daily.link}`}
            target="_blank"
            rel="noreferrer"
            className="primary-btn"
            style={{
              textDecoration: "none",
              fontSize: "0.9rem",
              padding: "8px 24px",
              marginTop: "10px",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-block",
              // --- UPDATED STYLES HERE ---
              backgroundColor: color,      // Background matches difficulty
              color: btnTextColor,         // Text color adapts for contrast
              border: `1px solid ${color}` // Border matches difficulty
            }}
          >
             Solve
          </a>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;