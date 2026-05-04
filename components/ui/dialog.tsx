"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function Dialog关闭({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.关闭>) {
  return <DialogPrimitive.关闭 data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  class名称,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      class名称={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        class名称
      )}
      {...props}
    />
  )
}

function DialogContent({
  class名称,
  children,
  show关闭Button = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  show关闭Button?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        class名称={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          class名称
        )}
        {...props}
      >
        {children}
        {show关闭Button && (
          <DialogPrimitive.关闭
            data-slot="dialog-close"
            class名称="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span class名称="sr-only">关闭</span>
          </DialogPrimitive.关闭>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      class名称={cn("flex flex-col gap-2 text-center sm:text-left", class名称)}
      {...props}
    />
  )
}

function DialogFooter({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      class名称={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        class名称
      )}
      {...props}
    />
  )
}

function DialogTitle({
  class名称,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      class名称={cn("text-lg leading-none font-semibold", class名称)}
      {...props}
    />
  )
}

function Dialog描述({
  class名称,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.描述>) {
  return (
    <DialogPrimitive.描述
      data-slot="dialog-description"
      class名称={cn("text-muted-foreground text-sm", class名称)}
      {...props}
    />
  )
}

export {
  Dialog,
  Dialog关闭,
  DialogContent,
  Dialog描述,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
