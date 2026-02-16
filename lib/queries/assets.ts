/**
 * Marmot Asset Queries
 *
 * Maps Marmot's asset API to the PortalJS data structures (Dataset, Resource, etc.)
 * maintaining compatibility with the existing component layer.
 *
 * Marmot API reference:
 *   - Search:  GET /api/v1/assets/search?q=&types=&services=&tags=&limit=&offset=&calculateCounts=true
 *   - Detail:  GET /api/v1/assets/{id}
 *   - Summary: GET /api/v1/assets/summary
 */

import { marmotFetch } from "../marmot";
import {
    MarmotAsset,
    MarmotSearchResponse,
    MarmotAssetSummary,
    Dataset,
    Resource,
    PackageSearchOptions,
} from "@/schemas/asset.interface";

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------
export async function searchAssets(options: PackageSearchOptions) {
    const queryParams: string[] = [];

    if (options?.query) {
        queryParams.push(`q=${encodeURIComponent(options.query)}`);
    }

    if (options?.offset !== undefined) {
        queryParams.push(`offset=${options.offset}`);
    }

    if (options?.limit !== undefined) {
        queryParams.push(`limit=${options.limit}`);
    }

    // Type filters
    if (options?.resFormat?.length) {
        queryParams.push(`types=${options.resFormat.join(",")}`);
    }

    // Provider / service filters (maps to OMD "orgs")
    if (options?.orgs?.length) {
        queryParams.push(`services=${options.orgs.join(",")}`);
    }

    // Tag filters
    if (options?.tags?.length) {
        queryParams.push(`tags=${options.tags.join(",")}`);
    }

    // Always request filter counts for faceted navigation
    queryParams.push("calculateCounts=true");

    const endpoint = `assets/search?${queryParams.join("&")}`;

    try {
        const res = await marmotFetch({ endpoint });

        if (!res.ok) {
            console.error(`searchAssets error: ${res.status} ${res.statusText}`);
            return emptySearchResult();
        }

        const data: MarmotSearchResponse = await res.json();

        // Map to PortalJS-compatible structure
        const datasets = (data.assets || []).map(assetToDataset);

        const search_facets = {
            organization: {
                title: "organization",
                items: mapFilterEntries(data.filters?.providers),
            },
            tags: {
                title: "tags",
                items: mapFilterEntries(data.filters?.tags),
            },
            res_format: {
                title: "res_format",
                items: mapFilterEntries(data.filters?.types),
            },
        };

        return {
            count: data.total ?? 0,
            datasets,
            search_facets,
        };
    } catch (error) {
        console.error("searchAssets exception:", error);
        return emptySearchResult();
    }
}

// Alias for backward compatibility with OMD-style function names
export const searchDatasets = searchAssets;
export const searchDataProducts = searchAssets;

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------
export async function getAsset({ id }: { id: string }) {
    const endpoint = `assets/${id}`;
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            console.error(`getAsset error: ${res.status} ${res.statusText}`);
            return null;
        }
        const data: MarmotAsset = await res.json();
        return assetToDataset(data);
    } catch (error) {
        console.error("getAsset exception:", error);
        return null;
    }
}

// Alias
export const getDataProduct = async (name: string) => {
    // In Marmot, we look up by qualified name
    const endpoint = `assets/qualified-name/${encodeURIComponent(name)}`;
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            console.error(`getDataProduct error: ${res.status} ${res.statusText}`);
            // Fallback: try by ID if name lookup fails
            return getAsset({ id: name });
        }
        const data: MarmotAsset = await res.json();
        const dataset = assetToDataset(data);
        dataset.activity_stream = [];
        return dataset;
    } catch (error) {
        console.error("getDataProduct exception:", error);
        return null;
    }
};

export const getDataset = async ({ name }: { name: string }) => {
    return getDataProduct(name);
};

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
export async function getAssetSummary(): Promise<MarmotAssetSummary> {
    const endpoint = "assets/summary";
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            return { types: {}, services: {}, tags: {} };
        }
        return res.json();
    } catch {
        return { types: {}, services: {}, tags: {} };
    }
}

// ---------------------------------------------------------------------------
// Glossary (kept here for backward compat – also available in glossary.ts)
// ---------------------------------------------------------------------------
export async function listGlossaries() {
    const endpoint = "glossary/list?limit=100";
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            console.error(`listGlossaries error: ${res.status} ${res.statusText}`);
            return { data: [] };
        }
        const data = await res.json();
        return {
            data: (data.terms || []).map((t: any) => ({
                id: t.id,
                name: t.name,
                displayName: t.name,
                description: t.definition || t.description || "",
            })),
        };
    } catch (error) {
        console.error("listGlossaries exception:", error);
        return { data: [] };
    }
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Convert a Marmot Asset to the PortalJS Dataset shape.
 * This is the key adapter that keeps the existing UI components working.
 */
export function assetToDataset(asset: MarmotAsset): Dataset {
    const provider =
        asset.providers && asset.providers.length > 0 ? asset.providers[0] : null;

    return {
        id: asset.id,
        name: asset.id,  // Use UUID for URL routing (MRN contains :// which breaks Next.js router)
        title: asset.name,
        notes: asset.description || asset.user_description || "",
        metadata_modified: asset.updated_at || asset.created_at || new Date().toISOString(),
        version: "1.0",
        resources: buildResources(asset),
        organization: provider
            ? {
                id: provider,
                name: provider,
                title: provider,
                display_name: provider,
                description: `Provider: ${provider}`,
                is_organization: true,
                type: "organization",
                state: "active",
                package_count: 0,
            }
            : null,
        tags:
            asset.tags?.map((t) => ({ display_name: t })) || [],
        // Extra Marmot-specific fields
        asset_type: asset.type,
        providers: asset.providers || [],
        schema: asset.schema || {},
        metadata: asset.metadata || {},
        external_links: asset.external_links || [],
        has_run_history: asset.has_run_history || false,
    };
}

function buildResources(asset: MarmotAsset): Resource[] {
    const resources: Resource[] = [];

    // If the asset has a schema, represent each field as a "resource"
    if (asset.schema && Object.keys(asset.schema).length > 0) {
        resources.push({
            id: `${asset.id}-schema`,
            name: `${asset.name} schema`,
            format: asset.type || "schema",
            description: `Schema with ${Object.keys(asset.schema).length} fields`,
        });
    }

    // Add external links as resources
    if (asset.external_links) {
        asset.external_links.forEach((link): void => {
            resources.push({
                id: `${asset.id}-link-${link.name}`,
                name: link.name,
                format: "link",
                description: link.url,
                url: link.url,
            });
        });
    }

    return resources;
}

function mapFilterEntries(
    entries?: Record<string, number>
): { name: string; display_name: string; count: number }[] {
    if (!entries) return [];
    return Object.entries(entries).map(([key, count]) => ({
        name: key,
        display_name: key,
        count,
    }));
}

function emptySearchResult() {
    return {
        count: 0,
        datasets: [],
        search_facets: {
            organization: { title: "organization", items: [] },
            tags: { title: "tags", items: [] },
            res_format: { title: "res_format", items: [] },
        },
    };
}
