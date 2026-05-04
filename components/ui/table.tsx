"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ class名称, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      class名称="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        class名称={cn("w-full caption-bottom text-sm", class名称)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ class名称, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      class名称={cn("[&_tr]:border-b", class名称)}
      {...props}
    />
  )
}

function TableBody({ class名称, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      class名称={cn("[&_tr:last-child]:border-0", class名称)}
      {...props}
    />
  )
}

function TableFooter({ class名称, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      class名称={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        class名称
      )}
      {...props}
    />
  )
}

function TableRow({ class名称, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      class名称={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        class名称
      )}
      {...props}
    />
  )
}

function TableHead({ class名称, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      class名称={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        class名称
      )}
      {...props}
    />
  )
}

function TableCell({ class名称, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      class名称={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        class名称
      )}
      {...props}
    />
  )
}

function TableCaption({
  class名称,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      class名称={cn("text-muted-foreground mt-4 text-sm", class名称)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
