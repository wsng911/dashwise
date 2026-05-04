import https from "https";
import axios from "axios";
import { 搜索Item } from "@/lib/jobs";

/** Minimal normalized Jellyfin item we care about */
type JellyfinItem = {
    Id: string;
    名称: string;
    Type?: string;
    PrimaryImageTag?: string | null;
    Series名称?: string | null;
    Album?: string | null;
    // raw payload can be attached if needed
    raw?: any;
};

/**
 * Fetch items from a Jellyfin server.
 * - serverUrl: root like "https://jellyfin.mydomain.example"
 * - token: Jellyfin API token (used as X-Emby-Token header)
 * - userId: optional Jellyfin user id to fetch that user's favorites; if omitted the function will attempt /Users/Me/favorites then fall back to /Items.
 * - allowInsecureCerts: pass true to accept self-signed certs.
 */
export async function getJellyfinItems({
    serverUrl,
    token,
    includeItemTypes = ["Movie", "Episode", "Series", "Audio", "MusicAlbum"],
    limit = 1000,
    allowInsecureCerts = false,
}: {
    serverUrl: string;
    token?: string | null;
    includeItemTypes?: string[];
    limit?: number;
    allowInsecureCerts?: boolean;
}): Promise<JellyfinItem[]> {
    try {
        const base = serverUrl.replace(/\/+$/, "");
        const headers: Record<string, string> = { Accept: "application/json" };
        if (token) headers["X-Emby-Token"] = token;

        // quick reachability check
        try {
            await axios.get(base, {
                timeout: 3000,
                httpsAgent: allowInsecureCerts ? new https.Agent({ rejectUnauthorized: false }) : undefined,
            });
        } catch {
            console.error(`[Jellyfin] ${serverUrl} not reachable.`);
            return [];
        }

        // Always fetch generic items
        const typesQuery = includeItemTypes.join(",");
        const itemsUrl = `${base}/Items?Recursive=true&IncludeItemTypes=${encodeURIComponent(
            typesQuery
        )}&Limit=${limit}`;
        const res = await axios.get(itemsUrl, {
            headers,
            httpsAgent: allowInsecureCerts ? new https.Agent({ rejectUnauthorized: false }) : undefined,
        });
        const itemsData = res.data;

        if (!itemsData) return [];

        // Normalize Items array
        let rawArray: any[] = [];
        if (Array.isArray(itemsData)) rawArray = itemsData;
        else if (Array.isArray(itemsData.Items)) rawArray = itemsData.Items;
        else if (Array.isArray(itemsData.items)) rawArray = itemsData.items;
        else if (Array.isArray(itemsData.Data)) rawArray = itemsData.Data;
        else if (typeof itemsData === "object" && itemsData !== null && "Id" in itemsData) rawArray = [itemsData];
        else rawArray = [];

        const normalized: JellyfinItem[] = rawArray
            .filter(Boolean)
            .map((it) => ({
                Id: it.Id,
                名称: it.名称 ?? it.Title ?? "Untitled",
                Type: it.Type,
                PrimaryImageTag: it.PrimaryImageTag ?? null,
                Series名称: it.Series名称 ?? null,
                Album: it.Album ?? null,
                raw: it,
            }));

        return normalized;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            console.error(`[Jellyfin] Failed to fetch items from ${serverUrl}`, {
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                message: err.message,
            });
        } else {
            console.error(`[Jellyfin] Unexpected error fetching items:`, err);
        }
        return [];
    }
}

/**
 * Map Jellyfin items to your 搜索Item[] format.
 * - 创建s thumbnail and web UI action links.
 */
export async function Jellyfin搜索Items({
    serverUrl,
    token,
    userId,
    allowInsecureCerts = false,
}: {
    serverUrl: string;
    token?: string | null;
    userId?: string | null;
    allowInsecureCerts?: boolean;
}): Promise<搜索Item[]> {
    const items = await getJellyfinItems({ serverUrl, token, allowInsecureCerts });
    const base = serverUrl.replace(/\/+$/, "");
    const mapped: 搜索Item[] = items.map((it) => {

        // action opens the item in the Jellyfin web UI
        const actionUrl = `${base}/web/index.html#/details?id=${encodeURIComponent(it.Id)}`;

        const secondary = it.Series名称 ?? it.Album ?? it.Type ?? "";

        return {
            id: it.Id,
            name: it.名称 ?? "Untitled",
            icon: "/icons/png/jellyfin-light.png",
            secondaryInfo: secondary,
            type: "jellyfinItem",
            action: `url:${actionUrl}`,
            tags: [it.名称, "jellyfin", secondary].filter((t): t is string => !!t)
        } as 搜索Item;
    });


    return mapped.sort((a, b) => a.name.localeCompare(b.name));
}
