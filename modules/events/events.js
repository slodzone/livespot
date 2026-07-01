// modules/events/events.js
// Answers one question: "Is there something worth doing today?"

export const id = "events";
export const title = "Today's Events";
export const icon = "🎉";

async function fetchEvents(city) {
  const res = await fetch("/modules/events/events.mock.json");
  const data = await res.json();
  return data[city.id] ?? [];
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesUntil(timeStr) {
  const target = timeToMinutes(timeStr);
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return target - nowMin;
}

function formatCountdown(min) {
  if (min <= 0)  return "Happening now";
  if (min < 60)  return `in ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `in ${h}h` : `in ${h}h ${m}m`;
}

function upcomingEvents(events) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return events
    .filter(e => timeToMinutes(e.time) >= nowMin - 180)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
}

export async function getSummary(city) {
  const events = await fetchEvents(city);
  const upcoming = upcomingEvents(events);

  if (upcoming.length === 0) {
    return { headline: "Nothing left today", subline: "Check back tomorrow" };
  }

  const next = upcoming[0];
  const min = minutesUntil(next.time);

  return {
    headline: next.title,
    subline: `${next.time} · ${formatCountdown(min)}`,
    tagline: upcoming.length > 1 ? `+${upcoming.length - 1} more today` : undefined,
  };
}

export async function getDetails(city) {
  const events = await fetchEvents(city);
  const all = events.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  if (all.length === 0) return { body: "<p>No events found for today.</p>" };

  const rows = all.map(e => {
    const min = minutesUntil(e.time);
    const isNow = min <= 0 && min > -180;
    const isPast = min < -180;
    const badge = isNow
      ? `<span style="background:var(--accent);color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px;">NOW</span>`
      : "";

    return `
      <div style="padding:14px 0;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px;opacity:${isPast ? "0.45" : "1"};">
        <p style="font-weight:600;color:var(--text-primary);">${e.title}${badge}</p>
        <p style="font-size:0.85rem;">${e.category} · ${e.time}</p>
        <p style="font-size:0.8rem;color:var(--text-secondary);">${e.place}</p>
        <p style="font-size:0.8rem;">${e.price}</p>
        <a href="${e.mapsUrl}" target="_blank" rel="noopener"
           style="display:inline-block;margin-top:6px;font-size:0.8rem;color:var(--accent);text-decoration:none;">
          📍 Open in Maps
        </a>
      </div>
    `;
  }).join("");

  return { body: `<div>${rows}</div>` };
}
