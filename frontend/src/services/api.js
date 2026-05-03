const BASE = "http://localhost:5000";

export async function saveContact(contact) {
  const res = await fetch(`${BASE}/api/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact)
  });
  return res.json();
}

export async function getContacts() {
  const res = await fetch(`${BASE}/api/contacts`);
  return res.json();
}

export async function uploadAudio(blob) {
  const formData = new FormData();
  formData.append("audio", blob, `evidence-${Date.now()}.webm`);
  const res = await fetch(`${BASE}/api/audio`, {
    method: "POST",
    body: formData
  });
  return res.json();
}

export async function saveAlert(alert) {
  const res = await fetch(`${BASE}/api/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alert)
  });
  return res.json();
}

export async function getAlerts() {
  const res = await fetch(`${BASE}/api/alerts`);
  return res.json();
}
