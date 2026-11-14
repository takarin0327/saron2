import { buildSite } from "./lib/site.mjs";

try {
  const result = buildSite({ write: true });
  const menuCount = result.config.menus.categories.reduce(
    (total, category) => total + category.items.length,
    0
  );

  console.log("Build complete: index.html / robots.txt");
  console.log(
    `  - mode: ${result.config.sampleMode ? "sample" : "production"}`
  );
  console.log(
    `  - menus: ${result.config.menus.categories.length} categories / ${menuCount} items`
  );
  console.log(
    `  - structured data: ${result.config.salon.businessType}`
  );
  if (result.sitemap) console.log("  - sitemap.xml generated");
  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => console.warn(`  warning: ${warning}`));
  }
} catch (error) {
  console.error("Build failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
