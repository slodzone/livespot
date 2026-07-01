// app/dashboard.js
// Renders tiles from the module registry and handles the detail modal.

import * as weather from "/modules/weather/weather.js";
import * as sunset from "/modules/sunset/sunset.js";
import * as happyhour from "/modules/happyhour/happyhour.js";
import * as events from "/modules/events/events.js";
import * as mpk from "/modules/mpk/mpk.js";
import * as spotOfDay from "/modules/spot-of-day/spot-of-day.js";

// Explicit, simple registry — add a new module here to add a tile.
export const MODULES = [weather, sunset, happyhour, events, mpk, spotOfDay];

const grid = document.getElementById("tileGrid");
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

export async function renderDashboard(city) {
  grid.innerHTML = "";

  for (const mod of MODULES) {
    const summary = await mod.getSummary(city);
    const tile = createTile(mod, summary);
    grid.appendChild(tile);
  }
}

function createTile(mod, summary) {
  const tile = document.createElement("button");
  tile.className = "tile";
  tile.setAttribute("type", "button");
  tile.setAttribute("aria-label", mod.title);

  tile.innerHTML = `
    <span class="tile-icon">${mod.icon}</span>
    <span class="tile-title">${mod.title}</span>
    <span class="tile-headline">${summary.headline}</span>
    <span class="tile-subline">${summary.subline}</span>
    ${summary.tagline ? `<span class="tile-tagline">${summary.tagline}</span>` : ""}
  `;

  tile.addEventListener("click", () => openModal(mod));
  return tile;
}

async function openModal(mod) {
  const details = await mod.getDetails(window.LIVESPOT_CITY);

  modalContent.innerHTML = `
    <h2 class="tile-title">${mod.icon} ${mod.title}</h2>
    <div style="margin-top:12px; color: var(--text-secondary);">${details.body}</div>
  `;

  modalOverlay.classList.add("open");
}

function closeModal() {
  modalOverlay.classList.remove("open");
}

modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
