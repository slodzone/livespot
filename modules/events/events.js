// modules/events/events.js
export const id = "events";
export const title = "Today's Events";
export const icon = "🎉";

const EVENTBRITE_TOKEN = "PEPUYIUJO3VSZTWKIPD3";

async function fetchEvents(city) {
  try {
    const today    = new Date();
    const tomorrow = new Date(Date.now() + 86400000);
    const fmt      = d => d.toISOString().split(".")[0] + "Z";

    const url = `https://www.eventbriteapi.com/v3/events/search/`
      + `?token=${EVENTBRITE_TOKEN}`
      + `&location.address=${encodeURIComponent(city.name + ", Poland")}`
      + `&location.within=10km`
      + `&start_date.range_start=${fmt(today)}`
      + `&start_date.range_end=${fmt(tomorrow)}`
      + `&expand=venue`
      + `&sort_by=date`;

    const res  = await fetch(url);
    const data = await res.json();
    const items = data?.events ?? [];

    return items.map(e => ({
      title:    e.name?.text ?? "Untitled",
      category: e.category_id ? "Event" : "Event",
