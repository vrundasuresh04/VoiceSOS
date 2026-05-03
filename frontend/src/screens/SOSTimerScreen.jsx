import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { speak, stopSpeaking } from "../services/voiceService";
import { getLocation } from "../services/locationService";
import { recordAudio } from "../services/audioService";
import { uploadAudio, saveAlert } from "../services/api";
import { getLocalContacts, getPrimaryContact } from "../services/storage";

export default function SOSTimerScreen({ trigger, onCancel, onSent }) {
  const [countdown, setCountdown] = useState(10);
  const [phase, setPhase] = useState("countdown"); // countdown | sending | sent
  const [statusText, setStatusText] = useState("");
  const cancelledRef = useRef(false);

  useEffect(() => {
    speak("Emergency detected. Sending S O S alert in 10 seconds. Tap cancel if false alarm.");
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    if (countdown > 0 && phase === "countdown") {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (countdown === 0 && phase === "countdown") {
      executeSOS();
    }
    // eslint-disable-next-line
  }, [countdown, phase]);

  async function executeSOS() {
    if (cancelledRef.current) return;
    setPhase("sending");

    setStatusText("Getting location...");
    const location = await getLocation();

    setStatusText("Recording 20s audio evidence...");
    const audioBlob = await recordAudio(20);

    let audioUrl = null;
    if (audioBlob) {
      setStatusText("Uploading audio evidence...");
      try {
        const uploaded = await uploadAudio(audioBlob);
        audioUrl = uploaded?.audioUrl || null;
      } catch (e) { console.warn("Audio upload failed"); }
    }

    const allContacts = getLocalContacts();
    const primary = getPrimaryContact();
    setStatusText("Saving alert...");

    const alert = {
      status: "sent",
      triggerPhrase: trigger.phrase,
      confidence: trigger.confidence,
      label: trigger.label,
      reasons: trigger.reasons,
      location: location || { lat: null, lng: null, mapLink: "Location unavailable" },
      audioUrl,
      contactName: primary?.name || "Unknown",
      contactPhone: primary?.phone || "",
      allContacts: allContacts.map(c => ({ name: c.name, phone: c.phone, role: c.role }))
    };

    try { await saveAlert(alert); } catch (e) { console.warn("Alert save failed"); }

    // Build WhatsApp deep link
    const message =
`EMERGENCY SOS!
I may be unsafe.

App: VoiceSOS
AI Confidence: ${trigger.confidence}%
Trigger: ${trigger.phrase}
Location: ${location?.mapLink || "unavailable"}

Audio evidence captured in app dashboard.`;

    // Build WhatsApp links for ALL contacts so user can quickly message each
    const waLinks = allContacts.map(c => ({
      name: c.name,
      role: c.role,
      phone: c.phone,
      waLink: `https://wa.me/${c.phone}?text=${encodeURIComponent(message)}`
    }));
    const primaryWaLink = waLinks[0]?.waLink || null;

    setPhase("sent");
    speak("Alert sent successfully. Your trusted contact has been notified.");
    onSent({ ...alert, waLink: primaryWaLink, waLinks });
  }

  function handleCancel() {
    cancelledRef.current = true;
    stopSpeaking();
    speak("S O S cancelled. You are safe.");
    onCancel();
  }

  if (phase === "sending") {
    return (
      <div className="mobile-container" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
        <div className="glass-card" style={{ textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sending SOS Alert...</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 14 }}>{statusText}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh", background: "linear-gradient(135deg, #2a0a0a 0%, #1a0303 100%)" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <AlertTriangle size={64} color="var(--danger-red)" style={{ filter: "drop-shadow(0 0 30px var(--danger-red-glow))" }} />
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 16, color: "var(--danger-red)" }}>SOS TRIGGERED</div>
      </div>

      <div className="glass-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          Reason
        </div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 4 }}>
          AI detected distress with {trigger.confidence}% confidence
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
          "{trigger.phrase}"
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 2 }}>
          Sending in
        </div>
        <div style={{ fontSize: 96, fontWeight: 800, color: "var(--danger-red)", lineHeight: 1, textShadow: "0 0 30px var(--danger-red-glow)" }}>
          {countdown}
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>seconds</div>
      </div>

      <button className="btn btn-primary" onClick={handleCancel} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <X size={20} />
        Cancel SOS
      </button>

      <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 16 }}>
        Tap Cancel if this was a false alarm.
      </div>
    </div>
  );
}
