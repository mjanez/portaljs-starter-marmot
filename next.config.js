/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");

const domains = [
    "demo.marmotdata.io",
    "demo.dev.datopian.com",
    "api.dev.cloud.portaljs",
    "blob.datopian.com",
];
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Enable standalone output for Docker deployment
    output: "standalone",
    i18n,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    images: {
        domains,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    publicRuntimeConfig: {
        DOMAINS: domains,
    },
};

module.exports = nextConfig;
