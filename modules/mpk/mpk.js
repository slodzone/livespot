export const id = "mpk";
export const title = "Public Transport";
export const icon = "🚋";

export async function getSummary(city) {
  return {
    headline: "Check live status",
    subline: "Tap for departures & delays",
  };
}

export async function getDetails(city) {
  const body = "<div style='display:flex;flex-direction:column;gap:12px;'>"
    + "<p style='color:var(--text-secondary);font-size:0.9rem;'>Real-time departures and disruptions:</p>"

    + "<a href='https://jakdojade.pl/wroclaw' target='_blank' rel='noopener'"
    + " style='display:block;padding:14px 20px;background:var(--accent);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:0.95rem;text-align:center;'>"
    + "🚋 jakdojade.pl — Live Departures</a>"

    + "<a href='https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=Wroclaw' target='_blank' rel='noopener'"
    + " style='display:block;padding:14px 20px;border:1px solid var(--border);border-radius:12px;text-decoration:none;font-weight:600;font-size:0.95rem;text-align:center;color:var(--text-primary);'>"
    + "🗺 Google Maps Transit</a>"

    + "</div>";

  return { body: body };
}
