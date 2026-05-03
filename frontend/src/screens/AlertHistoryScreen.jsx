import React, { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Volume2, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { getAlerts } from "../services/api";

export default function AlertHistoryScreen({ onBack }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadAlerts() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      const list = Array.isArray(data) ? data : [];
      // Newest first
      list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAlerts(list);
    } catch (e) {
      setError("Could not load alerts. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAlerts(); }, []);

  function formatTime(ts) {
    if (!ts) return "Unknown time";
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    return d.toLocaleString();
  }

  function confidenceColor(c) {
    if (c >= 70) return "var(--danger-red)";
    if (c >= 40) return "var(--warning-amber)";
    return "var(--safe-green)";
  }

  const stats = {
    total: alerts.length,
    sent: alerts.filter(a => a.status === "sent").length,
    cancelled: alerts.filter(a => a.status === "cancelled").length,
    avgConfidence: alerts.length
      ? Math.round(alerts.reduce((s, a) => s + (a.confidence || 0), 0) / alerts.length)
      : 0
  };

  return (
    <div className="mobile-container">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={20} />
          <span style={{ fontSize: 14 }}>Back</span>
        </button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Guardian Dashboard</div>
        <button onClick={loadAlerts} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--neon-blue)" }}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        <div className="glass-card" style={{ padding: 12, textAlign: "center", margin: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.total}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Total</div>
        </div>
        <div className="glass-card" style={{ padding: 12, textAlign: "center", margin: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--danger-red)" }}>{stats.sent}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Sent</div>
        </div>
        <div className="glass-card" style={{ padding: 12, textAlign: "center", margin: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--neon-blue)" }}>{stats.avgConfidence}%</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>Avg AI</div>
        </div>
      </div>

      {loading && (
        <div className="glass-card" style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
          Loading alerts...
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ textAlign: "center", padding: 24, color: "var(--danger-red)" }}>
          {error}
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="glass-card" style={{ textAlign: "center", padding: 32 }}>
          <Clock size={32} color="var(--text-muted)" />
          <div style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 12 }}>
            No alerts yet
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            Trigger an SOS from the Home screen to see it here.
          </div>
        </div>
      )}

      {!loading && alerts.map((a) => (
        <div key={a.id || a.timestamp} className="glass-card" style={{ borderLeft: `3px solid ${confidenceColor(a.confidence)}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {a.status === "sent" ? (
                <AlertTriangle size={18} color="var(--danger-red)" />
              ) : a.status === "cancelled" ? (
                <XCircle size={18} color="var(--text-muted)" />
              ) : (
                <CheckCircle size={18} color="var(--safe-green)" />
              )}
              <span style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                {a.status || "alert"}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatTime(a.timestamp)}</span>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
              Trigger
            </div>
            <div style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-primary)" }}>
              "{a.triggerPhrase || "Manual trigger"}"
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                AI Confidence
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: confidenceColor(a.confidence) }}>
                {a.confidence || 0}%
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                Sent to
              </div>
              <div style={{ fontSize: 14 }}>{a.contactName || "—"}</div>
            </div>
          </div>

          {a.reasons && a.reasons.length > 0 && (
            <details style={{ marginBottom: 10 }}>
              <summary style={{ fontSize: 12, color: "var(--neon-blue)", cursor: "pointer", marginBottom: 6 }}>
                Why AI flagged this →
              </summary>
              <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                {a.reasons.map((r, i) => (
                  <li key={i} style={{ padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    • {r}
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
            {a.location?.lat ? (
              <a href={a.location.mapLink} target="_blank" rel="noreferrer" style={{ color: "var(--neon-blue)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} /> View location
              </a>
            ) : (
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <MapPin size={12} /> No location
              </span>
            )}

            {a.audioUrl ? (
              <a href={`http://localhost:5000${a.audioUrl}`} target="_blank" rel="noreferrer" style={{ color: "var(--safe-green)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                <Volume2 size={12} /> Play audio
              </a>
            ) : (
              <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                <Volume2 size={12} /> No audio
              </span>
            )}
          </div>
        </div>
      ))}

      <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 16, lineHeight: 1.6 }}>
        All alerts stored locally in backend (alerts.json)<br />
        Audio evidence served from /uploads
      </div>
    </div>
  );
}
