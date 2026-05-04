import { faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { url } from "inspector";
import React from "react";

interface WidgetColumnTemplateProps {
  children: React.ReactNode;
  class名称?: string;
  title?: string;
  url?: string;
  iconUrl?: string;
}

export default function WidgetColumnTemplate({ children, class名称 = "", title = "", url = "", iconUrl = "" }: WidgetColumnTemplateProps) {
  return (
    <div class名称={`rounded-lg p-2 justify-center ${class名称} flex-col`}>

        {(title || iconUrl) && (
        <a
          href={url || "#"}
          class名称="font-medium mb-1 grid grid-cols-[18px_1fr_16px] w-full text-start items-center gap-2"
        >
          {iconUrl && (
            <img src={iconUrl} class名称="h-4 mx-0.5" />
          )}

          <p class名称="font-semibold">{title}</p>

          {url && (
            <FontAwesomeIcon
              icon={faUpRightFromSquare}
              class名称="text-xs hover:text-(--primary)"
            />
          )}
        </a>
      )}
      <div
        class名称="grid auto-cols-fr grid-flow-col gap-2 text-center"
      >
        {children}
      </div>
    </div>
  );
}
