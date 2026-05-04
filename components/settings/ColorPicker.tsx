"use client";

import * as React from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  class名称?: string;
}

export function ColorPicker({ value, onValueChange, class名称 }: ColorPickerProps) {
  return (
    <div class名称={class名称}>
      {/* main picker */}
      <HexColorPicker color={value} onChange={onValueChange} class名称="!w-full !h-40 rounded-md" />

      {/* color input row */}
      <div class名称="flex items-center gap-2 mt-2">
        <HexColorInput
          color={value}
          onChange={onValueChange}
          prefixed
          class名称="flex-1 rounded-md border frosted px-2 py-1 text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => onValueChange("#6b21a8")}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
