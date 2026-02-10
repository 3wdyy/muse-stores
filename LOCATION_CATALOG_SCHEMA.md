# Location Catalog Importer - Schema Reference & Validation Report

> Source: SM Sync Data Importers Guide v1.9.0 | Importer: `connect_upload_location_v3` | File: `_connect_upload_location_v3.json`

---

## File Naming Convention

```
new_<api_key>_<timestamp>_<file_set_name>_connect_upload_location_v3.json
```

| Part | Format | Example |
|------|--------|---------|
| `api_key` | 40-char key | `af3c95f0876d4395be907645c4acc5a7` |
| `timestamp` | `YYYYMMDDHHmmSS` | `20260209121354` |
| `file_set_name` | Configured in ETL Coordinator | `auto-connect-upload-location-v3` |

---

## JSON Structure

```
Array > Object > nodes[] > Node > subcategories[] > Node > children[] > Location
```

### Top Level

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `nodes` | Array | **Yes** | At least 1 node |

### Node (Category)

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `name` | String | **Yes** | Non-empty |
| `category_id` | String | **Yes** | Non-empty, **globally unique** across entire catalog |
| `description` | String | No | |
| `external_ids` | map[string]string | No | |
| `children` | Array | **Conditional** | Required if no `subcategories`. Location items |
| `subcategories` | Array | **Conditional** | Required if no `children`. Nested nodes |

> A node must have at least one of `children` or `subcategories` (both allowed in v3).

### Child (Location Item)

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `id` | String | **Yes** | Non-empty. Unique within parent category. May appear under multiple categories |
| `name` | String | **Yes** | Non-empty |
| `description` | String | No | |
| `external_ids` | map[string]string | No | e.g., `{"POSKey": "R70"}` |
| `metadata` | Object | **Yes** | See below |

### Metadata Fields

| Key | Type | Required | Notes |
|-----|------|----------|-------|
| `email` | String | **Yes** | Required for backwards compat (not used in features) |
| `time_zone` | String | **Yes** | Must be valid TZ database identifier (e.g., `Asia/Dubai`) |
| `scan_expiration_time` | Integer | **Yes** | Minutes. Required for backwards compat (not used in features) |
| `include_tax` | Boolean | No | Used by Campaigns for rule evaluation & point calc |
| `phone` | String | No | |
| `address_line_1` | String | No | |
| `address_line_2` | String | No | |
| `city` | String | No | |
| `state_province` | String | No | |
| `zip_postal_code` | String | No | |
| `country` | String | No | |
| `latitude` | Double | No | e.g., `37.17776` |
| `longitude` | Double | No | e.g., `-71.0589` |
| `pos_id` | String | No | |
| `sunday_hours` - `saturday_hours` | String | No | 7 fields, one per day |

### Global Rule

> If an optional field is included in **one** record, it must be included in **ALL** records in the file.

---

## Validation Results (Our Data File)

**File:** `etl_download_chunk_...auto-connect-upload-location-v3_...json`
**Stats:** 4 nodes | 59 subcategories | 974 children | ~567 unique location IDs

### Passes (12/12 schema checks)

| # | Check | Result |
|---|-------|--------|
| 1 | Top-level structure `Array > Object > nodes[]` | PASS |
| 2 | All 4 nodes have `name` and `category_id` | PASS |
| 3 | All nodes have `children` or `subcategories` | PASS |
| 4 | All 63 `category_id` values globally unique | PASS |
| 5 | Location IDs unique within each parent category | PASS |
| 6 | All 974 children have non-empty `id` | PASS |
| 7 | All 974 children have non-empty `name` | PASS |
| 8 | All 974 children have `email` in metadata | PASS |
| 9 | All 974 children have valid `time_zone` (TZ DB) | PASS |
| 10 | All 974 children have `scan_expiration_time` (integer) | PASS |
| 11 | `include_tax` is Boolean type | PASS |
| 12 | Optional field consistency (all-or-none) | PASS |

### Warnings (Non-Blocking)

| Issue | Detail |
|-------|--------|
| **Field mismatch** | Data uses `address` instead of spec's `address_line_1` / `address_line_2` |
| **Extra field** | `currency_code` present in all records (always empty `""`) -- not in spec |
| **Extra field** | `dynamic_catalog_data` nested object with 11 keys -- not in spec |

### Data Quality Notes

| Field | Observation |
|-------|-------------|
| `country` | Empty in all 974 records |
| `currency_code` | Empty in all 974 records |
| `city` | Empty in 2 records |
| `address` | Empty in 3 records |
| `email` | All = `support@experience-muse.com` |
| `scan_expiration_time` | All = `60` |

### Node Breakdown

| Node | Type | Subcategories | Children | Purpose |
|------|------|--------------|----------|---------|
| Market | Geographic | 4 (Bahrain, Kuwait, KSA, UAE) | 405 | Stores by country |
| Brand | By sponsor | 55 | 407 | Stores by brand |
| ECOM | Direct | 0 | 41 | E-commerce locations |
| Inactive | Direct | 0 | 121 | Deactivated stores |

### Spec Fields Not Used

`phone`, `address_line_1`, `address_line_2`, `zip_postal_code`, `latitude`, `longitude`, `pos_id`, `sunday_hours`-`saturday_hours`

---

**Verdict: VALID** -- File conforms to the Location Catalog Importer schema. Extra fields (`dynamic_catalog_data`, `currency_code`, `address`) are non-blocking but would be ignored by a strict parser.
