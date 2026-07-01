// modules/spot-of-day/spot-of-day.js
// One curated place per day, rotated by day-of-year.

export const id = "spot-of-day";
export const title = "Spot of the Day";
export const icon = "⭐";

let cached = null;

async function fetchSpots(city) {
  if (cached) return cached;
  const res = await fetch("/modules/spot-of-day/spot-of-day.mock.json");
  const data = await res.json();
  cached = data[city.id] ?? [];
  return cached;
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function pickSpot(spots) {
  return spots[dayOfYear() % spots.length];
}

export async function getSummary(city) {
  const spots = await fetchSpots(city);
  if (!spots.length) return { headline: "—", subline: "No spots available" };

  const spot = pickSpot(spots);
  return {
    headline: spot.name,
    subline: spot.tagline,
    tagline: `🕐 Best time: ${spot.bestTime}`,
  };
}

export async function getDetails(city) {
  const spots = await fetchSpots(city);
  if (!spots.length) return { body: "<p>No spot data available for this city.</p>" };

  const spot = pickSpot(spots);

  const body = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--accent);margin-bottom:6px;">${spot.category}</p>
        <p style="font-size:1rem;color:var(--text-secondary);">${spot.tagline}</p>
      </div>
      <div style="background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:6px;">
        <p style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.06em;">Local tip</p>
        <p style="font-size:0.95rem;color:var(--text-primary);">💡 ${spot.tip}</p>
      </div>
      <p style="font-size:0.85rem;">🕐 Best time to visit: <strong style="color:var(--text-primary);">${spot.bestTime}</strong></p>
      <a href="${spot.mapsUrl}" target="_blank" rel="noopener"
         style="display:inline-block;padding:12px 20px;background:var(--accent);color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:0.9rem;text-align:center;">
        📍 Open in Maps
      </a>
    </div>
  `;

  return { body };
}
