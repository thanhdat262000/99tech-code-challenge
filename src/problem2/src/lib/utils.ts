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

export const formatNumber = (num: number): string => {
  // Check if the number has decimal places
  if (num % 1 === 0) {
    // No decimal places, return as integer
    return num.toString();
  }

  // Convert to string to analyze decimal part
  const numStr = num.toString();
  const decimalPart = numStr.split(".")[1];

  if (!decimalPart) {
    return num.toString();
  }

  // Find the first zero in decimal part
  const firstZeroIndex = decimalPart.lastIndexOf("0");

  if (firstZeroIndex !== -1 && firstZeroIndex <= 4) {
    // Has zero in decimal part - show at least 4 digits after the first zero
    const minDigitsNeeded = firstZeroIndex + 1 + 4; // position of zero + 1 + 4 more digits
    const currentDecimalLength = decimalPart.length;

    if (currentDecimalLength >= minDigitsNeeded) {
      // Already has enough digits
      return num.toFixed(minDigitsNeeded);
    } else {
      // Need to show more precision
      return num.toFixed(currentDecimalLength);
    }
  } else {
    // No zero in decimal part - show exactly 4 decimal digits
    return num.toFixed(4);
  }
};
