"use client";

import * as React from "react";
import { cn } from "./utils";

interface LabelProps extends React.ComponentProps<"label"> {
  className?: string;
}

function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none text-gray-900",
        className
      )}
      {...props}
    />
  );
}

export { Label };

