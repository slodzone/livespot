// modules/sunset/sunset.js
// Sunset countdown + golden/blue hour status. No API, no backend.

export const id = "sunset";
export const title = "Sunset";
export const icon = "🌅";

let cachedData = null;

async function fetchSunsetData() {
  if (cachedData) return cachedData;
  const res = await fetch("/modules/sunset/sunset.mock.json");
  cachedData = await res.json();
  return cachedData;
}

function timeStringToToday(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function formatMinutesRemaining(diffMs) {
  const totalMin = Math.round(diffMs / 60000);
  if (totalMin < 60) return `in ${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}

function computeStatus(cityData) {
  const now = new Date();
  const sunset = timeStringToToday(cityData.today);
  const goldenStart = timeStringToToday(cityData.goldenHourStart);
  const blueEnd = timeStringToToday(cityData.blueHourEnd);

  const diffMs = sunset - now;
  const diffMin = diffMs / 60000;

  let statusLabel;
  if (diffMin > 60) {
    statusLabel = "Sunset later today";
  } else if (diffMin > 15) {
    statusLabel = "Golden hour soon";
  } else if (diffMin >= 0) {
    statusLabel = "GO NOW 🌅";
  } else {
    statusLabel = "Sunset has passed";
  }

  let tagline = null;
  if (now >= goldenStart && now < sunset) {
    tagline = "Perfect for photos 📸";
  } else if (now >= sunset && now < blueEnd) {
    tagline = "Blue hour magic 🌌";
  }

  const countdownText = diffMs >= 0 ? formatMinutesRemaining(diffMs) : statusLabel;

  return { sunset, goldenStart, blueEnd, statusLabel, tagline, countdownText, diffMs };
}

export async function getSummary(city) {
  const data = await fetchSunsetData();
  const cityData = data[city.id];
  if (!cityData) {
    return { headline: "—", subline: "No data for this city" };
  }

  const { statusLabel, tagline, countdownText } = computeStatus(cityData);

  return {
    headline: cityData.today,
    subline: countdownText === statusLabel ? statusLabel : countdownText,
    tagline: tagline || undefined,
  };
}

export async function getDetails(city) {
  const data = await fetchSunsetData();
  const cityData = data[city.id];
  if (!cityData) {
    return { body: "No sunset data available for this city yet." };
  }

  const spotsList = cityData.spots.map((spot) => `<li>${spot}</li>`).join("");

  const body = `
    <div style="display:flex; flex-direction:column; gap:18px;">
      <div>
        <p><strong>Sunset:</strong> ${cityData.today}</p>
        <p><strong>Golden hour:</strong> ${cityData.goldenHourStart} – ${cityData.today}</p>
        <p><strong>Blue hour:</strong> ${cityData.today} – ${cityData.blueHourEnd}</p>
      </div>
      <div>
        <p style="margin-bottom:6px;"><strong>📍 Best spots to watch</strong></p>
        <ul style="padding-left:18px; line-height:1.6;">${spotsList}</ul>
      </div>
      <div>
        <p style="margin-bottom:6px;"><strong>🌤 Conditions</strong></p>
        <p>Cloud coverage: ${cityData.conditions.cloudCoverage}</p>
        <p>Visibility: ${cityData.conditions.visibility}</p>
      </div>
    </div>
  `;

  return { body };
}
