import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-rock/30 bg-cream px-3 py-2 text-sm ring-offset-cream file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-rock/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plateau focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
