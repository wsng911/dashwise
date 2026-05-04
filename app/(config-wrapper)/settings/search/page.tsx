"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { writeToConfig } from "@/lib/frontend/data/MUTATE/config/writeToConfig";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Dialog关闭,
} from "@/components/ui/dialog";
import { Plus, MoreHorizontal } from "lucide-react";
import { useConfig } from "@/context/ConfigContext";
import 搜索EngineDetailsForm from "@/components/settings/搜索EngineDetailsForm";
import TabSwitcher from "@/components/common/TabSwitcher";
import 搜索EngineBrowseFeedComponent from "@/components/settings/搜索EngineBrowseFeed";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Select, SelectValue, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { write } from "fs";

export default function 搜索设置Page() {
  const { config, refreshConfig } = useConfig();
  const [engines, setEngines] = useState<搜索Engine[]>(config?.searchEngines || []);
  const [activeTab, setActiveTab] = useState("manual");

  // sync when config changes
  useEffect(() => {
    setEngines(config?.searchEngines || []);
  }, [config?.searchEngines]);

  const handleOpenChange = (open: boolean) => {
    set创建Open(open);
    if (!open) {
      // Small delay to reset tab so it looks fresh next time
      setTimeout(() => setActiveTab("manual"), 200);
    }
  };

  async function persistEngines(updated: 搜索Engine[]) {
    // update local state immediately for snappy UI
    setEngines(updated);

    try {
      const token = localStorage.getItem("pb_token");
      if (!token) throw new Error("Not authenticated");
      await writeToConfig(`searchEngines`, updated, { token });
      // refresh authoritative config on success
      await refreshConfig();
    } catch (err) {
      console.error("Failed to persist search engines:", err);
      // NOTE: we don't revert local state here — you can add error recovery if desired
    }
  }

  function toggleEngine(slug: string) {
    const updated = engines.map((e) => {
      if (e.slug !== slug) return e;
      if (e.status === "default") return e;
      return {
        ...e,
        status: e.status === "disabled" ? "enabled" as "enabled" : "disabled" as "disabled"
      };
    });
    persistEngines(updated);
  }

  function setDefault(slug: string) {
    const updated = engines.map((e) => ({
      ...e,
      status: e.slug === slug
        ? "default" as "default"
        : e.status === "default"
          ? "enabled" as "enabled"
          : e.status,
    }));
    persistEngines(updated);
  }

  function removeDefault(slug: string) {
    const updated = engines.map((e) =>
      e.slug === slug && e.status === "default"
        ? { ...e, status: "enabled" as "enabled" }
        : e
    );
    persistEngines(updated);
  }

  function deleteEngine(slug: string) {
    const updated = engines.filter((e) => e.slug !== slug);
    persistEngines(updated);
  }

  // create/edit dialog state
  const [createOpen, set创建Open] = useState(false);
  const [editOpen, set编辑Open] = useState(false);
  const [editingEngine, set编辑ingEngine] = useState<搜索Engine | null>(null);

  const createFormId = "se-create-form";
  const editFormId = "se-edit-form";

  return (
    <>
      <h1 class名称="text-2xl font-semibold mb-4">搜索</h1>
      <div class名称="content space-y-4 flex flex-col gap-2">
        <div class名称="flex justify-between items-center">
          <h2 class名称="text-xl font-semibold mb-2">搜索 engines</h2>
          <div class名称="flex items-center gap-2">
            <Button onClick={() => set创建Open(true)}>
              <Plus class名称="mr-2 h-4 w-4" /> 添加
            </Button>
          </div>
        </div>

        <div class名称="grid gap-4">
          {engines.map((engine) => (
            <div
              key={engine.slug}
              class名称="frosted rounded-2xl p-4 flex justify-between items-center group"
            >
              <div class名称="flex items-center gap-4">
                <img src={engine.icon} alt="" class名称="w-6 h-6" />
                <div>
                  <h3 class名称="text-lg font-medium group-hover:text-(--primary)">{engine.name}</h3>
                  <p class名称="text-sm text-gray-100">
                    {engine.url_home} - !{engine.slug} {engine.status === "default" && " - Default engine"}
                  </p>
                </div>
              </div>

              <div class名称="flex items-center gap-4">
                <Switch
                  checked={engine.status !== "disabled"}
                  onCheckedChange={() => toggleEngine(engine.slug)}
                  class名称="[&>span]:bg-white [&>span[data-state=checked]]:bg-white"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal class名称="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {engine.status === "default" ? (
                      <DropdownMenuItem onClick={() => removeDefault(engine.slug)}>
                        移除 default
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => setDefault(engine.slug)}>
                        Set as default
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => {
                        set编辑ingEngine(engine);
                        set编辑Open(true);
                      }}
                    >
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem class名称="text-red-500" onClick={() => deleteEngine(engine.slug)}>
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {/* 创建 dialog */}
        <Dialog open={createOpen} onOpenChange={set创建Open}>
          <DialogContent class名称="frosted text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>添加 search engine</DialogTitle>
            </DialogHeader>

            <TabSwitcher
              value={activeTab}
              onValueChange={setActiveTab}
              class名称="mt-1"
              items={[
                { value: "manual", label: "Manual" },
                { value: "browse", label: "Browse" },
              ]}
            />

            <div class名称="flex-1 min-h-0 relative">
              {/* MANUAL MODE */}
              {activeTab === "manual" && (
                <搜索EngineDetailsForm
                  formId="create-engine-form"
                  hide操作
                  on保存d={async () => {
                    set创建Open(false);
                    // Trigger your refresh/sync logic here
                  }}
                />
              )}

              {/* BROWSE MODE */}
              {activeTab === "browse" && (
                // Scroll area wrapper is critical for infinite scroll to work inside a modal
                <div class名称="h-[50vh] overflow-y-auto">
                  <搜索EngineBrowseFeedComponent />
                </div>
              )}
            </div>

            {/* 4. Dynamic Footer */}
            <DialogFooter class名称="flex justify-end gap-2 mt-4">
              <Dialog关闭 asChild>
                <Button variant="outline">
                  {activeTab === "browse" ? "Done" : "取消"}
                </Button>
              </Dialog关闭>

              {/* Only show '添加' button if in Manual mode (Browse mode has individual add buttons) */}
              {activeTab === "manual" && (
                <Button form="create-engine-form" type="submit">
                  添加
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑 dialog */}
        <Dialog open={editOpen} onOpenChange={(v) => { set编辑Open(v); if (!v) set编辑ingEngine(null); }}>
          <DialogContent class名称="frosted text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑 search engine</DialogTitle>
            </DialogHeader>

            {editingEngine && (
              <搜索EngineDetailsForm
                engine={editingEngine}
                formId={editFormId}
                hide操作
                on保存d={async () => {
                  // close edit dialog, clear editing engine, refresh and re-sync local engines
                  set编辑Open(false);
                  set编辑ingEngine(null);
                  try {
                    await refreshConfig();
                    setEngines(config?.searchEngines || []);
                  } catch (err) {
                    console.warn("Error refreshing config after editing search engine", err);
                  }
                }}
              />
            )}

            {/* footer with 取消 + 保存 on one line; disable 保存 until we have an editingEngine */}
            <DialogFooter class名称="flex justify-end gap-2">
              <Dialog关闭 asChild>
                <Button variant="outline">取消</Button>
              </Dialog关闭>
              <Button form={editFormId} type="submit" disabled={!editingEngine}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          <h2 class名称="text-xl font-semibold mb-0">Shortcuts</h2>
        <RedirectBangsSetting />
      </div>
    </>
  );
}

function RedirectBangsSetting() {
  const { config, refreshConfig } = useConfig();

  async function handleChange(newVal: string) {
    await writeToConfig("global", {
      ...config.global,
      searchEngineShortcutFallback: newVal,
    });

    refreshConfig();
  }

  return (
    <div class名称="flex border border-transparent items-center col-span-full p-1.5 rounded-md gap-2">
      <FontAwesomeIcon icon={faArrowRight} />
      <p class名称="w-full">Redirect Unknown Shortcuts To</p>

      <Select
        value={config.global.searchEngineShortcutFallback}
        onValueChange={handleChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Engine" />
        </SelectTrigger>

        <SelectContent>
          {config.searchEngines.map((engine) => (
            <SelectItem key={engine.slug} value={engine.slug}>
              {engine.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
