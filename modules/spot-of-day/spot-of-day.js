export const id = "spot-of-day";
export const title = "Spot of the Day";
export const icon = "⭐";

async function fetchSpots(city) {
  const res = await fetch("/modules/spot-of-day/spot-of-day.mock.json");
  const data = await res.json();
  return data[city.id] || [];
}

function getPeriod() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  return "evening";
}

function getSeason() {
  const m = new Date().getMonth();
  return (m >= 4 && m <= 8) ? "summer" : "winter";
}

function isWeekend() {
  const d = new Date().getDay();
  return d === 5 || d === 6 || d === 0;
}

function scoreSpot(spot, period, season, isRaining, weekend) {
  var score = 0;
  if (isRaining && spot.indoor) score += 10;
  if (isRaining && !spot.indoor) score -= 10;
  if (spot.season === season) score += 4;
  if (spot.season === "any") score += 2;
  if (spot.bestPeriod === period) score += 5;
  if (spot.bestPeriod.indexOf(period) !== -1) score += 3;
  if (weekend && (spot.vibe === "social" || spot.vibe === "fun")) score += 3;
  if (!weekend && (spot.vibe === "relaxed" || spot.vibe === "cultural")) score += 2;
  score += Math.floor(Math.random() * 3);
  return score;
}

function makeReason(spot, period, isRaining, weekend) {
  if (isRaining && spot.indoor) return "Perfect pick for a rainy day indoors";
  if (period === "morning") return "Great way to start the day";
  if (period === "afternoon" && !isRaining) return "Perfect for a sunny afternoon";
  if (period === "evening" && weekend) return "Top pick for tonight";
  if (period === "evening") return "Great evening choice";
  if (spot.vibe === "romantic") return "A special place worth visiting";
  if (spot.vibe === "scenic") return "Stunning views await";
  return "Worth a visit today";
}

export async function getSummary(city) {
  const spots = await fetchSpots(city);
  if (!spots.length) return { headline: "No spots yet", subline: "Check back soon" };

  const period = getPeriod();
  const season = getSeason();
  const weekend = isWeekend();
  const isRaining = false;

  var scored = spots.map(function(s) {
    return { spot: s, score: scoreSpot(s, period, season, isRaining, weekend) };
  });
  scored.sort(function(a, b) { return b.score - a.score; });

  const spot = scored[0].spot;
  const reason = makeReason(spot, period, isRaining, weekend);

  return {
    headline: spot.name,
    subline: reason,
    tagline: spot.category + " · " + spot.vibe,
  };
}

export async function getDetails(city) {
  const spots = await fetchSpots(city);
  if (!spots.length) return { body: "<p>No spots available.</p>" };

  const period = getPeriod();
  const season = getSeason();
  const weekend = isWeekend();
  const isRaining = false;

  var scored = spots.map(function(s) {
    return { spot: s, score: scoreSpot(s, period, season, isRaining, weekend) };
  });
  scored.sort(function(a, b) { return b.score - a.score; });

  const spot = scored[0].spot;
  const reason = makeReason(spot, period, isRaining, weekend);

  const body = "<div style='display:flex;flex-direction:column;gap:16px;'>"
    + "<div>"
    + "<p style='font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--accent);margin-bottom:6px;'>" + spot.category + "</p>"
    + "<p style='font-size:1rem;color:var(--text-secondary);'>" + spot.tagline + "</p>"
    + "</div>"
    + "<div style='background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;'>"
    + "<p style='font-size:0.8rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;'>Why now</p>"
    + "<p style='font-size:0.95rem;color:var(--text-primary);'>💡 " + reason + "</p>"
    + "</div>"
    + "<div style='background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:14px;'>"
    + "<p style='font-size:0.8rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;'>Local tip</p>"
    + "<p style='font-size:0.95rem;color:var(--text-primary);'>" + spot.tip + "</p>"
    + "</div>"
    + "<a href='" + spot.mapsUrl + "' target='_blank' rel='noopener'"
    + " style='display:block;padding:12px 20px;background:var(--accent);color:#fff;border-radius:12px;text-decoration:none;font-weight:600;font-size:0.9rem;text-align:center;'>"
    + "📍 Open in Maps</a>"
    + "</div>";

  return { body: body };
}
