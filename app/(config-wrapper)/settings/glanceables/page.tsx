"use client";
import { useEffect, useState } from "react";
import GlanceableComponent from "@/components/glanceables/Glanceable";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaginatedCarouselViewComponent } from "@/components/widgets/PaginatedCarouselView";
import TabSwitcher from "@/components/common/TabSwitcher";
import { useConfig } from "@/context/ConfigContext";
import { Label } from "@radix-ui/react-label";
import GlanceableProperties设置Component from "@/components/settings/GlanceableProperties设置";

type Glanceable = {
  type: string;
  display名称: string;
  description: string;
  example?: string;
  exampleProps?: Record<string, any>;
  properties?: Record<string, string>;
};


export default function Glanceables设置Page() {
  const { config } = useConfig();
  const [currentTab, setCurrentTab] = useState<"left" | "right">("left");
  const [glanceables, setGlanceables] = useState<Glanceable[]>([]);
  const [selectedGlanceable, setSelectedGlanceable] = useState<string>("current");

  useEffect(() => {
    fetch("/glanceables.json")
      .then((res) => res.json() as Promise<Record<string, Omit<Glanceable, "type">>>)
      .then((data) => {
        const list: Glanceable[] = Object.entries(data).map(([type, value]) => ({
          type,
          ...value,
        } as Glanceable));
        setGlanceables(list);
      });
  }, []);

  const currentGlanceable =
    currentTab === "left" ? config?.glanceables[0] : config?.glanceables[1];

  const selected =
  selectedGlanceable === "current"
    ? { ...currentGlanceable, isCurrent: true }
    : { ...(glanceables.find((g) => g.type === selectedGlanceable) ?? {}) };

  return (
    <>
      <h1 class名称="text-3xl font-semibold mb-4">Glanceables</h1>

      <TabSwitcher
        value={currentTab}
        onValueChange={(val) => setCurrentTab(val as "left" | "right")}
        items={[
          { value: "left", label: "Left one" },
          { value: "right", label: "Right one" },
        ]}
        class名称="pb-2"
      />

      <section class名称="grid grid-cols-[3fr_2fr]">
        <RadioGroup
          value={selectedGlanceable}
          onValueChange={setSelectedGlanceable}
          asChild>
          <PaginatedCarouselViewComponent minCols={2}>
            <Label class名称="grid grid-rows-[2fr_1fr] justify-center items-center gap-1">
              <GlanceableComponent type={currentGlanceable.type} params={currentGlanceable.properties} class名称="frosted px-2 py-0.5 h-8 rounded-full" />
              <RadioGroupItem
                value="current"
                id="glanceables-current"
                class名称="hidden data-[state=checked]:[&+p]:text-(--primary)"
              />
              <p class名称="text-sm text-center">Current</p>
            </Label>
            {glanceables.map((glanceable) => (
              <Label
                key={glanceable.type}
                class名称="grid grid-rows-[2fr_1fr] justify-center items-center gap-1"
              >
                <GlanceableComponent
                  type={glanceable.type}
                  params={glanceable.exampleProps || {}}
                  class名称="frosted px-2 py-0.5 h-8 rounded-full"
                />
                <RadioGroupItem
                  value={glanceable.type}
                  id={`glanceables-${glanceable.type}`}
                  class名称="hidden data-[state=checked]:[&+p]:text-(--primary)"
                />
                <p class名称="text-sm text-center">
                  {glanceable.display名称}
                </p>
              </Label>
            ))}
          </PaginatedCarouselViewComponent>
        </RadioGroup>

        <GlanceableProperties设置Component selected={selected} currentTab={currentTab} isCurrent={(selectedGlanceable === "current") ? true : false}/>
      </section>
    </>
  );
}
