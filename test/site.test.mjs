import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  escapeHtml,
  loadConfig,
  loadTemplate,
  renderRobots,
  renderSite,
  renderSitemap,
  validateConfig
} from "../scripts/lib/site.mjs";

const baseConfig = loadConfig();
const template = loadTemplate();
const html = renderSite(baseConfig, template);

function jsonLdFrom(source) {
  const match = source.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  );
  assert.ok(match, "JSON-LD が見つかりません");
  return JSON.parse(match[1]);
}

function makeProductionConfig(source) {
  const config = structuredClone(source);
  config.sampleMode = false;
  config.siteUrl = "https://salon.invalid";
  config.notice = "";
  config.seo = {
    ...config.seo,
    title: "テストサロン｜メニュー・アクセス・予約",
    description: "テスト用のサロンサイトです。",
    ogImage: "assets/img/og.svg"
  };
  config.salon = {
    ...config.salon,
    brandEn: "TEST SALON",
    name: "テストサロン",
    nameKana: "テストサロン",
    description: "テスト用のサロン説明です。",
    telephone: "03-1234-5678",
    hours: "10:00–19:00",
    closed: "月曜",
    access: "テスト駅 徒歩5分",
    payment: "現金・クレジットカード",
    address: {
      postalCode: "100-0001",
      region: "東京都",
      locality: "千代田区",
      streetAddress: "千代田1-1",
      full: "〒100-0001 東京都千代田区千代田1-1"
    },
    booking: {
      webUrl: "https://salon.invalid/reserve",
      lineUrl: "https://salon.invalid/line",
      phone: "03-1234-5678"
    },
    social: {
      instagramUrl: "https://salon.invalid/instagram",
      lineUrl: "https://salon.invalid/line"
    }
  };
  config.hero = {
    ...config.hero,
    eyebrow: "BEAUTY & RELAXATION",
    note: ""
  };
  config.menus = {
    ...config.menus,
    note: "",
    categories: config.menus.categories.map((category) => ({
      ...category,
      title: category.title.replace("（例）", ""),
      items: category.items.map((item) => ({
        ...item,
        price: "¥8,000〜",
        duration: "約60分"
      }))
    }))
  };
  config.faq = {
    ...config.faq,
    items: config.faq.items.map((item) => ({
      ...item,
      a: item.a.replaceAll("サンプル", "実際の店舗").replaceAll("公開時に", "店舗では")
    }))
  };
  config.gallery = {
    ...config.gallery,
    note: "",
    items: config.gallery.items.map((item, index) => ({
      ...item,
      alt: `店内写真${index + 1}`
    })),
    social: config.gallery.social.map((item) => ({
      ...item,
      status: "リンクを開く"
    }))
  };
  config.access = { ...config.access, lead: "" };
  config.reserve = {
    ...config.reserve,
    demoNotice: "",
    form: {
      ...config.reserve.form,
      demo: false,
      action: "https://salon.invalid/reserve",
      title: "予約リクエスト",
      submit: "この内容でリクエスト",
      note: "",
      success: ""
    }
  };
  config.footer = {
    ...config.footer,
    note: "",
    copyright: "TEST SALON"
  };
  return config;
}

test("sample build renders a complete Japanese document", () => {
  assert.match(html, /<html lang="ja"/);
  assert.match(html, /<meta name="viewport"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.doesNotMatch(html, /\{\{[A-Z0-9_]+\}\}/);
  assert.match(html, /href="#reserve"/);
  assert.match(html, /href="#menu"/);
  assert.match(html, /id="reserve-form"/);
  assert.match(html, /class="mobile-cta"/);
});

test("all internal anchors resolve", () => {
  const ids = new Set(
    [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
  );
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), `#${match[1]} の参照先がありません`);
  }
});

test("NAP is consistent between visible content and structured data", () => {
  const ld = jsonLdFrom(html);
  assert.equal(ld["@context"], "https://schema.org");
  assert.equal(ld["@type"], baseConfig.salon.businessType);
  assert.equal(ld.name, baseConfig.salon.name);
  assert.equal(ld.telephone, baseConfig.salon.telephone);
  assert.equal(ld.address.postalCode, baseConfig.salon.address.postalCode);
  assert.equal(ld.address.addressRegion, baseConfig.salon.address.region);
  assert.equal(ld.address.addressLocality, baseConfig.salon.address.locality);
  assert.equal(ld.address.streetAddress, baseConfig.salon.address.streetAddress);

  assert.ok(html.includes(escapeHtml(baseConfig.salon.name)));
  assert.ok(html.includes(escapeHtml(baseConfig.salon.address.full)));
  assert.ok(html.includes(escapeHtml(baseConfig.salon.telephone)));
});

