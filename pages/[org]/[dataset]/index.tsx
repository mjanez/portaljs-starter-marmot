import { GetServerSideProps } from "next";
import DatasetInfo from "@/components/dataset/individualPage/DatasetInfo";
import DatasetOverview from "@/components/dataset/individualPage/DatasetOverview";
import DatasetNavCrumbs from "@/components/dataset/individualPage/NavCrumbs";
import ResourcesList from "@/components/dataset/individualPage/ResourcesList";
import ActivityStream from "@/components/_shared/ActivityStream";
import Layout from "@/components/_shared/Layout";
import Tabs from "@/components/_shared/Tabs";
import styles from "styles/DatasetInfo.module.scss";
import { getAsset } from "@/lib/queries/assets";
import HeroSection from "@/components/_shared/HeroSection";
import { DatasetPageStructuredData } from "@/components/schema/DatasetPageStructuredData";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const datasetName = context.params?.dataset as string;
    const orgName = context.params?.org as string;

    if (!datasetName || !orgName.startsWith("@")) {
        return {
            notFound: true,
        };
    }

    try {
        // In Marmot, asset IDs may be qualifiedName or ID
        let dataset = await getAsset({ id: datasetName });

        if (!dataset) {
            return {
                notFound: true,
            };
        }

        const activityStream: any[] = [];
        dataset = {
            ...dataset,
            activity_stream: activityStream,
        };

        if (!dataset.organization || "@" + dataset.organization.name !== orgName) {
            return {
                notFound: true,
            };
        }

        return {
            props: {
                dataset,
            },
        };
    } catch {
        return {
            notFound: true,
        };
    }
};

export default function DatasetPage({ dataset }): JSX.Element {
    const tabs = [
        {
            id: "resources",
            content: (
                <ResourcesList
                    resources={dataset?.resources}
                    orgName={dataset.organization ? dataset.organization.name : ""}
                    datasetName={dataset.name}
                />
            ),
            title: "Resources",
        },
        {
            id: "information",
            content: <DatasetOverview dataset={dataset} />,
            title: "Info",
        },
        {
            id: "activity-stream",
            content: (
                <ActivityStream
                    activities={dataset?.activity_stream ? dataset.activity_stream : []}
                />
            ),
            title: "Activity Stream",
        },
    ];
    return (
        <>
            <DatasetPageStructuredData dataset={dataset} />
            <Layout>
                <HeroSection title={dataset.title} cols="6" />
                <DatasetNavCrumbs
                    datasetType={dataset.type}
                    datasetsLinkHref={"/search"}
                    org={{
                        name: dataset.organization?.name,
                        title: dataset.organization?.title,
                    }}
                    dataset={{
                        name: dataset.name,
                        title: dataset.title ? dataset.title : "This asset",
                    }}
                />
                <div className="grid grid-rows-datasetpage-hero mt-8">
                    <section className="grid row-start-2 row-span-2 col-span-full">
                        <div className="custom-container">
                            {dataset && (
                                <main className={styles.main}>
                                    <DatasetInfo dataset={dataset} />
                                    <div>
                                        <Tabs items={tabs} />
                                    </div>
                                </main>
                            )}
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
}
