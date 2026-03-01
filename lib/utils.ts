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

export function getRelativeTime(date: Date | string) {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export function getSeverityColor(severity: string) {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return "text-red-600 bg-red-50 border-red-200";
    case "HIGH":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "MEDIUM":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "LOW":
      return "text-green-600 bg-green-50 border-green-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getStatusColor(status: string) {
  switch (status?.toUpperCase()) {
    case "VERIFIED":
    case "APPROVED":
    case "COMPLETED":
      return "text-green-700 bg-green-50 border-green-200";
    case "DISPATCHED":
    case "IN_PROGRESS":
    case "ACTIVE":
      return "text-blue-700 bg-blue-50 border-blue-200";
    case "UNVERIFIED":
    case "PENDING_APPROVAL":
    case "PENDING":
      return "text-yellow-700 bg-yellow-50 border-yellow-200";
    case "WARD_NOTIFIED":
      return "text-purple-700 bg-purple-50 border-purple-200";
    case "REJECTED":
    case "FAKE":
      return "text-red-700 bg-red-50 border-red-200";
    case "RESOLVED":
      return "text-gray-700 bg-gray-50 border-gray-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
}

export function getDisasterIcon(type: string) {
  switch (type?.toLowerCase()) {
    case "flood":
      return "🌊";
    case "cyclone":
      return "🌀";
    case "earthquake":
      return "🌍";
    case "landslide":
      return "⛰️";
    case "drought":
      return "☀️";
    case "fire":
      return "🔥";
    case "forest_fire":
      return "🔥";
    case "heatwave":
      return "🌡️";
    default:
      return "⚠️";
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatCoordinates(lat: number, lon: number) {
  return `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
}
