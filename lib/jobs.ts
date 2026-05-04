import { beszel搜索Items } from "./clients/beszel/client.ts";
import { Jellyfin搜索Items } from "./clients/jellyfin/client.ts";
import { Karakeep搜索Items } from "./clients/karakeep/client.ts";
import config from "./config.ts";
import pb, { getSuperuserPB } from "./pb.ts";

type UserConfig = {
    id: string;
    associatedUserId: string;
    config: {
        links?: {
            name: string;
            icon: string;
            linkGroup: string;
            url: string;
        }[];
        integrations?: {
            Karakeep?: {
                api_token: string;
                server_location: string;
            };
            Jellyfin?: {
                api_token: string;
                server_location: string;
            };
            Beszel?: {
                server_location: string;
                pb_email: string;
                pb_password: string;
            }
            News?: Record<string, never>;
            Notifications?: Record<string, never>;
        };
    };
};

type User搜索Item = {
    id?: string;
    associatedUserId: string;
    searchItems: string; // JSON string of all search items
};

export type 搜索Item = {
    id?: string;
    name: string;
    icon: string;
    secondaryInfo: string;
    type: "link" | "karakeepBookmark" | "jellyfinItem" | "beszelItem";
    action: string;
    tags?: string[];
};

function map搜索ItemsToJSON(items: 搜索Item[]) {
    return JSON.stringify(
        items
            .map(i => ({
                name: i.name,
                icon: i.icon,
                secondaryInfo: i.secondaryInfo,
                type: i.type,
                action: i.action,
                tags: i.tags
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
    );
}

export default async function run返回groundJobs() {
    try {
        const pb = await getSuperuserPB();
        const configs = await pb.collection("userConfig").getFullList<UserConfig>()

        for (const userConfig of configs) {
            const associatedUserId = userConfig.associatedUserId;
            if (!associatedUserId) continue;

            const links = userConfig.config?.links ?? [];

            let searchItems: 搜索Item[];

            //initially, its just an array of links
            searchItems = links.map(link => ({
                name: link.name,
                icon: link.icon,
                secondaryInfo: link.linkGroup,
                type: "link",
                action: `url:${link.url}`,
                tags: [link.name, link.linkGroup, link.url.match(/^(?:https?:\/\/)?(?:www\.)?(?:[\w-]+\.)*([\w-]+)\.(?:[\w-]{2,}(?:\.[\w-]{2,})?)$/)?.[1]].filter((t): t is string => !!t)
            }));

            //check if user has any integrations configured
            if (userConfig.config.integrations?.Karakeep && userConfig.config.integrations?.Karakeep?.api_token && userConfig.config.integrations?.Karakeep?.server_location) {
                const karakeepConfig = userConfig.config.integrations?.Karakeep;
                const token = Buffer.from(karakeepConfig.api_token, "base64").toString("utf-8");
                const serverUrl = Buffer.from(karakeepConfig.server_location, "base64").toString("utf-8");

                if (!token || !serverUrl) return;

                const bookmarks = await Karakeep搜索Items({ serverUrl, token, allowInsecureCerts: config.allowInsecureCertsForIntegrationUrls });
                searchItems.push(...bookmarks);
            }

            if (userConfig.config.integrations?.Jellyfin && userConfig.config.integrations?.Jellyfin.api_token && userConfig.config.integrations?.Jellyfin.server_location) {

                const JellyfinConfig = userConfig.config.integrations?.Jellyfin;

                const token = Buffer.from(JellyfinConfig.api_token, "base64").toString("utf-8");
                const serverUrl = Buffer.from(JellyfinConfig.server_location, "base64").toString("utf-8");

                const items = await Jellyfin搜索Items({ serverUrl, token, allowInsecureCerts: config.allowInsecureCertsForIntegrationUrls });
                searchItems.push(...items);
            }

            if (userConfig.config.integrations?.Beszel && userConfig.config.integrations?.Beszel.server_location && userConfig.config.integrations?.Beszel.pb_email) {

                const JellyfinConfig = userConfig.config.integrations?.Beszel;

                const serverUrl = Buffer.from(JellyfinConfig.server_location, "base64").toString("utf-8");
                const pb_email = Buffer.from(JellyfinConfig.pb_email, "base64").toString("utf-8");
                const pb_password = Buffer.from(JellyfinConfig.pb_password, "base64").toString("utf-8");

                const items = await beszel搜索Items({ url: serverUrl, pb_email, pb_password, allowInsecureCerts: config.allowInsecureCertsForIntegrationUrls });
                searchItems.push(...items);
            }

            const desiredJson = map搜索ItemsToJSON(searchItems);

            // Check for existing record
            const existing = await pb.collection("user搜索Items")
                .getFirstListItem<User搜索Item>(`associatedUserId="${associatedUserId}"`)
                .catch(() => null);


            if (existing) {
                // Update only if different
                if (existing.searchItems !== desiredJson) {
                    await pb.collection("user搜索Items").update(existing.id!, {
                        searchItems: desiredJson,
                    });
                }
            } else {
                // 创建 new
                await pb.collection("user搜索Items").create({
                    associatedUserId,
                    searchItems: desiredJson,
                });
            }
        }
    } catch (error) {
        console.error("Error generating user search items:", error);
    }
}
