/* eslint-disable import/no-anonymous-default-export */

export const siteTitle = "PortalJS Data Catalog";
export const title = "PortalJS + MarmotData";
export const description =
    "Discover all your data assets – tables, topics, queues, buckets and more. An open data catalog powered by MarmotData and PortalJS.";

export const url = "https://portaljs-starter-marmot.vercel.app";
export const imageUrl = `${url}/images/portaljs-marmot.png`;

export default {
    defaultTitle: `${siteTitle} | ${title}`,
    siteTitle,
    description,
    canonical: url,
    openGraph: {
        siteTitle,
        description,
        type: "website",
        locale: "en_US",
        url,
        site_name: siteTitle,
        images: [
            {
                url: imageUrl,
                alt: siteTitle,
                width: 1200,
                height: 627,
                type: "image/png",
            },
        ],
    },
    twitter: {
        handle: "@marmotdata",
        site: "@PortalJS_",
        cardType: "summary_large_image",
    },
    additionalMetaTags: [
        {
            name: "keywords",
            content: "PortalJS, MarmotData, data catalog, data assets, data portal, open source, frontend template",
        },
        {
            name: "author",
            content: "mjanez / PortalJS",
        },
        {
            property: "og:image:width",
            content: "1200",
        },
        {
            property: "og:image:height",
            content: "627",
        },
        {
            property: "og:locale",
            content: "en_US",
        },
    ],
    additionalLinkTags: [
        {
            rel: "icon",
            href: "/favicon.ico",
        },
        {
            rel: "apple-touch-icon",
            href: "/apple-touch-icon.png",
            sizes: "180x180",
        },
        {
            rel: "manifest",
            href: "/site.webmanifest",
        },
    ]
};
