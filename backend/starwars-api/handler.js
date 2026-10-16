"use strict";

/**
 * Cyber x Star Wars intel API.
 *
 * One Lambda, three routes (API Gateway REST API, Lambda proxy integration):
 *
 *   GET /starwarsfact          -> one random fact
 *   GET /starwarsfact?id=<n>   -> a specific fact (ids start at 1)
 *   GET /starwarsfacts         -> every fact, optionally filtered with ?category=<name>
 *   GET /health                -> liveness, version and fact count
 *
 * Every response is JSON and carries CORS + basic hardening headers.
 */

const { randomInt } = require("node:crypto");
const facts = require("./starwarsFacts");

const DEFAULT_ORIGIN = "https://cloud.mrcyberleon.org";
const CATEGORIES = [...new Set(facts.map((f) => f.category))].sort();

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || DEFAULT_ORIGIN)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function requestOrigin(event) {
  const headers = (event && event.headers) || {};
  const key = Object.keys(headers).find((name) => name.toLowerCase() === "origin");
  return key ? headers[key] : "";
}

// Echo the caller's origin only when it is on the allow list; otherwise answer with the
// primary origin so a browser on an unknown site cannot read the response.
function corsOrigin(event) {
  const origins = allowedOrigins();
  const origin = requestOrigin(event);
  return origins.includes(origin) ? origin : origins[0];
}

function respond(event, statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": corsOrigin(event),
      Vary: "Origin",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
    body: JSON.stringify(body),
  };
}

function queryParams(event) {
  return (event && event.queryStringParameters) || {};
}

function parseId(raw) {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return id >= 1 && id <= facts.length ? id : null;
}

function getFact(event) {
  const params = queryParams(event);

  if (params.id !== undefined) {
    const id = parseId(String(params.id));
    if (id === null) {
      return respond(event, 400, {
        error: `id must be a whole number between 1 and ${facts.length}`,
      });
    }
    return respond(event, 200, { ...facts[id - 1], total: facts.length });
  }

  const fact = facts[randomInt(facts.length)];
  return respond(event, 200, { ...fact, total: facts.length });
}

function listFacts(event) {
  const params = queryParams(event);

  if (params.category !== undefined) {
    const category = String(params.category).trim().toLowerCase();
    if (!CATEGORIES.includes(category)) {
      return respond(event, 400, { error: "unknown category", categories: CATEGORIES });
    }
    const subset = facts.filter((f) => f.category === category);
    return respond(event, 200, { total: subset.length, category, facts: subset });
  }

  return respond(event, 200, { total: facts.length, categories: CATEGORIES, facts });
}

function health(event) {
  return respond(event, 200, {
    status: "ok",
    service: "starwars-api",
    version: process.env.API_VERSION || "dev",
    facts: facts.length,
    region: process.env.AWS_REGION || "unknown",
    timestamp: new Date().toISOString(),
  });
}

function route(event) {
  const path = String((event && (event.resource || event.path)) || "/").toLowerCase();
  if (path.endsWith("/starwarsfacts")) return listFacts(event);
  if (path.endsWith("/health")) return health(event);
  return getFact(event);
}

module.exports.starwarsfact = async (event) => {
  try {
    return route(event);
  } catch (error) {
    console.error("Unhandled error while serving request", error);
    return respond(event, 500, { error: "internal error" });
  }
};

// Exposed for unit tests only.
module.exports._internal = { route, corsOrigin, CATEGORIES };
