// modules/mpk/mpk.js
export const id = "mpk";
export const title = "Public Transport";
export const icon = "🚋";

export async function getSummary(city) {
  return {
    headline: "Check live status",
    subline: "Tap for current disruptions",
  };
}

export async function getDetails(city) {
  const body = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <p style="color:var(--text-secondary);">
        MPK Wrocław does not provide a public API. Tap below for live info directly from the source.
      </p>
      <a href="https://mpk.wroc.pl/strefa-pasazera/komunikaty" target="_blank" rel="noopener"
         style="display:block;padding:14px 20px;background:var(--accent);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:0.95rem;text-align:center;">
        🚋 Live MPK Disruptions
      </a>
      <a href="https://www.wroclaw.pl/rozklady-jazdy" target="_blank" rel="noopener"
         style="display:block;padding:14px 20px;border:1px solid var(--border);border-radius:12px;text-decoration:none;font-weight:600;font-size:0.95rem;text-align:center;color:var(--text-primary);">
        🗺 Timetables & Routes
      </a>
    </div>
  `;
  return { body };
}
