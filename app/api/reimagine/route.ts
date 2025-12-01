import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const runtime = "edge";

// Simplification level prompts - serious, professional, no jokes or puns
const SIMPLIFICATION_PROMPTS: Record<string, string> = {
    technical: `
You are a senior principal engineer.
Rewrite the following documentation to be highly technical and rigorous.
Focus on precise terminology, implementation specifics, and edge cases.
Maintain professional tone. No analogies or simplified explanations.
Keep the formatting (Markdown) clean.
Only return the modified text, no explanations.
`,
    standard: `
You are a documentation editor.
Make minimal rephrasing to the following documentation for improved clarity.
Preserve the original meaning and technical accuracy.
Only fix grammar issues or slightly awkward phrasing.
Maintain professional tone.
Keep the formatting (Markdown) clean.
Only return the modified text, no explanations.
`,
    simplified: `
You are a technical writer.
Rewrite the following documentation with clearer, more accessible language.
Reduce jargon where possible without losing accuracy.
Keep explanations direct and professional.
Maintain the same information depth but improve readability.
Keep the formatting (Markdown) clean.
Only return the modified text, no explanations.
`,
    beginner: `
You are a technical educator.
Rewrite the following documentation for someone with basic technical knowledge.
Explain concepts clearly without assuming prior expertise.
Break down complex ideas into simpler components.
Maintain a professional and direct tone.
Keep the formatting (Markdown) clean.
Only return the modified text, no explanations.
`,
    noob: `
You are a patient technical educator writing for complete beginners.
Rewrite the following documentation to be extremely accessible.
Assume no prior technical knowledge.
Use simple language and explain every concept from first principles.
Break complex ideas into small, digestible steps.
Maintain a professional and clear tone.
Keep the formatting (Markdown) clean.
Only return the modified text, no explanations.
`,
};

export async function POST(req: Request) {
    try {
        const { content, simplificationLevel, mode, prompt: customPrompt } = await req.json();

        // Construct the Prompt based on the selected level or mode
        let systemInstruction = "";
        
        if (mode === "custom" && customPrompt) {
            // Custom AI edit with user's prompt
            systemInstruction = `
You are an expert editor and writing assistant.
Apply the following instruction to the given text.
Keep the same general format (Markdown if present).
Only return the modified text, no explanations or extra content.

Instruction: ${customPrompt}
`;
        } else if (simplificationLevel && SIMPLIFICATION_PROMPTS[simplificationLevel]) {
            // Use the 5-level simplification system
            systemInstruction = SIMPLIFICATION_PROMPTS[simplificationLevel];
        } else if (mode === "simple") {
            // Fallback to old simple mode
            systemInstruction = SIMPLIFICATION_PROMPTS.simplified;
        } else {
            // Fallback to technical mode
            systemInstruction = SIMPLIFICATION_PROMPTS.technical;
        }

        const fullPrompt = `${systemInstruction}\n\n---\n\nText to modify:\n${content}`;

        // Use the AI SDK Core API with Gemini Flash for speed
        const result = await streamText({
            model: google("gemini-2.0-flash"),
            prompt: fullPrompt,
        });

        // Return a text stream directly
        return result.toTextStreamResponse();

    } catch (error) {
        console.error("Gemini API Error:", error);
        return new Response(JSON.stringify({ error: "Failed to process content" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}