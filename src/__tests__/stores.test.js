const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  getAllStores,
  getRegions,
  getBrands,
  getCategories,
  getVerticals,
  searchStores,
  filterStores,
  getStoreById,
} = require('../loader');

describe('loader', () => {
  it('loads all stores as a non-empty array', () => {
    const stores = getAllStores();
    assert.ok(Array.isArray(stores));
    assert.ok(stores.length > 0, 'Should have at least one store');
  });

  it('each store has required fields', () => {
    const stores = getAllStores();
    for (const s of stores.slice(0, 10)) {
      assert.ok(s.id, 'Store must have id');
      assert.ok(s.name, 'Store must have name');
      assert.ok(s.region, 'Store must have region');
    }
  });

  it('returns regions', () => {
    const regions = getRegions();
    assert.ok(regions.length > 0);
    assert.ok(regions.includes('UAE') || regions.includes('Bahrain'), 'Should include known regions');
  });

  it('returns brands', () => {
    const brands = getBrands();
    assert.ok(brands.length > 0);
  });

  it('returns categories', () => {
    const cats = getCategories();
    assert.ok(cats.length > 0);
    assert.ok(cats.includes('FASHION'), 'Should include FASHION category');
  });

  it('returns verticals', () => {
    const verts = getVerticals();
    assert.ok(verts.length > 0);
  });

  it('search finds stores by name', () => {
    const results = searchStores('ralph lauren');
    assert.ok(results.length > 0, 'Should find Ralph Lauren stores');
    assert.ok(results.every(s => s.name.toLowerCase().includes('ralph lauren') ||
      s.sponsorName.toLowerCase().includes('ralph lauren')));
  });

  it('search finds stores by region', () => {
    const results = searchStores('bahrain');
    assert.ok(results.length > 0, 'Should find Bahrain stores');
  });

  it('filter by region works', () => {
    const stores = filterStores({ region: 'Bahrain' });
    assert.ok(stores.length > 0);
    assert.ok(stores.every(s => s.region === 'Bahrain'));
  });

  it('filter by category works', () => {
    const stores = filterStores({ category: 'FASHION' });
    assert.ok(stores.length > 0);
    assert.ok(stores.every(s => s.storeCategory === 'FASHION'));
  });

  it('getStoreById finds a store', () => {
    const store = getStoreById('R70');
    assert.ok(store);
    assert.equal(store.id, 'R70');
    assert.ok(store.name.includes('RALPH LAUREN'));
  });

  it('getStoreById returns undefined for unknown id', () => {
    const store = getStoreById('NONEXISTENT_999');
    assert.equal(store, undefined);
  });
});