test("sample mode is not indexable and clearly labelled", () => {
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(html, /class="sample-banner"/);
  assert.match(html, /SAMPLE SITE/);
  assert.match(html, /サンプル/);
  assert.match(renderRobots(baseConfig), /Disallow: \//);
  assert.ok(!html.includes('href="tel:'));
});

test("no invented external booking, SNS, or contact links in sample mode", () => {
  const external = [
    ...html.matchAll(/(?:href|src)="(https?:\/\/[^"]+)"/g)
  ].map((match) => match[1]);
  assert.deepEqual(external, []);
  assert.match(html, /公開時に予約URLを設定/);
  assert.match(html, /公開時にLINE URLを設定/);
  assert.match(html, /公開時にURLを設定/);
});

test("structured data deliberately contains no reviews or ratings", () => {
  const ld = jsonLdFrom(html);
  const serialized = JSON.stringify(ld);
  assert.doesNotMatch(serialized, /"Review"|"AggregateRating"/);
  assert.doesNotMatch(serialized, /ratingValue|reviewCount/);
  assert.match(ld.disambiguatingDescription, /サンプル/);
});

test("reservation form is a clearly labelled in-page demo", () => {
  assert.match(html, /<form[^>]*id="reserve-form"[^>]*data-demo="true"/);
  assert.match(html, /id="reserve-demo-note"/);
  assert.match(html, /入力内容は送信・保存されません/);
  assert.match(html, /予約リクエスト（デモ）/);
  assert.doesNotMatch(html, /<form[^>]*id="reserve-form"[^>]*action=/);
  assert.match(
    html,
    /<button[^>]*id="reserve-submit"[^>]*type="button"[^>]*data-demo-submit/
  );
});

test("every form control has a label", () => {
  for (const match of html.matchAll(
    /<(input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/g
  )) {
    assert.match(
      html,
      new RegExp(`<label[^>]*\\bfor="${match[2]}"`),
      `#${match[2]} の label がありません`
    );
  }
});

test("local assets referenced by the page exist", () => {
  for (const match of html.matchAll(
    /(?:src|href)="((?:assets|content)\/[^"#?]+)"/g
  )) {
    assert.ok(
      fs.existsSync(path.join(ROOT, match[1])),
      `参照先がありません: ${match[1]}`
    );
  }
});

test("sample configuration rejects production mode while placeholders remain", () => {
  const broken = structuredClone(baseConfig);
  broken.sampleMode = false;
  broken.reserve.form.demo = false;
  broken.reserve.form.action = "https://salon.invalid/reserve";
  const { errors } = validateConfig(broken);
  assert.ok(errors.length > 0);
  assert.ok(errors.some((error) => /サンプル値|サンプル表記/.test(error)));
});

test("production configuration renders indexable output", () => {
  const production = makeProductionConfig(baseConfig);
  const { errors } = validateConfig(production);
  assert.deepEqual(errors, []);

  const productionHtml = renderSite(production, template);
  assert.match(productionHtml, /<meta name="robots" content="index, follow">/);
  assert.doesNotMatch(productionHtml, /class="sample-banner"/);
  assert.match(productionHtml, /rel="canonical"/);
  assert.match(productionHtml, /<form[^>]*id="reserve-form"[^>]*action="https:\/\/salon\.invalid\/reserve"/);
  assert.match(productionHtml, /<button[^>]*id="reserve-submit"[^>]*type="submit"/);
  assert.doesNotMatch(productionHtml, /data-demo-submit/);
  assert.match(productionHtml, /href="tel:0312345678"/);
  assert.match(productionHtml, /href="https:\/\/salon\.invalid\/instagram"/);
  assert.doesNotMatch(productionHtml, /gallery-sample/);
  assert.match(renderRobots(production), /Allow: \//);
  assert.match(renderSitemap(production), /https:\/\/salon\.invalid\//);

  const productionLd = jsonLdFrom(productionHtml);
  assert.equal(productionLd.name, "テストサロン");
  assert.equal(productionLd.telephone, "03-1234-5678");
  assert.equal(productionLd.address.addressLocality, "千代田区");
  assert.ok(productionHtml.includes("〒100-0001 東京都千代田区千代田1-1"));
  assert.equal(renderSitemap(baseConfig), "");
});

test("production mode refuses a demo form", () => {
  const production = makeProductionConfig(baseConfig);
  production.reserve.form.demo = true;
  production.reserve.form.title = "予約リクエスト（デモ）";
  production.reserve.form.submit = "送信（デモ）";
  const { errors } = validateConfig(production);
  assert.ok(errors.some((error) => /公開時はフォームを接続/.test(error)));
});

test("sample menu prices and durations are explicit placeholders", () => {
  for (const category of baseConfig.menus.categories) {
    for (const item of category.items) {
      assert.match(item.price, /サンプル/);
      assert.match(item.duration, /サンプル/);
      assert.ok(html.includes(escapeHtml(item.price)));
    }
  }
});
