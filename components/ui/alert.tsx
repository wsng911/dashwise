import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  class名称,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      class名称={cn(alertVariants({ variant }), class名称)}
      {...props}
    />
  )
}

function AlertTitle({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      class名称={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        class名称
      )}
      {...props}
    />
  )
}

function Alert描述({
  class名称,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      class名称={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        class名称
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, Alert描述 }
