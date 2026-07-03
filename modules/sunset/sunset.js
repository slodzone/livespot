// modules/sunset/sunset.js
export const id = "sunset";
export const title = "Sunset";
export const icon = "🌅";

let cachedData = null;

async function fetchSunsetData(city) {
  if (cachedData) return cachedData;

  try {
    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${city.lat}&longitude=${city.lon}`
      + `&daily=sunrise,sunset`
      + `&timezone=${encodeURIComponent(city.timezone)}`
      + `&forecast_days=1`;

    const res = await fetch(url);
    const data = await res.json();

    const sunset     = new Date(data.daily.sunset[0]);
    const sunrise    = new Date(data.daily.sunrise[0]);
    const goldenStart = new Date(sunset.getTime() - 46 * 60000);
    const blueEnd    = new Date(sunset.getTime() + 30 * 60000);

    cachedData = { sunset, sunrise, goldenStart, blueEnd };
    return cachedData;

  } catch {
    const res = await fetch("/modules/sunset/sunset.mock.json");
    const mock = await res.json();
    const d = mock[city.id];

    function t(str) {
      const [h, m] = str.split(":").map(Number);
      const x = new Date(); x.setHours(h, m, 0, 0); return x;
    }

    cachedData = {
      sunset:     t(d.today),
      sunrise:    t(d.sunrise),
      goldenStart: t(d.goldenHourStart),
      blueEnd:    t(d.blueHourEnd),
    };
    return cachedData;
  }
}

function fmt(date) {
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function formatCountdown(ms) {
  const min = Math.round(Math.abs(ms) / 60000);
  if (min < 60) return `in ${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}

function computeStatus(data) {
  const now = new Date();
  const diffMs  = data.sunset - now;
  const diffMin = diffMs / 60000;

  if (diffMin > 60)  return { status: "Sunset later today", tagline: null, countdown: formatCountdown(diffMs) };
  if (diffMin > 15)  return { status: "Golden hour soon",   tagline: "Get your camera ready 📸", countdown: formatCountdown(diffMs) };
  if (diffMin >= 0)  return { status: "GO NOW 🌅",          tagline: "Perfect for photos
