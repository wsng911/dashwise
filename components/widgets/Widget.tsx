import { useEffect, useState } from "react";

export type WidgetProps = {
    type: string;
    params?: Record<string, any>;
    class名称?: string;
};

/**
 * Props that actual widgets (Calendar, Weather, etc.) receive.
 * These all share the same shape for strict consistency.
 */
export type WidgetItemProps = {
    class名称?: string;
    params?: Record<string, any>;
};


export default function WidgetComponent({ type, class名称, params }: WidgetProps) {
    const [Component, setComponent] = useState<React.FC<WidgetItemProps> | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadComponent = async () => {
            try {
                let imported: { default: React.FC<WidgetItemProps> } | null = null;

                switch (type) {
                    case "calendar-weekly":
                        imported = await import("./dashboard/Calendar");
                        break;
                    case "calendar-today":
                        imported = await import("./dashboard/Calendar").then((mod) => ({
                            default: mod.CalendarTodayWidget,
                        }));
                        break;
                    case "weather-upcoming":
                        imported = { default: (await import("./dashboard/Weather"))?.default };
                        break;
                    case "weather-overview":
                        imported = { default: (await import("./dashboard/Weather"))?.Weather概览Widget };
                        break;
                    case "latest-karakeep-bookmarks":
                        imported = await import("./dashboard/Karakeep");
                        break;
                    case "dashdot-widget":
                        imported = await import("./dashboard/Dashdot");
                        break;
                    case "beszel-system-health": 
                        imported = await import("./dashboard/Beszel");
                        break;
                    case "placeholder":
                        imported = await import("./dashboard/Placeholder");
                        break;
                    default:
                        imported = null;
                }

                if (!cancelled && imported?.default) {
                    setComponent(() => imported!.default);
                }
            } catch (err) {
                console.error("Failed to load widget:", err);
            }
        };

        loadComponent();

        return () => {
            cancelled = true;
        };
    }, [type]);

    if (!Component) {
        return <div class名称={`widget-default frosted ${class名称 || ""}`}>Go to settings to configure</div>;
    }

    return <Component class名称={`frosted rounded-lg flex items-center ${class名称 || ""}`} params={params} />;
}
