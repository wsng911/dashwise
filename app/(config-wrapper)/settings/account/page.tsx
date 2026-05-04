"use client"

import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  Dialog关闭,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  faCaretRight,
  faCircleUser,
  faKey,
  faVault,
  faRightToBracket,
  faUpload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Alert, AlertTitle, Alert描述 } from "@/components/ui/alert"
import { Change密码Error, Change密码Request, Change密码Success } from "@/app/api/v1/auth/change-password/route"
import { useRouter } from "next/navigation"
import { postAuthChange密码 } from "@/lib/apiClient";
import { Dialog描述 } from "@radix-ui/react-dialog"
import ExportConfigDialog from "@/components/settings/ExportConfigDialog"
import { useConfig } from "@/context/ConfigContext"
import useAuth from "@/context/useAuth"
import ImportConfigDialog from "@/components/settings/ImportConfigDialog.tsx"

export default function Account设置Page() {
 const { config } = useConfig();
  const router = useRouter();
  const { user, token, setAuth, logout } = useAuth();
  const [old密码, setOld密码] = useState("")
  const [new密码, setNew密码] = useState("")
  const [confirm密码, set确认密码] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [delete密码, set删除密码] = useState("")
  const [deleteTotp, set删除Totp] = useState("")
  const [deleteLoading, set删除Loading] = useState(false)
  const [deleteError, set删除Error] = useState<string | null>(null)

  const handleChange密码提交 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!old密码 || !new密码 || !confirm密码) {
      setError("All fields are required")
      return
    }
    if (new密码 !== confirm密码) {
      setError("New passwords do not match")
      return
    }
    if (new密码.length < 8) {
      setError("New password should be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      // token from auth hook

      const payload = {
        old密码,
        new密码,
        confirm密码,
      } satisfies Change密码Request;

      try {
        const body: any = await postAuthChange密码(payload, { token });
        setSuccess(body.message || "密码 changed successfully");
        setOld密码("");
        setNew密码("");
        set确认密码("");
        if (body.token) setAuth(user, body.token);
        setTimeout(() => {
          setSuccess(null);
        }, 900);
      } catch (err: any) {
        setError(err?.body?.error ?? err?.message ?? "Failed to change password");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Network error")
      } else {
        setError("Network error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout提交 = async () => {
    logout();
    router.push('/auth/login');
  }

  const handle删除Account提交 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    set删除Error(null);
    if (!user) {
      set删除Error("Unable to determine your account details");
      return;
    }
    if (!delete密码) {
      set删除Error("密码 is required to delete your account");
      return;
    }

    const payload: { email: string; password: string; totp?: string } = {
      email: user.email ?? user.username ?? "",
      password: delete密码,
    };

    if (!payload.email) {
      set删除Error("Missing email address on your profile");
      return;
    }

    if (deleteTotp) {
      payload.totp = deleteTotp;
    }

    set删除Loading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/v1/auth/delete-account", {
        method: "DELETE",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? response.statusText ?? "Failed to delete account");
      }

      logout();
      router.push('/auth/login');
    } catch (err: any) {
      set删除Error(err?.message ?? "Failed to delete account");
    } finally {
      set删除Loading(false);
    }
  }

  return (
    <>
      <h1 class名称="text-3xl font-semibold mb-4">Account</h1>

      <div class名称="content grid grid-cols-[auto_1fr_auto] font-medium gap-2 items-center">
        <section class名称="frosted flex rounded-lg justify-center col-span-full p-2 items-center gap-6">
          <FontAwesomeIcon icon={faCircleUser} class名称="text-4xl" />
          <span>{user?.name ?? 'Lorem ipsum'}</span>
        </section>

        <h2 class名称="text-xl col-span-full">Authentication</h2>

        <Dialog>
          <DialogTrigger class名称="grid grid-cols-subgrid border border-transparent hover-frosted items-center col-span-full p-1.5 rounded-md">
            <FontAwesomeIcon icon={faKey} />
            <p class名称="text-left">Change password</p>
            <FontAwesomeIcon icon={faCaretRight} />
          </DialogTrigger>

          <DialogContent class名称="frosted text-foreground">
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
            </DialogHeader>

            <form on提交={handleChange密码提交} class名称="grid gap-4">
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

              <div class名称="grid gap-3">
                <Label htmlFor="old-password">Old password</Label>
                <Input
                  id="old-password"
                  name="old密码"
                  type="password"
                  placeholder="********"
                  value={old密码}
                  onChange={(e) => setOld密码(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              <div class名称="grid gap-3">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  name="new密码"
                  type="password"
                  placeholder="********"
                  value={new密码}
                  onChange={(e) => setNew密码(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <div class名称="grid gap-3">
                <Label htmlFor="confirm-new-password">Repeat new password</Label>
                <Input
                  id="confirm-new-password"
                  name="confirm密码"
                  type="password"
                  placeholder="********"
                  value={confirm密码}
                  onChange={(e) => set确认密码(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>

              <DialogFooter>
                <Dialog关闭 asChild>
                  <Button variant="outline" type="button" disabled={loading}>
                    取消
                  </Button>
                </Dialog关闭>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "保存 changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <div class名称="grid grid-cols-subgrid border border-transparent hover-frosted items-center col-span-full p-1.5 rounded-md">
          <FontAwesomeIcon icon={faVault} />
          <p>Multi-factor Authentication</p>
          <FontAwesomeIcon icon={faCaretRight} />
        </div>

        <Dialog>
          <DialogTrigger class名称="grid grid-cols-subgrid border border-transparent hover-frosted items-center col-span-full p-1.5 rounded-md">
            <FontAwesomeIcon icon={faRightToBracket} />
            <p class名称="text-left">退出登录</p>
            <FontAwesomeIcon icon={faCaretRight} />
          </DialogTrigger>

          <DialogContent class名称="frosted text-foreground">
            <DialogHeader>
              <DialogTitle>确认 Logout</DialogTitle>
            </DialogHeader>
            <Dialog描述>
              You will have to log back in again to access your dashboard
            </Dialog描述>

            <form on提交={handleLogout提交} class名称="grid gap-4">
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


              <DialogFooter>
                <Dialog关闭 asChild>
                  <Button variant="outline" type="button" disabled={loading}>
                    取消
                  </Button>
                </Dialog关闭>
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging out..." : "退出登录"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <h2 class名称="text-xl col-span-full">Config</h2>
        <ImportConfigDialog />
        <ExportConfigDialog jsonString={JSON.stringify(config)}/>

        <h2 class名称="text-xl col-span-full">Other</h2>
        <Dialog>
          <DialogTrigger class名称="grid grid-cols-subgrid border border-transparent hover-frosted items-center col-span-full p-1.5 rounded-md">
            <FontAwesomeIcon icon={faTrash} />
            <p class名称="text-left">删除 account</p>
            <FontAwesomeIcon icon={faCaretRight} />
          </DialogTrigger>

          <DialogContent class名称="frosted text-foreground">
            <DialogHeader>
              <DialogTitle>删除 account</DialogTitle>
              <Dialog描述>
                This is irreversible. You will need to re-create your account if you proceed.
              </Dialog描述>
            </DialogHeader>

            <form on提交={handle删除Account提交} class名称="grid gap-4">
              {deleteError && (
                <Alert class名称="mb-2" variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <Alert描述>{deleteError}</Alert描述>
                </Alert>
              )}

              <div class名称="grid gap-3">
                <Label htmlFor="delete-password">密码</Label>
                <Input
                  id="delete-password"
                  name="delete密码"
                  type="password"
                  placeholder="********"
                  value={delete密码}
                  onChange={(e) => set删除密码(e.target.value)}
                  disabled={deleteLoading}
                  autoComplete="current-password"
                />
              </div>

              <div class名称="grid gap-3">
                <Label htmlFor="delete-totp">TOTP code (if enabled)</Label>
                <Input
                  id="delete-totp"
                  name="deleteTotp"
                  type="text"
                  placeholder="123456"
                  value={deleteTotp}
                  onChange={(e) => set删除Totp(e.target.value)}
                  disabled={deleteLoading}
                  autoComplete="one-time-code"
                />
              </div>

              <DialogFooter>
                <Dialog关闭 asChild>
                  <Button variant="outline" type="button" disabled={deleteLoading}>
                    取消
                  </Button>
                </Dialog关闭>
                <Button variant="destructive" type="submit" disabled={deleteLoading}>
                  {deleteLoading ? "Deleting..." : "删除 account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
