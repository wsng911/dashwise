"use client";

import React, { useEffect, useState } from "react";
import { useRouter, use搜索Params } from "next/navigation";
import { useConfig } from "@/context/ConfigContext";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Dialog描述 } from "@/components/ui/dialog";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBroom, faCaretRight, faFolder, fa编辑, faTrash, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

import LinkDetailsForm from "@/components/settings/LinkDetailsForm";
import 删除UnusedLinkGroupsFormComponent from "@/components/settings/删除UnusedLinkGroupsForm";
import MoveLinkGroupsFormComponent from "@/components/settings/MoveLinkGroupsForm";
import { Badge } from "@/components/ui/badge";
import { writeToConfig } from "@/lib/frontend/data/MUTATE/config/writeToConfig";
import {
  编辑ItemsForm,
  use编辑ItemsForm,
  ListHeader,
  Modes,
  Tabs,
  Tab,
  TabDropdown,
  创建GroupAction,
  操作,
  ListContent,
  ListItemPrototype,
  Individual操作,
  Action,
  Bulk操作Footer,
  BulkItemsSelected操作,
} from "@/components/编辑ItemsForm";
type LinkItem = {
  id?: string;
  name: string;
  url: string;
  icon?: string;
  linkGroup?: string;
  folder?: string;
};

