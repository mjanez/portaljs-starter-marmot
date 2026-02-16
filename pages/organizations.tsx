import MiniSearch from "minisearch";
import { useState } from "react";
import SearchHero from "../components/dataset/_shared/SearchHero";
import ListOfOrgs from "../components/organization/ListOfOrganizations";
import Layout from "../components/_shared/Layout";
import { OrganizationPageStructuredData } from "@/components/schema/OrganizationPageStructuredData";
import { getAllProviders } from "@/lib/queries/providers";

export async function getServerSideProps() {
    const orgs = await getAllProviders();
    return {
        props: {
            orgs,
        },
    };
}

export default function OrgsPage({ orgs }): JSX.Element {
    const miniSearch = new MiniSearch({
        fields: ["description", "display_name"],
        storeFields: ["description", "display_name", "image_display_url", "name"],
    });
    miniSearch.addAll(orgs);
    return (
        <>
            <OrganizationPageStructuredData />
            <Main miniSearch={miniSearch} orgs={orgs} />
        </>
    );
}

function Main({
    miniSearch,
    orgs,
}: {
    miniSearch: MiniSearch<any>;
    orgs: any[];
}) {
    const [searchString, setSearchString] = useState("");
    return (
        <>
            <Layout>
                <SearchHero
                    title="Providers"
                    searchValue={searchString}
                    onChange={setSearchString}
                />

                <main className="custom-container py-8">
                    <ListOfOrgs
                        orgs={orgs}
                        searchString={searchString}
                        miniSearch={miniSearch}
                    />
                </main>
            </Layout>
        </>
    );
}
