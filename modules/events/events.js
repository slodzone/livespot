export const id = "events";
export const title = "Today's Events";
export const icon = "🎉";

const EVENTBRITE_TOKEN = "PEPUYIUJO3VSZTWKIPD3";

async function fetchEvents(city) {
  try {
    const now      = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);
    const start    = now.toISOString().split(".")[0] + "Z";
    const end      = tomorrow.toISOString().split(".")[0] + "Z";

    const url = "https://www.eventbriteapi.com/v3/events/search/"
      + "?token=" + EVENTBRITE_TOKEN
      + "&location.address=" + encodeURIComponent(city.name + ", Poland")
      + "&location.within=10km"
      + "&start_date.range_start=" + start
      + "&start_date.range_end=" + end
      + "&expand=venue"
      + "&sort_by=date";

    const res   = await fetch(url);
    const data  = await res.json();
    const items = data.events || [];

    return items.map(function(e) {
      return {
        title:   e.name ? e.name.text : "Untitled",
        time:    e.start && e.start.local ? e.start.local.slice(11, 16) : "TBD",
        place:   e.venue ? e.venue.name : "Venue TBD",
        price:   e.is_free ? "Free" : "See website",
        mapsUrl: e.venue
          ? "https://maps.google.com/?q=" + encodeURIComponent(e.venue.name + " " + city.name)
          : "https://maps.google.com/?q=" + encodeURIComponent(city.name),
        url: e.url || null,
      };
    });

  } catch (err) {
    const res  = await fetch("/modules/events/events.mock.json");
    const data = await res.json();
    return data[city.id] || [];
  }
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
    return { headline: "Nothing left today", subline: "Check back tomorrow" };
  }

  const next = upcoming[0];
  const min  = minutesUntil(next.time);

  return {
    headline: next.title,
    subline:  next.time + " · " + formatCountdown(min),
    tagline:  upcoming.length > 1 ? "+" + (upcoming.length - 1) + " more today" : undefined,
  };
}

export async function getDetails(city) {
  const events = await fetchEvents(city);
  const all    = events.slice().sort(function(a, b) {
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });

  if (all.length === 0) {
    return { body: "<p>No events found in Wroclaw today.</p>" };
  }

  var rows = all.map(function(e) {
    const min    = minutesUntil(e.time);
    const isNow  = min <= 0 && min > -180;
    const isPast = min < -180;

    const badge = isNow
      ? "<span style='background:var(--accent);color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px;'>NOW</span>"
      : "";

    const ticketLink = e.url
      ? "<a href='" + e.url + "' target='_blank' rel='noopener' style='font-size:0.8rem;color:var(--accent);text-decoration:none;'>Tickets</a>"
      : "";

    return "<div style='padding:14px 0;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px;opacity:" + (isPast ? "0.4" : "1") + ";'>"
      + "<p style='font-weight:600;color:var(--text-primary);'>" + e.title + badge + "</p>"
      + "<p style='font-size:0.85rem;'>" + e.time + " · " + e.place + "</p>"
      + "<p style='font-size:0.8rem;'>" + e.price + "</p>"
      + "<div style='display:flex;gap:12px;margin-top:4px;'>"
      + "<a href='" + e.mapsUrl + "' target='_blank' rel='noopener' style='font-size:0.8rem;color:var(--accent);text-decoration:none;'>Maps</a>"
      + ticketLink
      + "</div>"
      + "</div>";
  }).join("");

  return { body: "<div>" + rows + "</div>" };
}
