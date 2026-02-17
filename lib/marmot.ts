/**
 * Marmot API client wrapper.
 *
 * Marmot uses API Key authentication via the `X-API-Key` header.
 * The base URL is configured via `NEXT_PUBLIC_DMS` and the key via `DMS_API_KEY`.
 */
export function marmotFetch({ endpoint }: { endpoint: string }) {
    const baseUrl = process.env.NEXT_PUBLIC_DMS || "http://localhost:8080";
    const apiKey = process.env.DMS_API_KEY || "";

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (apiKey) {
        headers["X-API-Key"] = apiKey;
    }

    return fetch(`${baseUrl}/api/v1/${endpoint}`, { headers });
}

/**
 * POST request to Marmot API.
 */
export function marmotPost({
    endpoint,
    body,
}: {
    endpoint: string;
    body: any;
}) {
    const baseUrl = process.env.NEXT_PUBLIC_DMS || "http://localhost:8080";
    const apiKey = process.env.DMS_API_KEY || "";

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (apiKey) {
        headers["X-API-Key"] = apiKey;
    }

    return fetch(`${baseUrl}/api/v1/${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });
}
