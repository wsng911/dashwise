"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDown, faFolder, faPlus } from "@fortawesome/free-solid-svg-icons";

type MoveToGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: string[];
  onSelect: (group: string) => void;
  title?: string;
};

export default function MoveToGroupDialog({
  open,
  onOpenChange,
  groups,
  onSelect,
  title = "Move to group",
}: MoveToGroupDialogProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [newGroup名称, setNewGroup名称] = useState("");

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const handleSelectGroup = (group: string) => {
    onSelect(group);
    onOpenChange(false);
    setNewGroup名称("");
  };

  const handle创建NewGroup = () => {
    if (newGroup名称.trim()) {
      onSelect(newGroup名称.trim());
      onOpenChange(false);
      setNewGroup名称("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent class名称="frosted text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div class名称="space-y-3 max-h-96 overflow-y-auto">
          {/* List of existing groups */}
          {groups.length > 0 ? (
            <div class名称="space-y-1">
              {groups.map((group) => (
                <div key={group}>
                  <button
                    onClick={() => handleSelectGroup(group)}
                    class名称="w-full text-left px-3 py-2 rounded-md hover:bg-white/10 transition flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faFolder} class名称="text-sm" />
                    <span>{group}</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p class名称="text-sm text-white/60">No groups yet</p>
          )}

          {/* 创建 new group */}
          <div class名称="border-t pt-3 mt-3">
            <p class名称="text-xs text-white/60 mb-2">创建 new group</p>
            <div class名称="flex gap-2">
              <Input
                placeholder="Group name"
                value={newGroup名称}
                onChange={(e) => setNewGroup名称(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handle创建NewGroup();
                  }
                }}
                class名称="text-sm"
              />
              <Button
                size="sm"
                onClick={handle创建NewGroup}
                disabled={!newGroup名称.trim()}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
