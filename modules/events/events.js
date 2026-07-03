export const id = "events";
export const title = "Today's Events";
export const icon = "🎉";

async function fetchEvents(city) {
  const res  = await fetch("/modules/events/events.mock.json");
  const data = await res.json();
  return data[city.id] || [];
}

function timeToMinutes(t) {
  if (!t || t === "TBD") return 0;
  const parts = t.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function minutesUntil(t) {
  const now = new Date();
  return timeToMinutes(t) - (now.getHours() * 60 + now.getMinutes());
}

function formatCountdown(min) {
  if (min <= 0) return "Happening now";
  if (min < 60) return "in " + min + " min";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? "in " + h + "h" : "in " + h + "h " + m + "m";
}

function upcomingEvents(events) {
  const now    = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return events
    .filter(function(e) { return timeToMinutes(e.time) >= nowMin - 180; })
    .sort(function(a, b) { return timeToMinutes(a.time) - timeToMinutes(b.time); });
}

export async function getSummary(city) {
  const events   = await fetchEvents(city);
  const upcoming = upcomingEvents(events);

  if (upcoming.length === 0) {
    return { headline: "Nothing left tonight", subline: "Check wroclaw.pl/go tomorrow" };
  }

  const next = upcoming[0];
  const min  = minutesUntil(next.time);

  return {
    headline: next.title,
    subline:  next.time + " · " + formatCountdown(min),
    tagline:  upcoming.length > 1 ? "+" + (upcoming.length - 1) + " more tonight" : undefined,
  };
}

export async function getDetails(city) {
  const events = await fetchEvents(city);
  const all    = events.slice().sort(function(a, b) {
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });

  if (all.length === 0) {
    return { body: "<p>No events today. Check <a href='https://wroclaw.pl/go' target='_blank' style='color:var(--accent);'>wroclaw.pl/go</a> for live listings.</p>" };
  }

  var rows = all.map(function(e) {
    const min    = minutesUntil(e.time);
    const isNow  = min <= 0 && min > -180;
    const isPast = min < -180;

    const badge = isNow
      ? "<span style='background:var(--accent);color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px;'>NOW</span>"
      : "";

    const ticketLink = e.url
      ? "<a href='" + e.url + "' target='_blank' rel='noopener' style='font-size:0.8rem;color:var(--accent);text-decoration:none;'>🎟 Tickets</a>"
      : "";

    return "<div style='padding:14px 0;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px;opacity:" + (isPast ? "0.4" : "1") + ";'>"
      + "<p style='font-weight:600;color:var(--text-primary);'>" + e.title + badge + "</p>"
      + "<p style='font-size:0.85rem;'>" + e.category + " · " + e.time + "</p>"
      + "<p style='font-size:0.8rem;color:var(--text-secondary);'>" + e.place + "</p>"
      + "<p style='font-size:0.8rem;'>" + e.price + "</p>"
      + "<div style='display:flex;gap:12px;margin-top:4px;'>"
      + "<a href='" + e.mapsUrl + "' target='_blank' rel='noopener' style='font-size:0.8rem;color:var(--accent);text-decoration:none;'>📍 Maps</a>"
      + ticketLink
      + "</div>"
      + "</div>";
  }).join("");

  var footer = "<div style='padding-top:16px;'>"
    + "<a href='https://wroclaw.pl/go' target='_blank' rel='noopener' "
    + "style='display:block;padding:12px 20px;border:1px solid var(--border);border-radius:12px;text-decoration:none;font-weight:600;font-size:0.9rem;text-align:center;color:var(--text-primary);'>"
    + "📅 More events on wroclaw.pl/go</a>"
    + "</div>";

  return { body: "<div>" + rows + footer + "</div>" };
}
