'use strict';
/* cloud.mrcyberleon.org
   Live card: visitor counter (Lambda URL), intel API (API Gateway), latest GitHub Actions runs.
   Intel card: one fact per request. Theme toggle persisted in localStorage. No dependencies. */

const VERSION = 'v2.0.0';
const COUNTER_URL = 'https://syjqj5dnxt66uppllhlubt5zbm0nsrdm.lambda-url.us-east-1.on.aws/';
const API_BASE = 'https://wrnqhuvrp9.execute-api.us-east-1.amazonaws.com/dev';
const REPO = 'MrGuato/AWS-Cloud-Challenge';
const WORKFLOWS = { site: 'front-end-cicd.yaml', api: 'deploy.yml' };
const TIMEOUT = 8000;

// Warcraft item rarity per fact category. Unknown categories render as plain chips.
const RARITY = {
  'zero-trust': 'legendary', 'incident-response': 'legendary', 'supply-chain': 'legendary',
  encryption: 'epic', iam: 'epic', devsecops: 'epic', cloud: 'epic',
  patching: 'rare', authentication: 'rare', network: 'rare', monitoring: 'rare', ransomware: 'rare',
  phishing: 'uncommon', passwords: 'uncommon', backups: 'uncommon', 'social-engineering': 'uncommon',
};

// ---- helpers ----
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const pad = n => String(n).padStart(2, '0');
const hhmmss = d => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const fmtInt = n => Number(n).toLocaleString('en-US');

function getJSON(url, init = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  return fetch(url, { cache: 'no-store', ...init, signal: ctl.signal })
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .finally(() => clearTimeout(t));
}
async function timed(url) {
  const t0 = performance.now();
  const data = await getJSON(url);
  return { data, ms: Math.round(performance.now() - t0) };
}
function setValue(el, html, cls) {
  if (!el) return;
  el.innerHTML = html;
  el.className = cls || '';
}

// ---- theme ----
function applyTheme(t) {
  document.documentElement.dataset.theme = (t === 'light' || t === 'dark') ? t : '';
  document.querySelectorAll('#themeSeg button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
}
applyTheme(new URLSearchParams(location.search).get('theme') || safeGet('theme') || 'auto');
$('themeSeg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  safeSet('theme', b.dataset.t); applyTheme(b.dataset.t);
});
$('version').textContent = VERSION;
$('year').textContent = String(new Date().getFullYear());

// ---- headline status: only the runtime services count ----
const health = { counter: null, api: null };
function renderStatus() {
  const dot = $('statusDot'), txt = $('statusText');
  const vals = Object.values(health);
  let state = '', label = 'Connecting';
  if (!vals.some(v => v === null)) {
    if (vals.every(v => v === 'ok')) { state = 'ok'; label = 'All systems operational'; }
    else if (vals.every(v => v === 'bad')) { state = 'bad'; label = 'Major outage'; }
    else { state = 'warn'; label = 'Partial outage'; }
    $('checked').textContent = hhmmss(new Date());
  }
  dot.className = 'dot' + (state ? ' ' + state : '');
  txt.textContent = label;
  txt.className = state || 'dim';
}

// ---- visitor counter ----
async function loadCounter() {
  try {
    const views = Number(await getJSON(COUNTER_URL));
    if (!Number.isFinite(views)) throw new Error('not a number');
    setValue($('hViews'), esc(fmtInt(views)));
    health.counter = 'ok';
  } catch (err) {
    console.warn('counter', err);
    setValue($('hViews'), 'unavailable', 'bad');
    health.counter = 'bad';
  }
  renderStatus();
}

// ---- intel API ----
async function loadApi() {
  try {
    // v2 exposes /health; the original deployment only had /starwarsfact.
    let ms, version = null, v2 = false;
    try {
      const r = await timed(`${API_BASE}/health`);
      ms = r.ms; version = r.data.version; v2 = true;
    } catch {
      const r = await timed(`${API_BASE}/starwarsfact`);
      ms = r.ms;
    }
    setValue($('hApi'), `Online<small>${ms} ms${version ? ' · v' + esc(version) : ''}</small>`, 'ok');
    health.api = 'ok';
    if (v2) loadCategories();
  } catch (err) {
    console.warn('api', err);
    setValue($('hApi'), 'Offline', 'bad');
    health.api = 'bad';
  }
  renderStatus();
}

async function loadCategories() {
  try {
    const data = await getJSON(`${API_BASE}/starwarsfacts`);
    const sel = $('sector');
    for (const c of data.categories || []) {
      const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o);
    }
    sel.hidden = false;
  } catch (err) { console.warn('categories', err); }
}

async function newFact() {
  const btn = $('factBtn'), out = $('fact'), live = $('factLive'), chips = $('factChips');
  btn.disabled = true; live.textContent = 'requesting ...';
  const sector = $('sector').hidden ? 'all' : $('sector').value;
  const t0 = performance.now();
  try {
    let fact, path;
    if (sector !== 'all') {
      path = `/starwarsfacts?category=${encodeURIComponent(sector)}`;
      const data = await getJSON(API_BASE + path);
      fact = data.facts[Math.floor(Math.random() * data.facts.length)];
    } else {
      path = '/starwarsfact';
      fact = await getJSON(API_BASE + path);
    }
    if (!fact || typeof fact.fact !== 'string') throw new Error('unexpected payload');
    out.textContent = fact.fact;
    const rarity = RARITY[fact.category];
    chips.innerHTML = (fact.category ? `<span class="chip${rarity ? ' rarity-' + rarity : ''}">${esc(fact.category)}${rarity ? ' · ' + rarity : ''}</span>` : '')
      + (fact.id ? `<span class="chip">${fact.id} of ${fact.total}</span>` : '');
    live.textContent = `GET ${path} · ${Math.round(performance.now() - t0)} ms`;
    btn.textContent = 'Another';
  } catch (err) {
    console.warn('fact', err);
    out.textContent = 'The API did not answer. Try again in a moment.';
    chips.innerHTML = '';
    live.textContent = `error: ${err.message || err}`;
  } finally { btn.disabled = false; }
}
$('factBtn').addEventListener('click', newFact);

// ---- GitHub Actions (public API, no token) ----
async function loadRun(file, id) {
  const el = $(id);
  try {
    const data = await getJSON(`https://api.github.com/repos/${REPO}/actions/workflows/${file}/runs?branch=main&per_page=1`,
      { headers: { Accept: 'application/vnd.github+json' } });
    const run = data.workflow_runs && data.workflow_runs[0];
    if (!run) { setValue(el, 'no runs', 'dim'); return; }
    const running = run.status !== 'completed';
    const ok = run.conclusion === 'success';
    const cls = running ? 'warn' : ok ? 'ok' : 'bad';
    const label = running ? 'Running' : ok ? 'Passing' : run.conclusion === 'cancelled' ? 'Cancelled' : 'Failing';
    const when = new Date(run.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setValue(el, `<a class="${cls}" href="${esc(run.html_url)}" target="_blank" rel="noopener">${label}</a><small>#${run.run_number} · ${when}</small>`);
  } catch (err) {
    console.warn('actions', file, err);
    setValue(el, 'n/a', 'dim');
  }
}

// ---- boot ----
loadCounter();
loadApi();
loadRun(WORKFLOWS.site, 'hSite');
loadRun(WORKFLOWS.api, 'hApiDeploy');