export default function Links设置Page() {
  const { config, refreshConfig } = useConfig();
  const router = useRouter();
  const searchParams = use搜索Params();

  const [editOpen, set编辑Open] = useState(false);
  const [editingLink, set编辑ingLink] = useState<LinkItem | null>(null);

  const [addOpen, set添加Open] = useState(false);
  const [addingLinkGroup, set添加ingLinkGroup] = useState<string>("");

  const [removeLinkFolderOpen, set移除LinkFolderOpen] = useState(false);
  const [linkToBe移除dFromFolder, setLinkToBe移除dFromFolder] = useState<string>("");

  const [selectedGroup, setSelectedGroup] = useState<string>("");

  useEffect(() => {
    if (!selectedGroup && Array.isArray(config?.linkGroups) && config!.linkGroups.length > 0) {
      setSelectedGroup(config!.linkGroups[0]);
    }
  }, [config?.linkGroups]);

  // read query params and open link group
  useEffect(() => {
    if (!searchParams) return;
    const linkGroupOpenParam = searchParams.get("group");

    if (linkGroupOpenParam) {
      setSelectedGroup(linkGroupOpenParam);
    }
  }, [searchParams, config?.linkGroups, config?.links]);

  // Helper: patch links array on server
  const pushLinks = async (updatedLinks: LinkItem[]) => {
    await writeToConfig("links", updatedLinks);
  };

  // Helper: patch groups on server
  const pushGroups = async (updatedGroups: string[]) => {
    await writeToConfig("linkGroups", updatedGroups);
  };

  // on创建Group: creates a group server-side and refreshes config
  const handle创建Group = async (name: string) => {
    try {
      const nextGroups = Array.from(new Set([...(config?.linkGroups ?? []), name]));
      await pushGroups(nextGroups);
      await refreshConfig();
      setSelectedGroup(name);
    } catch (err) {
      console.error("create group failed", err);
      window.alert("Failed to create group");
    }
  };

  // onGroupAction: rename or delete group
  const handleGroupAction = async (action: "rename" | "delete", group名称: string, payload?: any) => {
    try {
      if (!config?.links) throw new Error("No links");
      const links = (config.links as LinkItem[]).slice();
      const groups = (config.linkGroups ?? []).slice();

      if (action === "rename") {
        const new名称 = payload?.new名称 ?? window.prompt("Rename group", group名称);
        if (!new名称 || new名称 === group名称) return;
        // update groups list
        const nextGroups = groups.map((g) => (g === group名称 ? new名称 : g));
        // update link items that referenced old group
        const nextLinks = links.map((l) => (l.linkGroup === group名称 ? { ...l, linkGroup: new名称 } : l));
        await pushLinks(nextLinks);
        await pushGroups(nextGroups);
        await refreshConfig();
        setSelectedGroup(new名称);
      } else if (action === "delete") {
        if (!confirm(`删除 group "${group名称}"? This will unassign it from links.`)) return;
        const nextGroups = groups.filter((g) => g !== group名称);
        const nextLinks = links.map((l) => (l.linkGroup === group名称 ? { ...l, linkGroup: "" } : l));
        await pushLinks(nextLinks);
        await pushGroups(nextGroups);
        await refreshConfig();
        setSelectedGroup(nextGroups[0] ?? "");
      }
    } catch (err) {
      console.error("group action failed", err);
      window.alert("Failed to perform group action");
    }

  };

  // onUpdate handler for 编辑FormComponent — accepts staged items and optionally updated groups.
  // This will be invoked when the user clicks 保存 (require确认ation=true).
  const handleUpdateFromForm = async (updatedItems: LinkItem[], updatedGroups?: string[]) => {
    try {
      // persist links first
      await pushLinks(updatedItems);
      // persist groups if provided
      if (Array.isArray(updatedGroups)) {
        await pushGroups(updatedGroups);
      }
      await refreshConfig();
      // keep the selected group sensible after update (if groups changed)
      if (updatedGroups && updatedGroups.length > 0) {
        if (!updatedGroups.includes(selectedGroup) && updatedGroups[0]) {
          setSelectedGroup(updatedGroups[0]);
        }
      }
    } catch (err) {
      console.error("Failed to save changes from 编辑FormComponent", err);
      window.alert("Failed to save changes");
      throw err;
    }
  };

  // on编辑Item: open existing LinkDetailsForm modal so user can edit the single item.
  // The LinkDetailsForm is responsible for saving to server and our refreshConfig() will pick it up.
  const handleOn编辑Item = async (item: LinkItem) => {
    set编辑ingLink(item);
    set编辑Open(true);
  };

  // utility: build groups array for passing into 编辑FormComponent
  const groupsForForm = config?.linkGroups ?? [];

  // Optional small wrapper to convert config.links to LinkItem[] safely
  const linksForForm: LinkItem[] = Array.isArray(config?.links) ? (config!.links as LinkItem[]) : [];

  const checkboxClass = "h-5 w-5 rounded-full";

  return (
    <>
      <h1 class名称="text-2xl font-semibold mb-4">Links</h1>

      <div class名称="content space-y-2">
        <编辑ItemsForm<LinkItem>
          items={linksForForm}
          groups={groupsForForm}
          groupBy="linkGroup"
          subgroupBy="folder"
          itemKey="id"
          enableSubgroup={true}
          onUpdate={async (updatedItems, updatedGroups) => {
            await handleUpdateFromForm(updatedItems, updatedGroups);
          }}
        >
          {/* Header with Mode Toggle, Group Tabs, and 操作 */}
          <ListHeader>
            {/* Mode Toggle: 编辑 or Move */}
            <Modes
              editLabel="编辑"
              moveLabel="Move"
            />

            {/* Group Tabs */}
            <Tabs>
              {groupsForForm.map((group) => (
                <Tab
                  key={group}
                  name={group}
                  onRename={() => {
                    const new名称 = window.prompt("Rename group", group);
                    if (new名称 && new名称 !== group) {
                      handleGroupAction("rename", group, { new名称 });
                    }
                  }}
                  on删除={() => {
                    if (window.confirm(`删除 group "${group}"?`)) {
                      handleGroupAction("delete", group);
                    }
                  }}
                />
              ))}
              <创建GroupAction
                on创建Group={() => {
                  const name = window.prompt("New group name");
                  if (name && name.trim()) {
                    handle创建Group(name.trim());
                  }
                }}
              />
            </Tabs>

            {/* 添加itional 操作 */}
            <操作 class名称="frosted rounded-md">
              <Action
                type="add"
                icon={faPlus}
                onClick={() => {
                  set添加ingLinkGroup(selectedGroup);
                  set添加Open(true);
                }}
              />
            </操作>
          </ListHeader>

          {/* Main Items List - Use inner component for groupBy filtering */}
          <LinksListContent
            items={linksForForm}
            on编辑={handleOn编辑Item}
            onUpdateItems={handleUpdateFromForm}
            set移除LinkFolderOpen={set移除LinkFolderOpen}
            setLinkToBe移除dFromFolder={setLinkToBe移除dFromFolder}
          />

          {/* Bulk 操作 Footer */}
          <Bulk操作Footer>
            <SubgroupBulk操作
              items={linksForForm}
              onUpdateItems={handleUpdateFromForm}
            />
          </Bulk操作Footer>
        </编辑ItemsForm>

        <h2 class名称="text-xl pt-2">Manage link groups</h2>

        <Dialog>
          <DialogTrigger asChild>
            <div class名称="flex border border-transparent hover-frosted items-center col-span-full p-1.5 rounded-md gap-2 cursor-pointer">
              <FontAwesomeIcon icon={faBars} />
              <p class名称="w-full">Rearrange</p>
              <FontAwesomeIcon icon={faCaretRight} />
            </div>
          </DialogTrigger>

          <DialogContent class名称="frosted">
            <DialogHeader>
              <DialogTitle>Rearrange link groups</DialogTitle>
            </DialogHeader>
            <MoveLinkGroupsFormComponent linkGroups={config?.linkGroups ?? []} />
          </DialogContent>
        </Dialog>

        {/* 删除 unused groups dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <div class名称="flex border border-transparent hover-frosted items-center col-span-full p-1.5 rounded-md gap-2">
              <FontAwesomeIcon icon={faBroom} />
              <p class名称="w-full">删除 unused ones</p>
              <FontAwesomeIcon icon={faCaretRight} />
            </div>
          </DialogTrigger>

          <DialogContent class名称="frosted text-foreground">
            <DialogHeader>
              <DialogTitle>删除 unused link groups</DialogTitle>
            </DialogHeader>
            <Dialog描述 class名称="text-muted-foreground">
              This will remove all link groups that do not contain any links. This action cannot be undone.
            </Dialog描述>

            <删除UnusedLinkGroupsFormComponent
              on删除d={async () => {
                await refreshConfig();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* 移除 link subgroup*/}
        <Dialog open={removeLinkFolderOpen} onOpenChange={set移除LinkFolderOpen}>
          <DialogContent class名称="frosted text-foreground">
            <DialogHeader>
              <DialogTitle>移除 link from Folder</DialogTitle>
            </DialogHeader>
            <Dialog描述 class名称="text-muted-foreground">
              This will remove the link from its folder but keep the link itself.
            </Dialog描述>
            <div class名称="flex gap-2 justify-end pt-4">
              <button
                onClick={() => set移除LinkFolderOpen(false)}
                class名称="px-4 py-2 rounded-md border border-(--border-color) hover:bg-(--surface-2) transition"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  if (!linkToBe移除dFromFolder) return;
                  try {
                    // Find the link and remove folder
                    const updatedLinks = linksForForm.map((link) =>
                      link.id === linkToBe移除dFromFolder
                        ? { ...link, folder: undefined }
                        : link
                    );
                    // Call update
                    await handleUpdateFromForm(updatedLinks);
                    set移除LinkFolderOpen(false);
                    setLinkToBe移除dFromFolder("");
                  } catch (err) {
                    console.error("Failed to remove link from folder", err);
                    window.alert("Failed to remove link from folder");
                  }
                }}
                class名称="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
              >
                移除
              </button>
            </div>
          </DialogContent>
        </Dialog>


        {/* 添加 Link dialog */}
        <Dialog open={addOpen} onOpenChange={(v) => {
          set添加Open(v);
          if (!v) set添加ingLinkGroup("");
        }}>
          <DialogContent class名称="frosted text-white">
            <DialogHeader>
              <DialogTitle>添加 new link</DialogTitle>
            </DialogHeader>

            <LinkDetailsForm
              preselectOpenedGroup={addingLinkGroup}
              on关闭={async () => {
                try {
                  set添加Open(false);
                  await refreshConfig();
                  // try to update localLinks immediately
                  if (addingLinkGroup && (config?.links as LinkItem[])) {
                    const updatedLinks = (config.links as LinkItem[]).filter(
                      (l) => (l.linkGroup ?? "") === addingLinkGroup
                    );
                  }

                  if (addingLinkGroup) {
                    router.push(`/settings/links?group=${encodeURIComponent(addingLinkGroup)}`);
                  }
                } catch (err) {
                  console.warn("Error refreshing config after add", err);
                }
              }}
              link={{ linkGroup: addingLinkGroup }}
            />
          </DialogContent>
        </Dialog>

        {/* 编辑 Link dialog (single instance) — opened by on编辑Item
    LinkDetailsForm is responsible for saving the single link to server and we refresh after it closes */}
        <Dialog open={editOpen} onOpenChange={(v) => {
          set编辑Open(v);
          if (!v) set编辑ingLink(null);
        }}>
          <DialogContent class名称="frosted text-white">
            <DialogHeader>
              <DialogTitle>编辑 link</DialogTitle>
            </DialogHeader>

            <LinkDetailsForm
              preselectOpenedGroup={selectedGroup}
              link={editingLink ?? undefined}
              on关闭={async () => {
                try {
                  set编辑Open(false);
                  set编辑ingLink(null);
                  await refreshConfig();
                  // navigate to same group if possible
                  if (selectedGroup) {
                    router.push(`/settings/links?group=${encodeURIComponent(selectedGroup)}`);
                  }
                } catch (err) {
                  console.warn("Error refreshing config after edit", err);
                }
              }}
            />
          </DialogContent>
        </Dialog>

      </div>
    </>

  );
}

