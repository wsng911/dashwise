"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Loader2, ExternalLink, 搜索 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input"; // shadcn input
import { add搜索Engine } from "@/lib/frontend/data/MUTATE/config/searchEngines/add";
import { useConfig } from "@/context/ConfigContext";
import useAuth from "@/context/useAuth";

// --- Types ---

interface DDGBang {
    c: string; // Category
    d: string; // Domain
    r: number; // Rank
    s: string; // 名称
    sc: string; // Subcategory
    t: string; // Trigger/Slug
    u: string; // URL Template
}

interface 搜索Engine {
    icon: string;
    name: string;
    slug: string;
    status: "enabled" | "disabled";
    url_home: string;
    url_params: string;
}

// --- Helper Functions ---

const transformTo搜索Engine = (bang: DDGBang): 搜索Engine => {
    return {
        icon: `https://icons.duckduckgo.com/ip3/${bang.d}.ico`,
        name: bang.s,
        slug: bang.t,
        status: "enabled",
        url_home: bang.d.startsWith("http") ? bang.d : `https://${bang.d}`,
        url_params: bang.u.replace("{{{s}}}", "%s"),
    };
};

export default function 搜索EngineBrowseFeedComponent() {
    const { config, refreshConfig } = useConfig();
    const { token } = useAuth();
    const [bangs, setBangs] = useState<DDGBang[]>([]);
    const [visibleBangs, setVisibleBangs] = useState<DDGBang[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, set搜索] = useState("");
    const [debounced搜索, setDebounced搜索] = useState("");

    // debounce search input (200ms)
    useEffect(() => {
        const id = setTimeout(() => setDebounced搜索(search), 200);
        return () => clearTimeout(id);
    }, [search]);

    const ITEMS_PER_PAGE = 20;

    const loaderRef = useRef<HTMLDivElement>(null);

    // Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/bangs.js");
                if (!res.ok) throw new Error("Failed to fetch");
                const data: DDGBang[] = await res.json();
                setBangs(data);
                setLoading(false);
            } catch (error) {
                console.error("Error loading search engines:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Build set of existing slugs from config
    const existingSlugs = React.useMemo(() => {
        const arr = config?.searchEngines ?? [];
        return new Set(arr.map((e: any) => String(e.slug)));
    }, [config]);

    // availableBangs: only those not already added
    const availableBangs = React.useMemo(() => {
        if (!bangs || bangs.length === 0) return [];
        return bangs.filter((b) => !existingSlugs.has(b.t));
    }, [bangs, existingSlugs]);

    // Filtered list derived from search (works only on availableBangs)
    const filteredBangs = React.useMemo(() => {
        // Only filter when user typed at least 3 characters
        if (!debounced搜索 || debounced搜索.trim().length < 3) return availableBangs;
        const q = debounced搜索.toLowerCase();
        return availableBangs.filter(
            (b) =>
                (b.s && b.s.toLowerCase().includes(q)) ||
                (b.d && b.d.toLowerCase().includes(q)) ||
                (b.t && b.t.toLowerCase().includes(q)) ||
                (b.c && b.c.toLowerCase().includes(q))
        );
    }, [availableBangs, debounced搜索]);

    // keep visibleBangs in sync with page/filter
    useEffect(() => {
        if (debounced搜索 && debounced搜索.trim().length >= 3) {
            // show full filtered set while searching (or slice if you prefer pagination)
            setVisibleBangs(filteredBangs);
            setPage(1);
        } else {
            setVisibleBangs(availableBangs.slice(0, page * ITEMS_PER_PAGE));
        }
    }, [availableBangs, page, debounced搜索, filteredBangs]);

    // Infinite Scroll Logic
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];
            if (
                target.isIntersecting &&
                !loading &&
                (!debounced搜索 || debounced搜索.trim().length < 3) &&
                visibleBangs.length < availableBangs.length
            ) {
                const nextPage = page + 1;
                const nextItems = availableBangs.slice(0, nextPage * ITEMS_PER_PAGE);
                setVisibleBangs(nextItems);
                setPage(nextPage);
            }
        },
        [loading, visibleBangs.length, availableBangs, page, debounced搜索]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "20px",
            threshold: 1.0,
        });
        // only observe when not actively searching (i.e. less than 3 chars)
        if ((!debounced搜索 || debounced搜索.trim().length < 3) && loaderRef.current) {
            observer.observe(loaderRef.current);
        }
        return () => observer.disconnect();
    }, [handleObserver, debounced搜索]);

    // 添加 Handler (async, then refresh config)
    const handle添加Engine = async (bang: DDGBang) => {
        const engineConfig = transformTo搜索Engine(bang);
        const tokenStr = token ?? "";
        try {
            await add搜索Engine(engineConfig, { token: tokenStr });
            console.log(`添加ed ${engineConfig.name}`);
            // Refresh config so the new engine will be filtered out
            try {
                refreshConfig?.();
            } catch (e) {
                // non-fatal: log
                console.warn("refreshConfig failed", e);
            }
        } catch (e) {
            console.error("Failed to add engine", e);
        }
    };

    if (loading && bangs.length === 0) {
        return (
            <div class名称="mx-auto p-4 space-y-4">
                <div class名称="flex items-center justify-between mb-6">
                    <h2 class名称="text-2xl font-bold tracking-tight">Browse 搜索 Engines</h2>
                    <div class名称="flex items-center gap-2">
                        <div class名称="w-28">
                            <Skeleton class名称="h-8 rounded" />
                        </div>
                        <Skeleton class名称="h-6 w-12 rounded" />
                    </div>
                </div>

                <div class名称="flex flex-col gap-4">
                    {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} class名称="h-16 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div class名称="space-y-4">
            <div class名称="flex items-center justify-between mb-4">
                <Badge variant={"secondary"}>{filteredBangs.length} shown</Badge>
                <div class名称="flex items-center gap-2 flex-1 justify-end">
                    <div class名称="flex items-center gap-2 border rounded-full px-2 py-1 frosted min-w-0">
                        <搜索 class名称="h-4 w-4 opacity-70" />
                        <Input
                            placeholder="搜索 name, domain, slug, category (3+ chars)..."
                            value={search}
                            onChange={(e) => set搜索(e.target.value)}
                            class名称="outline-none border-none bg-transparent rounded-full flex-1 min-w-0"
                        />
                    </div>
                </div>
            </div>

            <div class名称="flex flex-col gap-3">
                {visibleBangs.map((bang) => (
                    <BangRow key={bang.t} bang={bang} on添加={() => handle添加Engine(bang)} />
                ))}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={loaderRef} class名称="flex justify-center p-6">
                {(!debounced搜索 || debounced搜索.trim().length < 3) && visibleBangs.length < availableBangs.length ? (
                    <Loader2 class名称="h-6 w-6 animate-spin text-muted-foreground" />
                ) : null}
            </div>
        </div>
    );
}

