// voiceService.js
// Browser-native text-to-speech for SOS announcements.
// Adds an "assistant-like" feel without requiring external APIs.

let currentUtterance = null;

export function speak(text, options = {}) {
  if (!("speechSynthesis" in window)) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = options.lang || "en-IN";
  utter.rate = options.rate || 1.0;
  utter.pitch = options.pitch || 1.0;
  utter.volume = options.volume || 1.0;

  // Try to pick a female voice if available (more reassuring for safety app)
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith("en") && /female|samantha|zira|google.*female/i.test(v.name)
  ) || voices.find(v => v.lang.startsWith("en"));
  if (preferred) utter.voice = preferred;

  currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
