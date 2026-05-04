"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getLocations } from "@/lib/apiClient";

interface 搜索Result {
    display_name: string;
    lat: string;
    lon: string;
}

interface LocationSelectFormProps {
    value: { display名称: string; coordinates: string };
    onChange: (val: { display名称: string; coordinates: string }) => void;
}

export default function LocationSelectFormComponent({
    value,
    onChange,
}: LocationSelectFormProps) {
    const [searchQuery, set搜索Query] = useState("");
    const [searchResults, set搜索Results] = useState<搜索Result[]>([]);
    const [has搜索ed, setHas搜索ed] = useState(false);
    const [animateResults, setAnimateResults] = useState(false);
    const [loading, setLoading] = useState(false);

    async function runNominatim搜索(q: string) {
        if (!q) {
            set搜索Results([]);
            setHas搜索ed(false);
            setAnimateResults(false);
            return;
        }

        setHas搜索ed(true);
        setLoading(true);

        try {
            const json = await getLocations({ qs: { q } });
            set搜索Results(json || []);
            setAnimateResults(true);
        } catch (err) {
            console.error(err);
            set搜索Results([]);
            setAnimateResults(false);
        }

        setLoading(false);
    }

    function select搜索Result(r: 搜索Result) {
        onChange({
            display名称: r.display_name,
            coordinates: `${parseFloat(r.lat).toFixed(6)}, ${parseFloat(r.lon).toFixed(6)}`,
        });

        set搜索Results([]);
        set搜索Query("");
        setHas搜索ed(false);
        setAnimateResults(false);
    }

    return (
        <div class名称="space-y-3">
            <Label htmlFor="osm-search">搜索 location</Label>

            <div class名称="flex gap-2">
                <Input
                    id="osm-search"
                    value={searchQuery}
                    onChange={(e) => set搜索Query(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runNominatim搜索(searchQuery)}
                    placeholder="City, address, place..."
                />
                <Button disabled={loading} onClick={() => runNominatim搜索(searchQuery)}>
                    {loading ? "加载中..." : "搜索"}
                </Button>
            </div>

            {has搜索ed ? (
                loading ? (
                    <div class名称="text-center text-sm border rounded p-2 frosted">Loading…</div>
                ) : searchResults.length > 0 ? (
                    <div class名称="max-h-48 overflow-auto rounded border p-2 frosted">
                        {searchResults.map((r, idx) => (
                            <button
                                key={idx}
                                onClick={() => select搜索Result(r)}
                                class名称={`w-full text-left py-1 transition-all duration-300 transform hover:text-(--primary) ${
                                    animateResults
                                        ? "opacity-100 translate-y-0"
                                        : "opacity-0 -translate-y-2"
                                }`}
                                style={{ transitionDelay: `${idx * 50}ms` }}
                            >
                                {r.display_name}
                                <div class名称="text-xs opacity-60">
                                    {Number(r.lat).toFixed(5)}, {Number(r.lon).toFixed(5)}
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div class名称="text-center text-sm border rounded p-2">Nothing found</div>
                )
            ) : null}

            <div class名称="text-sm text-foreground">
                Selected: <strong>{value.display名称 || "none"}</strong>
                {value.coordinates ? <span> ({value.coordinates})</span> : null}
            </div>
        </div>
    );
}
