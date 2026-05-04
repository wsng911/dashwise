"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RenameGroupDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current名称: string;
  on确认: (new名称: string) => void;
  title?: string;
};

export default function RenameGroupDialog({
  open,
  onOpenChange,
  current名称,
  on确认,
  title = "Rename group",
}: RenameGroupDialogProps) {
  const [new名称, setNew名称] = useState(current名称);

  useEffect(() => {
    setNew名称(current名称);
  }, [current名称, open]);

  const handle确认 = () => {
    if (new名称.trim() && new名称 !== current名称) {
      on确认(new名称.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent class名称="frosted text-foreground">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div class名称="space-y-4">
          <div>
            <label class名称="text-sm mb-2 block">New name</label>
            <Input
              autoFocus
              value={new名称}
              onChange={(e) => setNew名称(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handle确认();
                }
              }}
              placeholder={current名称}
            />
          </div>

          <div class名称="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              onClick={handle确认}
              disabled={!new名称.trim() || new名称 === current名称}
            >
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
