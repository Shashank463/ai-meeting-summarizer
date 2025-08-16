"use client";
import { useState } from "react";

export default function Home() {
  const [transcript, setTranscript] = useState("");
  const [instruction, setInstruction] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("Meeting Summary");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function generateSummary() {
    setLoading(true);
    setToast(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, instruction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setSummary(data.summary || "");
    } catch (e: any) {
      setToast(e.message || "Summarization failed");
    } finally {
      setLoading(false);
    }
  }

  async function sendEmail() {
    setSending(true);
    setToast(null);
    try {
      const to = emailTo.split(',').map(s => s.trim()).filter(Boolean);
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject: emailSubject, summary }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      setToast("Email sent ✔");
    } catch (e: any) {
      setToast(e.message || "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 12 }}>AI Meeting Summarizer</h1>
      <p style={{ marginTop: 0, color: "#555" }}>Paste your transcript, add an instruction, generate, edit, and email.</p>

      <section style={{ marginTop: 24 }}>
        <label style={{ display: "block", fontWeight: 600 }}>Transcript</label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste text transcript here..."
          rows={10}
          style={{ width: "100%", padding: 8 }}
        />
      </section>

      <section style={{ marginTop: 16 }}>
        <label style={{ display: "block", fontWeight: 600 }}>Custom Instruction (optional)</label>
        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., Summarize in bullet points for executives"
          style={{ width: "100%", padding: 8 }}
        />
      </section>

      <button onClick={generateSummary} disabled={loading || !transcript.trim()} style={{ marginTop: 16, padding: "8px 12px" }}>
        {loading ? "Generating..." : "Generate Summary"}
      </button>

      <section style={{ marginTop: 24 }}>
        <label style={{ display: "block", fontWeight: 600 }}>Editable Summary (Markdown)</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Generated summary will appear here..."
          rows={12}
          style={{ width: "100%", padding: 8 }}
        />
      </section>

      <section style={{ marginTop: 24, borderTop: "1px solid #eee", paddingTop: 16 }}>
        <h3>Email Share</h3>
        <label style={{ display: "block", fontWeight: 600 }}>Recipients</label>
        <input
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          placeholder="alice@example.com, bob@company.com"
          style={{ width: "100%", padding: 8 }}
        />
        <label style={{ display: "block", marginTop: 8, fontWeight: 600 }}>Subject</label>
        <input
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="email-subject-input"
          title="Email subject"
          placeholder="Enter email subject"
        />
        <button onClick={sendEmail} disabled={sending || !summary.trim() || !emailTo.trim()} style={{ marginTop: 12, padding: "8px 12px" }}>
          {sending ? "Sending..." : "Send Email"}
        </button>
      </section>

      {toast && (
        <div style={{ marginTop: 12, padding: 8, background: "#f6f6f6" }}>{toast}</div>
      )}

      <footer style={{ marginTop: 32, color: "#777" }}>
        <small>Note: This demo is stateless; no data is stored.</small>
      </footer>
    </main>
  );
}