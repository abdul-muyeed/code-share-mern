/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import axios from "axios";

export const Home = () => {
  const [text, setText] = useState<string>("");
  const [, setShared] = useState<string[]>([]);
  const [url, setUrl] = useState<string>(window.location.href);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [mode, setMode] = useState<"text" | "file">("text");
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(
        "https://code-share-mern-kcnm.vercel.app/api/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      // const res = await axios.post(
      //   "http://localhost:3000/api/upload",
      //   formData,
      //   { headers: { "Content-Type": "multipart/form-data" } }
      // );
      return res.data.url ;
    } catch (err) {
      setStatus("Failed to upload file. See console for details.");
      // eslint-disable-next-line no-console
      console.error("File upload error:", err);
      return "";
    }
  };

  const share = async () => {
    setLoading(true);
    setStatus("");
    try {
      let payload: any = { isEncrypted: false };
      payload.url = url;
      if (mode === "text") {
        payload.text = text;
      } else if (mode === "file" && file) {
        // Upload file and get URL
        const uploadedUrl = await uploadFile(file);
        console.log("uploadedUrl", uploadedUrl);
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        payload.content_url = uploadedUrl;
        setFileUrl(uploadedUrl);
      }

      await axios.post(
        "https://code-share-mern-kcnm.vercel.app/api/text-share",
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      // console.log("payload", payload);
      // await axios.post(
      //   "http://localhost:3000/api/text-share",
      //   payload,
      //   { headers: { "Content-Type": "application/json" } }
      // );
      setShared((prev) =>
        mode === "text" ? [text, ...prev] : [file?.name || "", ...prev]
      );
      setText("");
      setFile(null);
      setStatus("Shared successfully.");
    } catch (err) {
      setStatus("Failed to share. See console for details.");
      // eslint-disable-next-line no-console
      console.error("Share error:", err);
    } finally {
      setLoading(false);
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
            htmlFor="share-mode"
            style={{ marginBottom: 8, fontWeight: 600 }}
          >
            Choose what to share
          </label>
          <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
            <label>
              <input
                type="radio"
                name="share-mode"
                value="text"
                checked={mode === "text"}
                onChange={() => {
                  setMode("text");
                  setFile(null);
                  setFileUrl("");
                }}
              />{" "}
              Text
            </label>
            <label>
              <input
                type="radio"
                name="share-mode"
                value="file"
                checked={mode === "file"}
                onChange={() => {
                  setMode("file");
                  setText("");
                }}
              />{" "}
              File
            </label>
          </div>
          <input
            id="share-url"
            aria-label="Destination URL"
            placeholder="https://example.com/view/your-id"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={styles.urlInput}
          />
          {mode === "file" ? (
            <>
              <label
                htmlFor="file-upload"
                style={{
                  marginBottom: 8,
                  fontWeight: 500,
                  fontSize: 13,
                  color: "#64748b",
                  display: "block",
                }}
              >
                Upload a file
              </label>
              <input
                id="file-upload"
                type="file"
                style={{ marginBottom: 12 }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setFile(f || null);
                  setFileUrl("");
                }}
              />
              {file && (
                <div style={{ fontSize: 13, marginBottom: 8 }}>
                  Selected: {file.name}
                </div>
              )}
            </>
          ) : (
            <>
              <label
                htmlFor="share-text"
                style={{ marginBottom: 8, fontWeight: 600 }}
              >
                Share some text
              </label>
              <textarea
                id="share-text"
                placeholder="Paste or type text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={styles.textarea}
              />
            </>
          )}
          <div style={styles.controls}>
            <button
              style={styles.button}
              onClick={share}
              aria-label="Share"
              disabled={loading || (mode === "text" ? !text : !file)}
            >
              {loading ? "Sharing..." : "Share"}
            </button>
            <button
              onClick={() => {
                setText("");
                setFile(null);
                setFileUrl("");
              }}
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
              {mode === "text" ? `${text.length} chars` : file ? file.name : ""}
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
          {fileUrl && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#0ea5e9" }}>
              Uploaded file URL: <a href={fileUrl}>{fileUrl}</a>
            </div>
          )}
        </section>
        {/* <Link to={`/view/asdf`}>View</Link> */}
      </main>
    </div>
  );
};
