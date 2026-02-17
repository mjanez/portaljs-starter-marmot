import { format } from "timeago.js";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getDatasetName(name: string) {
    // In Marmot, asset names are plain strings without org prefixes
    return name;
}

export function getTimeAgo(timestamp: string) {
    const trimmed = timestamp.trim();
    const hasTZ = /Z$|[+-]\d{2}:\d{2}$/.test(trimmed);
    const normalised = hasTZ ? trimmed : `${trimmed}Z`;

    const date = new Date(normalised);
    if (isNaN(date.getTime())) {
        return timestamp;
    }

    return format(date);
}

export function capitalizeFirstLetter(str: string) {
    if (str.length === 0) {
        return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format an asset type label for display.
 * e.g. "table" -> "Table", "s3_bucket" -> "S3 Bucket"
 */
export function formatAssetType(type: string): string {
    return type
        .split("_")
        .map((w) => capitalizeFirstLetter(w))
        .join(" ");
}

/**
 * Get a color class for an asset type badge.
 */
export function getAssetTypeColor(type: string): string {
    const colorMap: Record<string, string> = {
        table: "bg-blue-100 text-blue-800",
        topic: "bg-purple-100 text-purple-800",
        bucket: "bg-green-100 text-green-800",
        queue: "bg-orange-100 text-orange-800",
        api: "bg-pink-100 text-pink-800",
        view: "bg-indigo-100 text-indigo-800",
        dashboard: "bg-yellow-100 text-yellow-800",
        job: "bg-red-100 text-red-800",
        pipeline: "bg-teal-100 text-teal-800",
        database: "bg-cyan-100 text-cyan-800",
    };
    return colorMap[type?.toLowerCase()] || "bg-gray-100 text-gray-800";
}
