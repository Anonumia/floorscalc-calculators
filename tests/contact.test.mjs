import assert from "node:assert/strict";
import test from "node:test";
import { onRequest, onRequestPost } from "../functions/api/contact.ts";

const request = (body, ip = "203.0.113.1") => new Request("https://floorscalc.com/api/contact", {
  method: "POST",
  headers: { "content-type": "application/json", "CF-Connecting-IP": ip },
  body: typeof body === "string" ? body : JSON.stringify(body),
});
const valid = { name: "Test User", email: "test@example.com", subject: "Calculator", message: "Question" };

test("contact function rejects unsupported methods", async () => {
  assert.equal((await onRequest()).status, 405);
});

test("contact function validates JSON and required fields", async () => {
  assert.equal((await onRequestPost({ request: request("{"), env: {} })).status, 400);
  assert.equal((await onRequestPost({ request: request({ ...valid, email: "invalid" }, "203.0.113.2"), env: {} })).status, 400);
});

test("contact honeypot returns safely without delivery", async () => {
  const response = await onRequestPost({ request: request({ ...valid, website: "bot" }, "203.0.113.3"), env: {} });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("contact secrets are required only on the server", async () => {
  const response = await onRequestPost({ request: request(valid, "203.0.113.4"), env: {} });
  assert.equal(response.status, 503);
});

test("contact function delivers through Resend with environment bindings", async () => {
  const originalFetch = globalThis.fetch;
  let delivery;
  globalThis.fetch = async (url, init) => {
    delivery = { url, init };
    return new Response(null, { status: 200 });
  };
  try {
    const response = await onRequestPost({
      request: request(valid, "203.0.113.5"),
      env: { RESEND_API_KEY: "secret", CONTACT_EMAIL: "owner@example.com", CONTACT_FROM_EMAIL: "site@example.com" },
    });
    assert.equal(response.status, 200);
    assert.equal(delivery.url, "https://api.resend.com/emails");
    assert.equal(delivery.init.headers.authorization, "Bearer secret");
    const body = JSON.parse(delivery.init.body);
    assert.deepEqual(body.to, ["owner@example.com"]);
    assert.equal(body.from, "site@example.com");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("contact function rate limits repeated submissions", async () => {
  const ip = "203.0.113.6";
  for (let index = 0; index < 5; index += 1) {
    assert.equal((await onRequestPost({ request: request(valid, ip), env: {} })).status, 503);
  }
  assert.equal((await onRequestPost({ request: request(valid, ip), env: {} })).status, 429);
});
