"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { 搜索Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  Dialog描述,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  class名称,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      class名称={cn(
        "frosted text-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        class名称
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "搜索 for a command to run...",
  children,
  class名称,
  show关闭Button = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  class名称?: string
  show关闭Button?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader class名称="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <Dialog描述>{description}</Dialog描述>
      </DialogHeader>
      <DialogContent
        class名称={cn("overflow-hidden p-0", class名称)}
        show关闭Button={show关闭Button}
      >
        <Command class名称="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  class名称,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      class名称="flex h-9 items-center gap-2 border-b border-b-white/20 px-3"
    >
      <搜索Icon class名称="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        class名称={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          class名称
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  class名称,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      class名称={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        class名称
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      class名称="py-6 text-center text-sm"
      {...props}
    />
  )
}

function CommandGroup({
  class名称,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      class名称={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        class名称
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  class名称,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      class名称={cn("frosted -mx-1 h-px", class名称)}
      {...props}
    />
  )
}

function CommandItem({
  class名称,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      class名称={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        class名称
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  class名称,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      class名称={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        class名称
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
