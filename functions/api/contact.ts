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
  if (/\r|\n/.test(name + email + subject) || !name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
    return json({ error: "Please enter your name, a valid email address, and a message." }, 400);
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
  const displaySubject = subject || "(No subject provided)";
  const divider = "--------------------------------------------------";
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
        replyTo: { email, name },
        subject: `FloorsCalc contact: ${subject || "General inquiry"}`,
        textContent: `${divider}\nNew FloorsCalc Contact Form Submission\n${divider}\n\nWebsite:\nFloorsCalc\n\nName:\n${name}\n\nEmail:\n${email}\n\nSubject:\n${displaySubject}\n\nMessage:\n${message}\n\nSubmitted:\n${submitted}\n\n${divider}`,
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
