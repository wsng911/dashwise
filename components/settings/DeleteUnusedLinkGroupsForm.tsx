"use client";

import React, { useState } from "react";
import { useConfig } from "@/context/ConfigContext";
import useAuth from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { postConfig删除UnusedLinkgroups } from "@/lib/apiClient";
import { Alert, AlertTitle, Alert描述 } from "@/components/ui/alert";
import { Dialog关闭 } from "@/components/ui/dialog";

type Props = {
  on删除d?: () => void | Promise<void>;
};

export default function 删除UnusedLinkGroupsFormComponent({ on删除d }: Props) {
  const { refreshConfig } = useConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { token } = useAuth();

  const handle提交 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (!token) throw new Error("Not authenticated");

      try {
        const json = await postConfig删除UnusedLinkgroups(undefined, { token });
        setSuccess(json?.message || "Unused link groups deleted.");
        await refreshConfig();
      } catch (err: any) {
        throw err;
      }

      if (on删除d) await on删除d();
    } catch (err: any) {
      setError(err?.message || "Failed to delete unused link groups");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form on提交={handle提交} class名称="grid gap-4">
      {error && (
        <Alert class名称="mb-2" variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <Alert描述>{error}</Alert描述>
        </Alert>
      )}

      {success && (
        <Alert class名称="mb-2">
          <AlertTitle>Success</AlertTitle>
          <Alert描述>{success}</Alert描述>
        </Alert>
      )}

      <div class名称="flex gap-2 justify-end">
        <Dialog关闭 asChild>
          <Button variant="outline" type="button" disabled={loading}>
            取消
          </Button>
        </Dialog关闭>

        <Button type="submit" disabled={loading}>
          {loading ? "Deleting..." : "删除 unused"}
        </Button>
      </div>
    </form>
  );
}
