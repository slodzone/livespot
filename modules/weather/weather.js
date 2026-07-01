// modules/weather/weather.js
// One job: tell the user whether to go outside or not.
// Uses Open-Meteo (free, no API key). Falls back to mock on failure.

export const id = "weather";
export const title = "Weather";
export const icon = "🌤";

async function fetchWeather(city) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast`
      + `?latitude=${city.lat}&longitude=${city.lon}`
      + `&current=temperature_2m,apparent_temperature,precipitation,windspeed_10m,weathercode`
      + `&wind_speed_unit=kmh&forecast_days=1`;

    const res = await fetch(url);
    const data = await res.json();
    const c = data.current;

    return {
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      rain: c.precipitation > 0,
      windKph: Math.round(c.windspeed_10m),
      code: c.weathercode,
    };
  } catch {
    // API unreachable — use mock
    const res = await fetch("/modules/weather/weather.mock.json");
    const mock = await res.json();
    return mock[city.id] ?? mock.wroclaw;
  }
}

// Single decision based on conditions. Keep it human.
function makeDecision(w) {
  if (w.rain)           return "Take an umbrella ☂️";
  if (w.windKph > 40)   return "Very windy — maybe stay in 🏠";
  if (w.temp < 2)       return "Freezing outside 🧣";
  if (w.temp < 10)      return "Cold but manageable 🧥";
  if (w.temp > 33)      return "Very hot — stay hydrated 💧";
  if (w.temp >= 18 && w.temp <= 26 && !w.rain)
                        return "Great day to go outside 🚶";
  return "Fine to go out 👍";
}

export async function getSummary(city) {
  const w = await fetchWeather(city);
  return {
    headline: `${w.temp}°C`,
    subline: makeDecision(w),
  };
}

export async function getDetails(city) {
  const w = await fetchWeather(city);
  const decision = makeDecision(w);

  const body = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <p style="font-size:1.1rem; font-weight:600; color: var(--text-primary);">${decision}</p>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <p>Temperature: ${w.temp}°C</p>
        <p>Feels like: ${w.feelsLike}°C</p>
        <p>Wind: ${w.windKph} km/h</p>
        <p>Rain: ${w.rain ? "Yes" : "No"}</p>
      </div>
    </div>
  `;

  return { body };
}
