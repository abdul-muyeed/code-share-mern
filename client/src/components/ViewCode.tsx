/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export const ViewCode = () => {
    const { tag } = useParams<{ tag: string }>();
  const [content, setContent] = useState<string>(""); // default empty content
  const [language, ] = useState<string | undefined>(undefined);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(false);
  const [isWrapped, setIsWrapped] = useState<boolean>(false);
  const [filename, ] = useState<string>("shared.txt");

  const [, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState<boolean>(false);

  const lines = useMemo(() => content.split(/\r\n|\r|\n/), [content]);

  // new: fetch text via axios
  const fetchFromUrl = async () => {
    setLoading(true);
    setError(null);
    try {
      // ask server for text; if it returns JSON we'll stringify it
      const res = await axios.get(
        "https://code-share-mern-kcnm.vercel.app/api/text-share?url="+tag
      );

      const data = res?.data?.data ?? "";

      // res.data will be a string when responseType:'text' is used.
      // If server returns JSON-like string, leave as-is; if it's an object (unlikely with responseType:'text'),
      // fallback to stringify the object.
      const text =
        typeof data === "string" ? data : JSON.stringify(data, null, 2);

      setContent(text);
    } catch (err: any) {
      // Prefer server-provided message if available, else err.message
      const serverData = err?.response?.data;
      const msg =
        serverData && typeof serverData === "string"
          ? serverData
          : serverData
          ? JSON.stringify(serverData, null, 2)
          : err?.message || "Fetch error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromUrl();
  }, []);

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = content;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore errors silently for now
      setCopied(false);
    }
  };

  const downloadContent = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const containerStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 6,
    overflow: "hidden",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Segoe UI Mono", monospace',
    fontSize: 13,

    // changed: make the component take the full viewport and use column layout
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
  };

  // added: refs to keep line numbers synced with the code pane
  const lineNumsRef = useRef<HTMLDivElement | null>(null);
  const preRef = useRef<HTMLElement | null>(null);

  // added: sync scroll from code -> numbers
  const handlePreScroll = () => {
    if (preRef.current && lineNumsRef.current) {
      lineNumsRef.current.scrollTop = preRef.current.scrollTop;
    }
  };
  // added: sync scroll from numbers -> code (two-way)
  const handleLinesScroll = () => {
    if (preRef.current && lineNumsRef.current) {
      preRef.current.scrollTop = lineNumsRef.current.scrollTop;
    }
  };

  return (
    <div style={containerStyle}>
      {/* added: CSS to hide scrollbar for the line-number column (WebKit, Firefox, IE) */}
      <style>{`
				.line-nums {
					/* Firefox */
					scrollbar-width: none;
					/* IE 10+ */
					-ms-overflow-style: none;
				}
				/* WebKit browsers */
				.line-nums::-webkit-scrollbar {
					width: 0;
					height: 0;
				}
			`}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 10px",
          background: "#f7f7f7",
          borderBottom: "1px solid #eee",
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {language ? (
            <strong style={{ fontSize: 12 }}>{language}</strong>
          ) : (
            <span style={{ fontSize: 12, color: "#666" }}>Content</span>
          )}
          <button
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              padding: "4px 8px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
            }}
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            style={{
              background: "#fff",
              border: "1px solid #ccc",
              padding: "4px 8px",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
            }}
            onClick={downloadContent}
            title="Download content"
          >
            Download
          </button>
          {/* new: URL input + Fetch button */}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "#555" }}>
            <input
              type="checkbox"
              checked={isWrapped}
              onChange={() => setIsWrapped((s) => !s)}
              style={{ marginRight: 6 }}
            />
            Wrap
          </label>
          <label style={{ fontSize: 12, color: "#555" }}>
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={() => setShowLineNumbers((s) => !s)}
              style={{ marginRight: 6 }}
            />
            Line numbers
          </label>
          {showLineNumbers && (
            <span style={{ fontSize: 12, color: "#666" }}>
              Lines: {lines.length}
            </span>
          )}
        </div>
      </div>

      {/* show fetch error if any */}
      {error && (
        <div
          style={{
            padding: 8,
            background: "#fff3f3",
            color: "#a00",
            fontSize: 13,
            borderBottom: "1px solid #f1d0d0",
          }}
        >
          Error: {error}
        </div>
      )}

      <div
        style={{
          // changed: allow this area to grow and handle overflow internally
          display: "flex",
          alignItems: "stretch",
          flex: 1,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {showLineNumbers && (
          <div
            // added: ref and onScroll to sync with the code pane
            ref={lineNumsRef}
            onScroll={handleLinesScroll}
            className="line-nums" // added: class to target scrollbar CSS
            style={{
              padding: "10px 8px",
              background: "#fafafa",
              borderRight: "1px solid #eee",
              color: "#888",
              textAlign: "right",
              userSelect: "none",
              minWidth: 44,
              overflowY: "auto", // allow the numbers column to scroll
            }}
          >
            {lines.map((_, idx) => (
              <div key={idx} style={{ lineHeight: 1.6 }}>
                {idx + 1}
              </div>
            ))}
          </div>
        )}
        <pre
          // added: ref and onScroll so we can sync scrolling with the numbers
          ref={preRef as any}
          onScroll={handlePreScroll}
          style={{
            padding: 10,
            whiteSpace: isWrapped ? "pre-wrap" : "pre",
            minWidth: 200,
            overflow: "auto", // allow inner scrolling
            color: "#222",

            // fill remaining vertical space so scrolling happens inside this element
            flex: 1,
            margin: 0,
          }}
        >
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
};
