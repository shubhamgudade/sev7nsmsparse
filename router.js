const fs   = require("fs");
const path = require("path");

const CONFIG_PATH = path.resolve(__dirname, "../assets/data/config.json");

/* ═══════════════════════════════════════════════════
   KEYWORD TABLES
   Add keywords here — logic never needs to change.
   Each entry: string (case-insensitive substring match)
   ═══════════════════════════════════════════════════ */

const OPERATOR_KEYWORDS = {
    jio_heavy:    [],   // e.g. "jio", "जियो", "ਜੀਓ"
    jio_regional: [],
    operators_airtel:   [],
    operators_vi_bsnl:  []
};

const CATEGORY_KEYWORDS = {
    categories: [],     // e.g. "bank", "otp", "balance", "credited"
    misc:       []      // e.g. "travel", "utility", "bill"
};

/* ═══════════════════════════════════════════════════
   CONFIG CACHE
   ═══════════════════════════════════════════════════ */

let _config = null;

function getConfig() {
    if (_config) return _config;
    try {
        _config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
        return _config;
    } catch (err) {
        throw new Error(`[router] config.json read failed: ${err.message}`);
    }
}

/* ═══════════════════════════════════════════════════
   KEYWORD DETECTION
   ═══════════════════════════════════════════════════ */

function matchKeywords(text, table) {
    const lower = text.toLowerCase();
    for (const [bucket, keywords] of Object.entries(table)) {
        for (const kw of keywords) {
            if (lower.includes(kw.toLowerCase())) return bucket;
        }
    }
    return null;
}

function classifySms(text) {
    // step 1 — operator check
    const operatorBucket = matchKeywords(text, OPERATOR_KEYWORDS);
    if (operatorBucket) return operatorBucket;

    // step 2 — category check
    const categoryBucket = matchKeywords(text, CATEGORY_KEYWORDS);
    if (categoryBucket) return categoryBucket;

    // step 3 — no match, drop
    return null;
}

/* ═══════════════════════════════════════════════════
   PROCESSOR URL RESOLUTION
   Resolves agent names → URLs from config.
   Splits SMS slice across multiple processors simultaneously.
   ═══════════════════════════════════════════════════ */

function resolveUrls(processorNames) {
    const config = getConfig();
    return processorNames
        .map(name => config.agents[name])
        .filter(Boolean);
}

async function forwardToProcessors(urls, deviceId, smsBatch) {
    if (!urls.length || !smsBatch.length) return {};

    // split batch evenly across available processor URLs
    const sliceSize = Math.ceil(smsBatch.length / urls.length);
    const requests  = urls.map((url, i) => {
        const slice = smsBatch.slice(i * sliceSize, (i + 1) * sliceSize);
        if (!slice.length) return Promise.resolve({});
        return fetch(`${url}/parse`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ deviceId, sms: slice })
        })
        .then(r => r.ok ? r.json() : {})
        .then(data => data.evidence || {})
        .catch(() => ({}));
    });

    const results = await Promise.all(requests);
    return mergeEvidence(results);
}

/* ═══════════════════════════════════════════════════
   EVIDENCE MERGE
   Combines evidence maps from multiple processors.
   ═══════════════════════════════════════════════════ */

function mergeEvidence(evidenceList) {
    const merged = {};
    for (const evidence of evidenceList) {
        for (const [phone, data] of Object.entries(evidence)) {
            if (!merged[phone]) {
                merged[phone] = { count: 0, confirmed: true, sms: [] };
            }
            merged[phone].count += data.count || 0;
            for (const smsText of (data.sms || [])) {
                if (merged[phone].sms.length < 10 && !merged[phone].sms.includes(smsText)) {
                    merged[phone].sms.push(smsText);
                }
            }
            // cap count at 10
            if (merged[phone].count > 10) merged[phone].count = 10;
        }
    }
    return merged;
}

/* ═══════════════════════════════════════════════════
   MAIN ROUTE + FORWARD
   Called by server.js when ROLE=alpha
   ═══════════════════════════════════════════════════ */

async function routeAndForward(deviceId, smsList) {
    const config = getConfig();

    // group SMS by bucket
    const bucketMap = {}; // bucketName → [smsText]
    for (const text of smsList) {
        const bucket = classifySms(text);
        if (!bucket) continue; // dropped
        if (!bucketMap[bucket]) bucketMap[bucket] = [];
        bucketMap[bucket].push(text);
    }

    // forward each bucket group to its processors simultaneously
    const promises = Object.entries(bucketMap).map(([bucket, sms]) => {
        const group      = config.buckets[bucket];
        if (!group) return Promise.resolve({});
        const urls       = resolveUrls(group.processors);
        return forwardToProcessors(urls, deviceId, sms);
    });

    const results = await Promise.all(promises);
    return mergeEvidence(results);
}

/* ═══════════════════════════════════════════════════
   ALPHA DISTRIBUTION
   Master alpha distributes across other alphas.
   ═══════════════════════════════════════════════════ */

async function distributeAcrossAlphas(deviceId, smsList) {
    const config     = getConfig();
    const masterName = config.alpha.master;
    const allAlphas  = (config.alpha.agents || [])
        .filter(name => name !== masterName)
        .map(name => config.agents[name])
        .filter(Boolean);

    if (!allAlphas.length) {
        // no other alphas — process everything locally
        return routeAndForward(deviceId, smsList);
    }

    // split SMS between this alpha (master) + other alphas
    const allWorkers  = [null, ...allAlphas]; // null = local
    const sliceSize   = Math.ceil(smsList.length / allWorkers.length);

    const promises = allWorkers.map((url, i) => {
        const slice = smsList.slice(i * sliceSize, (i + 1) * sliceSize);
        if (!slice.length) return Promise.resolve({});
        if (!url) return routeAndForward(deviceId, slice); // local
        return fetch(`${url}/parse`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ deviceId, sms: slice })
        })
        .then(r => r.ok ? r.json() : {})
        .then(data => data.evidence || {})
        .catch(() => ({}));
    });

    const results = await Promise.all(promises);
    return mergeEvidence(results);
}

module.exports = { routeAndForward, distributeAcrossAlphas, mergeEvidence, classifySms };
