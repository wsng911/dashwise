"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConfig } from "@/context/ConfigContext";
import { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { faBrush, faChartLine, faCircleUser, faCircleXmark, faDisplay, faGripLines, faMagnifyingGlass, faPaperclip, faPuzzlePiece, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const navItems = [
  { href: "/settings/account", label: "Account", icon: faCircleUser },
  { href: "/settings/appearance", label: "Appearance", icon: faBrush },
  { href: "/settings/screensaver", label: "Screensaver", icon: faDisplay },
  { href: "/settings/glanceables", label: "Glanceables", icon: faGripLines },
  { href: "/settings/links", label: "Links", icon: faPaperclip },
  { href: "/settings/search", label: "搜索", icon: faMagnifyingGlass },
  { href: "/settings/integrations", label: "Integrations", icon: faPuzzlePiece },
  { href: "/settings/widgets", label: "Widgets", icon: faChartLine },
  { href: "/settings/general", label: "General", icon: faSliders },
];

export default function 设置Layout({ children }: { children: React.ReactNode }) {
  const { config, refreshConfig } = useConfig();
  const pathname = usePathname();
  const activeBgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const activeEl = document.querySelector<HTMLElement>(`.settings-label-div[data-href="${pathname}"]`);
    if (activeEl && activeBgRef.current) {
      const { offsetTop, offsetHeight } = activeEl;
      activeBgRef.current.style.top = offsetTop + "px";
      activeBgRef.current.style.height = offsetHeight + "px";
    }
  }, [pathname]);

  return (
    <div class名称="flex h-dvh bg-(--surface) text-white p-4">
      <div class名称="w-[30%]">
        <h1 class名称="scroll-m-20 text-4xl font-bold tracking-tight text-balance">设置</h1>

        <div class名称="relative flex flex-col h-[calc(100%-35px)] justify-between py-4">
          <div class名称="space-y-1">
            <div
              ref={activeBgRef}
              class名称="absolute left-0 w-[90%] rounded-md bg-white/20 transition-all duration-300"
              style={{ zIndex: 0 }}
            />

            {navItems.map((item) => (
              <Link key={item.href} href={item.href} class名称="block group">
                <div
                  class名称={`flex items-center space-x-2 p-2 settings-label-div round-md relative ${pathname === item.href ? "font-bold" : ""
                    }`}
                  data-href={item.href}
                >
                  <FontAwesomeIcon icon={item.icon} class名称="text-lg group-hover:text-(--primary)" />
                  <Label>{item.label}</Label>
                </div>
              </Link>
            ))}
          </div>

          <Link key="/home" href="/home" class名称="block group">
            <div
              class名称={`flex items-center space-x-2 p-2 settings-label-div round-md relative`}
              data-href="/home"
            >
              <FontAwesomeIcon icon={faCircleXmark} class名称=" group-hover:text-(--primary)"/>
              <Label>关闭</Label>
            </div>
          </Link>
        </div>

      </div>

      <div class名称="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
