import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT, DEFAULT_USER_INSTRUCTION } from "../../lib/prompts";


export async function POST(req: NextRequest) {
    try {
        const { transcript, instruction } = await req.json();

        if (!transcript || typeof transcript !== "string" || transcript.trim().length < 10) {
            return NextResponse.json({ error: "Transcript is required (min ~10 chars)." }, { status: 400 });
        }

        const userInstruction = (instruction && typeof instruction === "string" && instruction.trim().length > 0)
            ? instruction.trim()
            : DEFAULT_USER_INSTRUCTION;

        const body = {
            model: "llama-3.1-8b-instant",
            temperature: 0.2,
            max_tokens: 1200,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `User instruction:\n${userInstruction}\n\nTranscript:\n${transcript}` }
            ],
        };

        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        if (!resp.ok) {
            const text = await resp.text();
            console.error("Groq error:", text);
            return NextResponse.json({ error: "Summarization failed." }, { status: 500 });
        }

        const data = await resp.json();
        const summary = data.choices?.[0]?.message?.content ?? "";

        return NextResponse.json({ summary });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
    }
}