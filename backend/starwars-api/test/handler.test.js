"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const facts = require("../starwarsFacts");
const { starwarsfact, _internal } = require("../handler");

const PROD_ORIGIN = "https://cloud.mrcyberleon.org";

function makeEvent(resource, { query, origin } = {}) {
  return {
    resource,
    path: resource,
    httpMethod: "GET",
    headers: origin ? { Origin: origin } : {},
    queryStringParameters: query || null,
  };
}

const body = (response) => JSON.parse(response.body);

test("the fact list is well formed", () => {
  assert.ok(facts.length >= 30, "expected at least 30 facts");

  const ids = facts.map((f) => f.id);
  assert.deepEqual(ids, facts.map((_, i) => i + 1), "ids must be 1..n in order");

  const texts = new Set();
  for (const fact of facts) {
    assert.equal(typeof fact.fact, "string");
    assert.ok(fact.fact.trim().length > 20, `fact ${fact.id} is too short`);
    assert.ok(_internal.CATEGORIES.includes(fact.category), `fact ${fact.id} has unknown category`);
    assert.ok(!texts.has(fact.fact), `fact ${fact.id} is a duplicate`);
    texts.add(fact.fact);
  }
});

test("GET /starwarsfact returns a random fact with the expected shape", async () => {
  const response = await starwarsfact(makeEvent("/starwarsfact"));
  assert.equal(response.statusCode, 200);

  const data = body(response);
  assert.equal(typeof data.fact, "string");
  assert.equal(typeof data.category, "string");
  assert.ok(data.id >= 1 && data.id <= facts.length);
  assert.equal(data.total, facts.length);
});

test("GET /starwarsfact eventually returns different facts", async () => {
  const seen = new Set();
  for (let i = 0; i < 50; i += 1) {
    seen.add(body(await starwarsfact(makeEvent("/starwarsfact"))).id);
  }
  assert.ok(seen.size > 1, "random selection always returned the same fact");
});

test("GET /starwarsfact?id=N returns that exact fact", async () => {
  const response = await starwarsfact(makeEvent("/starwarsfact", { query: { id: "4" } }));
  assert.equal(response.statusCode, 200);
  assert.equal(body(response).id, 4);
  assert.equal(body(response).fact, facts[3].fact);
});

test("GET /starwarsfact rejects invalid ids with 400", async () => {
  for (const id of ["0", "-1", "1.5", "abc", String(facts.length + 1), ""]) {
    const response = await starwarsfact(makeEvent("/starwarsfact", { query: { id } }));
    assert.equal(response.statusCode, 400, `id=${JSON.stringify(id)} should be rejected`);
    assert.match(body(response).error, /between 1 and/);
  }
});

test("GET /starwarsfacts lists every fact and the categories", async () => {
  const response = await starwarsfact(makeEvent("/starwarsfacts"));
  assert.equal(response.statusCode, 200);

  const data = body(response);
  assert.equal(data.total, facts.length);
  assert.equal(data.facts.length, facts.length);
  assert.deepEqual(data.categories, _internal.CATEGORIES);
});

test("GET /starwarsfacts?category=X filters by category", async () => {
  const category = _internal.CATEGORIES[0];
  const response = await starwarsfact(makeEvent("/starwarsfacts", { query: { category } }));
  assert.equal(response.statusCode, 200);

  const data = body(response);
  assert.equal(data.category, category);
  assert.ok(data.total > 0);
  assert.ok(data.facts.every((f) => f.category === category));
});

test("GET /starwarsfacts rejects an unknown category with the list of valid ones", async () => {
  const response = await starwarsfact(makeEvent("/starwarsfacts", { query: { category: "midichlorians" } }));
  assert.equal(response.statusCode, 400);
  assert.deepEqual(body(response).categories, _internal.CATEGORIES);
});

test("GET /health reports ok with version and fact count", async () => {
  process.env.API_VERSION = "9.9.9-test";
  const response = await starwarsfact(makeEvent("/health"));
  assert.equal(response.statusCode, 200);

  const data = body(response);
  assert.equal(data.status, "ok");
  assert.equal(data.service, "starwars-api");
  assert.equal(data.version, "9.9.9-test");
  assert.equal(data.facts, facts.length);
  assert.ok(!Number.isNaN(Date.parse(data.timestamp)));
});

test("CORS echoes an allowed origin and falls back to the primary one otherwise", async () => {
  process.env.ALLOWED_ORIGINS = `${PROD_ORIGIN}, http://localhost:8080`;

  const allowed = await starwarsfact(makeEvent("/starwarsfact", { origin: "http://localhost:8080" }));
  assert.equal(allowed.headers["Access-Control-Allow-Origin"], "http://localhost:8080");

  const lowercaseHeader = _internal.corsOrigin({ headers: { origin: "http://localhost:8080" } });
  assert.equal(lowercaseHeader, "http://localhost:8080");

  const unknown = await starwarsfact(makeEvent("/starwarsfact", { origin: "https://evil.example" }));
  assert.equal(unknown.headers["Access-Control-Allow-Origin"], PROD_ORIGIN);

  const none = await starwarsfact(makeEvent("/starwarsfact"));
  assert.equal(none.headers["Access-Control-Allow-Origin"], PROD_ORIGIN);

  delete process.env.ALLOWED_ORIGINS;
  const defaults = await starwarsfact(makeEvent("/starwarsfact", { origin: "http://localhost:8080" }));
  assert.equal(defaults.headers["Access-Control-Allow-Origin"], PROD_ORIGIN);
});

test("every response carries the hardening headers", async () => {
  for (const resource of ["/starwarsfact", "/starwarsfacts", "/health"]) {
    const response = await starwarsfact(makeEvent(resource));
    assert.equal(response.headers["Content-Type"], "application/json; charset=utf-8");
    assert.equal(response.headers["Cache-Control"], "no-store");
    assert.equal(response.headers["X-Content-Type-Options"], "nosniff");
    assert.equal(response.headers.Vary, "Origin");
  }
});

test("unknown paths fall back to a random fact instead of crashing", async () => {
  const response = await starwarsfact({ resource: "/something-else", headers: {} });
  assert.equal(response.statusCode, 200);
  assert.equal(typeof body(response).fact, "string");

  const empty = await starwarsfact(undefined);
  assert.equal(empty.statusCode, 200);
});
