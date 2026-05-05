import * as React from "react"

import { cn } from "@/shared/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-xl border border-primary/30 bg-black/20 px-4 py-3 text-sm font-bold text-foreground-secondary placeholder:text-input-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0084ff] focus-visible:border-[#0084ff] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
