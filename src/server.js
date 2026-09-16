const express = require("express");
const { loadBuckets } = require("./loader");
const { parseSmsBatch } = require("./engine");
const { routeAndForward } = require("./router");

const app  = express();
const PORT = process.env.PORT || 3000;
const ROLE = (process.env.ROLE || "omega").toLowerCase();

/* ─── CORS ─── */
// Set CORS_ORIGIN to a comma-separated list in production when needed.
// Defaults to the local frontend used during development.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5000")
    .split(",")
    .map(origin => origin.trim())
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

/* ─── /health ─── */
app.get("/health", async (req, res) => {
    if (ROLE === "alpha") {
        return res.json({
            status:  "ok",
            role:    "alpha",
            master:  process.env.MASTER === "true",
            service: process.env.SERVICE_NAME || "unknown"
        });
    }

    // omega — report loaded bucket info
    const buckets = loadBuckets();
    const info    = Object.entries(buckets).map(([name, templates]) => ({
        bucket:    name,
        templates: templates.length
    }));
    return res.json({
        status:    "ok",
        role:      "omega",
        service:   process.env.SERVICE_NAME || "unknown",
        buckets:   info,
        totalTemplates: info.reduce((s, b) => s + b.templates, 0)
    });
});

/* ─── /parse ─── */
app.post("/parse", async (req, res) => {
    const { deviceId, sms } = req.body;

    if (!deviceId || !Array.isArray(sms) || sms.length === 0) {
        return res.status(400).json({ error: "deviceId and sms[] required" });
    }

    try {
        if (ROLE === "alpha") {
            const evidence = await routeAndForward(deviceId, sms);
            return res.json({ deviceId, evidence });
        }

        // omega — run engine directly
        const evidence = await parseSmsBatch(sms);
        return res.json({ deviceId, evidence });

    } catch (err) {
        console.error("[server] /parse error:", err.message);
        return res.status(500).json({ error: "parse failed" });
    }
});

/* ─── start ─── */
app.listen(PORT, async () => {
    if (ROLE === "omega") {
        // pre-load buckets on startup so first request is fast
        try {
            await require("./loader").initBuckets();
            console.log(`[server] omega ready on :${PORT}`);
        } catch (err) {
            console.error("[server] bucket load failed:", err.message);
        }
    } else {
        console.log(`[server] alpha ready on :${PORT} | master=${process.env.MASTER === "true"}`);
    }
});
