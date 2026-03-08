import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Page from "@/models/Page";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const projectId = searchParams.get("projectId");

    if (!query || query.length < 2) {
        return NextResponse.json(
            { error: "Search query must be at least 2 characters long." },
            { status: 400 }
        );
    }

    if (!projectId) {
        return NextResponse.json(
            { error: "Project ID is required." },
            { status: 400 }
        );
    }

    try {
        await connectToDB();

        const results = await Page.find(
            {
                projectId,
                isPublished: true,
                $text: { $search: query },
            },
            {
                score: { $meta: "textScore" }, // Project the text search score
            }
        )
        .sort({ score: { $meta: "textScore" } }) // Sort by relevance
        .limit(10)
        .select("title slug section"); // Select only the fields needed for display

        return NextResponse.json(results);

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred during search." },
            { status: 500 }
        );
    }
}
