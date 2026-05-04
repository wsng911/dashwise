import React from "react";
import { WidgetItemProps } from "../Widget";

interface PlaceholderWidgetProps extends WidgetItemProps{
}

export default function PlaceholderWidget({ class名称 = "flex items-center justify-center" }: PlaceholderWidgetProps) {
  return (
    <div class名称={class名称}>
      This is a placeholder
    </div>
  );
}