// --- Row (single-line) sub-component ---
function BangRow({ bang, on添加 }: { bang: DDGBang; on添加: () => void }) {
    const iconUrl = `https://icons.duckduckgo.com/ip3/${bang.d}.ico`;

    return (
        <article
            class名称="
            grid grid-cols-[1fr_auto]
            items-center gap-4
            rounded-lg frosted py-3 px-2
            hover:shadow-sm transition
            "
        >
            <div class名称="flex items-center gap-4 min-w-0">
                <div class名称="relative h-10 w-10 min-w-[2.5rem] overflow-hidden rounded-md border border-white/20 p-1 flex-shrink-0">
                    <img
                        src={iconUrl}
                        alt={bang.s}
                        class名称="h-full w-full object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "/icons/svg/google-images.svg";
                        }}
                    />
                </div>

                <div class名称="min-w-0">
                    <div class名称="flex items-center gap-2">
                        <h3 class名称="text-sm font-medium line-clamp-1" title={bang.s}>
                            {bang.s}
                        </h3>
                        <span class名称="text-xs line-clamp-1">{bang.d}</span>
                    </div>

                    <div class名称="mt-2 flex items-center gap-2">
                        <Badge class名称="text-xs font-normal">{bang.c}</Badge>
                        <Badge variant="secondary" class名称="text-xs font-normal font-mono">
                            !{bang.t}
                        </Badge>
                    </div>
                </div>
            </div>

            <div class名称="flex items-center gap-2">
                <Button onClick={on添加} size="sm" class名称="whitespace-nowrap">
                    <Plus class名称="mr-2 h-4 w-4" /> 添加
                </Button>

                <Button variant="ghost" size="icon" asChild title="Visit Site">
                    <a href={`https://${bang.d}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink class名称="h-4 w-4" />
                    </a>
                </Button>
            </div>
        </article>
    );
}
