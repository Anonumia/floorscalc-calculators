"use client";
import { useState } from "react";

type Status = { kind: "idle" | "sending" | "success" | "error"; message: string };

export default function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle", message: "" });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const email = String(data.email || "").trim();
    const message = String(data.message || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || !message) {
      setStatus({ kind: "error", message: "Please enter a valid email address and a message." });
      return;
    }

    setStatus({ kind: "sending", message: "Sending..." });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Your message could not be sent. Please try again later.");
      form.reset();
      setStatus({ kind: "success", message: "Thank you. Your message has been sent." });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Your message could not be sent. Please try again later.",
      });
    }
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label>Name (optional) <input name="name" autoComplete="name" maxLength={100} /></label>
        <label>Email <input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      </div>
      <label>Subject <input name="subject" maxLength={160} /></label>
      <label>Message <textarea name="message" rows={7} maxLength={5000} required /></label>
      <label className="honeypot" aria-hidden="true">Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button type="submit" disabled={status.kind === "sending"}>{status.kind === "sending" ? "Sending..." : "Send message"}</button>
      <p className={`form-status ${status.kind}`} role="status" aria-live="polite">{status.message}</p>
      <p className="privacy-note">We use the information you submit only to respond to your message. Please do not include sensitive personal information. See our <a href="/privacy">Privacy Policy</a>.</p>
    </form>
  );
}
