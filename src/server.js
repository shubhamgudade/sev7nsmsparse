const express = require("express");
const path    = require("path");
const fs      = require("fs");
const { loadBuckets } = require("./loader");
const { parseSmsBatch } = require("./engine");
const { routeAndForward } = require("./router");

const app  = express();
const PORT = process.env.PORT || 3000;
const ROLE = (process.env.ROLE || "omega").toLowerCase();

/* ═══════════════════════════════════════════════════
   IN-MEMORY LOG STORE
   Ring buffer — last 500 events, never hits disk
   ═══════════════════════════════════════════════════ */

const LOG_MAX = 500;
const _logs   = [];

function pushLog(level, source, message, meta = {}) {
    const entry = {
        id:        _logs.length > 0 ? _logs[_logs.length - 1].id + 1 : 1,
        ts:        Date.now(),
        level,     // "info" | "warn" | "error" | "parse" | "ping"
        source,    // "server" | "parse" | "ping" | agent name
        message,
        meta       // free-form: deviceId, phonesFound, bucket counts, etc.
    };
    _logs.push(entry);
    if (_logs.length > LOG_MAX) _logs.shift();
}

/* ═══════════════════════════════════════════════════
   SESSION STATS
   Reset on each new parse batch; accumulates until next
   ═══════════════════════════════════════════════════ */

let _session = {
    startedAt:    null,
    deviceId:     null,
    smsIn:        0,
    phonesFound:  0,
    bucketHits:   {},
    parseMs:      0,
    status:       "idle"   // "idle" | "working"
};

function resetSession(deviceId, smsCount) {
    _session = {
        startedAt:   Date.now(),
        deviceId,
        smsIn:       smsCount,
        phonesFound: 0,
        bucketHits:  {},
        parseMs:     0,
        status:      "working"
    };
}

function finalizeSession(evidence, durationMs) {
    _session.phonesFound = Object.keys(evidence).length;
    _session.parseMs     = durationMs;
    _session.status      = "idle";

    // bucket hit counts from evidence sms texts — best effort
    // real bucket breakdown comes from router, this is a summary
    _session.completedAt = Date.now();
}

/* ═══════════════════════════════════════════════════
   CORS
   ═══════════════════════════════════════════════════ */

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5000")
    .split(",")
    .map(o => o.trim())
    .filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(origin && allowedOrigins.includes(origin) ? 204 : 403);
    }
    next();
});

app.use(express.json({ limit: "50mb" }));

/* ═══════════════════════════════════════════════════
   MONITOR — static dashboard
   Serves monitor/index.html at /monitor/
   ═══════════════════════════════════════════════════ */

const MONITOR_DIR = path.resolve(__dirname, "monitor");
app.use("/monitor", express.static(MONITOR_DIR));

/* ═══════════════════════════════════════════════════
   MONITOR API — /monitor/api/*
   ═══════════════════════════════════════════════════ */

const CONFIG_PATH = path.resolve(__dirname, "assets/data/config.json");

function readConfig() {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    } catch {
        return null;
    }
}

/* GET /monitor/api/config — exposes full config to frontend */
app.get("/monitor/api/config", (req, res) => {
    const config = readConfig();
    if (!config) return res.status(500).json({ error: "config read failed" });
    res.json(config);
});

/* GET /monitor/api/logs?since=<id>&limit=<n> */
app.get("/monitor/api/logs", (req, res) => {
    const since = parseInt(req.query.since) || 0;
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const slice = since
        ? _logs.filter(l => l.id > since).slice(-limit)
        : _logs.slice(-limit);
    res.json({ logs: slice, total: _logs.length });
});

/* GET /monitor/api/session */
app.get("/monitor/api/session", (req, res) => {
    res.json(_session);
});

