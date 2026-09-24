import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes so a later class wins over an earlier one in the same group. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
