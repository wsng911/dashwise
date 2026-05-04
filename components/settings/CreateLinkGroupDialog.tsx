"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, Alert描述 } from "@/components/ui/alert";
import { useConfig } from "@/context/ConfigContext";
import useAuth from "@/context/useAuth";
import { postConfig } from "@/lib/apiClient";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  on创建d?: (newGroup: string) => void;
};

export default function 创建LinkGroupDialog({
  open,
  onOpenChange,
  on创建d,
}: Props) {
  const { config, refreshConfig } = useConfig();

  const [alert, setAlert] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant?: "success" | "error";
  }>({ open: false, title: "", description: "", variant: "success" });

  const on创建NewLinkGroup提交 = async (newGroup: string) => {
    try {
      const { token } = useAuth();
      if (!token) throw new Error("Not authenticated");

      const json = await postConfig({ newItem: newGroup }, { qs: { path: "linkGroups" }, token });
      if (json?.error) {
        throw new Error(json?.error || json?.message || "Failed to create link group");
      }

      await refreshConfig();

      setAlert({
        open: true,
        title: "Link group created",
        description: `创建d group "${newGroup}".`,
        variant: "success",
      });

      on创建d?.(newGroup);
    } catch (err: unknown) {
      let message = "Unknown error";

      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }

      setAlert({
        open: true,
        title: "Failed to create link group",
        description: message,
        variant: "error",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent class名称="frosted text-white">
        <DialogHeader>
          <DialogTitle>创建 new link group</DialogTitle>
        </DialogHeader>

        {alert.open && (
          <Alert class名称="mb-4">
            <div class名称="flex justify-between items-start">
              <div>
                <AlertTitle>{alert.title}</AlertTitle>
                {alert.description && (
                  <Alert描述>{alert.description}</Alert描述>
                )}
              </div>
              <button
                aria-label="关闭 alert"
                onClick={() => setAlert({ ...alert, open: false })}
                class名称="ml-4 inline-flex items-center rounded px-2 py-1 text-sm hover:bg-muted"
              >
                关闭
              </button>
            </div>
          </Alert>
        )}

        <form
          on提交={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const group名称 = (formData.get("new-group-name") as string)?.trim();
            if (!group名称) return;
            await on创建NewLinkGroup提交(group名称);
            onOpenChange(false);
          }}
          class名称="space-y-4"
        >
          <div class名称="flex flex-col gap-2">
            <Label htmlFor="new-group-name">Group name</Label>
            <input
              id="new-group-name"
              name="new-group-name"
              type="text"
              class名称="rounded-md border p-2 text-black"
              placeholder="Enter group name"
              required
            />
          </div>
          <div class名称="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">创建</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
