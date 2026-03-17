import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: any, defaultMessage: string = "An error occurred"): string {
  if (!error) return defaultMessage;

  const detail = error.response?.data?.detail;

  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    return detail.map((d: any) => {
      if (typeof d === 'string') return d;
      return d.msg || JSON.stringify(d);
    }).join(", ");
  }

  if (detail && typeof detail === 'object') {
    return detail.msg || JSON.stringify(detail);
  }

  return error.message || defaultMessage;
}

export function getMediaUrl(url: string | null | undefined, fallback?: string): string {
  if (!url) return fallback || "";
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  
  // Use the Vite env variable for the API base URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';
  
  // If it starts with /media, prefix with the backend URL
  if (url.startsWith('/media')) {
    return `${baseUrl}${url}`;
  }
  
  return url;
}
