"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface NewsFeed {
  id?: string;
  feedUrl: string;
  name?: string;
  icon?: string;
  category?: string;
}

interface SubscriptionDetailsFormProps {
  feed?: NewsFeed;
  categories: string[];
  on关闭?: () => void | Promise<void>;
  on保存?: (feed: NewsFeed) => Promise<void> | void;
}

export default function SubscriptionDetailsForm({
  feed,
  categories,
  on关闭,
  on保存,
}: SubscriptionDetailsFormProps) {
  const [feedUrl, setFeedUrl] = useState(() => feed?.feedUrl || "");
  const [name, set名称] = useState(() => feed?.name || "");
  const [icon, setIcon] = useState(() => feed?.icon || "");
  const [category, setCategory] = useState(() => feed?.category || categories[0] || "Uncategorized");
  const [customCategory, setCustomCategory] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const is编辑ing = Boolean(feed?.feedUrl && feed?.name);

  const handle提交 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!feedUrl.trim()) {
        throw new Error("Feed URL is required");
      }

      const finalCategory = useCustom
        ? customCategory.trim() || "Uncategorized"
        : category || "Uncategorized";

      const payload: NewsFeed = {
        feedUrl: feedUrl.trim(),
        name: name.trim() || feedUrl.trim(),
        icon: icon.trim(),
        category: finalCategory,
      };

      if (feed?.id) {
        payload.id = feed.id;
      }

      if (on保存) {
        await on保存(payload);
      }

      if (on关闭) await on关闭();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form on提交={handle提交} class名称="space-y-4">
      <div>
        <Label htmlFor="feed-url">Feed URL *</Label>
        <Input
          id="feed-url"
          class名称="frosted mt-1"
          placeholder="https://example.com/feed.xml"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          disabled={loading || is编辑ing}
        />
      </div>

      <div>
        <Label htmlFor="feed-name">Feed 名称</Label>
        <Input
          id="feed-name"
          class名称="frosted mt-1"
          placeholder="My Feed"
          value={name}
          onChange={(e) => set名称(e.target.value)}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="feed-icon">Icon URL</Label>
        <Input
          id="feed-icon"
          class名称="frosted mt-1"
          placeholder="https://example.com/icon.png"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          disabled={loading}
        />
        <p class名称="text-xs text-white/60 mt-1">
          Leave empty to let the backend choose a default icon
        </p>
      </div>

      <div>
        <Label htmlFor="feed-category">Category</Label>
        <Select
          value={useCustom ? "__custom__" : category}
          onValueChange={(v) => {
            if (v === "__custom__") {
              setUseCustom(true);
            } else {
              setUseCustom(false);
              setCategory(v);
            }
          }}
          disabled={loading}
        >
          <SelectTrigger class名称="frosted mt-1">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent class名称="frosted text-foreground">
            {categories.length === 0 && (
              <SelectItem value="Uncategorized">Uncategorized</SelectItem>
            )}
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
            <SelectItem value="__custom__">New category...</SelectItem>
          </SelectContent>
        </Select>

        {useCustom && (
          <Input
            type="text"
            placeholder="Enter custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            class名称="frosted mt-2"
            disabled={loading}
          />
        )}
      </div>

      <div class名称="pt-2">
        <div class名称="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={on关闭}
            disabled={loading}
          >
            取消
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? is编辑ing
                ? "Saving..."
                : "Subscribing..."
              : is编辑ing
                ? "保存"
                : "Subscribe"}
          </Button>

        </div>
      </div>

      {error && <p class名称="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
