"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { faImage, faPaperclip, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UploadWallpaperDialogComponent from "@/components/settings/UploadWallpaperDialog";
import UrlWallpaperDialogComponent from "@/components/settings/UrlWallpaperDialog";
import ThemeSelectComponent from "@/components/settings/ThemeSelect";
import WallpaperBlurSliderComponent from "@/components/settings/WallpaperBlurSlider";
import ClockFontSelectionCarousel from "@/components/settings/ClockFontSelectionCarousel";
import WallpaperBrightnessSliderComponent, { WallpaperBrightnessDarkModeSliderComponent } from "@/components/settings/WallpaperBrightnessSlider";

export default function Appearance设置Page() {
  const [value, setValue] = useState("current");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);

  return (
    <>
      <h1 class名称="text-3xl font-semibold mb-4">Appearance</h1>

      <div class名称="content space-y-2">
        <h2 class名称="text-xl font-bold">Wallpaper</h2>
        <RadioGroup
          value={value}
          onValueChange={(v) => {
            setValue(v);
            if (v === "upload") setUploadDialogOpen(true);
            if (v === "add-url") setUrlDialogOpen(true);
          }}
          class名称="grid gap-4 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] px-2"
        >
          <div>
            <RadioGroupItem id="r1" value="current" class名称="peer sr-only" />
            <Label
              htmlFor="r1"
              class名称="group flex flex-col items-center justify-center rounded-xl outline outline-transparent outline-offset-2 p-3 text-center cursor-pointer frosted text-xl
                 peer-data-[state=checked]:outline-(--primary)
                 peer-focus-visible:outline peer-focus-visible:outline-(--primary) h-22"
            >
              <FontAwesomeIcon class名称="group-hover:text-(--primary) transition-colors" icon={faImage} />
              <span class名称="text-lg">Current</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem id="r2" value="upload" class名称="peer sr-only" />
            <Label
              htmlFor="r2"
              class名称="group flex flex-col items-center justify-center rounded-xl outline outline-transparent p-3 text-center cursor-pointer frosted text-xl
                 peer-data-[state=checked]:outline-(--primary)
                 peer-focus-visible:outline peer-focus-visible:outline-(--primary) h-22"
            >
              <FontAwesomeIcon class名称="group-hover:text-(--primary) transition-colors" icon={faUpload} />
              <span class名称="text-lg">Upload</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem id="r3" value="add-url" class名称="peer sr-only" />
            <Label
              htmlFor="r3"
              class名称="group flex flex-col items-center justify-center rounded-xl outline outline-transparent p-3 text-center cursor-pointer frosted text-xl
                 peer-data-[state=checked]:outline-(--primary)
                 peer-focus-visible:outline peer-focus-visible:outline-(--primary) h-22"
            >
              <FontAwesomeIcon class名称="group-hover:text-(--primary) transition-colors" icon={faPaperclip} />
              <span class名称="text-lg">添加 from URL</span>
            </Label>
          </div>
        </RadioGroup>

        {/* Upload dialog */}
        <UploadWallpaperDialogComponent
          open={uploadDialogOpen}
          onOpenChange={(o) => {
            setUploadDialogOpen(o);
            if (!o) setValue("current"); // reset selection when dialog closes
          }}
        />

        {/* URL dialog */}
        <UrlWallpaperDialogComponent
          open={urlDialogOpen}
          onOpenChange={(o) => {
            setUrlDialogOpen(o);
            if (!o) setValue("current"); // reset selection when dialog closes
          }}
          configKey="settings/appearance"
        />

        <h3 class名称="text-lg font-medium">Wallpaper Filters</h3>

        <WallpaperBrightnessSliderComponent />
        <WallpaperBrightnessDarkModeSliderComponent />
        <WallpaperBlurSliderComponent />

        <h2 class名称="text-xl font-semibold">Theme</h2>

        {/* Accent color moved to its own component */}
        <ThemeSelectComponent/>

        <h3 class名称="text-lg font-medium">Clock</h3>
        <ClockFontSelectionCarousel/>
      </div>
    </>
  );
}
