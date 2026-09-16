const { getAllTemplates } = require("./loader");

const MAX_COUNT   = 10; // stop tracking a phone after this many hits
const MAX_SMS     = 10; // max SMS entries stored per phone

function normalizePhone(raw) {
    if (!raw) return null;
    const d = raw.replace(/[^0-9]/g, "");
    if (d.length === 10 && /^[6-9]/.test(d)) return d;
    if (d.length === 12 && d.startsWith("91") && /^91[6-9]/.test(d)) return d.slice(2);
    if (d.length === 11 && d.startsWith("0") && /^0[6-9]/.test(d)) return d.slice(1);
    return null;
}

/*
  evidence map shape:
  {
    "9876543210": {
      count:     4,
      confirmed: true,
      sms:       ["raw sms text", ...]   // up to MAX_SMS entries
    }
  }
*/

async function parseSmsBatch(smsList) {
    const templates = getAllTemplates();
    if (!templates.length) return {};

    // evidence map — phone → { count, confirmed, sms[] }
    const evidence = {};

    // dropped set — phones that hit MAX_COUNT, skip further tracking
    const dropped = new Set();

    for (const text of smsList) {
        if (typeof text !== "string" || !text.trim()) continue;

        // run all templates simultaneously against this SMS
        const hits = new Map(); // phone → Set of matched texts this SMS (dedup per sms)

        for (const { re } of templates) {
            let match;
            try { match = text.match(re); } catch { continue; }
            if (!match) continue;

            for (let i = 1; i < match.length; i++) {
                const phone = normalizePhone(match[i]);
                if (!phone) continue;
                if (dropped.has(phone)) continue;

                if (!hits.has(phone)) hits.set(phone, text);
            }
        }

        // update evidence for all phones found in this SMS
        for (const [phone, smsText] of hits) {
            if (!evidence[phone]) {
                evidence[phone] = {
                    count:     0,
                    confirmed: true, // confirmed on first appearance
                    sms:       []
                };
            }

            evidence[phone].count++;

            if (evidence[phone].sms.length < MAX_SMS) {
                evidence[phone].sms.push(smsText);
            }

            if (evidence[phone].count >= MAX_COUNT) {
                dropped.add(phone);
            }
        }
    }

    return evidence;
}

module.exports = { parseSmsBatch };
