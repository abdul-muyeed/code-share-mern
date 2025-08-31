import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export const Home = () => {
  const [text, setText] = useState<string>("");
  const [, setShared] = useState<string[]>([]);
  const [url, setUrl] = useState<string>(window.location.href); // destination URL initialized from current location (fallback to localhost)
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  const share = async () => {
    setLoading(true);
    setStatus("");
    try {
      await axios.post(
        "http://localhost:3000/api/text-share",
        { text: text,url: url, isEncrypted: false },
        { headers: { "Content-Type": "application/json" } }
      );
      setShared((prev) => [text, ...prev]);
      setText("");
      setStatus("Shared successfully.");
    } catch (err) {
      setStatus("Failed to share. See console for details.");
      // helpful for debugging
      // eslint-disable-next-line no-console
      console.error("Share error:", err);
    } finally {
      setLoading(false);
      // clear status after a short delay
      setTimeout(() => setStatus(""), 3000);
    }
  };

  // simple inline styles to avoid adding new files
  const styles = {
    app: {
      fontFamily:
        'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column" as const,
      background: "#f7f9fc",
      color: "#0f172a",
    },
    header: {
      padding: "20px 16px",
      borderBottom: "1px solid rgba(15,23,42,0.06)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#fff",
    },
    logoWrap: {
      display: "flex",
      gap: 12,
      alignItems: "center",
    },
    logoText: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: 0.2,
    },
    main: {
      flex: 1,
      display: "flex",
      gap: 24,
      padding: 24,
      maxWidth: 1100,
      margin: "0 auto",
      width: "100%",
      boxSizing: "border-box" as const,
    },
    left: {
      flex: 2,
      display: "flex",
      flexDirection: "column" as const,
    },
    textarea: {
      minHeight: 200,
      resize: "vertical" as const,
      padding: 12,
      borderRadius: 8,
      border: "1px solid rgba(15,23,42,0.08)",
      fontSize: 14,
      marginBottom: 12,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
    },
    urlInput: {
      padding: 10,
      borderRadius: 8,
      border: "1px solid rgba(15,23,42,0.08)",
      fontSize: 14,
      marginBottom: 12,
      width: "100%",
      boxSizing: "border-box" as const,
    },
    controls: {
      display: "flex",
      gap: 8,
      alignItems: "center",
    },
    button: {
      padding: "8px 14px",
      borderRadius: 8,
      border: "none",
      background: "#0ea5e9",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logoWrap} aria-hidden={false}>
          {/* inline SVG logo */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="1.5"
              y="3"
              width="21"
              height="14"
              rx="2.5"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              fill="#e6f6ff"
            />
            <path
              d="M7 8h10M7 11h7"
              stroke="#0369a1"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 19c2-1 4-1 6 0 2 1 4 1 6 0"
              stroke="#0369a1"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={styles.logoText}>TextShare</span>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.left}>
          <label
            htmlFor="share-text"
            style={{ marginBottom: 8, fontWeight: 600 }}
          >
            Share some text
          </label>
          {/* URL input for destination where the text will be shown */}
          <input
            id="share-url"
            aria-label="Destination URL"
            placeholder="https://example.com/view/your-id"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={styles.urlInput}
          />
          <textarea
            id="share-text"
            placeholder="Paste or type text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={styles.textarea}
          />
          <div style={styles.controls}>
            <button
              style={styles.button}
              onClick={share}
              aria-label="Share text"
              disabled={loading}
            >
              {loading ? "Sharing..." : "Share"}
            </button>
            <button
              onClick={() => setText("")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(15,23,42,0.06)",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
            <span
              style={{
                marginLeft: "auto",
                color: "rgba(15,23,42,0.6)",
                fontSize: 13,
              }}
            >
              {text.length} chars
            </span>
          </div>
          {status && (
            <div
              style={{
                marginTop: 8,
                color: status.startsWith("Failed") ? "#ef4444" : "#16a34a",
                fontSize: 13,
              }}
            >
              {status}
            </div>
          )}
        </section>
        <Link to={`/view/asdf`}>View</Link>
      </main>
    </div>
  );
};
