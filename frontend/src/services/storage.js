const KEY = "voicesos_contacts";
const LEGACY_KEY = "voicesos_contact"; // backward compatibility

export function saveLocalContacts(contacts) {
  localStorage.setItem(KEY, JSON.stringify(contacts));
}

export function getLocalContacts() {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch { return []; }
  }
  // Migrate old single-contact format if it exists
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    try {
      const old = JSON.parse(legacy);
      const arr = old?.name && old?.phone ? [{ ...old, role: "Primary" }] : [];
      saveLocalContacts(arr);
      return arr;
    } catch { return []; }
  }
  return [];
}

export function getPrimaryContact() {
  const list = getLocalContacts();
  return list.find(c => c.role === "Primary") || list[0] || null;
}

// Backward compat: code still calling getLocalContact() / saveLocalContact() will work
export function getLocalContact() {
  return getPrimaryContact();
}
export function saveLocalContact(contact) {
  saveLocalContacts([{ ...contact, role: "Primary" }]);
}
export function clearLocalContact() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(LEGACY_KEY);
}
