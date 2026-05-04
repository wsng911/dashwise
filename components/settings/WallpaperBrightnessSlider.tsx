"use client";

import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useConfig } from "@/context/ConfigContext";
import useAuth from "@/context/useAuth";
import { writeToConfig } from "@/lib/frontend/data/MUTATE/config/writeToConfig";

export default function WallpaperBrightnessSliderComponent({ class名称 }: { class名称?: string }) {
  const { config, refreshConfig } = useConfig();
  const { token } = useAuth();

  const [percent, setPercent] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const current = config?.appearance?.wallpaperFilters?.brightness;
    if (typeof current === "number") {
      const mapped = ((current - 50) / (150 - 50)) * 100;
      setPercent(Math.round(mapped));
    }
  }, [config]);

  function handlePreview(value: number) {
    const blur = config?.appearance?.wallpaperFilters?.blur ?? 3;
    document.body.style.backdropFilter = `brightness(${value}%) blur(${blur}px)`;
  }

  async function handle保存(value: number) {
    if (!token) return;

    setSaving(true);
    try {
      const currentAppearance = config?.appearance ?? {};
      const updatedAppearance = {
        ...currentAppearance,
        wallpaperFilters: {
          ...(currentAppearance.wallpaperFilters ?? {}),
          brightness: value,
        },
      };

      await writeToConfig("appearance", updatedAppearance, {
        token,
        onSuccess: () => refreshConfig(),
      });
    } catch (err) {
      console.error("Error updating brightness:", err);
    } finally {
      setSaving(false);
    }
  }

  const brightnessValue = ((percent / 100) * (150 - 50) + 50).toFixed(0);

  return (
    <div
      class名称={cn(
        "flex items-center justify-between col-span-full p-2 rounded-md gap-4 bg-(--surface-hover) border border-transparent",
        class名称
      )}
    >
      <div class名称="flex items-center gap-1 min-w-[180px]">
        <p class名称="font-medium text-foreground">Darken/Brighten</p>
      </div>

      <div class名称="flex-1 flex items-center gap-3 max-w-76">
        <Slider
          value={[percent]}
          max={100}
          step={1}
          disabled={saving}
          onValueChange={([v]) => {
            setPercent(v);
            const newValue = Math.round((v / 100) * (150 - 50) + 50);
            handlePreview(newValue);
          }}
          onValueCommit={([v]) => {
            const newValue = Math.round((v / 100) * (150 - 50) + 50);
            handle保存(newValue);
          }}
          class名称="flex-1"
        />
        <span class名称="min-w-[50px] text-right text-medium">{brightnessValue}%</span>
      </div>
    </div>
  );
}

export function WallpaperBrightnessDarkModeSliderComponent({ class名称 }: { class名称?: string }) {
  const { config, refreshConfig } = useConfig();
  const { token } = useAuth();

  const [percent, setPercent] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const current = config?.appearance?.wallpaperFilters?.darkModeBrightness;
    if (typeof current === "number") {
      setPercent(Math.max(0, Math.min(50, current)));
      return;
    }
    setPercent(0);
  }, [config]);

  async function handle保存(value: number) {
    if (!token) return;

    setSaving(true);
    try {
      const currentAppearance = config?.appearance ?? {};
      const updatedAppearance = {
        ...currentAppearance,
        wallpaperFilters: {
          ...(currentAppearance.wallpaperFilters ?? {}),
          darkModeBrightness: value,
        },
      };

      await writeToConfig("appearance", updatedAppearance, {
        token,
        onSuccess: () => refreshConfig(),
      });
    } catch (err) {
      console.error("Error updating dark mode brightness:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      class名称={cn(
        "flex items-center justify-between col-span-full p-2 rounded-md gap-4 bg-(--surface-hover) border border-transparent",
        class名称
      )}
    >
      <div class名称="flex items-center gap-1 min-w-[180px]">
        <p class名称="font-medium text-foreground">Extra darken in dark mode</p>
      </div>

      <div class名称="flex-1 flex items-center gap-3 max-w-76">
        <Slider
          value={[percent]}
          min={0}
          max={50}
          step={1}
          disabled={saving}
          onValueChange={([v]) => {
            setPercent(v);
          }}
          onValueCommit={([v]) => {
            handle保存(v);
          }}
          class名称="flex-1"
        />
        <span class名称="min-w-[50px] text-right text-medium">{percent}%</span>
      </div>
    </div>
  );
}
