import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { to, subject, summary } = await req.json();

        if (!Array.isArray(to) || to.length === 0) {
            return NextResponse.json({ error: "At least one recipient email is required." }, { status: 400 });
        }

        const safeSubject = (typeof subject === "string" && subject.trim()) || "Meeting Summary";
        const safeSummary = (typeof summary === "string" && summary.trim()) || "(empty)";

        const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.5;">
        <h2 style="margin:0 0 12px 0;">${escapeHtml(safeSubject)}</h2>
        <pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;">${escapeHtml(safeSummary)}</pre>
      </div>
    `;

        const { data, error } = await resend.emails.send({
            from:  "onboarding@resend.dev",
            to,
            subject: safeSubject,
            html,
        });

        if (error) {
            console.error(error);
            return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
        }

        return NextResponse.json({ ok: true, id: data?.id });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
    }
}

function escapeHtml(str: string) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}