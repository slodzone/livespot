export const id = "happyhour";
export const title = "Happy Hour";
export const icon = "🍺";

async function fetchVenues(city) {
  const res  = await fetch("/modules/happyhour/happyhour.mock.json");
  const data = await res.json();
  return data[city.id] || [];
}

function timeToMinutes(t) {
  const parts = t.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function isAvailableToday(venue) {
  if (!venue.days || venue.days === "Daily") return true;
  const day = new Date().getDay(); // 0=Sun,1=Mon,...,6=Sat
  const days = venue.days;
  if (days === "Tue only")  return day === 2;
  if (days === "Tue–Fri")   return day >= 2 && day <= 5;
  if (days === "Sun–Thu")   return day === 0 || (day >= 1 && day <= 4);
  if (days === "Mon–Fri")   return day >= 1 && day <= 5;
  return true;
}

function isActiveNow(hoursStr) {
  const parts = hoursStr.split("–");
  const start = timeToMinutes(parts[0]);
  const end   = timeToMinutes(parts[1]);
  const now   = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= start && nowMin < end;
}

function minutesUntil(timeStr) {
  const now    = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return timeToMinutes(timeStr) - nowMin;
}

export async function getSummary(city) {
  const venues  = await fetchVenues(city);
  const today   = venues.filter(isAvailableToday);
  const active  = today.filter(v => isActiveNow(v.hours));

  if (active.length > 0) {
    return {
      headline: active.length + " spot" + (active.length > 1 ? "s" : "") + " active",
      subline:  active[0].name,
      tagline:  active[0].deal,
    };
  }

  const upcoming = today
    .map(function(v) {
      return Object.assign({}, v, { startsIn: minutesUntil(v.hours.split("–")[0]) });
    })
    .filter(function(v) { return v.startsIn > 0; })
    .sort(function(a, b) { return a.startsIn - b.startsIn; });

  if (upcoming.length > 0) {
    const next = upcoming[0];
    const h    = Math.floor(next.startsIn / 60);
    const m    = next.startsIn % 60;
    const label = h > 0 ? "in " + h + "h " + m + "m" : "in " + m + " min";
    return {
      headline: next.name,
      subline:  "Starts " + label,
    };
  }

  return {
    headline: "None today",
    subline:  "Check back tomorrow",
  };
}

export async function getDetails(city) {
  const venues = await fetchVenues(city);

  var rows = venues.map(function(v) {
    const availableToday = isAvailableToday(v);
    const active = availableToday && isActiveNow(v.hours);

    const badge = active
      ? "<span style='background:var(--accent);color:#fff;font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px;'>NOW</span>"
      : "";

    const unavailable = !availableToday
      ? "<span style='font-size:0.75rem;color:var(--text-secondary);margin-left:6px;'>not today</span>"
      : "";

    return "<div style='padding:14px 0;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px;opacity:" + (availableToday ? "1" : "0.4") + ";'>"
      + "<p style='font-weight:600;color:var(--text-primary);'>" + v.name + badge + unavailable + "</p>"
      + "<p>" + v.deal + "</p>"
      + "<p style='font-size:0.8rem;color:var(--text-secondary);'>" + v.hours + " &middot; " + v.days + "</p>"
      + "<a href='" + v.mapsUrl + "' target='_blank' rel='noopener' style='margin-top:4px;font-size:0.8rem;color:var(--accent);text-decoration:none;'>Maps</a>"
      + "</div>";
  }).join("");

  return { body: "<div>" + rows + "</div>" };
}
