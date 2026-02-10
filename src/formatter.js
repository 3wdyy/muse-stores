function padRight(str, len) {
  const s = String(str);
  return s.length >= len ? s.slice(0, len) : s + ' '.repeat(len - s.length);
}

function table(rows, columns) {
  if (rows.length === 0) {
    console.log('  No results found.');
    return;
  }

  const widths = columns.map(col => {
    const headerLen = col.label.length;
    const maxData = rows.reduce((max, row) => {
      const val = String(col.value(row) ?? '');
      return Math.max(max, val.length);
    }, 0);
    return Math.min(Math.max(headerLen, maxData) + 2, col.maxWidth || 40);
  });

  const header = columns.map((col, i) => padRight(col.label, widths[i])).join('  ');
  const separator = columns.map((_, i) => '-'.repeat(widths[i])).join('  ');

  console.log(`  ${header}`);
  console.log(`  ${separator}`);

  for (const row of rows) {
    const line = columns.map((col, i) => padRight(col.value(row) ?? '', widths[i])).join('  ');
    console.log(`  ${line}`);
  }
}

function storeDetail(store) {
  const lines = [
    `  Store ID:       ${store.id}`,
    `  Name:           ${store.name}`,
    `  Region:         ${store.region}`,
    `  City:           ${store.city}`,
    `  Address:        ${store.address}`,
    `  Timezone:       ${store.timezone}`,
    `  Email:          ${store.email}`,
    `  Brand:          ${store.sponsorName}`,
    `  Organization:   ${store.orgName}`,
    `  Company:        ${store.companyName}`,
    `  Vertical:       ${store.vertical}`,
    `  Category:       ${store.storeCategory}`,
    `  Business Unit:  ${store.buName}`,
    `  District:       ${store.districtName}`,
    `  Mall:           ${store.mall}`,
  ];
  console.log(lines.join('\n'));
}

function statsOutput(stats) {
  console.log(`  Total stores:    ${stats.total}`);
  console.log(`  Regions:         ${stats.regions}`);
  console.log(`  Brands:          ${stats.brands}`);
  console.log(`  Categories:      ${stats.categories}`);
  console.log(`  Verticals:       ${stats.verticals}`);
  console.log('');
  console.log('  Stores by region:');
  for (const [region, count] of stats.byRegion) {
    console.log(`    ${padRight(region, 30)} ${count}`);
  }
  console.log('');
  console.log('  Stores by category:');
  for (const [cat, count] of stats.byCategory) {
    console.log(`    ${padRight(cat || '(none)', 30)} ${count}`);
  }
  console.log('');
  console.log('  Stores by vertical:');
  for (const [vert, count] of stats.byVertical) {
    console.log(`    ${padRight(vert || '(none)', 30)} ${count}`);
  }
}

module.exports = { table, storeDetail, statsOutput, padRight };
