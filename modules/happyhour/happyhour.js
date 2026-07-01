// modules/happyhour/happyhour.js
// Tells the user if happy hour is happening right now, and where.

export const id = "happyhour";
export const title = "Happy Hour";
export const icon = "🍺";

async function fetchVenues(city) {
  const res = await fetch("/modules/happyhour/happyhour.mock.json");
  const data = await res.json();
  return data[city.id] ?? [];
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function isActiveNow(hoursStr) {
  const [start, end] = hoursStr.split("–").map(timeToMinutes);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= start && nowMin < end;
}

function minutesUntil(timeStr) {
  const target = timeToMinutes(timeStr);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return target - nowMin;
}

export async function getSummary(city) {
  const venues = await fetchVenues(city);
  const active = venues.filter(v => isActiveNow(v.hours));

  if (active.length > 0) {
    return {
      headline: `${active.length} spot${active.length > 1 ? "s" : ""} active`,
      subline: active[0].name,
      tagline: active[0].deal,
    };
  }

  const upcoming = venues
    .map(v => ({ ...v, startsIn: minutesUntil(v.hours.split("–")[0]) }))
    .filter(v => v.startsIn > 0)
    .sort((a, b) => a.startsIn - b.startsIn);

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const h = Math.floor(next.startsIn / 60);
    const m = next.startsIn % 60;
    const timeLabel = h > 0 ? `in ${h}h ${m}m` : `in ${m} min`;
    return {
      headline: next.name,
      subline: `Starts ${timeLabel}`,
    };
  }

  return {
    headline: "None today",
    subline: "Check back tomorrow",
  };
}

export async function getDetails(city) {
  const venues = await fetchVenues(city);

  const rows = venues.map(v => {
    const active = isActiveNow(v.hours);
    const badge = active
      ? `<span style="background:var(--accent);color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px;">NOW</span>`
      : "";

    return `
      <div style="padding:14px 0;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px;">
        <p style="font-weight:600;color:var(--text-primary);">${v.name}${badge}</p>
        <p>${v.deal}</p>
        <p style="font-size:0.8rem;">${v.hours}</p>
        <a href="${v.mapsUrl}" target="_blank" rel="noopener"
           style="display:inline-block;margin-top:6px;font-size:0.8rem;color:var(--accent);text-decoration:none;">
          📍 Open in Maps
        </a>
      </div>
    `;
  }).join("");

  return { body: `<div>${rows}</div>` };
}
