"use client";

import React, { useEffect, useState } from "react";


export default function SubscribeForm(props: {
    categories: string[];
    defaultCategory?: string;
    subscribeFeed: (feed: NewsFeed) => Promise<void>;
    on添加ed: (feed: NewsFeed) => void;
    on取消: () => void;
}) {
    const { categories, defaultCategory, subscribeFeed, on添加ed, on取消 } = props;

    const [feedUrl, setFeedUrl] = useState("");
    const [name, set名称] = useState("");
    const [icon, setIcon] = useState("");
    const [category, setCategory] = useState<string>(defaultCategory ?? (categories.length ? categories[0] : "Uncategorized"));
    const [customCategory, setCustomCategory] = useState("");
    const [useCustom, setUseCustom] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!feedUrl) return;
        if (icon) return;

        try {
            const origin = new URL(feedUrl).origin;
            setIcon(`${origin}/favicon.ico`);
        } catch {
            /* ignore invalid URLs */
        }
    }, [feedUrl, icon]);

    const handleSubscribe = async (e?: React.MouseEvent) => {
        e?.preventDefault();
        setError("");

        if (!feedUrl.trim()) {
            setError("Feed URL is required");
            return;
        }

        const finalCategory = useCustom ? (customCategory.trim() || "Uncategorized") : (category || "Uncategorized");

        setSaving(true);
        try {
            await subscribeFeed({
                feedUrl: feedUrl.trim(),
                name: name.trim() || "",
                icon: icon.trim() || "",
                category: finalCategory,
            });

            on添加ed({
                feedUrl: feedUrl.trim(),
                name: name.trim() || "",
                icon: icon.trim() || "",
                category: finalCategory,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to subscribe");
        } finally {
            setSaving(false);
        }
    };

    return (
            <div class名称="space-y-4 mt-2">
                <div>
                    <label class名称="block text-sm font-medium mb-1">Feed URL *</label>
                    <input
                        type="text"
                        placeholder="https://example.com/feed.xml"
                        value={feedUrl}
                        onChange={(e) => setFeedUrl(e.target.value)}
                        class名称="w-full px-3 py-2 rounded-md bg-(--surface-3) border border-(--surface-4)"
                        disabled={saving}
                    />
                </div>

                <div>
                    <label class名称="block text-sm font-medium mb-1">Feed 名称</label>
                    <input
                        type="text"
                        placeholder="My Feed"
                        value={name}
                        onChange={(e) => set名称(e.target.value)}
                        class名称="w-full px-3 py-2 rounded-md bg-(--surface-3) border border-(--surface-4)"
                        disabled={saving}
                    />
                </div>

                <div>
                    <label class名称="block text-sm font-medium mb-1">Icon URL</label>
                    <input
                        type="text"
                        placeholder="https://example.com/icon.png"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        class名称="w-full px-3 py-2 rounded-md bg-(--surface-3) border border-(--surface-4)"
                        disabled={saving}
                    />
                </div>

                <div>
                    <label class名称="block text-sm font-medium mb-1">Category</label>
                    <select
                        value={useCustom ? "__custom__" : category}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v === "__custom__") {
                                setUseCustom(true);
                            } else {
                                setUseCustom(false);
                                setCategory(v);
                            }
                        }}
                        class名称="w-full px-3 py-2 rounded-md bg-(--surface-3) border border-(--surface-4)"
                        disabled={saving}
                    >
                        {categories.length === 0 && <option value="Uncategorized">Uncategorized</option>}
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                        <option value="__custom__">New category...</option>
                    </select>

                    {useCustom && (
                        <input
                            type="text"
                            placeholder="Enter custom category"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            class名称="w-full mt-2 px-3 py-2 rounded-md bg-(--surface-3) border border-(--surface-4)"
                            disabled={saving}
                        />
                    )}

                    <div class名称="text-xs text-white/60 mt-1">名称 and icon are added automatically if left empty.</div>
                </div>

                {error && <div class名称="text-red-500 text-sm">{error}</div>}

                <footer>
                    <div class名称="flex gap-2 w-full items-end justify-end">
                        <button
                            type="button"
                            onClick={() => on取消()}
                            disabled={saving}
                            class名称="px-4 py-2 rounded-md bg-transparent border border-(--surface-4)"
                        >
                            取消
                        </button>

                        <button
                            onClick={handleSubscribe}
                            disabled={saving}
                            class名称="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Subscribing..." : "Subscribe"}
                        </button>
                    </div>
                </footer>
            </div>
    );
}
