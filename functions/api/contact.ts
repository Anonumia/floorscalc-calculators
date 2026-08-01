interface Env {
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

const attempts = new Map<string, number[]>();
const WINDOW = 60_000;
const LIMIT = 5;
const clean = (value: unknown) => String(value || "").trim();
const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" },
});

export async function onRequestPost({ request, env }: PagesContext) {
  const ip = request.headers.get("CF-Connecting-IP")
    || request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim()
    || "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < WINDOW);
  if (recent.length >= LIMIT) return json({ error: "Too many messages were submitted. Please wait a minute and try again." }, 429);
  recent.push(now);
  attempts.set(ip, recent);

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid form submission." }, 400);
  }
  if (input.website) return json({ ok: true });

  const name = clean(input.name);
  const email = clean(input.email);
  const subject = clean(input.subject);
  const message = clean(input.message);
  if (/[\r\n]/.test(name + email + subject) || !name || !/^\S+@\S+\.\S+$/.test(email) || !subject || !message) {
    return json({ error: "Please complete every field and enter a valid email address." }, 400);
  }
  if (name.length > 100 || email.length > 254 || subject.length > 160 || message.length > 5000) {
    return json({ error: "One or more fields are too long." }, 400);
  }
  if (!env.RESEND_API_KEY || !env.CONTACT_EMAIL || !env.CONTACT_FROM_EMAIL) {
    return json({ error: "The contact form is not configured yet." }, 503);
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
        "idempotency-key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_EMAIL],
        reply_to: email,
        subject: `FloorsCalc contact: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      }),
    });
    if (!response.ok) {
      console.error(`Contact delivery provider returned HTTP ${response.status}`);
      return json({ error: "Your message could not be sent. Please try again." }, 502);
    }
    return json({ ok: true });
  } catch {
    console.error("Contact delivery provider could not be reached.");
    return json({ error: "Your message could not be sent. Please try again." }, 502);
  }
}

export function onRequest() {
  return json({ error: "Method not allowed." }, 405);
}
