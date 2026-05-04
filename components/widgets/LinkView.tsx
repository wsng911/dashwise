"use client";

import React, { useEffect, useState, useRef } from "react";
import { useConfig } from "@/context/ConfigContext";
import useAuth from "@/context/useAuth";
import { cn } from "@/lib/utils";
import { get监控ing状态 } from "@/lib/apiClient";
import { PaginatedCarouselViewComponent } from "./PaginatedCarouselView";
import 监控ingDialog, { JobEntry } from "./监控ingDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolder, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Popover关闭 } from "@radix-ui/react-popover";
import { Button } from "../ui/button";

export interface LinkType {
  id?: string;
  name?: string;
  url?: string;
  icon?: string;
  folder?: string;
  linkGroup?: string;
  statusCheck?: boolean;
  statusCheckEndpoint?: string;
  statusCheckMethod?: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
}

export default function LinkView() {
  const { config } = useConfig();
  const { token } = useAuth();
  const tokenRef = useRef<string | null | undefined>(token);
  
  const [activeGroup, setActiveGroup] = useState<string>(config.linkGroups[0]);
  const filtered = config.links.filter((link: LinkType) => link.linkGroup === activeGroup);

  const emittedFolders = new Set<string>();
  type Item =
    | { type: "link"; link: LinkType }
    | { type: "folder"; name: string; links: LinkType[] };

  const items: Item[] = [];

  for (const l of filtered) {
    if (l.folder) {
      if (!emittedFolders.has(l.folder)) {
        const children = filtered.filter((x) => x.folder === l.folder);
        items.push({ type: "folder", name: l.folder, links: children });
        emittedFolders.add(l.folder);
      }
    } else {
      items.push({ type: "link", link: l });
    }
  }


  const [statusMap, set状态Map] = useState<Record<string, boolean>>({});

  const [monitoringDetails, set监控ingDetails] = useState<Record<string, {
    status: string;
    dateChanged: string | null;
    durationChanged: number | null;
    endpoint?: string;
  }> | null>(null);

  const [openDialogFor, setOpenDialogFor] = useState<string | null>(null);

  function server状态ToBool(status?: string | null): boolean | undefined {
    if (status === undefined || status === null) return undefined;
    if (status === "healthy") return true;
    if (status === "disabled") return undefined;
    return false;
  }

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  async function fetch监控ing状态es() {
      try {
      if (typeof window === "undefined") return;
      const tokenToUse = tokenRef.current;
      if (!tokenToUse) {
        // no token — clear details
        set监控ingDetails(null);
        set状态Map({});
        return;
      }

      let data: any = null;
      try {
        data = await get监控ing状态({ token: tokenToUse });
      } catch (err) {
        console.warn("/api/v1/monitoring状态 error:", err);
        return;
      }


      const normalized: Record<string, any> = {};
      for (const [rawKey, entry] of Object.entries(data || {})) {
        const keyStr = String(rawKey);
        if (keyStr.startsWith("link ")) {
          const id = keyStr.slice(5); // remove "link " prefix
          normalized[id] = entry;
        } else {
          normalized[rawKey] = entry;
        }
      }

      set监控ingDetails(normalized);

      // map to simple boolean status map keyed by linkId
      const next: Record<string, boolean> = {};
      for (const [linkId, entry] of Object.entries(normalized)) {
        next[linkId] = server状态ToBool((entry as any).status) as boolean;
      }
      set状态Map(next);
    } catch (err) {
      console.error("Failed to fetch monitoring statuses:", err);
    }
  }

  // Initial fetch + periodic polling (30s). No client favicon probes anywhere.
  useEffect(() => {
    let mounted = true;
    fetch监控ing状态es();

    const id = window.setInterval(() => {
      if (!mounted) return;
      fetch监控ing状态es();
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Find the full link object based on the ID in state
  const selectedLink = openDialogFor
    ? config.links.find((l: LinkType) => l.id === openDialogFor)
    : undefined;

  return (
    <div class名称="space-y-2">
      {/* GROUP BUTTONS */}
      <div class名称="flex gap-2">
        {config.linkGroups.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            class名称={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition",
              activeGroup === g
                ? "bg-white/20 backdrop-blur-md text-white border border-(--primary)"
                : "bg-white/10 text-gray-100 hover:bg-white/20"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* PAGINATED LINKS */}
      <PaginatedCarouselViewComponent minColWidth={140}>
        {items.map((item) => {
          if (item.type === "link") {
            const link = item.link;
            const serverEntry = link.id && monitoringDetails ? monitoringDetails[link.id] : undefined;
            const server状态 = serverEntry?.status;
            const isHealthy = server状态 === "healthy";
            const isDisabled = server状态 === "disabled";
            const showDot = Boolean(link.statusCheck);
            const isMono = link.icon?.includes("-light");

            return (
              <a
                key={link.id || link.url}
                href={link.url}
                target={config?.global?.linkOpenBehaviour === "newtab" ? "_blank" : "_self"}
                rel={config?.global?.linkOpenBehaviour === "newtab" ? "noopener noreferrer" : undefined}
                class名称="group flex flex-col items-center justify-between space-y-2 frosted rounded-2xl p-2 hover:text-(primary) transition-colors min-h-18 w-full"
              >
                {isMono ? (
                  <div
                    class名称="h-[35px] w-[35px] bg-white group-hover:bg-(--primary) transition"
                    style={{
                      maskImage: `url(${link.icon})`,
                      WebkitMaskImage: `url(${link.icon})`,
                      maskRepeat: "no-repeat",
                      WebkitMaskRepeat: "no-repeat",
                      maskPosition: "center",
                      WebkitMaskPosition: "center",
                      maskSize: "contain",
                      WebkitMaskSize: "contain",
                    }}
                  />
                ) : link.icon ? (
                  <img src={link.icon} alt={link.name ?? "Icon"} class名称="h-[35px] w-[35px] object-contain" />
                ) : null}

                <div class名称="flex items-center w-full justify-center">
                  <span class名称="text-sm text-white">{link.name}</span>

                  {showDot && (
                    <button
                      aria-label={`Show monitoring details for ${link.name}`}
                      title={`Show monitoring details for ${link.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (link.id && monitoringDetails && monitoringDetails[link.id]) {
                          setOpenDialogFor(link.id);
                        }
                      }}
                      class名称="ml-2 flex items-center justify-center"
                    >
                      <span
                        class名称="h-2 w-2 rounded-full inline-block hover:cursor-pointer hover:ring-2"
                        style={{
                          backgroundColor: isHealthy ? "var(--primary)" : isDisabled ? "#9CA3AF" : "#6B7280",
                        }}
                        aria-hidden
                      />
                    </button>
                  )}
                </div>
              </a>
            );
          }

          // folder tile (Popover)
          const folder = item;
          return (
            <Popover key={folder.name}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  class名称="group flex flex-col items-center justify-between space-y-2 frosted rounded-2xl p-2 hover:text-(primary) transition-colors min-h-18 w-full"
                  aria-label={`Open folder ${folder.name}`}
                  title={folder.name}
                >
                  <div class名称="h-[35px] w-[35px] flex items-center justify-center">

                    <FontAwesomeIcon icon={faFolder} class名称="h-6 w-6" />
                  </div>

                  <div class名称="flex items-center w-full justify-center">
                    <span class名称="text-sm text-white">{folder.name}</span>
                  </div>
                </button>
              </PopoverTrigger>

              <PopoverContent class名称="w-[350px] frosted text-foreground space-y-2">
                <header class名称="flex justify-between items-center">
                <h4 class名称="font-semibold mb-2">{folder.name}</h4>
                <Popover关闭 asChild>
                  <Button variant="ghost" class名称="">
                    <FontAwesomeIcon icon={faXmark}/>
                  </Button>
                </Popover关闭>
                </header>
                <div
                  class名称="grid gap-3"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  }}
                >
                  {folder.links.map((child) => {
                    const serverEntry =
                      child.id && monitoringDetails ? monitoringDetails[child.id] : undefined;
                    const server状态 = serverEntry?.status;
                    const isHealthy = server状态 === "healthy";
                    const isDisabled = server状态 === "disabled";
                    const showDot = Boolean(child.statusCheck);
                    const isMono = child.icon?.includes("-light");

                    return (
                      <a
                        key={child.id || child.url}
                        href={child.url}
                        target={
                          config?.global?.linkOpenBehaviour === "newtab" ? "_blank" : "_self"
                        }
                        rel={
                          config?.global?.linkOpenBehaviour === "newtab"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        class名称="group frosted rounded-2xl p-2 hover:text-(primary) transition-colors min-h-18 flex flex-col items-center justify-between space-y-2"
                      >
                        {isMono ? (
                          <div
                            class名称="h-[30px] w-[30px] bg-white group-hover:bg-(--primary) transition"
                            style={{
                              maskImage: `url(${child.icon})`,
                              WebkitMaskImage: `url(${child.icon})`,
                              maskRepeat: "no-repeat",
                              WebkitMaskRepeat: "no-repeat",
                              maskPosition: "center",
                              WebkitMaskPosition: "center",
                              maskSize: "contain",
                              WebkitMaskSize: "contain",
                            }}
                          />
                        ) : child.icon ? (
                          <img
                            src={child.icon}
                            alt={child.name ?? "Icon"}
                            class名称="h-[30px] w-[30px] object-contain"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faFolder} class名称="h-5 w-5" />
                        )}

                        <div class名称="flex items-center justify-center w-full">
                          <span class名称="text-xs text-white">{child.name}</span>
                          {showDot && (
                            <span
                              class名称="ml-1 h-2 w-2 rounded-full inline-block"
                              style={{
                                backgroundColor: isHealthy
                                  ? "var(--primary)"
                                  : isDisabled
                                    ? "#9CA3AF"
                                    : "#6B7280",
                              }}
                            />
                          )}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </PaginatedCarouselViewComponent>

      {/* 监控ing dialog (opens when clicking a monitored link's dot) */}
      {selectedLink && (
        <监控ingDialog
          open={!!selectedLink}
          onOpenChange={(val) => {
            if (!val) setOpenDialogFor(null);
          }}
          link={selectedLink}
          onCheckTriggered={fetch监控ing状态es}
          details={
            selectedLink.id && monitoringDetails
              ? (monitoringDetails[selectedLink.id] as JobEntry)
              : undefined
          }
        />
      )}
    </div>
  );
}
