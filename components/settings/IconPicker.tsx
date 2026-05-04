"use client";

import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";

interface Icon {
    名称: string;
    Reference: string;
    SVG: "Yes" | "No";
    PNG: "Yes" | "No";
    Light: "Yes" | "No";
    Dark: "Yes" | "No";
    Category: string;
    Tags?: string;
    创建dAt?: string;
}

export interface IconResult {
    variant?: string | null;
    iconSet?: "default" | "mono" | "custom" | null;
    name?: string | null;
    url?: string | null;
}


export default function IconPickerComponent({
    initialIcons = [],
    on关闭,
    onSelect,
}: {
    initialIcons?: Icon[];
    on关闭?: () => void;
    onSelect?: (icon: IconResult) => void;
}) {
    const [icons, setIcons] = useState<Icon[]>(initialIcons);
    const [selected, setSelected] = useState<string | null>(null);
    const [search, set搜索] = useState("");

    // icon set mode
    const [iconSet, setIconSet] = useState<"default" | "mono">("default");

    useEffect(() => {
        fetch("/icons/index.json")
            .then((res) => res.json())
            .then((data: Icon[]) => setIcons(data))
            .catch(console.error);
    }, []);

    const getIconData = (icon: Icon): IconResult => {
        let variant = "";
        if (iconSet === "mono") {
            if (icon.Light === "Yes") variant = "light";
            else if (icon.Dark === "Yes") variant = "dark";
        }

        const url = `/icons/webp/${icon.Reference}${variant ? `-${variant}` : ""}.webp`;

        return {
            variant: variant || "default",
            iconSet,
            name: icon.名称,
            url,
        };
    };

    const filteredIcons = icons.filter(
        (icon) =>
            icon.名称.toLowerCase().includes(search.toLowerCase()) ||
            icon.Category.toLowerCase().includes(search.toLowerCase())
    );

    const groupedIcons: Record<string, Icon[]> = filteredIcons.reduce(
        (acc, icon) => {
            const firstLetter = icon.名称[0].toUpperCase();
            if (!acc[firstLetter]) acc[firstLetter] = [];
            acc[firstLetter].push(icon);
            return acc;
        },
        {} as Record<string, Icon[]>
    );

    const handleSelect = (value: string) => {
        setSelected(value);
        const icon = icons.find((i) => i.Reference === value);
        if (onSelect && icon) onSelect(getIconData(icon));
        if (on关闭) on关闭();
    };


    return (
        <div>
            <h3 class名称="text-lg font-semibold mb-2">Pick an icon</h3>

            <Input
                type="text"
                placeholder="搜索 icons..."
                value={search}
                onChange={(e) => set搜索(e.target.value)}
                class名称="frosted w-full mb-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div class名称="flex mb-2  rounded-md overflow-hidden w-fit frosted">
                {["default", "mono"].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setIconSet(mode as "default" | "mono")}
                        class名称={`
                        px-3 py-1 text-sm
                        ${iconSet === mode ? "bg-primary/20 border-primary" : "opacity-60"}
                        `}
                    >
                        {mode === "default" ? "Default" : "Monocolor"}
                    </button>
                ))}
            </div>

            <div class名称="max-h-[35vh] overflow-y-auto">
                {Object.keys(groupedIcons)
                    .sort()
                    .map((letter) => (
                        <div key={letter}>
                            <h4 class名称="font-semibold mt-2 mb-1">{letter}</h4>

                            <RadioGroup
                                value={selected ?? undefined}
                                onValueChange={handleSelect}
                                class名称="grid grid-cols-5 gap-4"
                            >
                                {groupedIcons[letter].map((icon) => (
                                    <Label
                                        key={icon.Reference}
                                        class名称={`h-[35px] w-[35px] rounded-md flex flex-col items-center justify-center cursor-pointer p-1 border bg-white/20 ${selected === icon.Reference
                                            ? "border-primary bg-primary/20"
                                            : "border-(--text-primary)/20"
                                            }`}
                                    >
                                        <RadioGroupItem
                                            value={icon.Reference}
                                            class名称="hidden"
                                        />

                                        <img
                                            src={getIconData(icon)?.url ?? ""}
                                            alt={icon.名称}
                                            loading="lazy"
                                            class名称="h-[20px] w-[20px]"
                                        />
                                    </Label>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
            </div>
        </div>
    );
}
