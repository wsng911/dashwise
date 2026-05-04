"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfig } from "@/context/ConfigContext";
import config from "@/lib/config";
import { faCalendar, faClock, faLocationDot, faRefresh, faTemperature0, faThermometer, faWindowRestore } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import LocationSelectFormComponent from "@/components/settings/LocationSelectForm";
import { writeToConfig } from "@/lib/frontend/data/MUTATE/config/writeToConfig";
import useAuth from "@/context/useAuth";
import { getJobsPullIcons } from "@/lib/apiClient";

type TimeFormatValue = "24-hour" | "12-hour";

function normalizeTimeFormat(value: unknown): TimeFormatValue {
  if (value === "12-hour" || value === "12h" || value === 12 || value === "12") {
    return "12-hour";
  }
  return "24-hour";
}

const DATE_FORMAT_OPTIONS = [
  "DD-MM-YYYY",
  "MM-DD-YYYY",
  "YYYY-MM-DD",
  "ddd DD-MM-YYYY",
] as const;

export default function General设置Page() {
  const [isRefreshingIcons, setIsRefreshingIcons] = useState(false);

  async function handleRefreshIcons() {
    if (isRefreshingIcons) return;

    try {
      setIsRefreshingIcons(true);
      await getJobsPullIcons();
    } catch (error) {
      console.error("Failed to refresh icons", error);
    } finally {
      setIsRefreshingIcons(false);
    }
  }

  return <> <h1 class名称="text-3xl font-semibold mb-4">General</h1>

    <div class名称="space-y-2">
      <h2 class名称="text-xl font-semibold">App Info</h2>
      <div class名称="content space-y-2 frosted rounded-md p-2 flex flex-col">
        <div class名称="flex items-center justify-center gap-5"> <img src="/dashwise-icon.png" class名称="h-14" /> <span><span class名称="font-semibold text-center text-2xl">dashwise</span> <br /> Version {config.version}</span></div>
        <ul class名称="col-span-full flex gap-2 justify-center my-2">
          <li class名称="frosted rounded-md px-2 py-1 font-medium min-w-40 text-center"><a href="https://github.com/andreasmolnardev/dashwise-next" class名称="hover:text-(--primary)">GitHub Repo</a></li>
          <li class名称="frosted rounded-md px-2 py-1 font-medium min-w-40 text-center"><a href="https://github.com/andreasmolnardev/dashwise-next/issues" class名称="hover:text-(--primary)">GitHub Issues</a></li>
        </ul>
      </div>
      <h2 class名称="text-xl font-semibold">External data</h2>
      <div
        class名称="content space-y-2 rounded-md p-2 flex items-center gap-2 group cursor-pointer"
        onClick={handleRefreshIcons}
      >
        <FontAwesomeIcon icon={faRefresh} class名称="p-0 m-0 group-hover:text-(--primary)"/>
        {isRefreshingIcons ? "Refreshing icons..." : "Refresh icons"}
      </div>
      <h2 class名称="text-xl font-semibold">Defaults</h2>
      <h3 class名称="text-lg font-medium">Links</h3>
      <div
        class名称={
          "flex border border-transparent items-center col-span-full p-1.5 rounded-md gap-2"
        }
      >
        <FontAwesomeIcon icon={faWindowRestore} />
        <p class名称="w-full font-medium">Open Behaviour</p>

        <div class名称="flex items-center gap-2">
          <LinkOpeningBehaviourSelect />
        </div>
      </div>
      <h3 class名称="text-lg font-medium">Weather</h3>
      <div
        class名称={
          "flex border border-transparent items-center col-span-full p-1.5 rounded-md gap-2"
        }
      >
        <FontAwesomeIcon icon={faTemperature0} />
        <p class名称="w-full font-medium">Temperature Unit</p>

        <div class名称="flex items-center gap-2 px-12">
          <WeatherUnitSelector />
        </div>
      </div>
      <div
        class名称={
          "flex border border-transparent items-center col-span-full p-1.5 rounded-md gap-2"
        }
      >
        <FontAwesomeIcon icon={faLocationDot} />
        <p class名称="w-full font-medium">Location</p>

        <div class名称="flex items-center gap-2 px-2">
          <WeatherLocationSelector />
        </div>
      </div>

      <h3 class名称="text-lg font-medium">Localization</h3>
      <Localization设置 />
    </div>
  </>;
}