// Helper component to handle groupBy filtering with context hook
function LinksListContent({
  items,
  on编辑,
  onUpdateItems,
  set移除LinkFolderOpen,
  setLinkToBe移除dFromFolder,
}: {
  items: LinkItem[];
  on编辑: (item: LinkItem) => void;
  onUpdateItems: (items: LinkItem[]) => Promise<void>;
  set移除LinkFolderOpen: (value: boolean) => void;
  setLinkToBe移除dFromFolder: (value: string) => void;
}) {
  const { currentGroup, updateItems } = use编辑ItemsForm();

  // Filter items based on currently selected group
  const filteredItems = currentGroup
    ? items.filter((item) => item.linkGroup === currentGroup)
    : items;

  const handle移除FromFolder = (item: LinkItem) => {
    setLinkToBe移除dFromFolder(item.id || "");
    set移除LinkFolderOpen(true);
  };

  return (
    <ListContent>
      {filteredItems.map((item, idx) => (
        <ListItemPrototype key={item.id || idx} item={item}>
          {/* Item Icon */}
          <div class名称="w-8 h-8 flex items-center justify-center rounded overflow-hidden flex-shrink-0">
            {item.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.icon} alt={`${item.name} icon`} class名称="object-contain w-full h-full" />
            ) : (
              <div class名称="w-8 h-8 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                {item.name?.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          {/* Text Content - 名称 and URL */}
          <div class名称="flex-1 min-w-0">
            <div class名称="font-medium truncate text-foreground">{item.name}</div>
            <div class名称="text-xs text-muted-foreground truncate">{item.url}</div>
          </div>

          {/* Folder Badge if in subgroup */}
          {item.folder && (
            <Badge variant="secondary" class名称="flex items-center gap-1 flex-shrink-0 pr-1.5">
              <FontAwesomeIcon icon={faFolder} class名称="text-xs" />
              <span>{item.folder}</span>
              <button
                onClick={async () => {
                  try {
                    const updatedItems = items.map((link) =>
                      link.id === item.id
                        ? { ...link, folder: undefined }
                        : link
                    );
                    await onUpdateItems(updatedItems);
                  } catch (err) {
                    console.error("Failed to remove link from folder", err);
                    window.alert("Failed to remove link from folder");
                  }
                }}
                class名称="ml-1 hover:opacity-70 transition-opacity flex-shrink-0"
                title="移除 from folder"
              >
                <FontAwesomeIcon icon={faXmark} class名称="text-xs" />
              </button>
            </Badge>
          )}

          {/* Individual Item 操作 */}
          <Individual操作>
            <Action type="edit" icon={fa编辑} onClick={() => on编辑(item)} label="编辑 Link"/>
            {/* <Action
              type="move"
              icon={faArrowRight}
              onClick={() => {
                const targetGroup = window.prompt("Move to group:", item.linkGroup || "");
                if (targetGroup) {
                  const updated = { ...item, linkGroup: targetGroup };
                  const newItems = items.map((l) => (l.id === item.id ? updated : l));
                  // This needs to call the parent's update function
                  // For now, we'll trigger it through the context or parent callback
                }
              }}
            /> */}
            <Action
              type="delete"
              icon={faTrash}
              label="删除 Link"
              onClick={() => {
                if (window.confirm("删除 this link?")) {
                  // This would be handled by parent - needs to filter and update
                }
              }}
            />
          </Individual操作>
        </ListItemPrototype>
      ))}
    </ListContent>
  );
}

