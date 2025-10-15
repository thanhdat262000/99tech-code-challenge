import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}
