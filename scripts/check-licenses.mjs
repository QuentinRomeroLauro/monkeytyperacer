import { readFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { join } from "node:path";

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const localNotice = (path) => {
  assert(path.startsWith("/licenses/") && !path.includes(".."), `Invalid notice path: ${path}`);
  assert(existsSync(`public${path}`), `Missing notice: ${path}`);
};
assert.equal(readFileSync("LICENSE", "utf8"), readFileSync("public/licenses/GPL-3.0.txt", "utf8"));
assert.equal(readFileSync("THIRD_PARTY_NOTICES.md", "utf8"), readFileSync("public/licenses/THIRD_PARTY_NOTICES.txt", "utf8"));
const fonts = json("public/licenses/fonts.json");
assert.deepEqual(fonts.map((font) => font.file).sort(), readdirSync("public/webfonts").filter((file) => file.endsWith(".woff2")).map((file) => `public/webfonts/${file}`).sort());
for (const font of fonts) {
  assert.equal(hash(font.file), font.sha256, `Font changed: ${font.file}`);
  localNotice(font.licenseFile);
  localNotice(font.noticeFile);
}
const { assets } = json("docs/asset-provenance.json");
for (const asset of assets) {
  assert.equal(existsSync(asset.file), asset.present, `Asset presence changed: ${asset.file}`);
  if (asset.present) assert.equal(hash(asset.file), asset.sha256, `Asset changed: ${asset.file}`);
}
function files(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]);
}
const inventoried = new Set(assets.filter((asset) => asset.present).map((asset) => asset.file));
for (const category of ["languages", "quotes", "sounds", "themes", "webfonts"]) {
  for (const file of files(`public/${category}`)) assert(inventoried.has(file), `Asset needs review: ${file}`);
}
const dependencies = json("public/licenses/dependencies.json");
for (const dependency of dependencies) for (const notice of dependency.notices) localNotice(notice);
for (const name of Object.keys(json("package.json").dependencies)) {
  const installed = json(`node_modules/${name}/package.json`);
  const record = dependencies.find((dependency) => dependency.name === name);
  assert(record?.versions.includes(installed.version), `Update dependency notices: ${name}@${installed.version}`);
  assert(record.notices.length > 0, `Missing direct dependency notice: ${name}`);
}
const languages = json("lib/languages.json");
for (const language of languages) assert(existsSync(`public/languages/${language}.json`), `Missing selectable language: ${language}`);
console.log(`License inventory checked: ${fonts.length} fonts, ${inventoried.size} assets, ${dependencies.length} dependency records. This checks inventory integrity, not legal clearance.`);
