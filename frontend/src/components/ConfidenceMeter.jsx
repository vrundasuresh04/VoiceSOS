import React from "react";

export default function ConfidenceMeter({ value = 0, label = "Normal" }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  let stroke = "var(--safe-green)";
  if (value >= 70) stroke = "var(--danger-red)";
  else if (value >= 40) stroke = "var(--warning-amber)";

  return (
    <div className="meter-wrap" style={{ position: "relative" }}>
      <svg className="meter-svg" width="200" height="200">
        <circle className="meter-track" cx="100" cy="100" r={radius} />
        <circle
          className="meter-progress"
          cx="100"
          cy="100"
          r={radius}
          stroke={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 10px ${stroke})` }}
        />
      </svg>
      <div className="meter-center">
        <div className="meter-value" style={{ color: stroke }}>{value}%</div>
        <div className="meter-label">{label}</div>
      </div>
    </div>
  );
}
