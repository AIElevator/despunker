"use client";

import { useState, useEffect } from "react";

const FREE_LIMIT = 3;
const STORAGE_KEY = "despunker_count";

const FORMATS = [
  {
    id: "prose",
    label: "General prose",
    desc: "Any clumsy writing made professional",
    icon: "✍",
    colour: "violet",
    active: "bg-violet-600 border-violet-600 text-white",
    idle: "bg-violet-50 border-violet-200 text-violet-800 hover:border-violet-400",
    button: "bg-violet-600 hover:bg-violet-500 shadow-violet-200",
  },
  {
    id: "document",
    label: "Business document",
    desc: "Reports, proposals, summaries",
    icon: "📄",
    colour: "blue",
    active: "bg-blue-600 border-blue-600 text-white",
    idle: "bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400",
    button: "bg-blue-600 hover:bg-blue-500 shadow-blue-200",
  },
  {
    id: "linkedin",
    label: "LinkedIn post",
    desc: "Professional but engaging",
    icon: "💼",
    colour: "sky",
    active: "bg-sky-500 border-sky-500 text-white",
    idle: "bg-sky-50 border-sky-200 text-sky-800 hover:border-sky-400",
    button: "bg-sky-500 hover:bg-sky-400 shadow-sky-200",
  },
  {
    id: "slack",
    label: "Slack / Teams message",
    desc: "Clear and concise",
    icon: "💬",
    colour: "emerald",
    active: "bg-emerald-600 border-emerald-600 text-white",
    idle: "bg-emerald-50 border-emerald-200 text-emerald-800 hover:border-emerald-400",
    button: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200",
  },
  {
    id: "meeting",
    label: "Meeting notes",
    desc: "Structured with actions",
    icon: "📋",
    colour: "amber",
    active: "bg-amber-500 border-amber-500 text-white",
    idle: "bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400",
    button: "bg-amber-500 hover:bg-amber-400 shadow-amber-200",
  },
  {
    id: "letter",
    label: "Formal letter",
    desc: "Correct structure and tone",
    icon: "✉",
    colour: "rose",
    active: "bg-rose-600 border-rose-600 text-white",
    idle: "bg-rose-50 border-rose-200 text-rose-800 hover:border-rose-400",
    button: "bg-rose-600 hover:bg-rose-500 shadow-rose-200",
  },
];

