// Encrypt lesson JSON files into lessons/<date>.json and list them in lessons/index.json.
// Usage: DC_PASSCODE=... node tools/add-lesson.mjs path/to/2026-11-24.json [more.json ...]
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { pbkdf2Sync, randomBytes, createCipheriv } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pass = process.env.DC_PASSCODE;
if (!pass) { console.error("Set DC_PASSCODE"); process.exit(1); }
const idxPath = join(root, "lessons", "index.json");
const idx = existsSync(idxPath) ? JSON.parse(readFileSync(idxPath, "utf8"))
  : { salt: randomBytes(16).toString("base64"), iter: 200000, dates: [] };
const key = pbkdf2Sync(pass, Buffer.from(idx.salt, "base64"), idx.iter, 32, "sha256");
for (const f of process.argv.slice(2)) {
  const lesson = JSON.parse(readFileSync(f, "utf8"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lesson.date || "")) { console.error(f + ": missing date"); process.exit(1); }
  const iv = randomBytes(12), c = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(JSON.stringify(lesson), "utf8"), c.final(), c.getAuthTag()]);
  writeFileSync(join(root, "lessons", lesson.date + ".json"), JSON.stringify({ iv: iv.toString("base64"), ct: ct.toString("base64") }));
  if (!idx.dates.includes(lesson.date)) idx.dates.push(lesson.date);
  console.log("added " + lesson.date);
}
idx.dates.sort();
writeFileSync(idxPath, JSON.stringify(idx, null, 1) + "\n");
