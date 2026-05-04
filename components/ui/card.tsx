import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      class名称={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        class名称
      )}
      {...props}
    />
  )
}

function CardHeader({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      class名称={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        class名称
      )}
      {...props}
    />
  )
}

function CardTitle({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      class名称={cn("leading-none font-semibold", class名称)}
      {...props}
    />
  )
}

function Card描述({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      class名称={cn("text-muted-foreground text-sm", class名称)}
      {...props}
    />
  )
}

function CardAction({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      class名称={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        class名称
      )}
      {...props}
    />
  )
}

function CardContent({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      class名称={cn("px-6", class名称)}
      {...props}
    />
  )
}

function CardFooter({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      class名称={cn("flex items-center px-6 [.border-t]:pt-6", class名称)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  Card描述,
  CardContent,
}
