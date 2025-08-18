"use client";
import { useState } from "react";

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    setLoading(true);
    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResult(data.insight);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">
        AI Project Manager & Strategist
      </h1>
      <textarea
        className="w-full border p-2 rounded"
        rows={4}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a question about your meetings..."
      />
      <button
        onClick={ask}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        disabled={loading}
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>
      {result && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <strong>Insight:</strong>
          <p>{result}</p>
        </div>
      )}
    </div>
  );
}