function Localization设置() {
  const { config, patchConfig } = useConfig();
  const { token } = useAuth();

  const globalConfig = config?.global ?? {};
  const timeFormat = normalizeTimeFormat(globalConfig?.timeFormat ?? globalConfig?.["time-format"]);
  const dateFormat = globalConfig?.dateFormat ?? "DD-MM-YYYY";

  async function updateGlobal(patch: Record<string, any>) {
    const nextGlobal = { ...globalConfig, ...patch };
    patchConfig((prev) => ({
      ...prev,
      global: nextGlobal,
    }));
    await writeToConfig("global", nextGlobal, { token });
  }

  return (
    <>
      <div class名称="flex border border-transparent items-center col-span-full p-1.5 rounded-md gap-2">
        <FontAwesomeIcon icon={faClock} />
        <p class名称="w-full font-medium">Time format</p>

        <Select
          value={timeFormat}
          onValueChange={(value) => {
            const next = value as TimeFormatValue;
            const legacy = next === "12-hour" ? "12h" : "24h";
            updateGlobal({ timeFormat: next, "time-format": legacy });
          }}
        >
          <SelectTrigger class名称="w-44 frosted">
            <SelectValue placeholder="Select time format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24-hour">24-hour</SelectItem>
            <SelectItem value="12-hour">12-hour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class名称="flex border border-transparent items-center col-span-full p-1.5 rounded-md gap-2">
        <FontAwesomeIcon icon={faCalendar} />
        <p class名称="w-full font-medium">Date format</p>

        <Select
          value={dateFormat}
          onValueChange={(value) => updateGlobal({ dateFormat: value })}
        >
          <SelectTrigger class名称="w-52 frosted">
            <SelectValue placeholder="Select date format" />
          </SelectTrigger>
          <SelectContent>
            {DATE_FORMAT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function WeatherUnitSelector() {
  const { config, patchConfig } = useConfig();
  const { token } = useAuth();
  const value = config?.global?.weatherUnit ?? "c";

  async function handleChange(unit: "c" | "f") {
    const nextGlobal = { ...(config?.global || {}), weatherUnit: unit };
    patchConfig((prev) => ({
      ...prev,
      global: nextGlobal,
    }));

    await writeToConfig("global", nextGlobal, {
      token,
      dispatchEvent: true
    });
  }

  return (
    <div class名称="flex gap-2 frosted rounded-full text-(--text-on-frosted) px-2 py-1">
      <button
        onClick={() => handleChange("c")}
        class名称={`
        rounded-full px-2 py-1
        ${value === "c" ? "bg-white/20" : ""}
      `}
      >
        °C
      </button>

      <button
        onClick={() => handleChange("f")}
        class名称={`
        rounded-full px-2 py-1
        ${value === "f" ? "bg-white/20" : ""}
      `}
      >
        °F
      </button>
    </div>
  );
};


function WeatherLocationSelector() {
  const { config, patchConfig } = useConfig();
  const { token } = useAuth();
  const [open, setOpen] = useState(false);

  // derive current global location (if any)
  const currentGlobal = useMemo(() => {
    const raw = config?.global?.weatherLocation;
    if (!raw) return { display名称: "", coordinates: "" };
    try {
      const parsed = JSON.parse(raw);
      return { display名称: parsed.name ?? "", coordinates: `${parsed.lat}, ${parsed.lon}` };
    } catch {
      // fallback if stored with single quotes or other oddities
      try {
        const parsed = JSON.parse(raw.replaceAll("'", '"'));
        return { display名称: parsed.name ?? "", coordinates: `${parsed.lat}, ${parsed.lon}` };
      } catch {
        return { display名称: "", coordinates: "" };
      }
    }
  }, [config?.global?.weatherLocation]);

  const [value, setValue] = useState<{ display名称: string; coordinates: string }>(currentGlobal);

  // keep local state in sync if global changes externally
  useEffect(() => setValue(currentGlobal), [currentGlobal]);

  async function handle保存() {
    // prepare a stable object to store in config.global.weatherLocation
    const coords = (value.coordinates || "").split(",").map((s) => s.trim());
    const lat = coords[0] ?? "";
    const lon = coords[1] ?? "";

    const updatedGlobal = {
      ...(config?.global || {}),
      // store as JSON string
      weatherLocation: JSON.stringify({ name: value.display名称 || "", lat, lon }),
    };

    try {
      patchConfig((prev) => ({
        ...prev,
        global: updatedGlobal,
      }));
      await writeToConfig("global", updatedGlobal, { token });
      setOpen(false);
    } catch (err) {
      console.error("Failed to update weatherLocation", err);
    }
  }

  return (
    <>

      <Dialog open={open} onOpenChange={(v) => setOpen(Boolean(v))}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)} variant="outline" class名称="rounded-full">编辑 weather location</Button>
        </DialogTrigger>
        <DialogContent class名称="max-h-[80vh] overflow-auto frosted text-foreground">
          <DialogHeader>
            <DialogTitle>Set global weather location</DialogTitle>
          </DialogHeader>

          <div class名称="py-4">
            <LocationSelectFormComponent value={value} onChange={setValue} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handle保存}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LinkOpeningBehaviourSelect() {
  const { config, patchConfig } = useConfig();
  const { token } = useAuth();
  const value = config?.global?.linkOpenBehaviour ?? "sametab";

  async function handleChange(setting: "newtab" | "sametab") {
    const nextGlobal = {
      ...(config?.global || {}),
      linkOpenBehaviour: setting,
    };

    patchConfig((prev) => ({
      ...prev,
      global: nextGlobal,
    }));

    await writeToConfig("global", nextGlobal, { token })
  }

  return (
    <div class名称="flex gap-2 frosted rounded-full text-(--text-on-frosted) px-2 py-1">
      <button
        onClick={() => handleChange("sametab")}
        class名称={`
        rounded-full px-2 py-1 whitespace-nowrap
        ${value === "sametab" ? "bg-white/20" : ""}
      `}
      >
        Same Tab
      </button>

      <button
        onClick={() => handleChange("newtab")}
        class名称={`
        rounded-full px-2 py-1 whitespace-nowrap
        ${value === "newtab" ? "bg-white/20" : ""}
      `}
      >
        New Tab
      </button>
    </div>
  );

}