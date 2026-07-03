export const id = "mpk";
export const title = "Public Transport";
export const icon = "🚋";

export async function getSummary(city) {
  return {
    headline: "Check live status",
    subline: "Tap for departures & alerts",
  };
}

export async function getDetails(city) {
  const body = "<div style='display:flex;flex-direction:column;gap:12px;'>"
    + "<p style='color:var(--text-secondary);font-size:0.9rem;'>Live transport info for Wroclaw:</p>"

    + "<a href='https://jakdojade.pl/wroclaw' target='_blank' rel='noopener'"
    + " style='display:block;padding:14px 20px;background:var(--accent);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:0.95rem;text-align:center;'>"
    + "🚋 jakdojade.pl — Live Departures</a>"

    + "<a href='https://mpk.wroc.pl' target='_blank' rel='noopener'"
    + " style='display:block;padding:14px 20px;border:1px solid var(--border);border-radius:12px;text-decoration:none;font-weight:600;font-size:0.95rem;text-align:center;color:var(--text-primary);'>"
    + "📢 mpk.wroc.pl — Disruption Alerts</a>"

    + "<a href='https://www.facebook.com/mpkwroc' target='_blank' rel='noopener'"
    + " style='display:block;padding:14px 20px;border:1px solid var(--border);border-radius:12px;text-decoration:none;font-weight:600;font-size:0.95rem;text-align:center;color:var(--text-primary);'>"
    + "📘 MPK Facebook — Real-time Updates</a>"

    + "</div>";

  return { body: body };
}
