/**
 * Marmot Asset interfaces.
 *
 * These types mirror the Marmot API response shapes (from openapi-spec.v0.1.json)
 * plus the PortalJS-compatible Dataset/Resource types used by UI components.
 */

// ===== Marmot API Types =====

export interface MarmotAsset {
    id: string;
    name: string;
    mrn: string;
    type: string;
    description?: string;
    user_description?: string;
    providers: string[];
    tags?: string[];
    schema?: Record<string, string>;
    metadata?: Record<string, any>;
    environments?: Record<string, MarmotEnvironment>;
    external_links?: MarmotExternalLink[];
    sources?: MarmotAssetSource[];
    parent_mrn?: string;
    query?: string;
    query_language?: string;
    has_run_history?: boolean;
    is_stub?: boolean;
    created_at: string;
    updated_at: string;
    created_by?: string;
    last_sync_at?: string;
}

export interface MarmotEnvironment {
    name: string;
    path: string;
    metadata?: Record<string, any>;
}

export interface MarmotExternalLink {
    name: string;
    url: string;
    icon?: string;
}

export interface MarmotAssetSource {
    name: string;
    priority: number;
    last_sync_at?: string;
    properties?: Record<string, any>;
}

export interface MarmotSearchResponse {
    assets: MarmotAsset[];
    total: number;
    limit: number;
    offset: number;
    filters?: MarmotAvailableFilters;
}

export interface MarmotAvailableFilters {
    types?: Record<string, number>;
    providers?: Record<string, number>;
    tags?: Record<string, number>;
}

export interface MarmotAssetSummary {
    types: Record<string, number>;
    services: Record<string, number>;
    tags: Record<string, number>;
}

// ===== PortalJS-Compatible Types =====

/**
 * Dataset interface that bridges Marmot assets to PortalJS components.
 * Extends the minimum CKAN Dataset shape with Marmot-specific fields.
 */
export interface Dataset {
    id: string;
    name: string;
    title: string;
    notes: string;
    metadata_modified: string;
    version?: string;
    resources: Resource[];
    organization: DatasetOrganization | null;
    tags: { display_name: string }[];
    activity_stream?: any[];

    // Marmot-specific extensions
    asset_type?: string;
    providers?: string[];
    schema?: Record<string, string>;
    metadata?: Record<string, any>;
    external_links?: MarmotExternalLink[];
    has_run_history?: boolean;
}

export interface DatasetOrganization {
    id: string;
    name: string;
    title: string;
    display_name: string;
    description: string;
    is_organization: boolean;
    type: string;
    state: string;
    package_count: number;
    image_display_url?: string;
}

export interface Resource {
    id: string;
    name: string;
    format: string;
    description: string | null;
    url?: string;
    metadata_modified?: string;
    extras?: Record<string, any>;
}

/**
 * Search options compatible with the OMD starter's PackageSearchOptions.
 */
export interface PackageSearchOptions {
    query?: string;
    offset?: number;
    limit?: number;
    sort?: string;
    tags?: string[];
    groups?: string[];
    orgs?: string[];
    resFormat?: string[];
    fq?: string;
    type?: string;
}
