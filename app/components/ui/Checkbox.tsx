"use client";

import * as React from "react";
import { cn } from "./utils";

interface CheckboxProps extends React.ComponentProps<"input"> {
  className?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({ 
  className, 
  checked, 
  onCheckedChange,
  ...props 
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      className={cn(
        "h-4 w-4 rounded border-gray-300 text-[#1A2C6D]",
        "focus:ring-2 focus:ring-[#1A2C6D]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Checkbox };

