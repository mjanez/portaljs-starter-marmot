import { TermsList } from "@/components/glossary/TermsList";
import { getGlossaryTerm } from "@/lib/queries/glossary";
import { LinkIcon } from "@heroicons/react/20/solid";
import Layout from "@/components/_shared/Layout";
import HeroSection from "@/components/_shared/HeroSection";
// Note: You might need to adjust TermsNavCrumbs if it depends strictly on FQNs
import TermsNavCrumbs from "@/components/glossary/TermsNavCrumbs";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";

export async function getServerSideProps(context: any) {
    const id = context.params.id as string;
    const term = await getGlossaryTerm({ id });

    if (!term) {
        return { notFound: true };
    }

    // Shim to make OMD components happy
    const adaptedTerm = {
        ...term,
        displayName: term.name,
        fullyQualifiedName: term.id, // Use ID as FQN for Marmot
        relatedTerms: [], // Marmot doesn't expose related terms in the same way yet
    };

    return {
        props: {
            ...(await serverSideTranslations(context.locale ?? "en", ["common"])),
            term: adaptedTerm,
        },
    };
}

export default function TermPage({ term }: any) {
    const relatedTerms = term?.relatedTerms;
    const { t } = useTranslation("common");

    return (
        <>
            <Layout>
                <div className="">
                    <div className="grid grid-rows-searchpage-hero mb-5">
                        <TermsNavCrumbs term={term} />
                        <HeroSection title={term?.displayName ?? term?.name} />
                    </div>
                    <div className="custom-container bg-[var(--card-bg)] space-y-5 rounded shadow-lg p-4">
                        <div dangerouslySetInnerHTML={{ __html: term?.description || term?.definition }}></div>
                        <div className="flex gap-4 text-sm text-[var(--gray)]">
                            <div className="flex items-center">
                                <LinkIcon className="mr-1 h-4 w-4" />
                                Related terms:{" "}
                                <div className="ml-1">
                                    {!!relatedTerms?.length
                                        ? relatedTerms.map((rt: any) => {
                                            return <span key={rt.id ?? rt.name}>{rt.name}</span>;
                                        })
                                        : t("glossary.none")}
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-[var(--gray)]">
                                {t("glossary.terms")}
                            </p>
                            {/* Pass the ID so the list can fetch children */}
                            <TermsList key={term.id} path={term.id} />
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
