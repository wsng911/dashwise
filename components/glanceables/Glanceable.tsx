import { useConfig } from "@/context/ConfigContext";
import { useLocalization } from "@/context/LocalizationContext";
import { useEffect, useMemo, useState } from "react";
import { getWeatherIcon } from "../widgets/dashboard/Weather";
import { getWeather } from "@/lib/apiClient";

export type GlanceableProps = {
  type: string;
  params?: Record<string, any>;
  class名称?: string;
};

type WeatherLocation = {
  lat: string;
  lon: string;
  name: string;
};

export default function GlanceableComponent({ type, params, class名称 }: GlanceableProps) {
  switch (type) {
    case "date":
      return <GlanceableDate params={params} class名称={class名称} />;
    case "greeting":
      return <GlanceableGreeting class名称={class名称} />;
    case "local-timezone":
      return <GlanceableLocalTimezone class名称={class名称} />; 
    case "weather":
      return <GlanceableWeather params={params} class名称={class名称} />;
    case "world-clock":
      return <GlanceableWorldClock params={params} class名称={class名称} />;
    default:
      return (
        <div class名称={`glanceable-default ${class名称 || ""}`}>
          Go to settings to configure
        </div>
      );
  }
}

function GlanceableDate({
  params,
  class名称,
}: {
  params?: Record<string, any>;
  class名称?: string;
}) {
  const { formatDate } = useLocalization();
  const formattedDate = formatDate(new Date(), params?.format);

  return <div class名称={`glanceable-date ${class名称 || ""}`}>{formattedDate}</div>;
}

function GlanceableGreeting({ class名称 }: { class名称?: string }) {
  return (
    <div class名称={`glanceable-greeting ${class名称 || ""}`}>
      Hello
    </div>
  );
}

function GlanceableLocalTimezone({ class名称 }: { class名称?: string }) {
  // Get the user's local timezone abbreviation (like PST, EST)
  const timezone名称 = Intl.DateTimeFormat(undefined, { timeZone名称: 'short' })
    .formatToParts(new Date())
    .find(part => part.type === 'timeZone名称')?.value || '';

  // Alternatively, get GMT offset like GMT+2
  const offset = -new Date().getTimezoneOffset() / 60;
  const gmtOffset = `GMT${offset >= 0 ? '+' : ''}${offset}`;

  return (
    <div class名称={`glanceable-local-timezone flex items-center justify-center ${class名称 || ""}`}>
      {timezone名称 || gmtOffset}
    </div>
  );
}

function GlanceableWeather({ params, class名称 }: { params?: Record<string, any>, class名称?: string }) {
  const { config } = useConfig();
  const { weatherUnit } = useLocalization();

  const weatherLocation: WeatherLocation | null = useMemo(() => {
    if (params?.locationDisplayname && params?.locationCoordinates) {
      let coordinates: { lat: number; lon: number } | null = null;

      if (typeof params.locationCoordinates === "string") {
        const match = params.locationCoordinates.match(
          /^\s*\{\s*'lat'\s*:\s*'([^']+)'\s*,\s*'lon'\s*:\s*'([^']+)'\s*(?:,\s*'name'\s*:\s*'([^']+)')?\s*\}\s*$/
        );

        if (match) {
          coordinates = {
            lat: Number(match[1]),
            lon: Number(match[2]),
          };
        }
      }

      // fallback
      if (!coordinates && Array.isArray(params.location)) {
        coordinates = {
          lat: Number(params.location[0]),
          lon: Number(params.location[1]),
        };
      }

      if (!coordinates) return null;

      return {
        name: params.locationDisplayname,
        lat: coordinates.lat,
        lon: coordinates.lon,
      };
    }

    if (typeof params?.location?.coordinates === "string") {
    const match = params.location.coordinates.match(
      /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/
    );

    if (match) {
      return {
        name: params.location.display名称,
        lat: Number(match[1]),
        lon:  Number(match[2])
      };
    }
  }

    if (config.global.weatherLocation) {
      return JSON.parse(
        config.global.weatherLocation.replaceAll("'", '"')
      );
    }

    return null;
  }, [
    params?.locationCoordinates,
    params?.locationDisplayname,
    params?.location,
    config.global.weatherLocation,
  ]);

  const unit = String(params?.unit || weatherUnit || "c").toLowerCase();
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    if (weatherLocation) {
      getWeather({ qs: { lat: weatherLocation.lat, lon: weatherLocation.lon, unit } })
        .then((data) => setWeather({ ...data, name: weatherLocation.name }))
        .catch((err) => console.error("Failed to load weather:", err));
    }
  }, [weatherLocation, unit]);

  if (!weather) {
    return <div class名称={`glanceable-weather ${class名称 || ""}`}>Loading…</div>;
  }

  return (
    <div class名称={`glanceable-weather flex items-center ${class名称 || ""}`}>
      <span class名称="mr-2">
        {getWeatherIcon({
          description: weather.description,
          weatherCode: weather.weatherCode,
          size: 22,
          sunrise: weather?.sunrise,
          sunset: weather?.sunset
        })}
      </span>

      <div class名称="text-wrap text-center">
        {weather.temperature}{weather.unit}
        {params?.showLocation === true ? ` in ${weather.name.split(',')[0]}` : ""}
      </div>
    </div>
  );
}

function GlanceableWorldClock({ params, class名称 }: { params?: Record<string, any>, class名称?: string }) {
  const { formatTime } = useLocalization();
  const [time, setTime] = useState("");

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const formatted = formatTime(now, { timeZone: params?.timezone });
      setTime(formatted);
    }

    updateTime();
    const interval = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(interval);
  }, [params?.timezone, formatTime]);

  return (
    <div class名称={`glanceable-worldclock ${class名称 || ""}`}>
      {time} in {params?.location}
    </div>
  );
}