/**
 * small helper - moves element in array (kept for compatibility with existing code)
 */
function arraymove_helper<T>(arr: T[] = [], fromIndex: number, toIndex: number): T[] {
  const array = [...arr];

  // invalid fromIndex -> return original array
  if (fromIndex < 0 || fromIndex >= array.length) return array;

  // remove the element
  const [element] = array.splice(fromIndex, 1);

  // clamp toIndex to valid insertion range [0, array.length]
  if (toIndex < 0) toIndex = 0;
  if (toIndex > array.length) toIndex = array.length;

  // insert element at toIndex
  array.splice(toIndex, 0, element);

  return array;
}

// Component to handle bulk subgroup creation with selected items
function SubgroupBulk操作({
  items,
  onUpdateItems,
}: {
  items: LinkItem[];
  onUpdateItems: (items: LinkItem[]) => Promise<void>;
}) {
  const { selected, itemKey } = use编辑ItemsForm();

  return (
    <BulkItemsSelected操作
      on删除={async () => {
        if (window.confirm("删除 all selected links?")) {
          try {
            // Filter out selected items, keeping only unselected ones
            const updatedItems = items.filter((item) => {
              const itemId = String(item[itemKey as keyof LinkItem] ?? "");
              return !selected[itemId];
            });
            await onUpdateItems(updatedItems);
          } catch (err) {
            console.error("Failed to delete selected links", err);
            window.alert("Failed to delete selected links");
          }
        }
      }}
      onMove={() => {
        const targetGroup = window.prompt("!WIP NOT WORKING! Move all selected links to:");
        if (targetGroup) {
          // Handle bulk move
        }
      }}
      on创建Subgroup={async () => {
        const folder名称 = window.prompt("创建 folder for selected items:");
        if (folder名称 && Object.values(selected).some(Boolean)) {
          try {
            // Update only selected items with new folder
            const updatedItems = items.map((item) => {
              const itemId = String(item[itemKey as keyof LinkItem] ?? "");
              if (selected[itemId]) {
                return { ...item, folder: folder名称 };
              }
              return item;
            });
            await onUpdateItems(updatedItems);
          } catch (err) {
            console.error("Failed to create subgroup", err);
            window.alert("Failed to create subgroup");
          }
        }
      }}
    />
  );
}
