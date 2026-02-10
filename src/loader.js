const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'stores.json');

function loadRawData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

function flattenStores(data, nodeType) {
  const stores = [];
  const nodes = data[0]?.nodes || [];
  const targetNode = nodes.find(n => n.name === nodeType);
  if (!targetNode) return stores;

  const subcategories = targetNode.subcategories || [];
  for (const region of subcategories) {
    const regionName = region.name;
    const children = region.children || [];
    for (const store of children) {
      stores.push({
        id: store.id,
        name: store.name,
        region: regionName,
        posKey: store.external_ids?.POSKey || store.id,
        city: store.metadata?.city || '',
        address: store.metadata?.address || '',
        timezone: store.metadata?.time_zone || '',
        email: store.metadata?.email || '',
        vertical: store.metadata?.dynamic_catalog_data?.vertical || '',
        orgName: store.metadata?.dynamic_catalog_data?.org_name || '',
        sponsorName: store.metadata?.dynamic_catalog_data?.sponsor_name || '',
        buName: store.metadata?.dynamic_catalog_data?.bu_name || '',
        districtName: store.metadata?.dynamic_catalog_data?.district_name || '',
        storeCategory: store.metadata?.dynamic_catalog_data?.store_category || '',
        companyName: store.metadata?.dynamic_catalog_data?.company_name || '',
        mall: store.metadata?.dynamic_catalog_data?.mall || '',
      });
    }
  }

  return stores;
}

let _marketCache = null;

function getAllStores() {
  if (!_marketCache) {
    const raw = loadRawData();
    _marketCache = flattenStores(raw, 'Market');
  }
  return _marketCache;
}

function getRegions() {
  const stores = getAllStores();
  return [...new Set(stores.map(s => s.region))].sort();
}

function getBrands() {
  const stores = getAllStores();
  return [...new Set(stores.map(s => s.sponsorName).filter(Boolean))].sort();
}

function getCategories() {
  const stores = getAllStores();
  return [...new Set(stores.map(s => s.storeCategory).filter(Boolean))].sort();
}

function getVerticals() {
  const stores = getAllStores();
  return [...new Set(stores.map(s => s.vertical).filter(Boolean))].sort();
}

const REGION_ALIASES = {
  uae: 'united arab emirates',
  ksa: 'saudi arabia',
  kwt: 'kuwait',
  bah: 'bahrain',
};

function resolveRegion(input) {
  const lower = input.toLowerCase();
  return REGION_ALIASES[lower] || lower;
}

function searchStores(query) {
  const stores = getAllStores();
  const q = query.toLowerCase();
  return stores.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.region.toLowerCase().includes(q) ||
    s.city.toLowerCase().includes(q) ||
    s.sponsorName.toLowerCase().includes(q) ||
    s.companyName.toLowerCase().includes(q) ||
    s.mall.toLowerCase().includes(q) ||
    s.id.toLowerCase().includes(q)
  );
}

function filterStores({ region, brand, category, vertical, city } = {}) {
  let stores = getAllStores();
  if (region) {
    const r = resolveRegion(region);
    stores = stores.filter(s => s.region.toLowerCase().includes(r));
  }
  if (brand) {
    const b = brand.toLowerCase();
    stores = stores.filter(s => s.sponsorName.toLowerCase().includes(b));
  }
  if (category) {
    const c = category.toLowerCase();
    stores = stores.filter(s => s.storeCategory.toLowerCase() === c);
  }
  if (vertical) {
    const v = vertical.toLowerCase();
    stores = stores.filter(s => s.vertical.toLowerCase().includes(v));
  }
  if (city) {
    const ci = city.toLowerCase();
    stores = stores.filter(s => s.city.toLowerCase().includes(ci));
  }
  return stores;
}

function getStoreById(id) {
  const stores = getAllStores();
  return stores.find(s => s.id === id || s.posKey === id);
}

module.exports = {
  loadRawData,
  flattenStores,
  getAllStores,
  getRegions,
  getBrands,
  getCategories,
  getVerticals,
  searchStores,
  filterStores,
  getStoreById,
};
