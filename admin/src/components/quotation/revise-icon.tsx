import React from "react";
import { FileClock } from "lucide-react";

interface ReviseIconProps {
  className?: string;
}

/**
 * Clean, minimal revise document icon matching Lucide stroke weight.
 */
export const ReviseIcon: React.FC<ReviseIconProps> = ({ className = "w-4 h-4" }) => (
  <FileClock className={className} aria-hidden="true" />
);
