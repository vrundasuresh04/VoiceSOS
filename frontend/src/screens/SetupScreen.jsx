import React, { useState, useEffect } from "react";
import { Shield, User, Phone, ChevronRight, Plus, X } from "lucide-react";
import { saveLocalContacts, getLocalContacts } from "../services/storage";
import { saveContact } from "../services/api";

const ROLES = ["Primary", "Secondary", "Tertiary"];
const ROLE_HINTS = {
  Primary: "e.g. Mom — first to be alerted",
  Secondary: "e.g. Dad / Brother — backup",
  Tertiary: "e.g. Friend — third option"
};

export default function SetupScreen({ onContinue }) {
  const [contacts, setContacts] = useState([
    { name: "", phone: "", role: "Primary" }
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const existing = getLocalContacts();
    if (existing.length > 0) {
      setContacts(existing);
    }
  }, []);

  function updateContact(index, field, value) {
    setContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  }

  function addContact() {
    if (contacts.length >= 3) return;
    const nextRole = ROLES[contacts.length];
    setContacts(prev => [...prev, { name: "", phone: "", role: nextRole }]);
  }

  function removeContact(index) {
    if (contacts.length <= 1) return;
    setContacts(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    // Validate primary at minimum
    const primary = contacts[0];
    if (!primary.name.trim() || !primary.phone.trim()) {
      alert("Please add at least the Primary contact (name + phone).");
      return;
    }
    // Filter out empty rows + clean phone
    const cleaned = contacts
      .filter(c => c.name.trim() && c.phone.trim())
      .map((c, i) => ({
        name: c.name.trim(),
        phone: c.phone.trim().replace(/\D/g, ""),
        role: ROLES[i] || `Contact ${i + 1}`
      }));

    setSaving(true);
    saveLocalContacts(cleaned);
    try {
      for (const c of cleaned) { await saveContact(c); }
    } catch (e) { console.warn("Backend save partial:", e); }
    setSaving(false);
    onContinue();
  }

  return (
    <div className="mobile-container">
      <div style={{ textAlign: "center", marginTop: 24, marginBottom: 24 }}>
        <Shield size={56} color="var(--neon-blue)" style={{ filter: "drop-shadow(0 0 20px var(--neon-blue-glow))" }} />
        <div className="app-title" style={{ marginTop: 12, fontSize: 28 }}>VoiceSOS</div>
        <div className="app-subtitle">Say Help. Stay Protected.</div>
      </div>

      <div className="glass-card">
        <div className="section-title">Trusted Contacts (up to 3)</div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.5 }}>
          These contacts will be available for SOS alerts. Primary is the default recipient.
        </div>

        {contacts.map((c, i) => (
          <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < contacts.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--neon-blue)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                {c.role}
              </span>
              {contacts.length > 1 && (
                <button
                  onClick={() => removeContact(i)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  title="Remove"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>{ROLE_HINTS[c.role]}</div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "var(--text-muted)", fontSize: 11 }}>
                <User size={12} /> Name
              </div>
              <input className="input" placeholder="e.g. Mom" value={c.name} onChange={e => updateContact(i, "name", e.target.value)} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, color: "var(--text-muted)", fontSize: 11 }}>
                <Phone size={12} /> Phone (with country code, e.g. 919876543210)
              </div>
              <input className="input" placeholder="919876543210" value={c.phone} onChange={e => updateContact(i, "phone", e.target.value)} />
            </div>
          </div>
        ))}

        {contacts.length < 3 && (
          <button
            onClick={addContact}
            className="btn btn-ghost"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, padding: 12 }}
          >
            <Plus size={14} /> Add another contact
          </button>
        )}
      </div>

      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 }}>
        {saving ? "Saving..." : "Continue to Safety Mode"}
        <ChevronRight size={18} />
      </button>

      <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 18, lineHeight: 1.6 }}>
        🔒 Contacts stored locally. Future scope: automated cascade alerting<br />
        (escalates to next contact if primary doesn't acknowledge in 60s).
      </div>
    </div>
  );
}
