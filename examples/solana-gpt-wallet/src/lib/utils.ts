import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function shortenAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function formatSOL(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 9
    }).format(amount)
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));