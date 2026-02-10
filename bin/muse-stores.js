#!/usr/bin/env node

const {
  getAllStores,
  getRegions,
  getBrands,
  getCategories,
  getVerticals,
  searchStores,
  filterStores,
  getStoreById,
} = require('../src/loader');

const fmt = require('../src/formatter');

const args = process.argv.slice(2);
const command = args[0];

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      flags[key] = val;
      if (val !== true) i++;
    }
  }
  return flags;
}

function showHelp() {
  console.log(`
  muse-stores - MUSE Loyalty Program Store Directory

  Usage:
    muse-stores <command> [options]

  Commands:
    list                         List all stores
    search <query>               Search stores by name, region, city, brand
    info <store-id>              Show detailed info for a store
    regions                      List all regions
    brands                       List all brands
    stats                        Show store statistics
    export [options]             Export filtered stores as JSON

  Options (for list/export):
    --region <name>              Filter by region
    --brand <name>               Filter by brand
    --category <name>            Filter by category (FASHION, BEAUTY, MULTI, LOYALTY)
    --vertical <name>            Filter by vertical
    --city <name>                Filter by city
    --limit <n>                  Limit number of results
    --json                       Output as JSON (for list command)

  Examples:
    muse-stores list --region UAE
    muse-stores search "ralph lauren"
    muse-stores info R70
    muse-stores stats
    muse-stores list --brand GUCCI --json
    muse-stores export --category FASHION --region UAE
`);
}

function cmdList(flagArgs) {
  const flags = parseFlags(flagArgs);
  let stores = filterStores({
    region: flags.region,
    brand: flags.brand,
    category: flags.category,
    vertical: flags.vertical,
    city: flags.city,
  });

  if (flags.limit) {
    stores = stores.slice(0, parseInt(flags.limit, 10));
  }

  if (flags.json) {
    console.log(JSON.stringify(stores, null, 2));
    return;
  }

  console.log(`\n  Found ${stores.length} store(s)\n`);
  fmt.table(stores, [
    { label: 'ID', value: s => s.id, maxWidth: 10 },
    { label: 'Name', value: s => s.name, maxWidth: 50 },
    { label: 'Region', value: s => s.region, maxWidth: 15 },
    { label: 'City', value: s => s.city, maxWidth: 15 },
    { label: 'Category', value: s => s.storeCategory, maxWidth: 12 },
  ]);
  console.log('');
}

function cmdSearch(query) {
  if (!query) {
    console.error('  Error: Please provide a search query.');
    process.exit(1);
  }

  const results = searchStores(query);
  console.log(`\n  Found ${results.length} result(s) for "${query}"\n`);
  fmt.table(results, [
    { label: 'ID', value: s => s.id, maxWidth: 10 },
    { label: 'Name', value: s => s.name, maxWidth: 50 },
    { label: 'Region', value: s => s.region, maxWidth: 15 },
    { label: 'Brand', value: s => s.sponsorName, maxWidth: 20 },
  ]);
  console.log('');
}

function cmdInfo(id) {
  if (!id) {
    console.error('  Error: Please provide a store ID.');
    process.exit(1);
  }

  const store = getStoreById(id);
  if (!store) {
    console.error(`  Error: Store "${id}" not found.`);
    process.exit(1);
  }

  console.log('');
  fmt.storeDetail(store);
  console.log('');
}

function cmdRegions() {
  const regions = getRegions();
  console.log(`\n  ${regions.length} region(s):\n`);
  for (const r of regions) {
    const count = filterStores({ region: r }).length;
    console.log(`    ${fmt.padRight(r, 30)} ${count} stores`);
  }
  console.log('');
}

function cmdBrands() {
  const brands = getBrands();
  console.log(`\n  ${brands.length} brand(s):\n`);
  for (const b of brands) {
    const count = filterStores({ brand: b }).length;
    console.log(`    ${fmt.padRight(b, 30)} ${count} stores`);
  }
  console.log('');
}

function cmdStats() {
  const stores = getAllStores();
  const regions = getRegions();
  const brands = getBrands();
  const categories = getCategories();
  const verticals = getVerticals();

  const byRegion = regions.map(r => [r, stores.filter(s => s.region === r).length])
    .sort((a, b) => b[1] - a[1]);

  const byCategory = categories.map(c => [c, stores.filter(s => s.storeCategory === c).length])
    .sort((a, b) => b[1] - a[1]);

  const byVertical = verticals.map(v => [v, stores.filter(s => s.vertical === v).length])
    .sort((a, b) => b[1] - a[1]);

  console.log('');
  fmt.statsOutput({
    total: stores.length,
    regions: regions.length,
    brands: brands.length,
    categories: categories.length,
    verticals: verticals.length,
    byRegion,
    byCategory,
    byVertical,
  });
  console.log('');
}

function cmdExport(flagArgs) {
  const flags = parseFlags(flagArgs);
  const stores = filterStores({
    region: flags.region,
    brand: flags.brand,
    category: flags.category,
    vertical: flags.vertical,
    city: flags.city,
  });
  console.log(JSON.stringify(stores, null, 2));
}

// Main dispatch
switch (command) {
  case 'list':
    cmdList(args.slice(1));
    break;
  case 'search':
    cmdSearch(args.slice(1).filter(a => !a.startsWith('--')).join(' '));
    break;
  case 'info':
    cmdInfo(args[1]);
    break;
  case 'regions':
    cmdRegions();
    break;
  case 'brands':
    cmdBrands();
    break;
  case 'stats':
    cmdStats();
    break;
  case 'export':
    cmdExport(args.slice(1));
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    showHelp();
    break;
}
