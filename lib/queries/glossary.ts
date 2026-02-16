/**
 * Marmot Glossary Queries
 *
 * Marmot API reference:
 *   - List:   GET /api/v1/glossary/list?limit=&offset=
 *   - Search: GET /api/v1/glossary/search?q=&limit=&offset=
 *   - Detail: GET /api/v1/glossary/{id}
 *   - Children: GET /api/v1/glossary/children/{id}
 *   - Ancestors: GET /api/v1/glossary/ancestors/{id}
 */

import { marmotFetch } from "../marmot";

export interface MarmotGlossaryTerm {
    id: string;
    name: string;
    definition: string;
    description?: string;
    parent_term_id?: string;
    tags?: string[];
    owners?: {
        id: string;
        name: string;
        username?: string;
        email?: string;
        type: string;
    }[];
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface MarmotGlossaryListResult {
    terms: MarmotGlossaryTerm[];
    total: number;
}

// ---------------------------------------------------------------------------
// List all glossary terms (top-level)
// ---------------------------------------------------------------------------
export async function listGlossaryTerms({
    limit = 100,
    offset = 0,
}: {
    limit?: number;
    offset?: number;
} = {}) {
    const endpoint = `glossary/list?limit=${limit}&offset=${offset}`;
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            console.error(
                `listGlossaryTerms error: ${res.status} ${res.statusText}`
            );
            return { terms: [], total: 0 };
        }
        const data: MarmotGlossaryListResult = await res.json();
        return data;
    } catch (error) {
        console.error("listGlossaryTerms exception:", error);
        return { terms: [], total: 0 };
    }
}

// ---------------------------------------------------------------------------
// Search glossary terms
// ---------------------------------------------------------------------------
export async function searchGlossaryTerms({
    query,
    parentTermId,
    limit = 20,
    offset = 0,
}: {
    query?: string;
    parentTermId?: string;
    limit?: number;
    offset?: number;
}) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (parentTermId) params.set("parent_term_id", parentTermId);
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    const endpoint = `glossary/search?${params.toString()}`;
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            console.error(
                `searchGlossaryTerms error: ${res.status} ${res.statusText}`
            );
            return { terms: [], total: 0 };
        }
        const data: MarmotGlossaryListResult = await res.json();
        return data;
    } catch (error) {
        console.error("searchGlossaryTerms exception:", error);
        return { terms: [], total: 0 };
    }
}

// ---------------------------------------------------------------------------
// Get a single glossary term
// ---------------------------------------------------------------------------
export async function getGlossaryTerm({ id }: { id: string }) {
    const endpoint = `glossary/${id}`;
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            return null;
        }
        const data: MarmotGlossaryTerm = await res.json();
        return data;
    } catch (error) {
        console.error("getGlossaryTerm exception:", error);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Get child terms
// ---------------------------------------------------------------------------
export async function getChildTerms({ id }: { id: string }) {
    const endpoint = `glossary/children/${id}`;
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            return [];
        }
        const data = await res.json();
        return data.terms || data || [];
    } catch (error) {
        console.error("getChildTerms exception:", error);
        return [];
    }
}

// ---------------------------------------------------------------------------
// Get ancestor chain
// ---------------------------------------------------------------------------
export async function getAncestorTerms({ id }: { id: string }) {
    const endpoint = `glossary/ancestors/${id}`;
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            return [];
        }
        const data = await res.json();
        return data.terms || data || [];
    } catch (error) {
        console.error("getAncestorTerms exception:", error);
        return [];
    }
}

// ---------------------------------------------------------------------------
// Get assets associated with a glossary term
// ---------------------------------------------------------------------------
export async function getTermAssets({
    termId,
    limit = 20,
    offset = 0,
}: {
    termId: string;
    limit?: number;
    offset?: number;
}) {
    const endpoint = `assets/by-glossary-term/${termId}?limit=${limit}&offset=${offset}`;
    try {
        const res = await marmotFetch({ endpoint });
        if (!res.ok) {
            return { assets: [], total: 0 };
        }
        return res.json();
    } catch (error) {
        console.error("getTermAssets exception:", error);
        return { assets: [], total: 0 };
    }
}

/**
 * Compatibility wrapper: list all glossaries as OMD-style objects.
 * In Marmot, there's no separate "glossary" entity – only terms.
 * We group root-level terms (no parent) as top-level "glossaries".
 */
export async function listGlossaries() {
    const result = await listGlossaryTerms({ limit: 200 });
    const rootTerms = (result.terms || []).filter((t) => !t.parent_term_id);

    return {
        data: rootTerms.map((t) => ({
            id: t.id,
            name: t.name,
            displayName: t.name,
            description: t.definition || t.description || "",
        })),
    };
}