export default function Home() {
  const [format, setFormat]           = useState("prose");
  const [input, setInput]             = useState("");
  const [output, setOutput]           = useState("");
  const [changes, setChanges]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [copied, setCopied]           = useState(false);
  const [usageCount, setUsageCount]   = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    setUsageCount(stored);
  }, []);

  const remaining  = Math.max(0, FREE_LIMIT - usageCount);
  const activeFormat = FORMATS.find((f) => f.id === format) ?? FORMATS[0];

  async function handleDespunk() {
    if (!input.trim()) { setError("Please paste some text first."); return; }
    if (usageCount >= FREE_LIMIT) { setShowUpgrade(true); return; }

    setLoading(true);
    setError("");
    setOutput("");
    setChanges("");

    try {
      const res = await fetch("/api/despunk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, format }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return; }
      setOutput(data.output ?? "");
      setChanges(data.changes ?? "");
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem(STORAGE_KEY, String(newCount));
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Gradient header bar */}
      <div className="h-1.5 bg-gradient-to-r from-violet-500 via-sky-400 via-emerald-400 via-amber-400 to-rose-500" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
              BD
            </div>
            <div>
              <span className="font-bold text-gray-900 text-lg tracking-tight">British Language Despunker</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {remaining > 0 ? (
              <span className="text-sm text-gray-500">
                <span className="font-semibold text-violet-600">{remaining}</span> free{" "}
                {remaining === 1 ? "use" : "uses"} left
              </span>
            ) : (
              <button
                onClick={() => setShowUpgrade(true)}
                className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-full transition-colors font-medium"
              >
                Upgrade — £9.99/mo
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-3">
            Write it badly. We will fix it.
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Paste in your stream of consciousness, clumsy draft or voice note transcript.
            Pick a format and get back polished, professional British English.
          </p>
        </div>

        {/* Format selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => { setFormat(f.id); setOutput(""); setError(""); }}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                format === f.id ? f.active : f.idle
              }`}
            >
              <span className="text-2xl mt-0.5 flex-shrink-0">{f.icon}</span>
              <div>
                <p className="font-semibold text-sm leading-tight">{f.label}</p>
                <p className={`text-xs mt-0.5 leading-tight ${format === f.id ? "opacity-80" : "opacity-60"}`}>
                  {f.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Tool */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Your rough text
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  "Paste anything here — a voice note transcript, bullet points, a badly written paragraph, a brain dump. The messier the better."
                }
                rows={12}
                className="w-full border border-gray-200 rounded-xl p-4 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm leading-relaxed bg-gray-50"
              />

              <button
                onClick={handleDespunk}
                disabled={loading || !input.trim()}
                className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all shadow-lg
                  ${activeFormat.button} text-white
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Despunking…
                  </span>
                ) : (
                  `Despunk it`
                )}
              </button>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* Output */}
          <div className="flex flex-col gap-4">
            {output ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
                {changes && (
                  <div className={`rounded-xl px-4 py-3 text-sm ${
                    format === "prose"     ? "bg-violet-50 text-violet-700 border border-violet-100" :
                    format === "document"  ? "bg-blue-50 text-blue-700 border border-blue-100" :
                    format === "linkedin"  ? "bg-sky-50 text-sky-700 border border-sky-100" :
                    format === "slack"     ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    format === "meeting"   ? "bg-amber-50 text-amber-700 border border-amber-100" :
                                            "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    <span className="font-semibold">What changed: </span>{changes}
                  </div>
                )}

                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {activeFormat.label}
                </label>

                <div className="border border-gray-200 rounded-xl p-4 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 min-h-48">
                  {output}
                </div>

                <button
                  onClick={copyOutput}
                  className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all border-2 ${
                    copied
                      ? "border-emerald-400 text-emerald-600 bg-emerald-50"
                      : "border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800"
                  }`}
                >
                  {copied ? "Copied to clipboard!" : "Copy to clipboard"}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex-1 flex flex-col items-center justify-center text-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-rose-100 flex items-center justify-center text-3xl">
                  {activeFormat.icon}
                </div>
                <div>
                  <p className="text-gray-700 font-semibold mb-1">Your despunked {activeFormat.label} will appear here</p>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto">
                    Paste your rough text on the left, then hit Despunk it
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs text-sm text-gray-400">
                  {["Polished British English", "All waffle removed", "What changed — explained"].map((item) => (
                    <div key={item} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white px-6 py-5 text-center text-gray-400 text-sm">
        British Language Despunker · {FREE_LIMIT} free uses, then £9.99/month for unlimited
      </footer>

      {/* Upgrade modal */}
      {showUpgrade && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setShowUpgrade(false)}
        >
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-rose-500 flex items-center justify-center text-white text-2xl mx-auto mb-4">
              BD
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You have used your free despunks</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Upgrade for unlimited use across all six formats.
            </p>
            <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
              <p className="text-3xl font-bold text-gray-900 mb-1">
                £9.99<span className="text-lg font-normal text-gray-400">/month</span>
              </p>
              <p className="text-gray-400 text-sm">Cancel any time.</p>
              <ul className="mt-4 text-sm text-gray-600 text-left space-y-2">
                {[
                  "Unlimited despunks",
                  "All six output formats",
                  "British English guardrails built in",
                  "What changed — explained every time",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <a
              href="https://buy.stripe.com/YOUR_STRIPE_PAYMENT_LINK"
              className="block w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors mb-3"
            >
              Get unlimited access
            </a>
            <button
              onClick={() => setShowUpgrade(false)}
              className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
