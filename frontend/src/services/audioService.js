export async function recordAudio(durationSec = 20) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);

    return new Promise((resolve) => {
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        resolve(blob);
      };
      recorder.start();
      setTimeout(() => recorder.stop(), durationSec * 1000);
    });
  } catch (err) {
    console.warn("Audio recording failed:", err);
    return null;
  }
}
