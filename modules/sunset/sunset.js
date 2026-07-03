export const id = "sunset";
export const title = "Sunset";
export const icon = "🌅";

let cachedData = null;

async function fetchSunsetData(city) {
  if (cachedData) return cachedData;

  try {
    const url = "https://api.open-meteo.com/v1/forecast"
      + "?latitude=" + city.lat
      + "&longitude=" + city.lon
      + "&daily=sunrise,sunset"
      + "&timezone=" + encodeURIComponent(city.timezone)
      + "&forecast_days=1";

    const res  = await fetch(url);
    const data = await res.json();

    const sunset      = new Date(data.daily.sunset[0]);
    const sunrise     = new Date(data.daily.sunrise[0]);
    const goldenStart = new Date(sunset.getTime() - 46 * 60000);
    const blueEnd     = new Date(sunset.getTime() + 30 * 60000);

    cachedData = { sunset, sunrise, goldenStart, blueEnd };
    return cachedData;

  } catch (e) {
    const res  = await fetch("/modules/sunset/sunset.mock.json");
    const mock = await res.json();
    const d    = mock[city.id];

    function t(str) {
      const parts = str.split(":");
      const h = parseInt(parts[0]);
      const m = parseInt(parts[1]);
      const x = new Date();
      x.setHours(h, m, 0, 0);
      return x;
    }

    cachedData = {
      sunset:      t(d.today),
      sunrise:     t(d.sunrise),
      goldenStart: t(d.goldenHourStart),
      blueEnd:     t(d.blueHourEnd),
    };
    return cachedData;
  }
}

function fmt(date) {
  return date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

function formatCountdown(ms) {
  const min = Math.round(Math.abs(ms) / 60000);
  if (min < 60) return "in " + min + " min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? "in " + h + "h" : "in " + h + "h " + m + "m";
}

function computeStatus(data) {
  const now     = new Date();
  const diffMs  = data.sunset - now;
  const diffMin = diffMs / 60000;

  if (diffMin > 60) {
    return { status: "Sunset later today", tagline: null, countdown: formatCountdown(diffMs) };
  }
  if (diffMin > 15) {
    return { status: "Golden hour soon", tagline: "Get your camera ready 📸", countdown: formatCountdown(diffMs) };
  }
  if (diffMin >= 0) {
    return { status: "GO NOW 🌅", tagline: "Perfect for photos 📸", countdown: formatCountdown(diffMs) };
  }
  if (now < data.blueEnd) {
    return { status: "Blue hour", tagline: "Blue hour magic 🌌", countdown: "Blue hour" };
  }
  return { status: "Sunset has passed", tagline: null, countdown: "Sunset has passed" };
}

export async function getSummary(city) {
  const data = await fetchSunsetData(city);
  const { tagline, countdown } = computeStatus(data);
  return {
    headline: fmt(data.sunset),
    subline:  countdown,
    tagline:  tagline || undefined,
  };
}

export async function getDetails(city) {
  const data = await fetchSunsetData(city);
  const { status } = computeStatus(data);

  let spots = [];
  try {
    const res  = await fetch("/modules/sunset/sunset.mock.json");
    const mock = await res.json();
    spots = mock[city.id] ? mock[city.id].spots : [];
  } catch (e) {}

  const spotsList = spots.map(function(s) { return "<li>" + s + "</li>"; }).join("");

  const body = "<div style='display:flex;flex-direction:column;gap:18px;'>"
    + "<div>"
    + "<p><strong>Sunrise:</strong> " + fmt(data.sunrise) + "</p>"
    + "<p><strong>Golden hour:</strong> " + fmt(data.goldenStart) + " to " + fmt(data.sunset) + "</p>"
    + "<p><strong>Sunset:</strong> " + fmt(data.sunset) + "</p>"
    + "<p><strong>Blue hour ends:</strong> " + fmt(data.blueEnd) + "</p>"
    + "</div>"
    + "<p style='font-weight:600;color:var(--text-primary);'>Now: " + status + "</p>"
    + (spots.length ? "<div><p style='margin-bottom:6px;'><strong>📍 Best spots to watch</strong></p><ul style='padding-left:18px;line-height:1.8;'>" + spotsList + "</ul></div>" : "")
    + "</div>";

  return { body: body };
}
