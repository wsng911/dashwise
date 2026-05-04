"use client";

import React, { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabItem = {
  value: string;
  label: string;
};

type TabSwitcherProps = {
  value: string;
  onValueChange: (value: string) => void;
  items?: TabItem[];
  children?: ReactNode;
  class名称?: string;
  listClass名称?: string;
};

/**
 * Reusable Tab Switcher component with animation
 * Similar to the glanceables left/right switcher
 * Supports both items array and children for flexibility
 */
export default function TabSwitcher({
  value,
  onValueChange,
  items,
  children,
  class名称 = "",
  listClass名称 = "",
}: TabSwitcherProps) {
  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      class名称={`w-full flex items-center ${class名称}`}
    >
      <TabsList class名称={`frosted rounded-full gap-2 text-white/20 ${listClass名称}`}>
        {items ? (
          items.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              class名称="data-[state=active]:bg-white/20 rounded-full transition-all duration-300 ease-out"
            >
              <span class名称="text-foreground">{item.label}</span>
            </TabsTrigger>
          ))
        ) : (
          children
        )}
      </TabsList>
    </Tabs>
  );
}
