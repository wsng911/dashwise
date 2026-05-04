"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useAuth from "@/context/useAuth";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { writeToConfig } from "@/lib/frontend/data/MUTATE/config/writeToConfig";
import { postConfig } from "@/lib/apiClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useConfig } from "@/context/ConfigContext";
import IconPickerComponent, { IconResult } from "@/components/settings/IconPicker";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { faEllipsisV, faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Icon {
  名称: string;
  Reference: string;
  SVG: "Yes" | "No";
  PNG: "Yes" | "No";
  Light: "Yes" | "No";
  Dark: "Yes" | "No";
  Category: string;
}

type 状态CheckMethod = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

type 状态CheckAuth =
  | { type: "bearer"; token: string }
  | { type: "basic"; username: string; password: string }
  | { type: "header"; name: string; value: string };

export interface LinkObject {
  id?: string;
  icon?: string;
  linkGroup?: string;
  folder?: string;
  name?: string;
  url?: string;
  statusCheck?: boolean;
  statusCheckEndpoint?: string;
  statusCheckMethod?: 状态CheckMethod;
  statusCheckAuth?: 状态CheckAuth;
  statusCheckShowAsUp?: number[];
}

interface LinkDetailsFormProps {
  link?: LinkObject;
  on关闭?: () => void | Promise<void>;
  preselectOpenedGroup?: string;
}

export default function LinkDetailsForm({ link, on关闭, preselectOpenedGroup }: LinkDetailsFormProps) {
  const { config } = useConfig();
  const { token } = useAuth();

  const linkGroups = useMemo(() => config?.linkGroups || [], [config?.linkGroups]);
  const links = config?.links || [];

  const [name, set名称] = useState("");
  const [linkId, setLinkId] = useState(() => link?.id || generateRandomId());
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState<IconResult | null>(null);
  const [linkGroup, setLinkGroup] = useState(() => preselectOpenedGroup || link?.linkGroup || "");
  const [folder, setFolder] = useState(() => link?.folder || "");
  const [statusCheck, set状态Check] = useState(false);
  const [statusCheckEndpoint, set状态CheckEndpoint] = useState("");
  const [statusCheckMethod, set状态CheckMethod] = useState<状态CheckMethod>("GET");
  const [statusCheckAuthType, set状态CheckAuthType] = useState<"none" | "bearer" | "basic" | "header">("none");
  const [bearerToken, setBearerToken] = useState("");
  const [basic用户名, setBasic用户名] = useState("");
  const [basic密码, setBasic密码] = useState("");
  const [customHeader名称, setCustomHeader名称] = useState("");
  const [customHeaderValue, setCustomHeaderValue] = useState("");
  const [statusCheckShowAsUpRaw, set状态CheckShowAsUpRaw] = useState("200,201,202,204,301,302,304");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [icon编辑ed, setIcon编辑ed] = useState(false);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [open, setOpen] = useState(false);

  const is编辑ing = Boolean(link?.url && link?.name && link?.icon);

  // Load icons
  useEffect(() => {
    fetch("/icons/index.json")
      .then((res) => res.json())
      .then((data) => setIcons(data))
      .catch(console.error);
  }, []);

  // Prefill group
  useEffect(() => {
    if (link?.linkGroup) {
      setLinkGroup(link.linkGroup);
    }
    if ((link as any)?.folder) {
      setFolder((link as any).folder);
    }
    if ((link as any)?.statusCheck) {
      set状态Check(Boolean((link as any).statusCheck));
    }
    const statusCheckEndpointFromLink = (link as any)?.statusCheckEndpoint;
    if (typeof statusCheckEndpointFromLink === "string") {
      set状态CheckEndpoint(statusCheckEndpointFromLink);
    }

    const statusCheckMethodFromLink = (link as any)?.statusCheckMethod;
    if (typeof statusCheckMethodFromLink === "string") {
      set状态CheckMethod(statusCheckMethodFromLink as 状态CheckMethod);
    }

    const statusCheckShowAsUpFromLink = (link as any)?.statusCheckShowAsUp;
    if (Array.isArray(statusCheckShowAsUpFromLink) && statusCheckShowAsUpFromLink.length > 0) {
      set状态CheckShowAsUpRaw(
        statusCheckShowAsUpFromLink
          .map((code: unknown) => Number(code))
          .filter((code: number) => Number.isInteger(code) && code > 0)
          .join(",")
      );
    }

    const statusCheckAuth = parse状态CheckAuth((link as any)?.statusCheckAuth);
    if (statusCheckAuth?.type === "bearer") {
      set状态CheckAuthType("bearer");
      setBearerToken(statusCheckAuth.token ?? "");
    } else if (statusCheckAuth?.type === "basic") {
      set状态CheckAuthType("basic");
      setBasic用户名(statusCheckAuth.username ?? "");
      setBasic密码(statusCheckAuth.password ?? "");
    } else if (statusCheckAuth?.type === "header") {
      set状态CheckAuthType("header");
      setCustomHeader名称(statusCheckAuth.name ?? "");
      setCustomHeaderValue(statusCheckAuth.value ?? "");
    }
  }, [link]);

  const iconRequestId = useRef(0);

  const handle名称Blur = async () => {
    if (icon编辑ed) return;

    const nameSnapshot = name;
    const urlSnapshot = url;
    const reqId = ++iconRequestId.current;

    const result = await getIcon(nameSnapshot, urlSnapshot);

    if (reqId !== iconRequestId.current) return;
    if (nameSnapshot !== name || urlSnapshot !== url) return;

    if (result) {
      setIcon(result);
      const hidden = document.querySelector<HTMLInputElement>('input[name="icon"]');
      if (hidden) hidden.value = String(result.url);
    }
  };

  const handleUrlBlur = async () => {
    if (icon编辑ed) return;

    const nameSnapshot = name;
    const urlSnapshot = url;
    const reqId = ++iconRequestId.current;

    const result = await getIcon(nameSnapshot, urlSnapshot);

    if (reqId !== iconRequestId.current) return;
    if (nameSnapshot !== name || urlSnapshot !== url) return;

    if (result) {
      setIcon(result);
      const hidden = document.querySelector<HTMLInputElement>('input[name="icon"]');
      if (hidden) hidden.value = String(result.url);
    }
  };

  useEffect(() => {
    if (linkGroups.length === 0) return;
    if (link?.name && link?.url && link?.icon) {
      set名称(link.name);
      setUrl(link.url);
      setIcon({ url: link.icon, iconSet: link.icon.includes("-light") ? "mono" : "custom" });
      setIcon编辑ed(true);
    }
  }, [link, linkGroups]);

  const saveLink = async () => {
    if (!token) throw new Error("Not authenticated");

    const payload: LinkObject = {
      id: linkId,
      name,
      url,
      icon: icon?.url ?? "",
      linkGroup,
    };

    if (folder) payload.folder = folder;
    if (statusCheck) payload.statusCheck = true;
    if (statusCheck) {
      const endpoint = statusCheckEndpoint.trim();
      if (endpoint) payload.statusCheckEndpoint = endpoint;

      payload.statusCheckMethod = statusCheckMethod;

      const parsedCodes = parse状态CodeList(statusCheckShowAsUpRaw);
      payload.statusCheckShowAsUp = parsedCodes.length > 0 ? parsedCodes : [200, 201, 202, 204, 301, 302, 304];

      if (statusCheckAuthType === "bearer" && bearerToken.trim()) {
        payload.statusCheckAuth = { type: "bearer", token: bearerToken.trim() };
      }

      if (statusCheckAuthType === "basic" && basic用户名.trim()) {
        payload.statusCheckAuth = {
          type: "basic",
          username: basic用户名.trim(),
          password: basic密码,
        };
      }

      if (statusCheckAuthType === "header" && customHeader名称.trim()) {
        payload.statusCheckAuth = {
          type: "header",
          name: customHeader名称.trim(),
          value: customHeaderValue,
        };
      }
    }

    if (is编辑ing) {
      const updatedLinks = links.map((l) =>
        l.url === link?.url ? payload : l
      );
      await writeToConfig("links", updatedLinks, { token });
    } else {
      const json = await postConfig({ newItem: payload }, { qs: { path: "links" }, token });
      if (json?.error) throw new Error(json.error || "Failed to save link");
    }
  };

  const resetForm = () => {
    set名称("");
    setUrl("");
    setIcon(null);
    setIcon编辑ed(false);
    setFolder("");
    set状态Check(false);
    set状态CheckEndpoint("");
    set状态CheckMethod("GET");
    set状态CheckAuthType("none");
    setBearerToken("");
    setBasic用户名("");
    setBasic密码("");
    setCustomHeader名称("");
    setCustomHeaderValue("");
    set状态CheckShowAsUpRaw("200,201,202,204,301,302,304");
    setLinkId(generateRandomId());
  };


  const handle提交 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await saveLink();
      if (on关闭) await on关闭();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handle添加Another = async () => {
    setLoading(true);
    setError(null);

    try {
      await saveLink();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      on提交={handle提交}
      class名称="flex gap-2 justify-center relative"
    >
      <section class名称="max-h-100 overflow-scroll">
        <Label htmlFor="link-title">名称</Label>
        <Input
          id="link-title"
          class名称="frosted"
          placeholder="Title"
          value={name ?? ""}
          onChange={(e) => set名称(e.target.value)}
          onBlur={handle名称Blur}
        />

        <Label htmlFor="link-url">URL</Label>
        <Input
          id="link-url"
          class名称="frosted"
          placeholder="https://example.com"
          value={url ?? ""}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={handleUrlBlur}
        />

        <Label htmlFor="link-image">Icon</Label>
        <RadioGroup class名称="flex flex-wrap items-center gap-2" defaultValue="current">
          <Label
            key={name}
            class名称="h-[35px] w-[96px] frosted rounded-md flex items-center justify-center gap-2 outline-2 outline-transparent has-checked:outline-(--primary)"
          >
            <RadioGroupItem value={name} class名称="hidden" />
            <Icon set={String(icon?.iconSet) || ""} url={String(icon?.url) || ""} name={String(icon?.name) || ""} />
            <span>
              {is编辑ing
                ? "Current"
                : "Auto"}
            </span>
          </Label>
          <Popover modal={true}>
            <PopoverTrigger>
              <Label
                class名称="h-[35px] frosted rounded-md flex items-center justify-center px-2 gap-2 outline-2 outline-transparent cursor-pointer"
                title="Set icon by link"
              >
                <FontAwesomeIcon icon={faPaperclip} />
                <span>Link</span>
              </Label>
            </PopoverTrigger>

            <PopoverContent class名称="frosted p-3 text-foreground w-[300px]">
              <div class名称="flex flex-col gap-2">
                <Label htmlFor="iconUrl">Icon URL</Label>
                <Input
                  id="iconUrl"
                  name="iconUrl"
                  placeholder="https://example.com/icon.svg"
                  class名称="frosted"
                  defaultValue={icon?.url ?? ""}
                  onChange={(e) => {
                    const url = e.target.value;
                    setIcon({ iconSet: "custom", url });
                    setIcon编辑ed(true);

                    const hidden = document.querySelector<HTMLInputElement>('input[name="icon"]');
                    if (hidden) hidden.value = url;
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>

          <Popover modal={true} open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
              <Label
                key={name}
                class名称="h-[35px] frosted rounded-md flex items-center justify-center px-2 gap-2 outline-2 outline-transparent has-checked:outline-(--primary)"
              >
                <FontAwesomeIcon icon={faEllipsisV} />
                <span>Icon Picker</span>
              </Label>
            </PopoverTrigger>
            <PopoverContent class名称="frosted text-foreground">
              <IconPickerComponent
                initialIcons={icons}
                onSelect={(iconObj) => {
                  setIcon(iconObj);
                  setIcon编辑ed(true);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="icon" value={icon?.url ?? ""} />
        </RadioGroup>
        <div class名称="mt-3 flex items-center gap-2">
          <Switch
            id="status-checks"
            checked={statusCheck}
            onCheckedChange={(v) => set状态Check(Boolean(v))}
          />
          <Label htmlFor="status-checks" class名称="text-sm">
            状态 checks
          </Label>
        </div>
        {statusCheck && (
          <div class名称="mt-3 space-y-2 rounded-md frosted p-2">
            <div class名称="space-y-1">
              <Label htmlFor="status-check-endpoint" class名称="text-sm">Endpoint override</Label>
              <Input
                id="status-check-endpoint"
                class名称="frosted"
                placeholder="defaults to link URL"
                value={statusCheckEndpoint}
                onChange={(e) => set状态CheckEndpoint(e.target.value)}
              />
            </div>

            <div class名称="space-y-1">
              <Label class名称="text-sm">Method</Label>
              <Select value={statusCheckMethod} onValueChange={(value) => set状态CheckMethod(value as 状态CheckMethod)}>
                <SelectTrigger class名称="rounded-md bg-white border-0 frosted">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent class名称="frosted text-white">
                  {(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as 状态CheckMethod[]).map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div class名称="space-y-1">
              <Label class名称="text-sm">Auth</Label>
              <Select value={statusCheckAuthType} onValueChange={(value) => set状态CheckAuthType(value as "none" | "bearer" | "basic" | "header") }>
                <SelectTrigger class名称="rounded-md bg-white border-0 frosted">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent class名称="frosted text-white">
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="bearer">Bearer token</SelectItem>
                  <SelectItem value="basic">Basic auth</SelectItem>
                  <SelectItem value="header">Custom header</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {statusCheckAuthType === "bearer" && (
              <div class名称="space-y-1">
                <Label htmlFor="status-check-bearer" class名称="text-sm">Bearer token</Label>
                <Input
                  id="status-check-bearer"
                  class名称="frosted"
                  placeholder="token"
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                />
              </div>
            )}

            {statusCheckAuthType === "basic" && (
              <div class名称="grid grid-cols-2 gap-2">
                <div class名称="space-y-1">
                  <Label htmlFor="status-check-basic-user" class名称="text-sm">用户名</Label>
                  <Input
                    id="status-check-basic-user"
                    class名称="frosted"
                    placeholder="user"
                    value={basic用户名}
                    onChange={(e) => setBasic用户名(e.target.value)}
                  />
                </div>
                <div class名称="space-y-1">
                  <Label htmlFor="status-check-basic-pass" class名称="text-sm">密码</Label>
                  <Input
                    id="status-check-basic-pass"
                    type="password"
                    class名称="frosted"
                    placeholder="password"
                    value={basic密码}
                    onChange={(e) => setBasic密码(e.target.value)}
                  />
                </div>
              </div>
            )}

            {statusCheckAuthType === "header" && (
              <div class名称="grid grid-cols-2 gap-2">
                <div class名称="space-y-1">
                  <Label htmlFor="status-check-header-name" class名称="text-sm">Header name</Label>
                  <Input
                    id="status-check-header-name"
                    class名称="frosted"
                    placeholder="X-API-Key"
                    value={customHeader名称}
                    onChange={(e) => setCustomHeader名称(e.target.value)}
                  />
                </div>
                <div class名称="space-y-1">
                  <Label htmlFor="status-check-header-value" class名称="text-sm">Header value</Label>
                  <Input
                    id="status-check-header-value"
                    class名称="frosted"
                    placeholder="value"
                    value={customHeaderValue}
                    onChange={(e) => setCustomHeaderValue(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div class名称="space-y-1">
              <Label htmlFor="status-check-up-codes" class名称="text-sm">Show as up (status codes)</Label>
              <Input
                id="status-check-up-codes"
                class名称="frosted"
                placeholder="200,201,202,204,301,302,304"
                value={statusCheckShowAsUpRaw}
                onChange={(e) => set状态CheckShowAsUpRaw(e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      <Separator orientation="vertical" class名称="frosted" />

      <section class名称="flex flex-col gap-1.5 justify-center pb-10">
        <div class名称="flex gap-2 justify-between items-center">
          <Label class名称="font-medium">Link Group</Label>
          <Select
            defaultValue={link?.linkGroup}
            onValueChange={(v) => setLinkGroup(v)}
          >
            <SelectTrigger class名称="rounded-full bg-white border-0 frosted">
              <SelectValue placeholder="Link Group" />
            </SelectTrigger>
            <SelectContent class名称="frosted text-white">
              {linkGroups.map((grp) => (
                <SelectItem key={grp} value={grp}>
                  {grp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div class名称="flex gap-4 justify-between items-center">
          <Label class名称="font-medium">Folder</Label>
          <Input
            type="text"
            placeholder="optional"
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            class名称="frosted w-36"
          />
        </div>

        <div class名称="mt-4">
          <p class名称="text-xs text-gray-400 mb-1">
            Preview {is编辑ing && "(编辑ing)"}
          </p>
          <div class名称="group flex flex-col items-center justify-between space-y-2 frosted rounded-2xl p-2 min-h-18 w-[120px] mx-auto">
            {icon?.iconSet === "mono" ? (
              <div
                class名称="h-[35px] w-[35px] bg-white group-hover:bg-(--primary) transition"
                style={{
                  maskImage: `url(${icon.url})`,
                  WebkitMaskImage: `url(${icon.url})`,
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
              />
            ) : icon?.url ? (
              <img
                src={icon.url}
                alt={icon?.name ?? "Custom Icon"}
                class名称="h-[35px] w-[35px] object-contain"
              />
            ) : null}
            <span class名称="text-sm text-white">{name || "Link name"}</span>
          </div>
        </div>
      </section>

      <div class名称="col-span-3 mt-2 flex gap-2 justify-end absolute bottom-2 right-2">
        {error && <p class名称="text-red-500">{error}</p>}
        {!is编辑ing && (
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={handle添加Another}
          >
            添加 Another
          </Button>
        )}

        <Button type="submit" disabled={loading}>
          {loading
            ? is编辑ing
              ? "Saving..."
              : "添加ing..."
            : is编辑ing
              ? "保存"
              : "添加"}
        </Button>
      </div>
    </form>
  );
}

async function getIcon(
  name?: string,
  linkUrl?: string
): Promise<IconResult | null> {
  const testImage = (src: string): Promise<boolean> =>
    new Promise((resolve) => {
      if (!src) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });

  const normalizeUrl = (raw?: string) => {
    if (!raw) return null;
    try {
      return new URL(raw.includes("://") ? raw : `https://${raw}`);
    } catch {
      return null;
    }
  };


  if (name) {
    const safe名称 = name.trim().replace(/\s+/g, "-").toLowerCase();
    if (safe名称) {
      const autoIcon = `/icons/svg/${safe名称}-light.svg`;
      if (await testImage(autoIcon)) {
        return { iconSet: "custom", url: autoIcon };
      }
    }
  }

  const parsed = normalizeUrl(linkUrl);
  if (parsed) {
    const favicon = `${parsed.origin}/favicon.ico`;
    if (await testImage(favicon)) {
      return { iconSet: "custom", url: favicon };
    }

    const googleFavicon = `https://www.google.com/s2/favicons?sz=128&domain=${parsed.hostname}`;
    if (await testImage(googleFavicon)) {
      return { iconSet: "custom", url: googleFavicon };
    }
  }

  return null;
}

export function Icon({
  url,
  name,
  set,
}: {
  url: string;
  set: string | null;
  name: string | null;
}) {
  if (!url || url == "undefined") {
    return (
      <div
        class名称="bg-white rounded-md opacity-30 h-[22px] w-[22px]"
        aria-label="icon placeholder"
      />
    );
  }

  return set === "mono" ? (
    <div
      class名称="bg-white h-[22px] w-[22px]"
      style={{
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  ) : (
    <img
      src={url}
      alt={name ?? ""}
      class名称="h-[22px] w-[22px] object-contain"
    />
  );
}

function generateRandomId(length = 8) {
  return Math.random().toString(36).substr(2, length);
}

function parse状态CodeList(raw: string): number[] {
  return raw
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter((code) => Number.isInteger(code) && code >= 100 && code <= 599);
}

function parse状态CheckAuth(raw: unknown): 状态CheckAuth | undefined {
  if (!raw) return undefined;

  let parsed: any = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  if (!parsed || typeof parsed !== "object") return undefined;

  if (parsed.type === "bearer" && typeof parsed.token === "string") {
    return { type: "bearer", token: parsed.token };
  }

  if (parsed.type === "basic" && typeof parsed.username === "string") {
    return {
      type: "basic",
      username: parsed.username,
      password: typeof parsed.password === "string" ? parsed.password : "",
    };
  }

  if (parsed.type === "header" && typeof parsed.name === "string") {
    return {
      type: "header",
      name: parsed.name,
      value: typeof parsed.value === "string" ? parsed.value : "",
    };
  }

  return undefined;
}
