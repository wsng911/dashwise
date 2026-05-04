"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, Copy, Trash2, 编辑2 } from "lucide-react";
import 创建ForwarderDialogComponent, { ForwarderItem } from "@/components/notifications/创建ForwarderDialog";
import useAuth from "@/context/useAuth";
import { post, put, del } from "@/lib/apiClient";
import {
    getNotificationTopics,
    getNotificationForwarders,
} from "@/lib/frontend/data/notifications";

export default function NotificationForwardersPage() {
    const [items, setItems] = useState<ForwarderItem[]>([]);
    const [topics, setTopics] = useState<{ id: string; title?: string }[]>([]);
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const [newForwarderDialogVisible, setNewForwarderDialogVisible] = useState(false);
    const [editingForwarder, set编辑ingForwarder] = useState<ForwarderItem | null>(null);
    const [editTarget, set编辑Target] = useState("");
    const [editIsActive, set编辑IsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { token } = useAuth();

    useEffect(() => {
        if (!token) return;

        const load = async () => {
            const topics = await getNotificationTopics(token);
            setTopics(topics);
            if (!activeTopic && topics.length) setActiveTopic(topics[0].id);

            const forwarders = await getNotificationForwarders(token);
            setItems(forwarders);
        };

        load();
    }, [token]);

    const filtered = activeTopic
        ? items.filter((i) => i.topic?.id === activeTopic)
        : items;

    const fmt = (iso?: string | null) =>
        iso
            ? new Date(iso).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
            : "—";

    const mask = (t: string) =>
        t.length <= 20 ? t : `${t.slice(0, 10)}…${t.slice(-10)}`;

    const copy = async (v: string) => {
        if (!v) return alert("No target value available");
        await navigator.clipboard.writeText(v);
    };

    const deleteForwarder = async (forwarderId: string) => {
        if (!token) return;
        if (!confirm("Are you sure you want to delete this forwarder?")) return;
        try {
            const json = await del("/notifications/forwarders", { token, body: { forwarderId } });
            if (json?.error) throw new Error(json.error ?? "Failed to delete");
            setItems((old) => old.filter((i) => i.id !== forwarderId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete forwarder");
        }
    };

    const start编辑 = (forwarder: ForwarderItem) => {
        set编辑ingForwarder(forwarder);
        set编辑Target(forwarder.target);
        set编辑IsActive(forwarder.isActive);
    };

    const save编辑 = async () => {
        if (!token || !editingForwarder) return;
        setIsSaving(true);

        try {
            const json = await put("/notifications/forwarders", {
                forwarderId: editingForwarder.id,
                target: editTarget,
                isActive: editIsActive,
            }, { token });

            if (json?.error) throw new Error(json.error ?? "Failed to update");

            setItems((old) => old.map((i) => i.id === editingForwarder.id ? { ...i, target: editTarget, isActive: editIsActive } : i));

            set编辑ingForwarder(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update forwarder");
        } finally {
            setIsSaving(false);
        }
    };

    const cancel编辑 = () => {
        set编辑ingForwarder(null);
    };

    const getTopicTitle = (topicId: string) => {
        return topics.find((t) => t.id === topicId)?.title ?? topicId;
    };

    return (
        <>
            <div class名称="flex items-center justify-between mb-4">
                <h1 class名称="text-3xl font-semibold">Forwarders</h1>
                <Button onClick={() => setNewForwarderDialogVisible(true)}>添加 forwarder</Button>
            </div>

            <div class名称="space-y-4">
                {/* Topic chips */}
                <div class名称="flex gap-2 overflow-x-auto mb-4">
                    <button
                        key="all"
                        onClick={() => setActiveTopic(null)}
                        class名称={cn(
                            "px-4 py-2 rounded-xl text-sm transition whitespace-nowrap",
                            activeTopic === null
                                ? "bg-white/20 backdrop-blur-md text-white border border-(--primary)"
                                : "bg-white/10 text-gray-100 hover:bg-white/20"
                        )}
                    >
                        All
                    </button>

                    {topics.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTopic(t.id)}
                            class名称={cn(
                                "px-4 py-2 rounded-xl text-sm transition whitespace-nowrap",
                                activeTopic === t.id
                                    ? "bg-white/20 backdrop-blur-md text-white border border-(--primary)"
                                    : "bg-white/10 text-gray-100 hover:bg-white/20"
                            )}
                        >
                            {t.title}
                        </button>
                    ))}
                </div>

                {/* Table */}
                {filtered.length === 0 ? (
                    <div class名称="text-center py-8 text-gray-400">
                        No forwarders configured
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Topic</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>创建d</TableHead>
                                <TableHead class名称="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((fwd) => (
                                <TableRow key={fwd.id}>
                                    <TableCell>
                                        {getTopicTitle(fwd.topic.id)}
                                    </TableCell>
                                    <TableCell class名称="font-mono text-xs">
                                        {editingForwarder?.id === fwd.id ? (
                                            <input
                                                type="text"
                                                value={editTarget}
                                                onChange={(e) => set编辑Target(e.target.value)}
                                                class名称="w-full bg-white/10 border border-white/20 rounded px-2 py-1"
                                            />
                                        ) : (
                                            <span title={fwd.target}>{mask(fwd.target)}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingForwarder?.id === fwd.id ? (
                                            <label class名称="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={editIsActive}
                                                    onChange={(e) => set编辑IsActive(e.target.checked)}
                                                />
                                                <span class名称="text-xs">Active</span>
                                            </label>
                                        ) : (
                                            <span class名称={cn(
                                                "inline-block px-2 py-1 rounded text-xs",
                                                fwd.isActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"
                                            )}>
                                                {fwd.isActive ? "Active" : "Inactive"}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {fmt(fwd.created)}
                                    </TableCell>
                                    <TableCell class名称="text-right">
                                        {editingForwarder?.id === fwd.id ? (
                                            <div class名称="flex gap-2 justify-end">
                                                <button
                                                    onClick={save编辑}
                                                    disabled={isSaving}
                                                    class名称="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs hover:bg-blue-500/30"
                                                >
                                                    {isSaving ? "Saving..." : "保存"}
                                                </button>
                                                <button
                                                    onClick={cancel编辑}
                                                    class名称="px-2 py-1 bg-gray-500/20 text-gray-300 rounded text-xs hover:bg-gray-500/30"
                                                >
                                                    取消
                                                </button>
                                            </div>
                                        ) : (
                                            <Forwarder操作Menu
                                                forwarderId={fwd.id}
                                                target={fwd.target}
                                                on编辑={() => start编辑(fwd)}
                                                on删除={() => deleteForwarder(fwd.id)}
                                                onCopy={() => copy(fwd.target)}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <创建ForwarderDialogComponent
                open={newForwarderDialogVisible}
                onOpenChange={setNewForwarderDialogVisible}
                topics={topics.map((t) => ({ id: t.id, title: t.title ?? t.id }))}
                onForwarder创建d={(newItem) => {
                    setItems((old) => [...old, newItem]);
                }}
            />
        </>
    );
}

function Forwarder操作Menu({
    forwarderId,
    target,
    on编辑,
    on删除,
    onCopy,
}: {
    forwarderId: string;
    target: string;
    on编辑: () => void;
    on删除: () => void;
    onCopy: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" class名称="h-8 w-8 p-0">
                    <MoreHorizontal class名称="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class名称="w-48">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={on编辑} class名称="cursor-pointer">
                    <编辑2 class名称="mr-2 h-4 w-4" />
                    编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopy} class名称="cursor-pointer">
                    <Copy class名称="mr-2 h-4 w-4" />
                    Copy Target
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={on删除} class名称="cursor-pointer text-red-400">
                    <Trash2 class名称="mr-2 h-4 w-4" />
                    删除
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
