import React from "react";

export default function ExplanationCard({ reasons = [] }) {
  if (!reasons.length) return null;
  return (
    <div className="glass-card">
      <div className="section-title">Why AI detected this?</div>
      <ul className="reasons-list">
        {reasons.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}
