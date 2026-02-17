import { GetServerSideProps } from "next";
import OrgNavCrumbs from "@/components/organization/individualPage/OrgNavCrumbs";
import OrgInfo from "@/components/organization/individualPage/OrgInfo";
import ActivityStream from "@/components/_shared/ActivityStream";
import Layout from "@/components/_shared/Layout";
import Tabs from "@/components/_shared/Tabs";
import styles from "styles/DatasetInfo.module.scss";
import DatasetList from "@/components/_shared/DatasetList";
import { getProvider } from "@/lib/queries/providers";

import HeroSection from "@/components/_shared/HeroSection";
import { OrganizationIndividualPageStructuredData } from "@/components/schema/OrganizationIndividualPageStructuredData";

export const getServerSideProps: GetServerSideProps = async (context) => {
    let orgName = context.params?.org as string;
    if (!orgName || !orgName.startsWith("@")) {
        return {
            notFound: true,
        };
    }
    orgName = orgName.split("@")[1];

    const org = await getProvider({ name: orgName });

    if (!org) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            org,
        },
    };
};

export default function OrgPage({ org }): JSX.Element {
    const tabs = [
        {
            id: "datasets",
            content: org.packages ? (
                <DatasetList datasets={org.packages ? org.packages : []} />
            ) : (
                ""
            ),
            title: "Assets",
        },
        {
            id: "activity-stream",
            content: (
                <ActivityStream
                    activities={org?.activity_stream ? org.activity_stream : []}
                />
            ),
            title: "Activity Stream",
        },
    ];
    return (
        <>
            <OrganizationIndividualPageStructuredData org={org} />
            {org && (
                <Layout>
                    <HeroSection title={org.title} cols="6" />
                    <OrgNavCrumbs
                        org={{
                            name: org?.name,
                            title: org?.title,
                        }}
                    />
                    <div className="grid mt-8 grid-rows-datasetpage-hero">
                        <section className="grid row-start-2 row-span-2 col-span-full">
                            <div className="custom-container">
                                {org && (
                                    <main className={styles.main}>
                                        <OrgInfo org={org} />
                                        <div>
                                            <Tabs items={tabs} />
                                        </div>
                                    </main>
                                )}
                            </div>
                        </section>
                    </div>
                </Layout>
            )}
        </>
    );
}
