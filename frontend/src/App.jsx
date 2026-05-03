import React, { useState, useEffect } from "react";
import SetupScreen from "./screens/SetupScreen";
import HomeScreen from "./screens/HomeScreen";
import SOSTimerScreen from "./screens/SOSTimerScreen";
import AlertSentScreen from "./screens/AlertSentScreen";
import AlertHistoryScreen from "./screens/AlertHistoryScreen";
import { getLocalContacts } from "./services/storage";
import "./styles/theme.css";

export default function App() {
  const [screen, setScreen] = useState("setup");
  const [trigger, setTrigger] = useState(null);
  const [sentAlert, setSentAlert] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then(r => r.json())
      .then(d => setBackendStatus(d.status === "ok" ? "connected" : "error"))
      .catch(() => setBackendStatus("offline"));

    if (getLocalContacts().length > 0) setScreen("home");
  }, []);

  return (
    <>
      {screen === "setup" && (
        <SetupScreen onContinue={() => setScreen("home")} />
      )}
      {screen === "home" && (
        <HomeScreen
          onTriggerSOS={(t) => { setTrigger(t); setScreen("sos"); }}
          onViewHistory={() => setScreen("history")}
        />
      )}
      {screen === "sos" && trigger && (
        <SOSTimerScreen
          trigger={trigger}
          onCancel={() => setScreen("home")}
          onSent={(a) => { setSentAlert(a); setScreen("sent"); }}
        />
      )}
      {screen === "sent" && sentAlert && (
        <AlertSentScreen
          alert={sentAlert}
          onBackHome={() => setScreen("home")}
        />
      )}
      {screen === "history" && (
        <AlertHistoryScreen onBack={() => setScreen("home")} />
      )}
      <div style={{
        position: "fixed", bottom: 8, right: 8,
        fontSize: 10, color: "rgba(255,255,255,0.4)",
        background: "rgba(0,0,0,0.5)", padding: "4px 8px", borderRadius: 8
      }}>
        backend: {backendStatus}
      </div>
    </>
  );
}
