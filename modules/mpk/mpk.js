// modules/mpk/mpk.js
// Answers one question: "Is transport running normally?"

export const id = "mpk";
export const title = "Public Transport";
export const icon = "🚋";

async function fetchTransport(city) {
  const res = await fetch("/modules/mpk/mpk.mock.json");
  const data = await res.json();
  return data[city.id] ?? null;
}

function statusIcon(status) {
  if (status === "ok")         return "✅";
  if (status === "disruption") return "⚠️";
  if (status === "critical")   return "🚨";
  return "ℹ️";
}

export async function getSummary(city) {
  const transport = await fetchTransport(city);

  if (!transport) return { headline: "No data", subline: "Status unavailable" };

  if (transport.status === "ok") {
    return {
      headline: "Running normally",
      subline: "No delays reported",
      tagline: "All lines on schedule ✅",
    };
  }

  return {
    headline: `${statusIcon(transport.status)} ${transport.alerts.length} alert${transport.alerts.length > 1 ? "s" : ""}`,
    subline: transport.summary,
  };
}

export async function getDetails(city) {
  const transport = await fetchTransport(city);

  if (!transport) return { body: "<p>Transport data unavailable for this city.</p>" };

  if (transport.status === "ok") {
    return { body: `<p style="font-size:1.1rem;font-weight:600;color:var(--text-primary);">✅ All lines running normally</p><p style="margin-top:8px;">No delays or disruptions reported.</p>` };
  }

  const severityColor = { low: "var(--text-secondary)", medium: "#f0a500", high: "#e05252" };

  const alertRows = transport.alerts.map(alert => `
    <div style="padding:14px 0;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px;">
      <p style="font-weight:600;color:var(--text-primary);">
        ${alert.type} line ${alert.line}
        <span style="font-size:0.7rem;font-weight:700;color:${severityColor[alert.severity] ?? "var(--text-secondary)"};margin-left:8px;text-transform:uppercase;">${alert.severity}</span>
      </p>
      <p style="font-size:0.85rem;">${alert.message}</p>
    </div>
  `).join("");

  const tipHtml = transport.tip
    ? `<p style="margin-top:16px;font-size:0.85rem;color:var(--accent);">💡 ${transport.tip}</p>`
    : "";

  return { body: `<div>${alertRows}${tipHtml}</div>` };
}
