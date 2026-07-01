// app/main.js
// Entry point: loads city config and starts the dashboard.

import { renderDashboard } from "/app/dashboard.js";

const ACTIVE_CITY_ID = "wroclaw";

async function init() {
  const res = await fetch("/data/cities.json");
  const cities = await res.json();
  const city = cities[ACTIVE_CITY_ID];

  window.LIVESPOT_CITY = city;
  document.getElementById("cityLabel").textContent = city.name;

  await renderDashboard(city);
}

init();
