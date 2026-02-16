import { searchAssets } from "@/lib/queries/assets";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const options = req.query as any;

            if (typeof options.orgs === "string") {
                options.orgs = [options.orgs];
            }

            if (typeof options.tags === "string") {
                options.tags = [options.tags];
            }

            if (typeof options.resFormat === "string") {
                options.resFormat = [options.resFormat];
            }

            const results = await searchAssets(options);
            res.status(200).json(results);
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
