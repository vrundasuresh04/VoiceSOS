export function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        resolve({
          lat,
          lng,
          mapLink: `https://www.google.com/maps?q=${lat},${lng}`
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}
