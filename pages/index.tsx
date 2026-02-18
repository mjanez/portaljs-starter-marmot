import type { InferGetServerSidePropsType } from "next";
import MainSection from "../components/home/mainSection/MainSection";
import { searchAssets } from "@/lib/queries/assets";
import { getAllProviders } from "@/lib/queries/providers";
import HeroSectionLight from "@/components/home/heroSectionLight";
import { HomePageStructuredData } from "@/components/schema/HomePageStructuredData";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getServerSideProps(context: any) {
    const datasets = await searchAssets({
        offset: 0,
        limit: 5,
        tags: [],
        groups: [],
        orgs: [],
    });

    const orgs = await getAllProviders();
    const stats = {
        datasetCount: datasets.count,
        orgCount: orgs.length,
    };
    return {
        props: {
            ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
            datasets: datasets.datasets,
            orgs,
            stats,
        },
    };
}

export default function Home({
    datasets,
    orgs,
    stats,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
    return (
        <>
            <HomePageStructuredData />
            <HeroSectionLight stats={stats} />
            <MainSection datasets={datasets} />
        </>
    );
}
