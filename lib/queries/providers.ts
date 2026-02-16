/**
 * Marmot Provider Queries
 *
 * In Marmot, providers (e.g. "postgres", "kafka", "s3") are the equivalent
 * of OpenMetadata Domains. They are derived from asset metadata rather than
 * being first-class entities with their own CRUD endpoints.
 *
 * We synthesize organization-like objects from the asset summary endpoint
 * `/api/v1/assets/summary` which returns counts by service/provider.
 */

import { Organization } from "@portaljs/ckan";
import { marmotFetch } from "../marmot";
import { searchAssets, assetToDataset } from "./assets";

// ---------------------------------------------------------------------------
// List all providers as "organizations"
// ---------------------------------------------------------------------------
export async function getAllProviders(): Promise<Organization[]> {
    const endpoint = "assets/summary";
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            console.error(`getAllProviders error: ${res.status} ${res.statusText}`);
            return [];
        }
        const data = await res.json();

        // data.providers is a map of { "PostgreSQL": 7, "Kafka": 3, ... }
        const services: Record<string, number> = data.providers || {};

        return Object.entries(services).map(([name, count]) =>
            providerToOrg(name, count as number)
        );
    } catch (error) {
        console.error("getAllProviders exception:", error);
        return [];
    }
}

// Alias for backward compatibility with OMD starter
export const getAllDomains = getAllProviders;
export const getAllOrganizations = async ({ detailed }: { detailed?: boolean } = {}) => {
    return getAllProviders();
};

// ---------------------------------------------------------------------------
// Get a single provider with its assets
// ---------------------------------------------------------------------------
export async function getProvider({
    name,
}: {
    name: string;
}): Promise<Organization> {
    // Get assets for this provider
    const searchResult = await searchAssets({
        orgs: [name],
        limit: 50,
        offset: 0,
        tags: [],
        groups: [],
    });

    const org = providerToOrg(name, searchResult.count);
    org.packages = searchResult.datasets;
    org.package_count = searchResult.count;

    return org;
}

// Alias
export const getDomain = getProvider;
export const getOrganization = async ({ name }: { name: string }) => {
    return getProvider({ name });
};

// ---------------------------------------------------------------------------
// Get assets for a provider
// ---------------------------------------------------------------------------
export async function getProviderAssets(
    provider: string
): Promise<any[]> {
    const result = await searchAssets({
        orgs: [provider],
        limit: 100,
        offset: 0,
        tags: [],
        groups: [],
    });
    return result.datasets;
}

export const getDomainDataProducts = getProviderAssets;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function providerToOrg(name: string, packageCount: number = 0): Organization {
    return {
        id: name,
        name: name,
        title: capitalizeProvider(name),
        display_name: capitalizeProvider(name),
        description: `Data assets from ${capitalizeProvider(name)}`,
        package_count: packageCount,
        is_organization: true,
        type: "organization",
        state: "active",
    };
}

// Re-export for backward compat
export const domainToOrg = providerToOrg;

function capitalizeProvider(name: string): string {
    const brandMap: Record<string, string> = {
        postgres: "PostgreSQL",
        postgresql: "PostgreSQL",
        mysql: "MySQL",
        kafka: "Kafka",
        "confluent-cloud": "Confluent Cloud",
        s3: "Amazon S3",
        gcs: "Google Cloud Storage",
        bigquery: "BigQuery",
        clickhouse: "ClickHouse",
        mongodb: "MongoDB",
        redis: "Redis",
        nats: "NATS",
        sqs: "Amazon SQS",
        sns: "Amazon SNS",
        airflow: "Apache Airflow",
        dbt: "dbt",
    };

    return (
        brandMap[name.toLowerCase()] ||
        name.charAt(0).toUpperCase() + name.slice(1)
    );
}
