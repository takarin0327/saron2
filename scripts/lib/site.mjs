import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
export const CONFIG_PATH = path.join(ROOT, "content", "site.json");
export const TEMPLATE_PATH = path.join(ROOT, "src", "index.html");

const BUSINESS_TYPES = new Set([
  "BeautySalon",
  "HairSalon",
  "NailSalon",
  "DaySpa",
  "HealthAndBeautyBusiness",
  "LocalBusiness"
]);

const WEEKDAYS = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]);

const SAMPLE_PATTERNS = [
  /サンプル/,
  /SAMPLE/i,
  /000-0000/,
  /¥0,000/,
  /約00分/,
  /example\.(com|org|net)/i,
  /[◯〇]{2,}/
];

const SAMPLE_ONLY_PATH =
  /^(notice|hero\.note|menus\.note|gallery\.note|access\.lead|footer\.note|reserve\.demoNotice|seo\.ogImage|siteUrl|reserve\.form\.action|salon\.booking\..+|salon\.social\..+|gallery\.items\.\d+\.image)$/;

const ICONS = {
  sparkle:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M12 2.8l1.9 6.1 6.1 1.9-6.1 1.9L12 18.8l-1.9-6.1L4 10.8l6.1-1.9L12 2.8Z"/><path d="M19 16.4l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z"/></svg>',
  coin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><circle cx="12" cy="12" r="8.6"/><path d="M8.8 8.7 12 12l3.2-3.3M9 13.4h6M12 12v5.1"/></svg>',
  clock:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2"/></svg>',
  leaf:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M19.8 4.2C13 4.4 6.1 7.1 6.1 13.1c0 2.2 1.7 4 3.9 4 6 0 8.6-6.9 9.8-12.9Z"/><path d="M4.2 20.2c2.6-4.4 6.1-7.7 10.4-9.7"/></svg>',
  chat:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M20 11.4c0 3.9-3.6 7-8 7-.9 0-1.8-.1-2.6-.4l-4.8 2.2 1.3-4.1A6.6 6.6 0 0 1 4 11.4c0-3.9 3.6-7 8-7s8 3.1 8 7Z"/><path d="M8.5 11.4h.01M12 11.4h.01M15.5 11.4h.01"/></svg>',
  receipt:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17Z"/><path d="M9 8.2h6M9 11.8h6M9 15.4h3.5"/></svg>',
  heart:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M20.3 5.8a5 5 0 0 0-7.1 0L12 7l-1.2-1.2a5 5 0 1 0-7.1 7.1L12 21l8.3-8.1a5 5 0 0 0 0-7.1Z"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><circle cx="12" cy="12" r="8.6"/><path d="m8.2 12.1 2.5 2.5 5.1-5.2"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="3.8" y="5.5" width="16.4" height="15" rx="2.2"/><path d="M8 3.5v4M16 3.5v4M3.8 10.2h16.4M8 14h.01M12 14h.01M16 14h.01M8 17.3h.01M12 17.3h.01"/></svg>',
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M7.2 3.8 4.4 6.6c-.8.8-.7 2.1.1 3.7 1.9 3.8 5.4 7.3 9.2 9.2 1.6.8 2.9.9 3.7.1l2.8-2.8-4.8-3.2-2.2 2.2a14.6 14.6 0 0 1-5-5l2.2-2.2-3.2-4.8Z"/></svg>',
  pin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M19.2 10.2c0 5.1-7.2 10.4-7.2 10.4s-7.2-5.3-7.2-10.4a7.2 7.2 0 1 1 14.4 0Z"/><circle cx="12" cy="10.2" r="2.6"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M17.2 6.9h.01"/></svg>',
  line:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M20 11.3c0 3.8-3.6 6.8-8 6.8-.9 0-1.8-.1-2.6-.4L4.6 20l1.3-4A6.5 6.5 0 0 1 4 11.3c0-3.8 3.6-6.8 8-6.8s8 3 8 6.8Z"/><path d="M8.5 9.6v3.5M12 9.6v3.5M15.5 9.6v3.5M8.5 13.1h7"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M4.5 12h15M13.5 6l6 6-6 6"/></svg>',
  menu:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[character];
  });
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/\r?\n/g, " ");
}

function icon(name, className = "") {
  const svg = ICONS[name] ?? ICONS.sparkle;
  return `<span class="icon${className ? ` ${className}` : ""}" aria-hidden="true">${svg}</span>`;
}

function sampleChip(label = "サンプル") {
  return `<span class="sample-chip">${escapeHtml(label)}</span>`;
}

function isSampleValue(value) {
  return typeof value === "string" && SAMPLE_PATTERNS.some((pattern) => pattern.test(value));
}

function walkStrings(value, visitor, pathParts = []) {
  if (typeof value === "string") {
    visitor(value, pathParts.join("."));
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkStrings(entry, visitor, [...pathParts, String(index)]));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      walkStrings(entry, visitor, [...pathParts, key]);
    }
  }
}

function normalizedSiteUrl(siteUrl) {
  return String(siteUrl || "").replace(/\/+$/, "");
}

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isInternalAnchor(value) {
  return typeof value === "string" && /^#[a-z0-9-]+$/i.test(value);
}

