interface Env {
  BREVO_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const attempts = new Map<string, number[]>();
const duplicates = new Map<string, number>();
const WINDOW = 60_000;
const DUPLICATE_WINDOW = 30 * 60_000;
const LIMIT = 5;
export const BREVO_IDEMPOTENCY_KEY_MAX_LENGTH = 32;
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character] || character);
const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: {
    "allow": "POST",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  },
});

export const createIdempotencyKey = async (fields: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const value = [fields.name, fields.email, fields.subject, fields.message].join("\n");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, BREVO_IDEMPOTENCY_KEY_MAX_LENGTH);
};

export const formatSubmittedAt = (date: Date) => {
  const timeZone = "America/New_York";
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
  return `${formattedDate} • ${formattedTime}`;
};

export async function onRequestPost({ request, env }: PagesContext) {
  const ip = request.headers.get("CF-Connecting-IP")
    || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim()
    || "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < WINDOW);
  if (recent.length >= LIMIT) {
    console.warn("FloorsCalc contact rate limit reached", { ip });
    return json({ error: "Too many messages were submitted. Please wait a minute and try again." }, 429);
  }
  recent.push(now);
  attempts.set(ip, recent);

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ error: "Invalid form submission." }, 400);
  }

  let input: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid JSON object");
    input = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid form submission." }, 400);
  }
  if (clean(input.website)) return json({ ok: true });

  const name = clean(input.name);
  const email = clean(input.email);
  const subject = clean(input.subject);
  const message = clean(input.message);
  if (/\r|\n/.test(name + email + subject) || !/^\S+@\S+\.\S+$/.test(email) || !message) {
    return json({ error: "Please enter a valid email address and a message." }, 400);
  }
  if (name.length > 100 || email.length > 254 || subject.length > 160 || message.length > 5000) {
    return json({ error: "One or more fields are too long." }, 400);
  }
  if (!env.BREVO_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    console.error("FloorsCalc contact environment variables are missing");
    return json({ error: "The contact form is temporarily unavailable. Please try again later." }, 503);
  }

  const duplicateKey = await createIdempotencyKey({ name, email, subject, message });
  const previousAttempt = duplicates.get(duplicateKey);
  if (previousAttempt && now - previousAttempt < DUPLICATE_WINDOW) return json({ ok: true });
  duplicates.set(duplicateKey, now);
  for (const [key, time] of duplicates) {
    if (now - time >= DUPLICATE_WINDOW) duplicates.delete(key);
  }

  const submitted = formatSubmittedAt(new Date(now));
  const displayName = name || "Not provided";
  const displaySubject = subject || "(No subject provided)";
  const divider = "--------------------------------------------------";
  const emailFields = [
    ["Name", displayName],
    ["Email", email],
    ["Subject", displaySubject],
    ["Submitted", submitted],
  ];
  const htmlFields = emailFields.map(([label, value]) => `
    <tr>
      <td style="padding:8px 16px 8px 0;color:#64748b;font-size:13px;font-weight:700;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#1e293b;font-size:14px;line-height:1.5;">${escapeHtml(value)}</td>
    </tr>`).join("");
  const htmlContent = `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#1e293b;">
  <div style="padding:32px 16px;">
    <div style="max-width:640px;margin:0 auto;overflow:hidden;border:1px solid #dbe5df;border-radius:16px;background:#ffffff;box-shadow:0 8px 24px rgba(15,23,42,.08);">
      <div style="padding:24px 28px;background:#173f35;color:#ffffff;">
        <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#c8dfb4;">FloorsCalc</div>
        <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;">New contact form submission</h1>
      </div>
      <div style="padding:24px 28px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">${htmlFields}
        </table>
        <div style="height:1px;margin:20px 0;background:#e2e8f0;"></div>
        <div style="margin-bottom:8px;color:#64748b;font-size:13px;font-weight:700;">Message</div>
        <div style="white-space:pre-wrap;color:#1e293b;font-size:15px;line-height:1.65;">${escapeHtml(message)}</div>
      </div>
      <div style="padding:16px 28px;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.5;">Reply to this email to respond directly to ${escapeHtml(name || email)}.</div>
    </div>
  </div>
</body></html>`;
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "FloorsCalc", email: env.CONTACT_FROM_EMAIL },
        to: [{ email: env.CONTACT_TO_EMAIL }],
        replyTo: { email, name: name || email },
        subject: `FloorsCalc contact: ${subject || "General inquiry"}`,
        htmlContent,
        textContent: `${divider}\nNew FloorsCalc Contact Form Submission\n${divider}\n\nWebsite:\nFloorsCalc\n\nName:\n${displayName}\n\nEmail:\n${email}\n\nSubject:\n${displaySubject}\n\nMessage:\n${message}\n\nSubmitted:\n${submitted}\n\n${divider}\n\nReply to this email to respond directly to ${name || email}.`,
        headers: { idempotencyKey: duplicateKey },
        tags: ["floorscalc-contact"],
      }),
    });
    const responseBody = await response.text();
    if (!response.ok) {
      let detail: Record<string, unknown> = {};
      try {
        detail = JSON.parse(responseBody) as Record<string, unknown>;
      } catch {
        detail = { raw: responseBody };
      }
      if (detail.code === "duplicate_parameter") return json({ ok: true });
      duplicates.delete(duplicateKey);
      console.error("Brevo contact delivery failed", { status: response.status, code: detail.code || "unknown" });
      return json({ error: "Your message could not be sent. Please try again later." }, 502);
    }
    return json({ ok: true });
  } catch (error) {
    duplicates.delete(duplicateKey);
    console.error("Brevo contact delivery could not be reached", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Your message could not be sent. Please try again later." }, 502);
  }
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
