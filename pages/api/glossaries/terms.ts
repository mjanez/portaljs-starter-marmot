import { getChildTerms } from "@/lib/queries/glossary";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "GET") {
        try {
            const { directChildrenOf } = req.query;

            if (!directChildrenOf || typeof directChildrenOf !== "string") {
                // If no parent specified, maybe we should return root terms?
                // For now, let's assume this endpoint is called with a parent.
                // If we need root terms, we can handle that case specifically.
                res.status(400).json({ message: "directChildrenOf parameter is required" });
                return;
            }

            const terms = await getChildTerms({ id: directChildrenOf });

            // Transform to match what TermsList expects
            const data = terms.map((term: any) => ({
                ...term,
                displayName: term.name,
                fullyQualifiedName: term.id, // Use ID as FQN
                childrenCount: term.child_count ?? (term.has_children ? 1 : 0), // Use heuristic if count not available
                children: [], // Initially empty, will be populated on expand
            }));

            res.status(200).json({ data });
        } catch (e: any) {
            console.error(e);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
