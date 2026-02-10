// Basic lint check: validates that source files parse correctly
const fs = require('fs');
const path = require('path');

const srcFiles = [
  'src/loader.js',
  'src/formatter.js',
  'bin/muse-stores.js',
];

let errors = 0;

for (const file of srcFiles) {
  const fullPath = path.join(__dirname, '..', file);
  try {
    let code = fs.readFileSync(fullPath, 'utf8');
    if (code.startsWith('#!')) {
      code = code.slice(code.indexOf('\n') + 1);
    }
    new Function(code);
    console.log(`  OK: ${file}`);
  } catch (err) {
    console.error(`  FAIL: ${file} - ${err.message}`);
    errors++;
  }
}

// Validate JSON data
try {
  const dataPath = path.join(__dirname, '..', 'data', 'stores.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  JSON.parse(raw);
  console.log('  OK: data/stores.json (valid JSON)');
} catch (err) {
  console.error(`  FAIL: data/stores.json - ${err.message}`);
  errors++;
}

if (errors > 0) {
  console.error(`\n  ${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log('\n  All checks passed.');
}
