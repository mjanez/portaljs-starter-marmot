export interface Resource {
    id: string;
    name: string;
    format: string;
    description: string | null;
    url?: string;
    metadata_modified?: string;
    extras?: Record<string, any>;
}
