import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(score: number): string {
  if (score < 30) return "#10b981"; // green
  if (score < 60) return "#f59e0b"; // yellow/orange
  if (score < 80) return "#ef4444"; // red
  return "#7f1d1d"; // dark red
}

export function getRiskLabel(score: number): string {
  if (score < 30) return "Low Risk";
  if (score < 60) return "Moderate Risk";
  if (score < 80) return "High Risk";
  return "Critical Risk";
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
