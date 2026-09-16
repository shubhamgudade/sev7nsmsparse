const fs   = require("fs");
const path = require("path");

const BUCKET_GROUP  = process.env.BUCKET_GROUP || "";
const DATA_DIR      = path.resolve(__dirname, "../assets/data");
const CONFIG_PATH   = path.resolve(__dirname, "../assets/data/config.json");

// loaded state: { bucketName: [{ serial, re }] }
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

async function initBuckets() {
    if (_buckets) return _buckets;

    const config = readConfig();

    // BUCKET_GROUP is a comma-separated list of bucket names this omega handles
    // e.g. BUCKET_GROUP=jio_heavy,jio_regional
    const groupNames = BUCKET_GROUP
        ? BUCKET_GROUP.split(",").map(s => s.trim()).filter(Boolean)
        : Object.keys(config.buckets);

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

// flat list of all compiled templates across all loaded buckets
function getAllTemplates() {
    const buckets = loadBuckets();
    return Object.values(buckets).flat();
}

module.exports = { initBuckets, loadBuckets, getAllTemplates };
