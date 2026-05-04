import { cn } from "@/lib/utils"

function Skeleton({ class名称, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      class名称={cn("bg-accent animate-pulse rounded-md", class名称)}
      {...props}
    />
  )
}

export { Skeleton }