/* GET /monitor/api/agents — live ping all agents from config */
app.get("/monitor/api/agents", async (req, res) => {
    const config = readConfig();
    if (!config) return res.status(500).json({ error: "config read failed" });

    const agents   = config.agents   || {};
    const alphaSet = new Set(config.alpha?.agents || []);
    const master   = config.alpha?.master;
    const buckets  = config.buckets  || {};

    // build per-agent bucket membership
    const agentBuckets = {};
    for (const [bucketName, bucket] of Object.entries(buckets)) {
        for (const proc of (bucket.processors || [])) {
            if (!agentBuckets[proc]) agentBuckets[proc] = [];
            agentBuckets[proc].push({
                name:       bucketName,
                files:      (bucket.files || []).length,
                fileList:   bucket.files || []
            });
        }
    }

    // ping all agents concurrently, 4s timeout each
    const agentEntries = Object.entries(agents);
    const pingResults  = await Promise.all(
        agentEntries.map(async ([name, url]) => {
            const t0 = Date.now();
            try {
                const controller = new AbortController();
                const timer = setTimeout(() => controller.abort(), 4000);
                const r     = await fetch(`${url}/health`, {
                    method: "GET",
                    cache:  "no-store",
                    signal: controller.signal
                });
                clearTimeout(timer);
                const latencyMs = Date.now() - t0;
                const data = r.ok ? await r.json() : {};
                const isAlpha  = alphaSet.has(name);
                const isMaster = name === master;

                pushLog("ping", name, `health ok — ${latencyMs}ms`, { latencyMs, role: isAlpha ? "alpha" : "omega" });

                return {
                    name,
                    url,
                    role:       isAlpha ? "alpha" : "omega",
                    isMaster,
                    online:     r.ok,
                    latencyMs,
                    buckets:    agentBuckets[name] || [],
                    health:     data,
                    checkedAt:  Date.now()
                };
            } catch (err) {
                pushLog("warn", name, `health failed — ${err.message}`, { error: err.message });
                return {
                    name,
                    url,
                    role:      alphaSet.has(name) ? "alpha" : "omega",
                    isMaster:  name === master,
                    online:    false,
                    latencyMs: null,
                    buckets:   agentBuckets[name] || [],
                    health:    {},
                    checkedAt: Date.now()
                };
            }
        })
    );

    res.json({ agents: pingResults, checkedAt: Date.now() });
});

/* ═══════════════════════════════════════════════════
   /health
   ═══════════════════════════════════════════════════ */

app.get("/health", async (req, res) => {
    if (ROLE === "alpha") {
        return res.json({
            status:  "ok",
            role:    "alpha",
            master:  process.env.MASTER === "true",
            service: process.env.SERVICE_NAME || "unknown"
        });
    }

    const buckets = loadBuckets();
    const info    = Object.entries(buckets).map(([name, templates]) => ({
        bucket:    name,
        templates: templates.length
    }));
    return res.json({
        status:         "ok",
        role:           "omega",
        service:        process.env.SERVICE_NAME || "unknown",
        buckets:        info,
        totalTemplates: info.reduce((s, b) => s + b.templates, 0)
    });
});

/* ═══════════════════════════════════════════════════
   /parse — instrumented
   ═══════════════════════════════════════════════════ */

app.post("/parse", async (req, res) => {
    const { deviceId, sms } = req.body;

    if (!deviceId || !Array.isArray(sms) || sms.length === 0) {
        pushLog("warn", "server", "bad /parse request — missing deviceId or sms[]", { deviceId });
        return res.status(400).json({ error: "deviceId and sms[] required" });
    }

    resetSession(deviceId, sms.length);
    pushLog("parse", "server", `parse started — device=${deviceId} sms=${sms.length}`, {
        deviceId,
        smsCount: sms.length,
        role: ROLE
    });

    const t0 = Date.now();

    try {
        let evidence;

        if (ROLE === "alpha") {
            evidence = await routeAndForward(deviceId, sms);
        } else {
            evidence = await parseSmsBatch(sms);
        }

        const durationMs   = Date.now() - t0;
        const phonesFound  = Object.keys(evidence).length;

        finalizeSession(evidence, durationMs);

        pushLog("parse", "server", `parse done — ${phonesFound} phones in ${durationMs}ms`, {
            deviceId,
            smsCount:   sms.length,
            phonesFound,
            durationMs,
            role: ROLE
        });

        return res.json({ deviceId, evidence });

    } catch (err) {
        const durationMs = Date.now() - t0;
        _session.status  = "idle";
        pushLog("error", "server", `parse failed — ${err.message}`, {
            deviceId,
            durationMs,
            error: err.message
        });
        return res.status(500).json({ error: "parse failed" });
    }
});

/* ═══════════════════════════════════════════════════
   START
   ═══════════════════════════════════════════════════ */

app.listen(PORT, async () => {
    if (ROLE === "omega") {
        try {
            await require("./loader").initBuckets();
            pushLog("info", "server", `omega ready on :${PORT}`, { port: PORT, role: "omega" });
        } catch (err) {
            pushLog("error", "server", `bucket load failed — ${err.message}`, { error: err.message });
        }
    } else {
        const isMaster = process.env.MASTER === "true";
        pushLog("info", "server", `alpha ready on :${PORT}`, {
            port: PORT, role: "alpha", master: isMaster,
            service: process.env.SERVICE_NAME || "unknown"
        });
    }
});
