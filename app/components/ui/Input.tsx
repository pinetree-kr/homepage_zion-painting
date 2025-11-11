import * as React from "react";
import { cn } from "./utils";

interface InputProps extends React.ComponentProps<"input"> {
  className?: string;
}

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-base transition-colors",
        "placeholder:text-gray-400",
        "focus:border-[#1A2C6D] focus:outline-none focus:ring-2 focus:ring-[#1A2C6D]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };

