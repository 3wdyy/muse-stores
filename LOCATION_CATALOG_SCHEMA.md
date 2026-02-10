# MUSE Location Catalog - File Specification

> Importer: `connect_upload_location_v3` | Based on: SM Sync Data Importers Guide v1.9.0
> Use this spec when adding, removing, or modifying store locations.

---

## File Naming

```
new_<api_key>_<timestamp>_<file_set_name>_connect_upload_location_v3.json
```

| Part | Format | Example |
|------|--------|---------|
| `api_key` | 40-char key | `af3c95f0876d4395be907645c4acc5a7` |
| `timestamp` | `YYYYMMDDHHmmSS` | `20260209121354` |
| `file_set_name` | ETL Coordinator config | `auto-connect-upload-location-v3` |

Delivery: S3 bucket. Files in the same set must share `api_key`, `timestamp`, and `file_set_name`.

---

## JSON Structure

```
Array
  └─ Object
       └─ nodes[]                          (4 nodes)
            ├─ Market   → subcategories[]  (by country → children[])
            ├─ Brand    → subcategories[]  (by brand → children[])
            ├─ ECOM     → children[]       (direct)
            └─ Inactive → children[]       (direct)
```

---

## Top Level

The file is a JSON array containing a single object.

| Key | Type | Required | Rule |
|-----|------|----------|------|
| `nodes` | Array of Node | **Yes** | At least 1 node |

---

## Node (Category Level)

| Key | Type | Required | Rule |
|-----|------|----------|------|
| `name` | String | **Yes** | Non-empty |
| `category_id` | String | **Yes** | Non-empty. **Globally unique** across entire catalog |
| `external_ids` | map[string]string | **Yes** | Must include `POSKey`. Value = `category_id` |
| `description` | String | No | |
| `children` | Array of Location | Conditional | Required if no `subcategories` |
| `subcategories` | Array of Node | Conditional | Required if no `children` |

> At least one of `children` or `subcategories` must be populated. Both allowed in v3.

### Our Nodes

| Node | `category_id` | `external_ids.POSKey` | Structure | Purpose |
|------|---------------|----------------------|-----------|---------|
| `Market` | `market_location` | `market_location` | 4 subcategories (countries) with children | Geographic grouping |
| `Brand` | `store_brand` | `store_brand` | 55 subcategories (brands) with children | Brand grouping |
| `ECOM` | `ecom` | `ecom` | Direct children (no subcategories) | E-commerce locations |
| `Inactive` | `Inactive` | `Inactive` | Direct children (no subcategories) | Deactivated stores |

### Subcategory Naming Conventions

| Parent | `name` | `category_id` pattern | `external_ids.POSKey` pattern |
|--------|--------|----------------------|------------------------------|
| Market | Country name (e.g., `Bahrain`) | `market_location_<Country>` | `market_location_<Country>` |
| Brand | Brand name (e.g., `GUCCI`) | `store_brand_<Brand>` | `store_brand_<Brand>` |

### Market Subcategories

| Name | `category_id` | Stores |
|------|---------------|--------|
| Bahrain | `market_location_Bahrain` | 21 |
| Kuwait | `market_location_Kuwait` | 38 |
| Saudi Arabia | `market_location_Saudi Arabia` | 202 |
| United Arab Emirates | `market_location_United Arab Emirates` | 144 |

---

## Location (Child Element)

| Key | Type | Required | Rule |
|-----|------|----------|------|
| `id` | String | **Yes** | Non-empty. Unique within parent category. May appear under multiple categories |
| `name` | String | **Yes** | Non-empty. Format: `BRAND - LOCATION \| COUNTRY_CODE` |
| `external_ids` | map[string]string | **Yes** | Must include `POSKey`. Value = `id` |
| `metadata` | Object | **Yes** | See Metadata section below |

### Name Format

```
<SPONSOR_NAME> - <MALL/LOCATION> | <COUNTRY_CODE>
```

Examples:
- `RALPH LAUREN - BAHRAIN CITY CENTER | BAH`
- `SAKS FIFTH AVENUE - DUBAI MALL | UAE`
- `FACES - ECOMMERCE | KWT`

Country codes: `BAH` (Bahrain), `KWT` (Kuwait), `KSA` (Saudi Arabia), `UAE` (United Arab Emirates)

### Location ID Rules

- A store **can** appear under multiple nodes (e.g., same ID under both Market and Brand)
- A store **cannot** have a duplicate ID within the same parent category
- IDs are string values (e.g., `"R70"`, `"15001"`, `"40062"`)

---

## Metadata

### Required Fields

| Key | Type | Required | Rule | Our Default |
|-----|------|----------|------|-------------|
| `email` | String | **Yes** | Contact email | `support@experience-muse.com` |
| `time_zone` | String | **Yes** | Valid TZ database identifier | See table below |
| `scan_expiration_time` | Integer | **Yes** | Minutes | `60` |

### Standard Fields

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `country` | String | **Yes**\* | Country name (currently empty in all records) |
| `city` | String | **Yes**\* | City name, uppercase (e.g., `MANAMA`, `DUBAI`) |
| `address` | String | **Yes**\* | Full address string |
| `state_province` | String | **Yes**\* | State/province code |
| `include_tax` | Boolean | **Yes**\* | Tax inclusion for campaign rules | Default: `false` |
| `currency_code` | String | **Yes**\* | Currency code (currently empty in all records) |

> \* Present in every record per the optional field consistency rule: if included in one record, must be in all.

### Time Zone Values

| Region | `time_zone` |
|--------|-------------|
| Bahrain | `Asia/Bahrain` |
| Kuwait | `Asia/Kuwait` |
| Saudi Arabia | `Asia/Riyadh` |
| United Arab Emirates | `Asia/Dubai` |

---

## dynamic_catalog_data

Nested object within `metadata` containing MUSE-specific business classification fields. Present on every location record.

| Key | Type | Required | Description | Values |
|-----|------|----------|-------------|--------|
| `vertical` | String | **Yes**\* | Business vertical | `MANAGED COMPANIES`, `JOINT VENTURES`, `COUNTRY MANAGEMENT`, `LOYALTY` |
| `org_name` | String | **Yes**\* | Organization name | `Chalhoub Brand`, `ETOILE Brand`, `BoConcept Brand`, `Soho Middle East`, `LOYALTY` |
| `sponsor_id` | String | **Yes**\* | Sponsor identifier | Numeric string (e.g., `"224"`, `"19"`) |
| `sponsor_name` | String | **Yes**\* | Brand/sponsor name | 55 brands (e.g., `RALPH LAUREN`, `GUCCI`, `SAKS FIFTH AVENUE`) |
| `bu_name` | String | **Yes**\* | Business unit name | May be empty |
| `district_name` | String | **Yes**\* | District name | May be empty |
| `store_category` | String | **Yes**\* | Store category | `FASHION`, `BEAUTY`, `LIFESTYLE`, `MULTI`, `LOYALTY` |
| `company_id` | String | **Yes**\* | Legal entity ID | Numeric string (e.g., `"79"`, `"0"` for external) |
| `company_name` | String | **Yes**\* | Legal entity name | 20 companies (e.g., `CHALMAX ME TRADING LLC`, `EXTERNAL`) |
| `mall` | String | **Yes**\* | Mall/location name | May be empty |
| `po_box` | String | **Yes**\* | PO Box number | May be empty |

> \* Present in every record per the consistency rule.

---

## Consistency Rules

1. **Optional field all-or-none:** If any optional field appears in one record, it must appear in ALL records in the file.
2. **Category ID uniqueness:** No duplicate `category_id` values anywhere in the catalog (nodes + subcategories).
3. **Location ID per-parent uniqueness:** No duplicate `id` within the same parent category.
4. **Cross-node duplication is allowed:** The same store `id` can appear under Market, Brand, ECOM, and Inactive nodes.

---

## Complete Example (Single Location)

```json
[
  {
    "nodes": [
      {
        "name": "Market",
        "category_id": "market_location",
        "external_ids": { "POSKey": "market_location" },
        "subcategories": [
          {
            "name": "Bahrain",
            "category_id": "market_location_Bahrain",
            "external_ids": { "POSKey": "market_location_Bahrain" },
            "children": [
              {
                "id": "R70",
                "name": "RALPH LAUREN - BAHRAIN CITY CENTER | BAH",
                "external_ids": { "POSKey": "R70" },
                "metadata": {
                  "country": "",
                  "time_zone": "Asia/Bahrain",
                  "include_tax": false,
                  "currency_code": "",
                  "city": "MANAMA",
                  "state_province": "13",
                  "address": "Ground Level - Bahrain City Center - Manama - Bahrain",
                  "email": "support@experience-muse.com",
                  "scan_expiration_time": 60,
                  "dynamic_catalog_data": {
                    "vertical": "JOINT VENTURES",
                    "org_name": "ETOILE Brand",
                    "sponsor_id": "224",
                    "sponsor_name": "RALPH LAUREN",
                    "bu_name": "",
                    "district_name": "",
                    "store_category": "FASHION",
                    "company_id": "0",
                    "company_name": "EXTERNAL",
                    "mall": "",
                    "po_box": ""
                  }
                }
              }
            ]
          }
        ]
      }
    ]
  }
]
```

---

## Current File Stats

| Metric | Count |
|--------|-------|
| Total nodes | 4 |
| Total subcategories | 59 (4 Market + 55 Brand) |
| Total location entries | 974 |
| Unique location IDs | ~567 |
| Market stores (active, by country) | 405 |
| Brand stores (active, by brand) | 407 |
| ECOM stores | 41 |
| Inactive stores | 121 |
| Regions | 4 (Bahrain, Kuwait, Saudi Arabia, UAE) |
| Brands | 55 |
| Store categories | 5 (FASHION, BEAUTY, LIFESTYLE, MULTI, LOYALTY) |
| Verticals | 4 (MANAGED COMPANIES, JOINT VENTURES, COUNTRY MANAGEMENT, LOYALTY) |

---

## Operations Guide

### Adding a Store

1. Create the child object with all required fields (`id`, `name`, `external_ids`, `metadata` with all fields)
2. Add to the appropriate Market subcategory (by country)
3. Add to the appropriate Brand subcategory (by `sponsor_name`)
4. If e-commerce, also add to the ECOM node
5. Ensure `id` is unique within each parent category
6. Include ALL metadata and `dynamic_catalog_data` fields (consistency rule)

### Deactivating a Store

1. Remove from Market and Brand subcategories
2. Add to the Inactive node's `children` array
3. Preserve all metadata

### Modifying a Store

1. Update the record in ALL nodes where it appears (Market, Brand, ECOM)
2. Keep `id` and `external_ids.POSKey` unchanged
3. All metadata fields must remain present

### Adding a New Brand

1. Add a new subcategory under the Brand node
2. Set `name` = brand name, `category_id` = `store_brand_<BRAND>`, `external_ids.POSKey` = `store_brand_<BRAND>`
3. Add children (stores) under it

### Adding a New Region

1. Add a new subcategory under the Market node
2. Set `name` = country name, `category_id` = `market_location_<Country>`, `external_ids.POSKey` = `market_location_<Country>`
3. Add children (stores) under it
4. Add the appropriate `time_zone` value for the new region
