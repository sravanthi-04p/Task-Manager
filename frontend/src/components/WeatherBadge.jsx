import { CloudSun } from 'lucide-react';

// Small presentational badge - task.weather is populated by DashboardPage
// after it calls GET /api/tasks/weather/:city for tasks that have a location.
const WeatherBadge = ({ weather }) => {
  if (!weather) return null;

  return (
    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-medium text-xs">
      <CloudSun className="w-3.5 h-3.5 text-blue-500" />
      <span>{weather.temp}°C, {weather.description}</span>
    </div>
  );
};

export default WeatherBadge;
