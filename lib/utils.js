import { clsx } from "clsx"; // Removed 'type ClassValue'
import { twMerge } from "tailwind-merge";

// Removed ': ClassValue[]' type annotation from inputs
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
