/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export const ViewCode = () => {
  const { tag } = useParams<{ tag: string }>();
  const [content, setContent] = useState<string>(""); // default empty content
  const [isFileUrl, setIsFileUrl] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(false);
  const [isWrapped, setIsWrapped] = useState<boolean>(false);
  const [filename] = useState<string>("shared.txt");

  const [, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [copied, setCopied] = useState<boolean>(false);

  const lines = useMemo(
    () => (isFileUrl ? [] : content.split(/\r\n|\r|\n/)),
    [content, isFileUrl]
  );

  // new: fetch text via axios
  const fetchFromUrl = async () => {
    setLoading(true);
    setError(null);
    try {
      // ask server for text; if it returns JSON we'll stringify it
      const res = await axios.get(
        "https://code-share-mern-kcnm.vercel.app/api/text-share?url="+tag
      );
      // const res = await axios.get(
      //   "http://localhost:3000/api/text-share?url=" + tag,
      //   { responseType: "json" } // get JSON so we can distinguish fields
      // );

      // Accept both {text} and {content_url}
      const data = res?.data ?? {};
      console.log(data);
      if (
        typeof data.content_url === "string" &&
        /^https?:\/\//.test(data.content_url)
      ) {
        setIsFileUrl(true);
        setContent(data.content_url);
      } else if (typeof data.text === "string") {
        setIsFileUrl(false);
        setContent(data.text);
      } else if (
        typeof data.data === "string" &&
        /^https?:\/\//.test(data.data)
      ) {
        // fallback for previous API
        setIsFileUrl(true);
        setContent(data.data);
      } else {
        setIsFileUrl(false);
        setContent(
          typeof data.data === "string"
            ? data.data
            : JSON.stringify(data, null, 2)
        );
      }
      // console.log(isFileUrl, content);
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
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          {/* Remove language check, just show "Content" */}
          <span style={{ fontSize: 12, color: "#666" }}>Content</span>
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

      {/* Only show file UI if isFileUrl, otherwise show text/code UI */}
      {isFileUrl ? (
        <div
          style={{
            margin: "auto",
            textAlign: "center",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <p style={{ fontSize: 16, marginBottom: 16 }}>
            This share contains a file or content.
          </p>
          <div
            style={{
              marginBottom: 16,
              wordBreak: "break-all",
              color: "#0369a1",
              fontSize: 14,
            }}
          >
            <span>File URL: </span>
            <a
              href={content}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0369a1" }}
            >
              {content}
            </a>
          </div>
          <button
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "#0ea5e9",
              color: "#fff",
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: "none",
              marginRight: 12,
              border: "none",
              cursor: "pointer",
            }}
            onClick={() => {
              // Download file using anchor click
              const link = document.createElement("a");
              link.href = content;
              link.download = ""; // Let browser use filename from URL or headers
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download File
          </button>
          <div
            style={{
              marginTop: 24,
              width: 300,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div
              style={{
                background: "#e5e7eb",
                borderRadius: 8,
                height: 8,
                width: "100%",
                marginBottom: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#0ea5e9",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "#666" }}>Ready to download</div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            flex: 1,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {/* Only show text/code UI for text */}
          <div style={{ flex: 1, display: "flex" }}>
            {showLineNumbers && (
              <div
                ref={lineNumsRef}
                onScroll={handleLinesScroll}
                className="line-nums"
                style={{
                  padding: "10px 8px",
                  background: "#fafafa",
                  borderRight: "1px solid #eee",
                  color: "#888",
                  textAlign: "right",
                  userSelect: "none",
                  minWidth: 44,
                  overflowY: "auto",
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
              ref={preRef as any}
              onScroll={handlePreScroll}
              style={{
                padding: 10,
                whiteSpace: isWrapped ? "pre-wrap" : "pre",
                minWidth: 200,
                overflow: "auto",
                color: "#222",
                flex: 1,
                margin: 0,
              }}
            >
              <code>{content}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
