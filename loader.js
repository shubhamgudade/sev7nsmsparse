const fs   = require("fs");
const path = require("path");

const SERVICE_NAME = (process.env.SERVICE_NAME || "").toLowerCase();
const DATA_DIR     = path.resolve(__dirname, "../assets/data");
const CONFIG_PATH  = path.resolve(__dirname, "../assets/data/config.json");

let _buckets = null;

function readConfig() {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    } catch (err) {
        throw new Error(`[loader] config.json read failed: ${err.message}`);
    }
}

function compileTemplate(t) {
    try {
        let pattern = t.regex;
        let flags   = "";
        if (pattern.startsWith("(?i)")) {
            pattern = pattern.slice(4);
            flags   = "i";
        }
        return { serial: t.serial, re: new RegExp(pattern, flags) };
    } catch {
        return null;
    }
}

function loadBucketFile(filename) {
    const filepath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filepath)) {
        console.warn(`[loader] missing file: ${filename}`);
        return [];
    }
    try {
        const data = JSON.parse(fs.readFileSync(filepath, "utf8"));
        return (data.templates || []).map(compileTemplate).filter(Boolean);
    } catch (err) {
        console.warn(`[loader] failed to parse ${filename}: ${err.message}`);
        return [];
    }
}

function resolveBucketNames(config) {
    if (!SERVICE_NAME) {
        // no SERVICE_NAME — load everything (local dev / fallback)
        return Object.keys(config.buckets);
    }

    // scan config.buckets — find every bucket this service is listed in
    const mine = [];
    for (const [bucketName, bucket] of Object.entries(config.buckets)) {
        if (Array.isArray(bucket.processors) && bucket.processors.includes(SERVICE_NAME)) {
            mine.push(bucketName);
        }
    }

    if (!mine.length) {
        console.warn(`[loader] SERVICE_NAME="${SERVICE_NAME}" not found in any bucket processors — loading nothing`);
    }

    return mine;
}

async function initBuckets() {
    if (_buckets) return _buckets;

    const config     = readConfig();
    const groupNames = resolveBucketNames(config);

    _buckets = {};

    for (const groupName of groupNames) {
        const group = config.buckets[groupName];
        if (!group) {
            console.warn(`[loader] unknown bucket group: ${groupName}`);
            continue;
        }

        const compiled = [];
        for (const filename of group.files) {
            const templates = loadBucketFile(filename);
            compiled.push(...templates);
        }

        _buckets[groupName] = compiled;
        console.log(`[loader] ${groupName}: ${compiled.length} templates loaded`);
    }

    return _buckets;
}

function loadBuckets() {
    if (!_buckets) throw new Error("[loader] buckets not initialized — call initBuckets() first");
    return _buckets;
}

function getAllTemplates() {
    const buckets = loadBuckets();
    return Object.values(buckets).flat();
}

module.exports = { initBuckets, loadBuckets, getAllTemplates };