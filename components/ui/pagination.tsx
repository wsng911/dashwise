import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants, type Button } from "@/components/ui/button"

function Pagination({ class名称, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      class名称={cn("mx-auto flex w-full justify-center", class名称)}
      {...props}
    />
  )
}

function PaginationContent({
  class名称,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      class名称={cn("flex flex-row items-center gap-1", class名称)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">

function PaginationLink({
  class名称,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      class名称={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        class名称
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  class名称,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      class名称={cn("gap-1 px-2.5 sm:pl-2.5", class名称)}
      {...props}
    >
      <ChevronLeftIcon />
      <span class名称="hidden sm:block">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  class名称,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      class名称={cn("gap-1 px-2.5 sm:pr-2.5", class名称)}
      {...props}
    >
      <span class名称="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  class名称,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      class名称={cn("flex size-9 items-center justify-center", class名称)}
      {...props}
    >
      <MoreHorizontalIcon class名称="size-4" />
      <span class名称="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
