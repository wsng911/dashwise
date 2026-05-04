"use client";

import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { useConfig } from "@/context/ConfigContext";
import { writeToConfig } from "@/lib/frontend/data/MUTATE/config/writeToConfig";
import useAuth from "@/context/useAuth";

export default function WallpaperBlurSliderComponent({ class名称 }: { class名称?: string }) {
  const { config, refreshConfig } = useConfig();
  const { token } = useAuth();
  
  const [percent, setPercent] = useState(50); // slider percentage
  const [previewBlur, setPreviewBlur] = useState(3); // px
  const [saving, setSaving] = useState(false);

  // Load current blur from config on mount
  useEffect(() => {
    const current = config?.appearance?.wallpaperFilters?.blur;
    if (typeof current === "number") {
      const newPercent = ((current - 1) / (25 - 1)) * 100;
      setPercent(Math.round(newPercent));
      setPreviewBlur(current);
    }
  }, [config]);

  // Preview on drag
  function handlePreview(pxValue: number) {
    setPreviewBlur(pxValue);
    document.body.style.backdropFilter = `blur(${pxValue}px) brightness(${config?.appearance?.wallpaperFilters?.brightness ? 0.01 * config?.appearance?.wallpaperFilters?.brightness : 85})`;
  }

  // 保存 on release
  async function handle保存(pxValue: number) {
    if (!token) return;

    setSaving(true);
    try {
      const currentAppearance = config?.appearance ?? {};
      const updatedAppearance = {
        ...currentAppearance,
        wallpaperFilters: {
          ...(currentAppearance.wallpaperFilters ?? {}),
          blur: pxValue,
        },
      };

      await writeToConfig(`appearance`, updatedAppearance, {
        token,
        onSuccess: () => refreshConfig(),
      });
    } catch (err) {
      console.error("Error updating blur:", err);
    } finally {
      setSaving(false);
    }
  }

  const blurPx = ((percent / 100) * (25 - 1) + 1).toFixed(1);

  return (
    <div
      class名称={
        class名称 ??
        "flex items-center justify-between col-span-full p-2 rounded-md gap-4 bg-(--surface-hover) border border-transparent"
      }
    >
      {/* Label + tooltip */}
      <div class名称="flex items-center gap-1 min-w-[180px]">
        <p class名称="font-medium text-foreground">Blur</p>
      </div>

      {/* Slider */}
      <div class名称="flex-1 flex items-center gap-3 max-w-76">
        <Slider
          value={[percent]}
          max={100}
          step={1}
          disabled={saving}
          onValueChange={([v]) => {
            setPercent(v);
            const newValue = Math.round((v / 100) * (25 - 1) + 1);
            handlePreview(newValue);
          }}

          onValueCommit={([v]) => {
            const newValue = Math.round((v / 100) * (25 - 1) + 1);
            handle保存(newValue);
          }}
          class名称="flex-1"
        />
        {/* Percentage + px */}
        <span class名称="min-w-[50px] text-right text-medium">
          {blurPx}px
        </span>
      </div>
    </div>
  );
}