export function loadConfig(root = ROOT) {
  return JSON.parse(fs.readFileSync(path.join(root, "content", "site.json"), "utf8"));
}

export function loadTemplate(root = ROOT) {
  return fs.readFileSync(path.join(root, "src", "index.html"), "utf8");
}

export function validateConfig(config) {
  const errors = [];
  const warnings = [];

  const requireString = (value, label) => {
    if (typeof value !== "string" || !value.trim()) {
      errors.push(`${label} は必須です。`);
    }
  };

  if (!config || typeof config !== "object") {
    return { errors: ["設定ファイルの形式が正しくありません。"], warnings };
  }

  if (typeof config.sampleMode !== "boolean") {
    errors.push("sampleMode は true / false で指定してください。");
  }
  if (!config.sampleMode && !config.siteUrl) {
    warnings.push("siteUrl が空のため、canonical / OGP URL / sitemap.xml は生成されません。");
  }

  const { seo = {}, salon = {}, hero = {}, menus, flow, anxiety, faq, gallery, reserve, access, footer } = config;
  requireString(seo.title, "seo.title");
  requireString(seo.description, "seo.description");
  requireString(salon.brandEn, "salon.brandEn");
  requireString(salon.name, "salon.name");
  requireString(salon.description, "salon.description");
  requireString(salon.telephone, "salon.telephone");
  requireString(salon.hours, "salon.hours");
  requireString(salon.closed, "salon.closed");
  requireString(salon.access, "salon.access");
  requireString(salon.payment, "salon.payment");
  requireString(salon.address?.full, "salon.address.full");
  requireString(salon.address?.region, "salon.address.region");
  requireString(salon.address?.locality, "salon.address.locality");
  requireString(salon.address?.streetAddress, "salon.address.streetAddress");

  if (!BUSINESS_TYPES.has(salon.businessType)) {
    errors.push(
      `salon.businessType は ${[...BUSINESS_TYPES].join(", ")} のいずれかにしてください。`
    );
  }

  if (config.siteUrl) {
    if (!isHttpsUrl(config.siteUrl)) {
      errors.push("siteUrl は https:// で始まる絶対URLにしてください。");
    } else {
      const url = new URL(config.siteUrl);
      if (url.search || url.hash) {
        errors.push("siteUrl にはクエリやフラグメントを含めないでください。");
      }
    }
  }

  for (const [label, value] of [
    ["salon.booking.webUrl", salon.booking?.webUrl],
    ["salon.booking.lineUrl", salon.booking?.lineUrl],
    ["salon.social.instagramUrl", salon.social?.instagramUrl],
    ["salon.social.lineUrl", salon.social?.lineUrl]
  ]) {
    if (value && !isHttpsUrl(value)) {
      errors.push(`${label} は https:// のURLにしてください。`);
    }
  }

  if (salon.booking?.phone && !/^[0-9+\-() ]{7,}$/.test(salon.booking.phone)) {
    errors.push("salon.booking.phone は電話番号の形式で指定してください。");
  }

  if (!Array.isArray(config.openingHours) || config.openingHours.length === 0) {
    errors.push("openingHours は1件以上指定してください。");
  } else {
    for (const [index, spec] of config.openingHours.entries()) {
      if (!Array.isArray(spec.days) || spec.days.length === 0) {
        errors.push(`openingHours[${index}].days は1件以上指定してください。");
      } else {
        for (const day of spec.days) {
          if (!WEEKDAYS.has(day)) {
            errors.push(`openingHours[${index}].days に不正な曜日があります: ${day}`);
          }
        }
      }
      if (!/^\d{2}:\d{2}$/.test(spec.opens || "") || !/^\d{2}:\d{2}$/.test(spec.closes || "")) {
        errors.push(`openingHours[${index}] の opens / closes は HH:MM 形式にしてください。`);
      }
    }
  }

  if (!Array.isArray(menus?.categories) || menus.categories.length === 0) {
    errors.push("menus.categories は1件以上指定してください。");
  } else {
    const ids = new Set();
    for (const [categoryIndex, category] of menus.categories.entries()) {
      if (!/^[a-z0-9-]+$/.test(category.id || "")) {
        errors.push(`menus.categories[${categoryIndex}].id は半角英数字とハイフンにしてください。");
      }
      if (ids.has(category.id)) {
        errors.push(`menus.categories の id が重複しています: ${category.id}`);
      }
      ids.add(category.id);
      requireString(category.label, `menus.categories[${categoryIndex}].label`);
      requireString(category.title, `menus.categories[${categoryIndex}].title`);
      if (!Array.isArray(category.items) || category.items.length === 0) {
        errors.push(`menus.categories[${categoryIndex}].items は1件以上指定してください。");
      } else {
        for (const [itemIndex, item] of category.items.entries()) {
          requireString(
            item.name,
            `menus.categories[${categoryIndex}].items[${itemIndex}].name`
          );
          requireString(
            item.description,
            `menus.categories[${categoryIndex}].items[${itemIndex}].description`
          );
          requireString(
            item.price,
            `menus.categories[${categoryIndex}].items[${itemIndex}].price`
          );
          requireString(
            item.duration,
            `menus.categories[${categoryIndex}].items[${itemIndex}].duration`
          );
        }
      }
    }
  }

  if (!Array.isArray(flow?.steps) || flow.steps.length === 0) {
    errors.push("flow.steps は1件以上指定してください。");
  }
  if (!Array.isArray(anxiety?.items) || anxiety.items.length === 0) {
    errors.push("anxiety.items は1件以上指定してください。");
  }
  if (!Array.isArray(faq?.items) || faq.items.length === 0) {
    errors.push("faq.items は1件以上指定してください。");
  }
  if (!Array.isArray(gallery?.items) || gallery.items.length === 0) {
    errors.push("gallery.items は1件以上指定してください。");
  } else {
    for (const [index, item] of gallery.items.entries()) {
      requireString(item.image, `gallery.items[${index}].image`);
      requireString(item.alt, `gallery.items[${index}].alt`);
      if (item.image && !/^assets\/[a-z0-9/_-]+\.(svg|webp|jpe?g|png|avif)$/i.test(item.image)) {
        errors.push(`gallery.items[${index}].image は assets/ 配下の画像パスにしてください。");
      }
    }
  }

  if (!reserve || !reserve.form) {
    errors.push("reserve.form は必須です。");
  } else {
    requireString(reserve.form.title, "reserve.form.title");
    requireString(reserve.form.submit, "reserve.form.submit");
    if (typeof reserve.form.demo !== "boolean") {
      errors.push("reserve.form.demo は true / false で指定してください。");
    }
    if (reserve.form.demo === true) {
      requireString(reserve.form.note, "reserve.form.note");
      requireString(reserve.form.success, "reserve.form.success");
    }
    if (reserve.form.demo === false) {
      if (!reserve.form.action) {
        errors.push("reserve.form.demo=false の場合は reserve.form.action を指定してください。");
      } else if (!/^\//.test(reserve.form.action) && !isHttpsUrl(reserve.form.action)) {
        errors.push("reserve.form.action は / で始まるパスか https:// のURLにしてください。");
      }
      if (/デモ/.test(reserve.form.title || "") || /デモ/.test(reserve.form.submit || "")) {
        errors.push("公開用フォームのタイトル・送信ボタンから「デモ」を外してください。");
      }
    }
  }

  if (!Array.isArray(reserve?.options) || reserve.options.length === 0) {
    errors.push("reserve.options は1件以上指定してください。");
  } else {
    for (const [index, option] of reserve.options.entries()) {
      requireString(option.label, `reserve.options[${index}].label`);
      requireString(option.title, `reserve.options[${index}].title`);
      requireString(option.text, `reserve.options[${index}].text`);
      requireString(option.cta, `reserve.options[${index}].cta`);
      if (!["web", "line", "phone"].includes(option.type)) {
        errors.push(`reserve.options[${index}].type は web / line / phone のいずれかにしてください。");
      }
      if (!isInternalAnchor(option.href)) {
        errors.push(`reserve.options[${index}].href は # で始まるページ内リンクにしてください。");
      }
    }
  }

  if (!Array.isArray(config.nav) || config.nav.length === 0) {
    errors.push("nav は1件以上指定してください。");
  } else {
    for (const [index, item] of config.nav.entries()) {
      requireString(item.label, `nav[${index}].label`);
      if (!isInternalAnchor(item.href)) {
        errors.push(`nav[${index}].href は # で始まるページ内リンクにしてください。");
      }
    }
  }

  if (config.sampleMode) {
    requireString(config.notice, "notice");
    if (config.notice && !/サンプル/.test(config.notice)) {
      errors.push("sampleMode=true の場合は notice に「サンプル」と明記してください。");
    }
    if (reserve?.form?.demo !== true) {
      errors.push("sampleMode=true の場合は reserve.form.demo=true にしてください。");
    }
    for (const [categoryIndex, category] of (menus?.categories || []).entries()) {
      for (const [itemIndex, item] of (category.items || []).entries()) {
        if (!/サンプル/.test(item.price || "")) {
          errors.push(
            `サンプル料金には「サンプル」と明記してください: menus.categories[${categoryIndex}].items[${itemIndex}].price`
          );
        }
        if (!/サンプル/.test(item.duration || "")) {
          errors.push(
            `サンプル所要時間には「サンプル」と明記してください: menus.categories[${categoryIndex}].items[${itemIndex}].duration`
          );
        }
      }
    }
  } else {
    for (const [label, value] of [
      ["salon.name", salon.name],
      ["salon.brandEn", salon.brandEn],
      ["salon.nameKana", salon.nameKana],
      ["salon.address.full", salon.address?.full],
      ["salon.telephone", salon.telephone],
      ["salon.hours", salon.hours],
      ["salon.closed", salon.closed],
      ["salon.access", salon.access],
      ["salon.payment", salon.payment]
    ]) {
      if (isSampleValue(value)) {
        errors.push(`sampleMode=false ですが、${label} にサンプル値が残っています。");
      }
    }

    walkStrings(config, (value, valuePath) => {
      if (SAMPLE_ONLY_PATH.test(valuePath)) return;
      if (isSampleValue(value)) {
        errors.push(`sampleMode=false ですが、${valuePath} にサンプル表記が残っています。");
      }
    });

    if (reserve?.form?.demo === true) {
      errors.push(
        "reserve.form.demo=true のフォームは送信されません。公開時はフォームを接続するか、demo=false と action を設定してください。"
      );
    }
  }

  return { errors, warnings };
}

function requireValidConfig(config) {
  const { errors } = validateConfig(config);
  if (errors.length > 0) {
    throw new Error(`設定に ${errors.length} 件の問題があります:\n- ${errors.join("\n- ")}`);
  }
}

function renderMeta(config) {
  const { seo, salon, sampleMode } = config;
  const siteUrl = normalizedSiteUrl(config.siteUrl);
  const ogImage =
    siteUrl && seo.ogImage
      ? new URL(String(seo.ogImage).replace(/^\//, ""), `${siteUrl}/`).href
      : "";
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeAttr(seo.description)}">`,
    `<meta name="robots" content="${sampleMode ? "noindex, nofollow" : "index, follow"}">`,
    `<meta name="theme-color" content="#26231f">`,
    `<meta name="color-scheme" content="light">`,
    `<meta name="format-detection" content="telephone=${sampleMode ? "no" : "yes"}">`,
    `<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta property="og:title" content="${escapeAttr(seo.title)}">`,
    `<meta property="og:description" content="${escapeAttr(seo.description)}">`,
    `<meta property="og:site_name" content="${escapeAttr(salon.name)}">`,
    `<meta name="twitter:card" content="${ogImage ? "summary_large_image" : "summary"}">`,
    `<meta name="twitter:title" content="${escapeAttr(seo.title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(seo.description)}">`
  ];

  if (siteUrl) {
    tags.push(`<link rel="canonical" href="${escapeAttr(`${siteUrl}/`)}">`);
    tags.push(`<meta property="og:url" content="${escapeAttr(`${siteUrl}/`)}">`);
  }
  if (ogImage) {
    tags.push(`<meta property="og:image" content="${escapeAttr(ogImage)}">`);
    tags.push('<meta property="og:image:width" content="1200">');
    tags.push('<meta property="og:image:height" content="630">');
    tags.push(
      `<meta property="og:image:alt" content="${escapeAttr(
        sampleMode ? `${salon.name} のサンプル画像` : salon.name
      )}">`
    );
    tags.push(`<meta name="twitter:image" content="${escapeAttr(ogImage)}">`);
  }

  return tags.join("\n    ");
}

function renderJsonLd(config) {
  const { salon, sampleMode, menus } = config;
  const siteUrl = normalizedSiteUrl(config.siteUrl);
  const sameAs = [salon.social?.instagramUrl, salon.social?.lineUrl].filter(Boolean);
  const ld = {
    "@context": "https://schema.org",
    "@type": salon.businessType,
    name: salon.name,
    description: salon.description,
    telephone: salon.telephone,
    address: {
      "@type": "PostalAddress",
      postalCode: salon.address.postalCode,
      addressRegion: salon.address.region,
      addressLocality: salon.address.locality,
      streetAddress: salon.address.streetAddress,
      addressCountry: "JP"
    },
    areaServed: {
      "@type": "City",
      name: `${salon.address.region}${salon.address.locality}`
    },
    openingHoursSpecification: config.openingHours.map((spec) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: spec.days.map((day) => `https://schema.org/${day}`),
      opens: spec.opens,
      closes: spec.closes
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "メニュー",
      itemListElement: menus.categories.map((category) => ({
        "@type": "OfferCatalog",
        name: category.title,
        itemListElement: category.items.map((item) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: item.name,
            description: item.description
          }
        }))
      }))
    }
  };

  if (siteUrl) {
    ld["@id"] = `${siteUrl}/#salon`;
    ld.url = `${siteUrl}/`;
  }
  if (sameAs.length > 0) {
    ld.sameAs = sameAs;
  }
  if (salon.booking?.webUrl) {
    ld.potentialAction = {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: salon.booking.webUrl,
        inLanguage: "ja",
        actionPlatform: [
          "https://schema.org/DesktopWebPlatform",
          "https://schema.org/MobileWebPlatform"
        ]
      },
      result: {
        "@type": "Reservation",
        name: "予約"
      }
    };
  }
  if (sampleMode) {
    ld.disambiguatingDescription =
      "営業提案用のサンプルサイトです。実在の店舗・人物・料金・口コミではありません。";
  }

  const serialized = JSON.stringify(ld, null, 2).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">\n${serialized}\n</script>`;
}

function renderHeader(config) {
  const navItems = config.nav
    .map(
      (item) =>
        `<li><a href="${escapeAttr(item.href)}">${escapeHtml(item.label)}</a></li>`
    )
    .join("");

  return `<header class="site-header" id="top">
      <div class="container header-inner">
        <a class="brand" href="#top" aria-label="${escapeAttr(config.salon.name)} トップへ">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false">
              <path d="M5.5 34V20.5a14.5 14.5 0 0 1 29 0V34"/>
              <path d="M11 34V21a9 9 0 0 1 18 0v13"/>
              <circle cx="20" cy="25.5" r="2.6"/>
            </svg>
          </span>
          <span class="brand-text">
            <span class="brand-name">${escapeHtml(config.salon.name)}</span>
            <span class="brand-en">${escapeHtml(config.salon.brandEn)}</span>
          </span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="メニューを開く">
          <span class="nav-toggle-open">${icon("menu")}</span>
          <span class="nav-toggle-close">${icon("close")}</span>
        </button>
        <nav class="site-nav" id="site-nav" aria-label="メインナビゲーション">
          <ul class="nav-list">${navItems}</ul>
          <a class="button button-primary nav-cta" href="#reserve">${escapeHtml(config.hero.primaryCta)}</a>
        </nav>
      </div>
    </header>`;
}

function renderFooter(config) {
  const navItems = config.nav
    .map(
      (item) =>
        `<li><a href="${escapeAttr(item.href)}">${escapeHtml(item.label)}</a></li>`
    )
    .join("");
  const note = config.sampleMode
    ? `<p class="footer-note">${escapeHtml(config.footer.note)}</p>`
    : "";

  return `<footer class="site-footer" aria-labelledby="footer-title">
      <div class="container footer-grid">
        <div class="footer-brand">
          <p class="footer-title" id="footer-title">
            <span class="brand-name">${escapeHtml(config.salon.name)}</span>
            <span class="brand-en">${escapeHtml(config.salon.brandEn)}</span>
          </p>
          <p class="footer-description">${escapeHtml(config.salon.description)}</p>
          <nav aria-label="フッターナビゲーション">
            <ul class="footer-nav">${navItems}</ul>
          </nav>
        </div>
        <div class="footer-info">
          <h2 class="footer-heading">店舗情報</h2>
          <address class="footer-address">
            <span class="footer-address-name">${escapeHtml(config.salon.name)}${config.sampleMode ? sampleChip() : ""}</span>
            <span>${escapeHtml(config.salon.address.full)}</span>
            <span>TEL ${escapeHtml(config.salon.telephone)}${config.sampleMode ? sampleChip() : ""}</span>
            <span>${escapeHtml(config.salon.hours)}</span>
            <span>定休日 ${escapeHtml(config.salon.closed)}</span>
          </address>
        </div>
        <div class="footer-reserve">
          <h2 class="footer-heading">ご予約</h2>
          <p>スマートフォンから、すきま時間にご予約・ご相談いただけます。</p>
          <a class="button button-light" href="#reserve">${escapeHtml(config.hero.primaryCta)}</a>
        </div>
      </div>
      <div class="container footer-bottom">
        ${note}
        <p class="copyright">&copy; ${new Date().getFullYear()} ${escapeHtml(config.footer.copyright)}</p>
      </div>
    </footer>`;
}

function renderMobileCta(config) {
  return `<div class="mobile-cta" id="mobile-cta">
      <a class="mobile-cta-primary" href="#reserve">
        ${icon("calendar")}
        <span>${escapeHtml(config.hero.primaryCta)}</span>
      </a>
      <a class="mobile-cta-secondary" href="#menu">
        ${icon("menu")}
        <span>メニュー</span>
      </a>
    </div>`;
}

function renderSampleBanner(config) {
  if (!config.sampleMode) return "";
  return `<div class="sample-banner" role="note">
      <div class="container sample-banner-inner">
        <span class="sample-banner-label">SAMPLE SITE</span>
        <p>${escapeHtml(config.notice)}</p>
      </div>
    </div>`;
}

function renderConcernCards(items) {
  return items
    .map(
      (item) => `<article class="info-card">
          <span class="info-card-icon" aria-hidden="true">${icon(item.icon)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>`
    )
    .join("");
}

function renderReasonCards(items) {
  return items
    .map(
      (item) => `<article class="reason-card">
          <span class="reason-number" aria-hidden="true">${escapeHtml(item.number)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.text)}</p>
        </article>`
    )
    .join("");
}

function renderMenuFilters(categories) {
  const buttons = categories
    .map(
      (category) =>
        `<button type="button" class="filter-chip" data-filter="${escapeAttr(category.id)}" aria-pressed="false">${escapeHtml(category.label)}</button>`
    )
    .join("");
  return `<button type="button" class="filter-chip is-active" data-filter="all" aria-pressed="true">すべて</button>${buttons}`;
}

function renderMenuCards(categories) {
  return categories
    .map(
      (category, categoryIndex) => `<article class="menu-card" data-category="${escapeAttr(category.id)}" aria-labelledby="menu-${escapeAttr(category.id)}">
          <header class="menu-card-head">
            <span class="menu-index" aria-hidden="true">${String(categoryIndex + 1).padStart(2, "0")}</span>
            <div>
              <p class="menu-kicker">${escapeHtml(category.label)}</p>
              <h3 id="menu-${escapeAttr(category.id)}">${escapeHtml(category.title)}</h3>
            </div>
          </header>
          <p class="menu-card-description">${escapeHtml(category.description)}</p>
          <ul class="menu-items">
            ${category.items
              .map(
                (item) => `<li class="menu-item">
              <div class="menu-item-top">
                <h4>${escapeHtml(item.name)}</h4>
                <p class="menu-item-price">${escapeHtml(item.price)}</p>
              </div>
              <p class="menu-item-description">${escapeHtml(item.description)}</p>
              <p class="menu-item-duration">${icon("clock")}${escapeHtml(item.duration)}</p>
            </li>`
              )
              .join("")}
          </ul>
        </article>`
    )
    .join("");
}

function renderFlowSteps(steps) {
  return steps
    .map(
      (step) => `<li class="flow-step">
          <span class="flow-number" aria-hidden="true">${escapeHtml(step.number)}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.text)}</p>
        </li>`
    )
    .join("");
}

function renderAnxietyCards(items) {
  return items
    .map(
      (item) => `<article class="anxiety-card">
          <span class="anxiety-icon" aria-hidden="true">${icon(item.icon)}</span>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </div>
        </article>`
    )
    .join("");
}

function renderFaqItems(items) {
  return items
    .map(
      (item) => `<details class="faq-item">
          <summary>
            <span class="faq-question">${escapeHtml(item.q)}</span>
            <span class="faq-toggle" aria-hidden="true"></span>
          </summary>
          <div class="faq-answer"><p>${escapeHtml(item.a)}</p></div>
        </details>`
    )
    .join("");
}

function renderGalleryItems(items, sampleMode) {
  return items
    .map(
      (item, index) => `<figure class="gallery-item">
          <div class="gallery-media">
            <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.alt)}" width="600" height="750" loading="${index === 0 ? "eager" : "lazy"}" decoding="async">
            <span class="gallery-tag">${escapeHtml(item.label)}</span>
            ${sampleMode ? '<span class="gallery-sample">SAMPLE</span>' : ""}
          </div>
        </figure>`
    )
    .join("");
}

function renderSocialCards(items, config) {
  const urls = {
    instagram: config.salon.social?.instagramUrl || "",
    line: config.salon.social?.lineUrl || ""
  };

  return items
    .map((item) => {
      const url = urls[item.type];
      if (url) {
        return `<a class="social-card" href="${escapeAttr(url)}" target="_blank" rel="noopener noreferrer">
            <span class="social-icon" aria-hidden="true">${icon(item.type)}</span>
            <span class="social-body">
              <span class="social-title">${escapeHtml(item.title)}</span>
              <span class="social-text">${escapeHtml(item.text)}</span>
              <span class="social-status">新しいタブで開きます</span>
            </span>
            ${icon("arrow", "social-arrow")}
          </a>`;
      }
      return `<div class="social-card is-placeholder">
          <span class="social-icon" aria-hidden="true">${icon(item.type)}</span>
          <span class="social-body">
            <span class="social-title">${escapeHtml(item.title)}</span>
            <span class="social-text">${escapeHtml(item.text)}</span>
            <span class="social-status">${escapeHtml(item.status)}</span>
          </span>
        </div>`;
    })
    .join("");
}

function renderReserveOptions(config) {
  return config.reserve.options
    .map((option) => {
      let href = option.href;
      let external = false;
      let status = "";

      if (option.type === "web" && config.salon.booking?.webUrl) {
        href = config.salon.booking.webUrl;
        external = true;
      } else if (option.type === "line" && config.salon.booking?.lineUrl) {
        href = config.salon.booking.lineUrl;
        external = true;
      } else if (option.type === "phone" && config.salon.booking?.phone && !config.sampleMode) {
        href = `tel:${config.salon.booking.phone.replace(/[^\d+]/g, "")}`;
      } else if (option.type === "web") {
        status = "公開時に予約URLを設定";
      } else if (option.type === "line") {
        status = "公開時にLINE URLを設定";
      }

      const linkAttributes = external
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      const statusMarkup = status
        ? `<span class="option-status">${escapeHtml(status)}</span>`
        : "";
      const phoneMarkup =
        option.type === "phone"
          ? `<p class="reserve-option-phone">${escapeHtml(config.salon.telephone)}${config.sampleMode ? sampleChip() : ""}</p>`
          : "";

      return `<article class="reserve-option">
          <p class="reserve-option-label">${escapeHtml(option.label)}</p>
          <h3>${escapeHtml(option.title)}</h3>
          <p>${escapeHtml(option.text)}</p>
          ${phoneMarkup}
          ${statusMarkup}
          <a class="text-link" href="${escapeAttr(href)}"${linkAttributes}>${escapeHtml(option.cta)}${icon("arrow")}</a>
        </article>`;
    })
    .join("");
}

function renderFormMenuOptions(categories) {
  return [
    '<option value="">まだ決まっていない</option>',
    ...categories.map(
      (category) => `<optgroup label="${escapeAttr(category.label)}">
              ${category.items
                .map(
                  (item) =>
                    `<option value="${escapeAttr(item.name)}">${escapeHtml(item.name)}</option>`
                )
                .join("")}
            </optgroup>`
    )
  ].join("");
}

function renderFormParts(config) {
  const form = config.reserve.form;
  const demo = form.demo === true;
  const attrs = demo
    ? `data-demo="true" aria-describedby="reserve-demo-note"`
    : `action="${escapeAttr(form.action)}" method="post"`;
  const demoCallout = demo
    ? `<div class="form-demo-callout" id="reserve-demo-note" role="note">
            <span class="sample-chip">DEMO</span>
            <p>${escapeHtml(form.note)}</p>
          </div>`
    : "";
  const successPanel = demo
    ? `<div class="form-success" id="reserve-success" role="status" aria-live="polite" tabindex="-1" hidden>
            <span class="form-success-mark" aria-hidden="true">${icon("check")}</span>
            <h4>デモ送信の流れを確認しました</h4>
            <p>${escapeHtml(form.success)}</p>
            <button type="button" class="text-button js-reset-form">もう一度入力する</button>
          </div>`
    : "";

  return {
    attrs,
    demoCallout,
    successPanel,
    menuOptions: renderFormMenuOptions(config.menus.categories),
    title: form.title,
    submit: form.submit,
    submitType: demo ? "button" : "submit",
    submitAttrs: demo ? "data-demo-submit" : "",
    badge: demo ? '<span class="sample-chip">DEMO</span>' : "",
    footnote: demo
      ? '<p class="form-note">※ このサイトは営業提案用のサンプルです。公開時は、個人情報の取り扱いについての文面を必ずご確認ください。</p>'
      : ""
  };
}

function renderAccessDetails(config) {
  const labels = config.access.labels;
  const phoneHref = config.salon.telephone.replace(/[^\d+]/g, "");
  const phone = config.sampleMode
    ? `<span class="access-tel">${escapeHtml(config.salon.telephone)}</span>${sampleChip()}`
    : `<a class="access-tel" href="tel:${escapeAttr(phoneHref)}">${escapeHtml(config.salon.telephone)}</a>`;

  const rows = [
    [labels.address, `${escapeHtml(config.salon.address.full)}${config.sampleMode ? sampleChip() : ""}`],
    [labels.telephone, phone],
    [labels.hours, escapeHtml(config.salon.hours)],
    [labels.closed, escapeHtml(config.salon.closed)],
    [labels.access, escapeHtml(config.salon.access)],
    [labels.payment, escapeHtml(config.salon.payment)]
  ];

  return rows
    .map(
      ([label, value]) => `<div class="access-row">
            <dt>${escapeHtml(label)}</dt>
            <dd>${value}</dd>
          </div>`
    )
    .join("");
}

function leadMarkup(className, text) {
  return text ? `<p class="${className}">${escapeHtml(text)}</p>` : "";
}

export function renderRobots(config) {
  if (config.sampleMode) {
    return [
      "# 営業提案用のサンプルサイトのため、検索エンジンへの登録を停止しています。",
      "# 実店舗情報に差し替えたうえで sampleMode を false にすると解除されます。",
      "User-agent: *",
      "Disallow: /",
      ""
    ].join("\n");
  }

  const siteUrl = normalizedSiteUrl(config.siteUrl);
  return [
    "User-agent: *",
    "Allow: /",
    ...(siteUrl ? ["", `Sitemap: ${siteUrl}/sitemap.xml`] : []),
    ""
  ].join("\n");
}

export function renderSitemap(config) {
  const siteUrl = normalizedSiteUrl(config.siteUrl);
  if (!siteUrl) return "";
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    "  <url>",
    `    <loc>${escapeHtml(`${siteUrl}/`)}</loc>`,
    "  </url>",
    "</urlset>",
    ""
  ].join("\n");
}

export function renderSite(config, template) {
  requireValidConfig(config);

  const form = renderFormParts(config);
  const heroNote = config.sampleMode
    ? `<p class="hero-note">${escapeHtml(config.hero.note)}</p>`
    : "";
  const menuNote = config.sampleMode
    ? `<p class="section-note" role="note">${escapeHtml(config.menus.note)}</p>`
    : "";
  const galleryNote = config.sampleMode
    ? `<p class="section-note" role="note">${escapeHtml(config.gallery.note)}</p>`
    : "";
  const accessLead = config.sampleMode ? leadMarkup("section-lead", config.access.lead) : "";
  const reserveDemoNotice = config.reserve.form.demo
    ? `<div class="reserve-demo-note" role="note">
            <span class="sample-chip">DEMO</span>
            <p>${escapeHtml(config.reserve.demoNotice)}</p>
          </div>`
    : "";

  const tokens = {
    META: renderMeta(config),
    SAMPLE_BANNER: renderSampleBanner(config),
    HEADER: renderHeader(config),
    FOOTER: renderFooter(config),
    MOBILE_CTA: renderMobileCta(config),
    JSON_LD: renderJsonLd(config),

    HERO_EYEBROW: escapeHtml(config.hero.eyebrow),
    HERO_TITLE_1: escapeHtml(config.hero.titleLine1),
    HERO_TITLE_2: escapeHtml(config.hero.titleLine2),
    HERO_LEAD: escapeHtml(config.hero.lead),
    HERO_PRIMARY_CTA: escapeHtml(config.hero.primaryCta),
    HERO_SECONDARY_CTA: escapeHtml(config.hero.secondaryCta),
    HERO_NOTE: heroNote,
    HERO_CAPTION: config.sampleMode ? "SAMPLE VISUAL / NOT A REAL PHOTO" : "",

    CONCERNS_EYEBROW: escapeHtml(config.concerns.eyebrow),
    CONCERNS_TITLE: escapeHtml(config.concerns.title),
    CONCERNS_LEAD: leadMarkup("section-lead", config.concerns.lead),
    CONCERN_CARDS: renderConcernCards(config.concerns.items),

    REASONS_EYEBROW: escapeHtml(config.reasons.eyebrow),
    REASONS_TITLE: escapeHtml(config.reasons.title),
    REASONS_LEAD: leadMarkup("section-lead", config.reasons.lead),
    REASON_CARDS: renderReasonCards(config.reasons.items),

    MENUS_EYEBROW: escapeHtml(config.menus.eyebrow),
    MENUS_TITLE: escapeHtml(config.menus.title),
    MENUS_LEAD: leadMarkup("section-lead", config.menus.lead),
    MENU_FILTER_LABEL: escapeHtml(config.menus.filterLabel),
    MENU_FILTERS: renderMenuFilters(config.menus.categories),
    MENU_CARDS: renderMenuCards(config.menus.categories),
    MENU_NOTE: menuNote,

    FLOW_EYEBROW: escapeHtml(config.flow.eyebrow),
    FLOW_TITLE: escapeHtml(config.flow.title),
    FLOW_LEAD: leadMarkup("section-lead", config.flow.lead),
    FLOW_STEPS: renderFlowSteps(config.flow.steps),

    ANXIETY_EYEBROW: escapeHtml(config.anxiety.eyebrow),
    ANXIETY_TITLE: escapeHtml(config.anxiety.title),
    ANXIETY_LEAD: leadMarkup("section-lead", config.anxiety.lead),
    ANXIETY_CARDS: renderAnxietyCards(config.anxiety.items),

    FAQ_EYEBROW: escapeHtml(config.faq.eyebrow),
    FAQ_TITLE: escapeHtml(config.faq.title),
    FAQ_ITEMS: renderFaqItems(config.faq.items),

    GALLERY_EYEBROW: escapeHtml(config.gallery.eyebrow),
    GALLERY_TITLE: escapeHtml(config.gallery.title),
    GALLERY_LEAD: leadMarkup("section-lead", config.gallery.lead),
    GALLERY_ITEMS: renderGalleryItems(config.gallery.items, config.sampleMode),
    GALLERY_NOTE: galleryNote,
    SOCIAL_CARDS: renderSocialCards(config.gallery.social, config),

    RESERVE_EYEBROW: escapeHtml(config.reserve.eyebrow),
    RESERVE_TITLE: escapeHtml(config.reserve.title),
    RESERVE_LEAD: leadMarkup("section-lead", config.reserve.lead),
    RESERVE_OPTIONS: renderReserveOptions(config),
    RESERVE_DEMO_NOTICE: reserveDemoNotice,
    FORM_ATTRS: form.attrs,
    FORM_DEMO_CALLOUT: form.demoCallout,
    FORM_MENU_OPTIONS: form.menuOptions,
    FORM_SUCCESS_PANEL: form.successPanel,
    FORM_TITLE: escapeHtml(form.title),
    FORM_SUBMIT: escapeHtml(form.submit),
    FORM_SUBMIT_TYPE: form.submitType,
    FORM_SUBMIT_ATTRS: form.submitAttrs,
    FORM_BADGE: form.badge,
    FORM_FOOTNOTE: form.footnote,

    ACCESS_EYEBROW: escapeHtml(config.access.eyebrow),
    ACCESS_TITLE: escapeHtml(config.access.title),
    ACCESS_LEAD: accessLead,
    ACCESS_DETAILS: renderAccessDetails(config),
    ACCESS_MAP_NOTE: escapeHtml(
      config.sampleMode
        ? config.access.mapNote
        : "Googleマップ等でアクセスをご確認ください。"
    ),
    MAP_LABEL: config.sampleMode ? "MAP / SAMPLE" : "MAP"
  };

  let html = template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => {
    if (!(key in tokens)) {
      throw new Error(`テンプレート変数 {{${key}}} が定義されていません。`);
    }
    return tokens[key];
  });

  const unresolved = html.match(/\{\{[A-Z0-9_]+\}\}/g);
  if (unresolved) {
    throw new Error(`未解決のテンプレート変数があります: ${[...new Set(unresolved)].join(", ")}`);
  }

  return `<!-- このファイルは scripts/build.mjs が content/site.json と src/index.html から生成します。直接編集しないでください。 -->\n${html}`;
}

export function buildSite({ root = ROOT, write = true } = {}) {
  const config = loadConfig(root);
  const { errors, warnings } = validateConfig(config);
  if (errors.length > 0) {
    throw new Error(`設定に ${errors.length} 件の問題があります:\n- ${errors.join("\n- ")}`);
  }

  const template = loadTemplate(root);
  const html = renderSite(config, template);
  const robots = renderRobots(config);
  const sitemap = !config.sampleMode ? renderSitemap(config) : "";

  if (write) {
    fs.writeFileSync(path.join(root, "index.html"), html);
    fs.writeFileSync(path.join(root, "robots.txt"), robots);
    const sitemapPath = path.join(root, "sitemap.xml");
    if (sitemap) {
      fs.writeFileSync(sitemapPath, sitemap);
    } else if (fs.existsSync(sitemapPath)) {
      fs.unlinkSync(sitemapPath);
    }
  }

  return { html, robots, sitemap, config, warnings };
}
