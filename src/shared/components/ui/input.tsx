import * as React from "react"
import { cn } from "@/shared/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 text-sm font-bold text-foreground-secondary placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0084ff] focus-visible:border-[#0084ff] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
