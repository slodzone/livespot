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
  const day = new Date().getDay();
  if (venue.days === "Tue only") return day === 2;
  if (venue.days === "Tue-Fri")  return day >= 2 && day <= 5;
  if (venue.days === "Sun-Thu")  return day === 0 || (day >= 1 && day <= 4);
  if (venue.days === "Mon-Fri")  return day >= 1 && day <= 5;
  return true;
}

function isActiveNow(hoursStr) {
  const parts  = hoursStr.split("-");
  const start  = timeToMinutes(parts[0]);
  const end    = timeToMinutes(parts[1]);
  const now    = new Date();
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
  const active  = today.filter(function(v) { return isActiveNow(v.hours); });

  if (active.length > 0) {
    return {
      headline: active.length + " spot" +
