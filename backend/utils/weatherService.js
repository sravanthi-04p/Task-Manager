const axios = require('axios');

// Fetches live weather for a given city via OpenWeatherMap.
// Returns null (instead of throwing) if the API key is missing or the request fails,
// so a bad/missing key never breaks task creation.
const getWeatherByCity = async (city) => {
  if (!city) return null;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  OPENWEATHER_API_KEY not set - skipping weather lookup.');
    return null;
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: apiKey, units: 'metric' },
      timeout: 5000,
    });

    const { data } = response;
    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0]?.description,
      icon: data.weather[0]?.icon,
      cityName: data.name,
    };
  } catch (error) {
    console.error(`Failed to fetch weather for "${city}":`, error.message);
    return null;
  }
};

module.exports = { getWeatherByCity };
