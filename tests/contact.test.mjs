import assert from "node:assert/strict";
import test from "node:test";
import { onRequest, onRequestPost } from "../functions/api/contact.ts";

const request = (body, ip = "203.0.113.1") => new Request("https://floorscalc.com/api/contact", {
  method: "POST",
  headers: { "content-type": "application/json", "CF-Connecting-IP": ip },
  body: typeof body === "string" ? body : JSON.stringify(body),
});
const valid = { name: " Test User ", email: "test@example.com", subject: " Calculator ", message: " Question " };

test("contact function rejects unsupported methods", async () => {
  assert.equal((await onRequest()).status, 405);
});

test("contact function validates JSON and required fields", async () => {
  assert.equal((await onRequestPost({ request: request("{"), env: {} })).status, 400);
  assert.equal((await onRequestPost({ request: request({ ...valid, email: "invalid" }, "203.0.113.2"), env: {} })).status, 400);
  assert.equal((await onRequestPost({ request: request({ ...valid, message: "" }, "203.0.113.20"), env: {} })).status, 400);
  const wrongType = new Request("https://floorscalc.com/api/contact", { method: "POST", body: "text" });
  assert.equal((await onRequestPost({ request: wrongType, env: {} })).status, 400);
});

test("contact honeypot returns safely without delivery", async () => {
  const response = await onRequestPost({ request: request({ ...valid, website: "bot" }, "203.0.113.3"), env: {} });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("contact secrets are required only on the server", async () => {
  const response = await onRequestPost({ request: request(valid, "203.0.113.4"), env: {} });
  assert.equal(response.status, 503);
  assert.deepEqual((await response.json()).debug, {
    BREVO_API_KEY: false,
    CONTACT_FROM_EMAIL: false,
    CONTACT_TO_EMAIL: false,
    brevoStatus: null,
    brevoBody: null,
    exception: null,
  });
});

test("contact failure temporarily returns safe Brevo diagnostics", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ code: "unauthorized", message: "Key not found" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
  try {
    const response = await onRequestPost({
      request: request(valid, "203.0.113.40"),
      env: { BREVO_API_KEY: "never-return-this", CONTACT_TO_EMAIL: "owner@example.com", CONTACT_FROM_EMAIL: "verified@example.com" },
    });
    const body = await response.json();
    assert.equal(response.status, 502);
    assert.equal(body.debug.BREVO_API_KEY, true);
    assert.equal(body.debug.CONTACT_FROM_EMAIL, true);
    assert.equal(body.debug.CONTACT_TO_EMAIL, true);
    assert.equal(body.debug.brevoStatus, 401);
    assert.deepEqual(body.debug.brevoBody, { code: "unauthorized", message: "Key not found" });
    assert.doesNotMatch(JSON.stringify(body), /never-return-this/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("contact function delivers through Brevo with environment bindings", async () => {
  const originalFetch = globalThis.fetch;
  let delivery;
  globalThis.fetch = async (url, init) => {
    delivery = { url, init };
    return new Response(null, { status: 200 });
  };
  try {
    const response = await onRequestPost({
      request: request(valid, "203.0.113.5"),
      env: { BREVO_API_KEY: "secret", CONTACT_TO_EMAIL: "owner@example.com", CONTACT_FROM_EMAIL: "verified@example.com" },
    });
    assert.equal(response.status, 200);
    assert.equal(delivery.url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(delivery.init.headers["api-key"], "secret");
    const body = JSON.parse(delivery.init.body);
    assert.deepEqual(body.sender, { name: "FloorsCalc", email: "verified@example.com" });
    assert.deepEqual(body.to, [{ email: "owner@example.com" }]);
    assert.deepEqual(body.replyTo, { email: "test@example.com", name: "Test User" });
    assert.match(body.textContent, /Website:\nFloorsCalc/);
    assert.match(body.textContent, /Subject:\nCalculator/);
    assert.match(body.textContent, /Submitted:\n\d{4}-\d{2}-\d{2}T/);
    assert.ok(body.headers.idempotencyKey);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("contact subject is optional and duplicate submissions are accepted once", async () => {
  const originalFetch = globalThis.fetch;
  let deliveries = 0;
  globalThis.fetch = async () => { deliveries += 1; return new Response(null, { status: 201 }); };
  const env = { BREVO_API_KEY: "secret", CONTACT_TO_EMAIL: "owner@example.com", CONTACT_FROM_EMAIL: "verified@example.com" };
  const body = { ...valid, subject: "" };
  try {
    assert.equal((await onRequestPost({ request: request(body, "203.0.113.7"), env })).status, 200);
    assert.equal((await onRequestPost({ request: request(body, "203.0.113.7"), env })).status, 200);
    assert.equal(deliveries, 1);
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
