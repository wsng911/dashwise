"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import IconPickerComponent from "@/components/settings/IconPicker";
import { useConfig } from "@/context/ConfigContext";
import { writeToConfig } from "@/lib/frontend/data/MUTATE/config/writeToConfig";
import useAuth from "@/context/useAuth";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { add搜索Engine } from "@/lib/frontend/data/MUTATE/config/searchEngines/add";

export default function 搜索EngineDetailsForm({
    engine,
    on保存d,
    formId,
    hide操作,
}: {
    engine?: 搜索Engine | null;
    on保存d?: () => void | Promise<void>;
    formId?: string;
    hide操作?: boolean;
}) {
    const { config, refreshConfig } = useConfig();
    const { token } = useAuth();

    const [name, set名称] = useState(engine?.name ?? "");
    const [slug, setSlug] = useState(engine?.slug ?? "");
    const [icon, setIcon] = useState(engine?.icon ?? "/icons/svg/default-light.svg");
    const [searchUrl, set搜索Url] = useState(engine?.url_params ?? "");
    const [urlHome, setUrlHome] = useState(engine?.url_home ?? "");
    const [status, set状态] = useState<搜索Engine["status"]>(engine?.status ?? "enabled");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [icon编辑ed, setIcon编辑ed] = useState(Boolean(engine?.icon));
    const [icons, setIcons] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetch("/icons/index.json")
            .then((res) => res.json())
            .then((d) => setIcons(d))
            .catch(() => setIcons([]));
    }, []);

    // auto-generate slug from name for new engines
    useEffect(() => {
        if (!engine && name.trim() && !slug) {
            const s = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            setSlug(s || `engine-${Date.now()}`);
        }
    }, [name, engine, slug]);

    // auto-generate icon path (light svg) until user edits
    useEffect(() => {
        if (!icon编辑ed && name.trim()) {
            const safe名称 = name.trim().replace(/\s+/g, "-").toLowerCase();
            setIcon(`/icons/svg/${safe名称}-light.svg`);
        }
    }, [name, icon编辑ed]);

    const is编辑ing = Boolean(engine);

    // use provided formId or fallback to a stable default
    const effectiveFormId = formId ?? "search-engine-form";

    const handle保存 = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Basic validation
            if (!name.trim()) throw new Error("名称 is required");
            if (!slug.trim()) throw new Error("Slug is required");
            if (!searchUrl.includes("%s")) throw new Error("搜索 URL must include '%s' placeholder");

            // If urlHome is empty, derive origin/base from searchUrl
            let resolvedHome = urlHome?.trim();
            if (!resolvedHome) {
                try {
                    const sample = searchUrl.replace("%s", "");
                    const u = new URL(sample);
                    resolvedHome = `${u.protocol}//${u.host}`;
                } catch {
                    // fallback to empty string if cannot parse
                    resolvedHome = "";
                }
            }

            const payloadEngine: 搜索Engine = {
                name: name || "Untitled",
                slug: slug || `engine-${Date.now()}`,
                icon,
                status,
                url_home: resolvedHome,
                url_params: searchUrl,
            };

            if (is编辑ing) {
                const updated = (config.searchEngines || []).map((s: 搜索Engine) =>
                    s.slug === engine!.slug ? payloadEngine : s
                );

                if (!token) throw new Error("Not authenticated");

                await writeToConfig(`searchEngines`, updated, { token });
            } else {
                const tokenStr = token ?? "";
                await add搜索Engine(payloadEngine, { token: tokenStr });
            }

            await refreshConfig();
            if (on保存d) await on保存d();
        } catch (err: any) {
            setError(err?.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id={effectiveFormId} on提交={handle保存} class名称="grid grid-cols-2 gap-4">
            <div class名称="col-span-full">
                <Label htmlFor="se-name">名称</Label>
                <Input
                    id="se-name"
                    placeholder="New 搜索 Engine"
                    value={name}
                    onChange={(e) => set名称(e.target.value)}
                    class名称="frosted"
                />
            </div>



            <div class名称="col-span-full"><Label htmlFor="se-search" class名称="mt-2">
                搜索 URL
            </Label>
                <Input
                    id="se-search" placeholder="use %s as placeholder for search string"
                    value={searchUrl}
                    onChange={(e) => set搜索Url(e.target.value)}
                    class名称="frosted"
                /></div>

            <div><Label class名称="mt-2">状态</Label>
                <Select onValueChange={(v) => set状态(v as 搜索Engine["status"])} value={status}>
                    <SelectTrigger class名称="w-[180px] frosted">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent class名称="frosted text-foreground">
                        <SelectGroup>
                            <SelectItem value="enabled">Enabled</SelectItem>
                            <SelectItem value="disabled">Disabled</SelectItem>
                            <SelectItem value="default">Default</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select></div>

            <div><Label htmlFor="se-slug" class名称="mt-2">
                Shortcut (used for !bangs)
            </Label>
                <Input
                    id="se-slug"
                    value={slug}
                    onChange={(e) => {
                        let value = e.target.value;
                        if (value.startsWith("!")) value = value.slice(1);
                        setSlug(value);
                    }}
                    class名称="frosted"
                    placeholder="gg"
                /></div>

            <div class名称="col-span-full"><Label>Icon</Label>
                <div class名称="flex items-start gap-2">
                    <Label
                        class名称="h-[35px] w-[35px] frosted rounded-md flex items-center justify-center outline-2 outline-transparent cursor-pointer"
                        title="current"
                    >
                        <div
                            class名称="bg-white h-[22px] w-[22px]"
                            style={{
                                maskImage: icon ? `url(${icon})` : "none",
                                WebkitMaskImage: icon ? `url(${icon})` : "none",
                                maskRepeat: "no-repeat",
                                WebkitMaskRepeat: "no-repeat",
                                maskPosition: "center",
                                WebkitMaskPosition: "center",
                                maskSize: "contain",
                                WebkitMaskSize: "contain",
                            }}
                        />
                    </Label>

                    <Popover modal={true}>
                        <PopoverTrigger>
                            <Label
                                class名称="h-[35px] w-[35px] frosted rounded-md flex items-center justify-center outline-2 outline-transparent cursor-pointer"
                                title="Set icon by link"
                            >
                                <FontAwesomeIcon icon={faPaperclip} />
                            </Label>
                        </PopoverTrigger>

                        <PopoverContent class名称="frosted p-3 text-foreground w-[300px]">
                            <div class名称="flex flex-col gap-2">
                                <Label htmlFor="iconUrl">Icon URL</Label>
                                <Input
                                    id="iconUrl"
                                    name="iconUrl"
                                    placeholder="https://example.com/icon.svg"
                                    class名称="frosted"
                                    defaultValue={icon}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setIcon(value);
                                        setIcon编辑ed(true);

                                        // update hidden input directly
                                        const hidden = document.querySelector<HTMLInputElement>('input[name="icon"]');
                                        if (hidden) hidden.value = value;
                                    }}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>


                    {/* Popover around icon picker */}
                    <Popover modal={true} open={open} onOpenChange={setOpen}>
                        <PopoverTrigger>
                            <Label
                                class名称="h-[35px] w-[35px] frosted rounded-md flex items-center justify-center outline-2 outline-transparent cursor-pointer"
                                title="Pick icon"
                            >
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </Label>
                        </PopoverTrigger>

                        <PopoverContent class名称="frosted text-foreground max-w-[480px]">
                            <IconPickerComponent
                                initialIcons={icons}
                                onSelect={(iconObj: any) => {
                                    const ext = iconObj.SVG === "Yes" ? "svg" : "png";
                                    let variant = "";
                                    if (iconObj.Light === "Yes") variant = "-light";
                                    else if (iconObj.Dark === "Yes") variant = "-dark";
                                    const url = `/icons/${ext}/${iconObj.Reference}${variant}.${ext}`;
                                    setIcon(url);
                                    setIcon编辑ed(true);
                                    setOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    <input type="hidden" name="icon" value={icon ?? ""} />
                </div>
            </div>

            {/* Advanced collapsible for Home URL */}
            <details class名称="mt-2" aria-details="true">
                <summary class名称="cursor-pointer select-none text-sm text-gray-300">
                    Advanced (Home URL)
                </summary>
                <div class名称="mt-2">
                    <Label htmlFor="se-home" class名称="text-xs">
                        Home URL (optional)
                    </Label>
                    <Input
                        id="se-home"
                        value={urlHome}
                        placeholder="https://example.com (leave empty to derive from 搜索 URL)"
                        onChange={(e) => setUrlHome(e.target.value)}
                        class名称="frosted"
                    />
                    <p class名称="text-xs text-gray-400 mt-1">
                        If left empty, the base/origin will be derived from the 搜索 URL on save.
                    </p>
                </div>
            </details>

            {error && <div class名称="text-red-400">{error}</div>}

            {/* only render internal submit button when hide操作 is falsy */}
            {!hide操作 && (
                <div class名称="mt-4">
                    <Button type="submit" disabled={loading}>
                        {loading ? (is编辑ing ? "Saving..." : "添加ing...") : is编辑ing ? "保存" : "添加"}
                    </Button>
                </div>
            )}

        </form >
    );
}
