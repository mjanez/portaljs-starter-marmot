import MiniSearch from "minisearch";
import { useState } from "react";
import SearchHero from "../components/dataset/_shared/SearchHero";
import ListOfOrgs from "../components/organization/ListOfOrganizations";
import Layout from "../components/_shared/Layout";
import { OrganizationPageStructuredData } from "@/components/schema/OrganizationPageStructuredData";
import { getAllProviders } from "@/lib/queries/providers";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export async function getServerSideProps(context: any) {
    const orgs = await getAllProviders();
    return {
        props: {
            ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
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
    const { t } = useTranslation("common");
    return (
        <>
            <Layout>
                <SearchHero
                    title={t("organizations.title")}
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
