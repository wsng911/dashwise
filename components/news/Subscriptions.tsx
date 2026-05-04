"use client";

import { useState, useRef, useEffect } from "react";
import { faPlus, faCheck, faXmark, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// --------------------
// Types
// --------------------
export interface Feed {
    id: number;
    icon: string; // URL to favicon or custom
    name: string;
    url: string;
}

export interface FeedsByCategory {
    [category: string]: Feed[];
}

// --------------------
// Small helper component
// --------------------
const ImageWithFallback = ({ src, alt, size = 28 }: { src: string; alt: string; size?: number }) => {
    const [ok, setOk] = useState(true);

    return (
        <div class名称="flex items-center justify-center" style={{ width: size, height: size }}>
            {ok ? (
                <img
                    src={src}
                    alt={alt}
                    width={size}
                    height={size}
                    class名称="rounded"
                    onError={() => setOk(false)}
                />
            ) : (
                <span class名称="rounded bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-medium"
                    style={{ width: size, height: size }}>
                    {alt?.[0]?.toUpperCase() ?? "F"}
                </span>
            )}
        </div>
    );
};

// --------------------
// Mock data
// --------------------
const initialCategories: string[] = [
    "Technology", "Finance", "Science", "Sports", "Lifestyle", "Gaming", "Politics"
];

const initialFeedsByCategory: FeedsByCategory = {
    Technology: [
        { id: 1, icon: "https://techcrunch.com/favicon.ico", name: "TechCrunch", url: "https://techcrunch.com/feed" },
        { id: 2, icon: "https://www.theverge.com/apple-touch-icon.png", name: "The Verge", url: "https://www.theverge.com/rss/index.xml" }
    ],
    Finance: [
        { id: 3, icon: "https://www.bloomberg.com/favicon.ico", name: "Bloomberg", url: "https://www.bloomberg.com/feeds/bna/latest.rss" }
    ],
    Science: [
        { id: 4, icon: "https://www.nature.com/favicon.ico", name: "Nature News", url: "https://www.nature.com/latest-news.rss" }
    ],
    Sports: [],
    Lifestyle: [],
    Gaming: [],
    Politics: []
};

// --------------------
// Grid column layout
// --------------------
const FEED_GRID_COLS = "grid-cols-[50px_1.5fr_2fr_100px]";

// --------------------
// New Feed Row
// --------------------
interface NewFeedRowProps {
    category: string;
    on确认: (feed: Omit<Feed, "id"> & { category: string }) => void;
    on取消: () => void;
}

const NewFeedGridRow = ({ category, on确认, on取消 }: NewFeedRowProps) => {
    const [icon, setIcon] = useState("");
    const [name, set名称] = useState("");
    const [url, setUrl] = useState("");

    // Autofill favicon
    useEffect(() => {
        if (!url) return;
        if (icon) return;

        try {
            const origin = new URL(url).origin;
            setIcon(`${origin}/favicon.ico`);
        } catch {
            /* ignore invalid URLs */
        }
    }, [url, icon]);

    const handle确认 = () => {
        if (!name || !url) {
            alert("名称 and URL are required.");
            return;
        }

        let finalIcon = icon;

        if (!finalIcon) {
            try {
                finalIcon = `${new URL(url).origin}/favicon.ico`;
            } catch {
                finalIcon = "";
            }
        }

        on确认({
            category,
            icon: finalIcon,
            name,
            url
        });
    };

    return (
        <div class名称={`grid ${FEED_GRID_COLS} items-center`}>
            <div class名称="p-2 border-r border-[color:var(--primary)]/10">
                <input
                    type="url"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Icon URL (favicon)"
                    class名称="w-full bg-transparent text-sm focus:outline-none"
                />
            </div>

            <div class名称="p-2 border-r border-[color:var(--primary)]/10">
                <input
                    type="text"
                    placeholder="Feed 名称"
                    value={name}
                    onChange={(e) => set名称(e.target.value)}
                    class名称="w-full bg-transparent focus:outline-none"
                />
            </div>

            <div class名称="p-2 border-r border-[color:var(--primary)]/10">
                <input
                    type="url"
                    placeholder="Feed URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    class名称="w-full bg-transparent text-sm focus:outline-none"
                />
            </div>

            <div class名称="p-2 flex justify-center space-x-2">
                <button onClick={handle确认} class名称="p-1 hover:text-(--primary)">
                    <FontAwesomeIcon icon={faCheck} />
                </button>
                <button onClick={on取消} class名称="p-1 hover:text-(--primary)">
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>
        </div>
    );
};

// --------------------
// New Category Row
// --------------------
interface NewCategoryProps {
    on确认: (name: string) => void;
    on取消: () => void;
}

const NewCategoryRow = ({ on确认, on取消 }: NewCategoryProps) => {
    const [value, setValue] = useState("");

    return (
        <div class名称="flex items-center space-x-2 p-2 rounded-md border border-[color:var(--primary)]/10 bg-[color:var(--primary)]/6">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="New category name"
                class名称="flex-1 bg-transparent focus:outline-none"
            />
            <button onClick={() => value.trim() && on确认(value.trim())} class名称="text-[color:var(--primary)] p-1">
                <FontAwesomeIcon icon={faCheck} />
            </button>
            <button onClick={on取消} class名称="text-red-600 p-1">
                <FontAwesomeIcon icon={faXmark} />
            </button>
        </div>
    );
};

// --------------------
// Main Component
// --------------------
export default function NewsSubscriptions概览() {
    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
    const [is添加ingCategory, setIs添加ingCategory] = useState(false);

    const [feedsData, setFeedsData] = useState<FeedsByCategory>(initialFeedsByCategory);
    const [is添加ingNewFeed, setIs添加ingNewFeed] = useState(false);

    const feeds = feedsData[selectedCategory] || [];

    const activeBgRef = useRef<HTMLDivElement>(null);
    const categoryContainerRef = useRef<HTMLDivElement>(null);

    // Position active category highlight
    useEffect(() => {
        const container = categoryContainerRef.current;
        const activeEl = container?.querySelector<HTMLDivElement>(
            `.category-label-div[data-category="${selectedCategory}"]`
        );

        if (activeEl && activeBgRef.current && container) {
            const elRect = activeEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const topPosition = elRect.top - containerRect.top + container.scrollTop;

            activeBgRef.current.style.top = `${topPosition}px`;
            activeBgRef.current.style.height = `${elRect.height}px`;
        }
    }, [selectedCategory, categories]);

    const handle添加Feed确认 = (newFeed: Omit<Feed, "id"> & { category: string }) => {
        const updated = [...(feedsData[newFeed.category] ?? []), { ...newFeed, id: Date.now() }];
        setFeedsData((prev) => ({ ...prev, [newFeed.category]: updated }));
        setIs添加ingNewFeed(false);
    };

    const handleNewCategory确认 = (name: string) => {
        if (!name) return;
        if (categories.includes(name)) return alert("Category already exists");

        setCategories((prev) => [...prev, name]);
        setFeedsData((prev) => ({ ...prev, [name]: [] }));
        setSelectedCategory(name);
        setIs添加ingCategory(false);
    };

    return (
        <div class名称="grid grid-cols-[300px_1fr] gap-4 p-4 min-h-[400px]">
            <h1 class名称="col-span-full text-3xl font-bold">Manage your subscriptions</h1>

            {/* Left: Categories */}
            <div class名称="w-full">
                <div ref={categoryContainerRef} class名称="relative flex flex-col py-1 pr-4 overflow-auto max-h-[520px]">
                    <div class名称="space-y-1">

                        <div
                            ref={activeBgRef}
                            class名称="absolute left-0 w-[95%] rounded-md transition-all duration-200 bg-white/20"
                            style={{ zIndex: 0 }}
                        />

                        {categories.map((category) => (
                            <div key={category} class名称="group cursor-pointer" onClick={() => setSelectedCategory(category)}>
                                <div
                                    class名称="p-2 rounded-md relative category-label-div text-white font-medium"
                                    data-category={category}
                                    style={{ zIndex: 1 }}
                                >
                                    {category}
                                </div>
                            </div>
                        ))}

                        {is添加ingCategory ? (
                            <NewCategoryRow on确认={handleNewCategory确认} on取消={() => setIs添加ingCategory(false)} />
                        ) : (
                            <div class名称="cursor-pointer" onClick={() => setIs添加ingCategory(true)}>
                                <div class名称="p-2 rounded-md hover:bg-white/20 text-sm">+ 添加 category</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Feeds */}
            <div class名称="py-1">
                <h2 class名称="text-xl font-bold mb-4">
                    Feeds in <span class名称="text-[var(--primary)]">{selectedCategory}</span>
                </h2>

                <div class名称="overflow-hidden">
                    
                    {/* Header */}
                    <div class名称={`grid ${FEED_GRID_COLS} font-semibold`}>
                        <div class名称="p-2 text-center">Icon</div>
                        <div class名称="p-2">名称</div>
                        <div class名称="p-2">URL</div>
                        <div class名称="p-2 text-center">Action</div>
                    </div>

                    {/* Feeds list */}
                    <div class名称="divide-y divide-gray-200">
                        {feeds.map((feed) => (
                            <div key={feed.id} class名称={`grid ${FEED_GRID_COLS} items-center rounded-md hover:bg-white/20 border-0`}>
                                <div class名称="p-2 flex justify-center">
                                    <ImageWithFallback src={feed.icon} alt={feed.name} size={28} />
                                </div>

                                <div class名称="p-2">{feed.name}</div>

                                <div class名称="p-2">
                                    <a href={feed.url} target="_blank" rel="noopener noreferrer"
                                        class名称="text-sm text-foreground hover:underline block truncate">
                                        {feed.url}
                                    </a>
                                </div>

                                <div class名称="p-2 text-center">
                                    <button class名称="hover:text-red-500">
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* New feed row */}
                        {is添加ingNewFeed && (
                            <NewFeedGridRow
                                category={selectedCategory}
                                on确认={handle添加Feed确认}
                                on取消={() => setIs添加ingNewFeed(false)}
                            />
                        )}

                        {/* 添加 new button */}
                        {!is添加ingNewFeed && (
                            <button
                                onClick={() => setIs添加ingNewFeed(true)}
                                class名称="w-full py-2 text-[--text-primary] font-semibold flex items-center justify-center space-x-2 hover:bg-white/20 rounded-md"
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span>添加 New Feed</span>
                            </button>
                        )}

                        {feeds.length === 0 && !is添加ingNewFeed && (
                            <div class名称="p-4 text-center italic text-white">
                                No feeds found for this category.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
