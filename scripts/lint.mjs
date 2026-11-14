import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import {
  ROOT,
  escapeHtml,
  loadConfig,
  loadTemplate,
  renderRobots,
  renderSite,
  renderSitemap,
  validateConfig
} from "./lib/site.mjs";

const config = loadConfig();
const template = loadTemplate();
const { errors: configErrors, warnings: configWarnings } = validateConfig(config);

const errors = [];
const warnings = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) errors.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

if (configErrors.length > 0) {
  console.error("Lint failed: content/site.json に問題があります。");
  configErrors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

let html;
try {
  html = renderSite(config, template);
} catch (error) {
  console.error("Lint failed: サイトをレンダリングできませんでした。");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

/* ---------- Document basics ---------- */

check(/<html lang="ja"/.test(html), "html 要素の lang が ja ではありません。");
check(/<meta name="viewport"/.test(html), "viewport メタタグがありません。");
check(/<meta charset="utf-8">/.test(html), "charset が utf-8 ではありません。");
check(/<title>[^<]+<\/title>/.test(html), "title がありません。");
check(/<meta name="description" content="[^"]+">/.test(html), "meta description がありません。");
check(!html.includes("{{"), "未解決のテンプレート変数があります。");
check((html.match(/<h1\b/g) || []).length === 1, "h1 は1つにしてください。");
check(!html.includes('href="#"'), 'href="#" の空リンクがあります。');
check(!/TODO|lorem ipsum/i.test(html), "TODO やダミーテキストが残っています。");

/* ---------- IDs / anchors / ARIA references ---------- */

const ids = new Map();
for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
  const id = match[1];
  ids.set(id, (ids.get(id) || 0) + 1);
}
for (const [id, count] of ids) {
  check(count === 1, `id="${id}" が ${count} 回使われています。");
}

for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  check(ids.has(match[1]), `内部リンク #${match[1]} の参照先がありません。");
}

for (const match of html.matchAll(/aria-labelledby="([^"]+)"/g)) {
  for (const id of match[1].split(/\s+/)) {
    check(ids.has(id), `aria-labelledby="${id}" の参照先がありません。");
  }
}

for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) {
  for (const id of match[1].split(/\s+/)) {
    check(ids.has(id), `aria-controls="${id}" の参照先がありません。");
  }
}

for (const match of html.matchAll(/aria-describedby="([^"]+)"/g)) {
  for (const id of match[1].split(/\s+/)) {
    check(ids.has(id), `aria-describedby="${id}" の参照先がありません。");
  }
}

/* ---------- Images / local assets ---------- */

for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  const tag = match[0];
  check(/\balt="/.test(tag), "alt のない img があります。");
  check(/\bwidth="\d+"/.test(tag) && /\bheight="\d+"/.test(tag), "width/height のない img があります。");
}

const localAssetPaths = new Set();
for (const match of html.matchAll(/(?:src|href)="((?:assets|content)\/[^"#?]+)"/g)) {
  localAssetPaths.add(match[1]);
}
for (const assetPath of localAssetPaths) {
  check(fs.existsSync(path.join(ROOT, assetPath)), `参照先のファイルがありません: ${assetPath}`);
}

/* ---------- Buttons / external links ---------- */

for (const match of html.matchAll(/<button\b[^>]*>/g)) {
  check(/\btype="/.test(match[0]), "type 属性のない button があります。");
}

for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
  check(/\brel="[^"]*noopener/.test(match[0]), "target=_blank のリンクに rel=noopener がありません。");
}

const externalLinks = [...html.matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)].map(
  (match) => match[1]
);
if (config.sampleMode) {
  check(externalLinks.length === 0, `サンプルモードで外部リンクがあります: ${externalLinks.join(", ")}`);
  check(!/href="tel:/.test(html), "サンプルモードで tel: リンクが生成されています。");
}

/* ---------- Form ---------- */

const formTag = html.match(/<form\b[^>]*id="reserve-form"[^>]*>/);
check(Boolean(formTag), "予約フォームが見つかりません。");
if (formTag) {
  const tag = formTag[0];
  if (config.reserve.form.demo) {
    check(/\bdata-demo="true"/.test(tag), "デモフォームに data-demo=true がありません。");
    check(!/\baction=/.test(tag), "デモフォームに action が設定されています。");
    check(/\baria-describedby="reserve-demo-note"/.test(tag), "デモフォームの説明参照がありません。");
  } else {
    check(!/\bdata-demo="true"/.test(tag), "公開フォームがデモ扱いのままです。");
    check(/\baction="[^"]+"/.test(tag), "公開フォームに action がありません。");
  }
}

const submitTag = html.match(/<button\b[^>]*id="reserve-submit"[^>]*>/);
check(Boolean(submitTag), "予約フォームの送信ボタンが見つかりません。");
if (submitTag) {
  if (config.reserve.form.demo) {
    check(/\btype="button"/.test(submitTag[0]), "デモフォームの送信ボタンは type=button にしてください。");
    check(/\bdata-demo-submit/.test(submitTag[0]), "デモフォームの送信ボタンに data-demo-submit がありません。");
  } else {
    check(/\btype="submit"/.test(submitTag[0]), "公開フォームの送信ボタンは type=submit にしてください。");
  }
}

for (const match of html.matchAll(/<(input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/g)) {
  const id = match[2];
  check(
    new RegExp(`<label[^>]*\\bfor="${id}"`).test(html),
    `フォーム部品 #${id} に対応する label がありません。`
  );
}

/* ---------- Sample safeguards ---------- */

if (config.sampleMode) {
  check(
    /<meta name="robots" content="noindex, nofollow">/.test(html),
    "サンプルモードなのに noindex がありません。"
  );
  check(html.includes('class="sample-banner"'), "サンプル告知バナーがありません。");
  check(html.includes("DEMO"), "デモ表示がありません。");
  for (const category of config.menus.categories) {
    for (const item of category.items) {
      check(html.includes(escapeHtml(item.price)), `料金表示が見つかりません: ${item.price}`);
      check(/サンプル/.test(item.price), `料金にサンプル表記がありません: ${item.price}`);
    }
  }
  check(renderRobots(config).includes("Disallow: /"), "robots.txt がサンプルを拒否していません。");
} else {
  check(
    /<meta name="robots" content="index, follow">/.test(html),
    "公開モードなのに index 指定がありません。"
  );
  check(!html.includes('class="sample-banner"'), "公開モードにサンプル告知バナーが残っています。");
  if (config.siteUrl) {
    check(/<link rel="canonical"/.test(html), "公開モードなのに canonical がありません。");
    const sitemap = renderSitemap(config);
    check(sitemap.includes(`<loc>${config.siteUrl.replace(/\/+$/, "")}/</loc>`), "sitemap の URL が正しくありません。");
  }
  check(!renderRobots(config).includes("Disallow: /"), "公開モードなのに robots.txt が拒否しています。");
}

/* ---------- Structured data ---------- */

const jsonLdMatch = html.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
);
check(Boolean(jsonLdMatch), "LocalBusiness の JSON-LD がありません。");

if (jsonLdMatch) {
  let data;
  try {
    data = JSON.parse(jsonLdMatch[1]);
    checks += 1;
  } catch (error) {
    errors.push(`JSON-LD を解析できません: ${error.message}`);
  }

  if (data) {
    check(data["@context"] === "https://schema.org", "JSON-LD の @context が正しくありません。");
    check(
      data["@type"] === config.salon.businessType,
      "JSON-LD の @type が businessType と一致しません。"
    );
    check(data.name === config.salon.name, "JSON-LD の店舗名が設定と一致しません。");
    check(
      data.address?.postalCode === config.salon.address.postalCode &&
        data.address?.addressRegion === config.salon.address.region &&
        data.address?.addressLocality === config.salon.address.locality &&
        data.address?.streetAddress === config.salon.address.streetAddress,
      "JSON-LD の住所が設定と一致しません。"
    );
    check(
      data.telephone === config.salon.telephone,
      "JSON-LD の電話番号が設定と一致しません。");
    check(!/"@type"\s*:\s*"(Review|AggregateRating)"/.test(jsonLdMatch[1]), "架空の口コミ・評価スキーマがあります。");
    check(!/"ratingValue"|"reviewCount"/.test(jsonLdMatch[1]), "評価値・レビュー件数が含まれています。");

    if (config.sampleMode) {
      check(
        /サンプル/.test(data.disambiguatingDescription || ""),
        "サンプルモードの JSON-LD にサンプル注記がありません。");
    } else {
      check(!data.disambiguatingDescription, "公開モードの JSON-LD にサンプル注記が残っています。");
    }
  }
}

/* ---------- Visible NAP consistency ---------- */

check(html.includes(escapeHtml(config.salon.name)), "店舗名が HTML に表示されていません。");
check(html.includes(escapeHtml(config.salon.address.full)), "住所が HTML に表示されていません。");
check(html.includes(escapeHtml(config.salon.telephone)), "電話番号が HTML に表示されていません。");

/* ---------- Code syntax ---------- */

const jsPath = path.join(ROOT, "assets", "js", "main.js");
const cssPath = path.join(ROOT, "assets", "css", "styles.css");

check(fs.existsSync(jsPath), "assets/js/main.js がありません。");
check(fs.existsSync(cssPath), "assets/css/styles.css がありません。");

if (fs.existsSync(jsPath)) {
  try {
    execFileSync(process.execPath, ["--check", jsPath], { stdio: "pipe" });
    checks += 1;
  } catch (error) {
    errors.push(`JavaScript の構文エラー: ${error.message}`);
  }
}

if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, "utf8");
  const opens = (css.match(/\{/g) || []).length;
  const closes = (css.match(/\}/g) || []).length;
  check(opens === closes, `CSS の波かっこが不一致です（{ ${opens} / } ${closes}）。`);
  check(!/@import\s+url\(\s*["']?https?:/i.test(css), "外部CSSの読み込みがあります。");
}

/* ---------- Report ---------- */

[...configWarnings, ...warnings].forEach((warning) => console.warn(`warning: ${warning}`));

if (errors.length > 0) {
  console.error(`Lint failed: ${errors.length} error(s) / ${checks} checks`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Lint OK: ${checks} checks`);
}
