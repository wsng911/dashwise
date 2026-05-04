"use client";

import { useEffect, useState } from "react";
import { getIntegrationsKarakeep } from "@/lib/apiClient";
import useAuth from "@/context/useAuth";
import { WidgetItemProps } from "../Widget";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip, faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

type Bookmark = {
  id: string;
  title?: string;
  url: string;
  createdAt?: string;
  icon?: string | null;
};

type KarakeepResponse = {
  latest: Bookmark[];
  serverDetails: { url: string };
};


export default function latestKarakeepBookmarksWidget({
  class名称 = "",
}: WidgetItemProps) {
  const [data, setData] = useState<KarakeepResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    getIntegrationsKarakeep({ qs: { latest: true }, token })
      .then((d) => {
        setData({
          latest: Array.isArray(d?.latest) ? d.latest : [],
          serverDetails: {
            url: typeof d?.serverDetails?.url === "string" ? d.serverDetails.url : "#",
          },
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);


  return (
    <div
      class名称={`rounded-lg p-2 flex flex-col text-center items-start ${class名称}`}
    >
      <a class名称="font-medium mb-0.5 grid grid-cols-[18px_1fr_16px] w-full text-start items-center justify-center gap-2.5" href={data?.serverDetails?.url || "#"}>
        <img src="/icons/png/karakeep-light.png" class名称="h-4 mx-0.5" />
        <p class名称="font-semibold">Latest Bookmarks</p>
        <FontAwesomeIcon icon={faUpRightFromSquare} class名称="text-xs hover:text-(--primary)" />
      </a>

      {loading && <span class名称="text-sm opacity-60">Loading…</span>}

      {!loading && data?.latest.length === 0 && (
        <span class名称="text-sm opacity-60">No bookmarks found.</span>
      )}

      {!loading && data?.latest?.[0] && (
        <ul class名称="flex flex-col gap-1 w-full text-left h-32 overflow-y-auto pr-1">
          {data?.latest.map((bookmark) => (
            <li key={bookmark.id} class名称="min-w-0">

              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                class名称="grid grid-cols-[20px_1fr] gap-2 truncate group"
              >
                {bookmark.icon && typeof bookmark.icon === "string" ? (
                  <img
                    src={bookmark.icon}
                    alt=""
                    class名称="w-4 h-4 shrink-0 rounded-sm justify-self-center self-center"
                  />
                ) : (
                  <div class名称="w-4 h-4 shrink-0 bg-gray-400/30 rounded-sm justify-self-start" />
                )}
                <div class名称="flex flex-col">
                  <span class名称="font-semibold group-hover:text-(--primary)">
                    {bookmark.title || "Untitled"}
                  </span>

                  <p class名称="text-sm text-(--text-on-frosted)">
                    <FontAwesomeIcon icon={faPaperclip} class名称="text-xs text-(--primary)" />
                    {bookmark.url || "No URL"}
                  </p>
                </div>
              </a>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
