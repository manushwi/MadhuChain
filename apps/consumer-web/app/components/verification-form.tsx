"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

function tokenFromEntry(entry: string) {
  const value = entry.trim();
  if (!value) return "";

  const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(value) || /\/v\//i.test(value);
  if (!looksLikeUrl) return value.replace(/^\/+|\/+$/g, "");

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    const parts = url.pathname.split("/").filter(Boolean);
    const verificationSegment = parts.findIndex((part) => part.toLowerCase() === "v");
    const token = verificationSegment >= 0 ? parts[verificationSegment + 1] : parts.at(-1);
    return token ? decodeURIComponent(token) : "";
  } catch {
    return value.replace(/^\/+|\/+$/g, "");
  }
}

export function VerificationForm() {
  const router = useRouter();
  const [entry, setEntry] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = tokenFromEntry(entry);
    if (!token || token.includes("/")) {
      setError("Enter the token or full verification URL printed on your jar.");
      return;
    }
    setError("");
    router.push(`/v/${encodeURIComponent(token)}`);
  }

  return (
    <form className="verify-form" onSubmit={submit} noValidate>
      <label htmlFor="verification-entry">Enter a token or verification URL</label>
      <div className="input-row">
        <input
          id="verification-entry"
          value={entry}
          onChange={(event) => setEntry(event.target.value)}
          placeholder="e.g. HC-7A92-K41D"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby={error ? "entry-error" : "entry-hint"}
        />
        <button type="submit">Verify jar <span aria-hidden="true">→</span></button>
      </div>
      {error ? <p id="entry-error" className="form-error" role="alert">{error}</p> : <p id="entry-hint" className="form-hint">The code is usually printed below the QR label.</p>}
    </form>
  );
}
