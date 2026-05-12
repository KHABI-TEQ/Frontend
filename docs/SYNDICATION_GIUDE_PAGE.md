# Central Hub Syndication — Partner Integration Guide

This document describes what **external listing platforms** (partners) must implement and provide to integrate with the **central syndication hub**, from onboarding through inbound HTTP calls from the hub and optional outbound webhooks **to** the hub.

Terminology:

- **Hub** — the central system that owns `SyndicationPlatform`, `PlatformConnection`, syndication jobs, and inbound webhook ingestion.
- **Partner** — your platform’s public API origin (e.g. `https://api.yourbrand.com`) that receives listing events from the hub and may call the hub’s inbound webhook URL.

All hub-facing HTTP paths below are on the **hub** origin unless stated otherwise (typically under `/api`).

---

## 1. End-to-end flow

1. Partner submits a **public onboarding application** (no auth).
2. Hub **admin** reviews and approves; a `SyndicationPlatform` blueprint is created (or created manually by admin).
3. End users on the hub browse **approved** platforms and create a **`PlatformConnection`**, pasting credentials (e.g. API key) your product issued.
4. When a property event occurs on the hub, a **syndication job** is queued; the hub **dispatcher** `POST`s JSON to your **`config.baseUrl`** (see §5).
5. Optionally, after your platform updates a mirrored listing, you **`POST`** an inbound webhook to the hub (see §7) so mapping and status stay aligned.

---

## 2. Onboarding — public partner application

**Endpoint (hub):** `POST /api/third-party/syndication/platform-applications`  
**Auth:** none.

### Request body (JSON keys)

| Key | Type | Description |
|-----|------|-------------|
| `companyName` | string | Legal or product company name. |
| `contactName` | string | Primary integration contact. |
| `contactEmail` | string | Operational email for the hub team. |
| `contactPhone` | string | E.164 or agreed format. |
| `platformName` | string | Display name shown to hub users. |
| `platformKeySuggestion` | string | Desired stable slug (lowercase, URL-safe); hub may normalize or override on approval. |
| `authType` | string | How the hub authenticates **outbound** calls to you, e.g. `api_key` (see §6). |
| `baseUrl` | string | **Root URL** for syndication **inbound** HTTP (no trailing slash recommended). The hub appends fixed path segments (§5). Must be HTTPS in production. |
| `webhookSupport` | boolean | Whether you will call the hub’s **inbound** webhook (§7) for status/listing callbacks. |
| `docsUrl` | string | Public URL to your technical docs for hub reviewers. |
| `notes` | string | Free text (scopes, SLAs, contacts). |

### Success response (example shape)

Hub returns `201` with envelope `{ success, message, data }` where `data` includes at least: application `_id`, `platformName`, `platformKeySuggestion`, `status` (e.g. `pending`), `createdAt`.

---

## 3. Onboarding — hub admin blueprint (reference)

After approval, the hub stores a **`SyndicationPlatform`** document. Admins may also create or edit platforms directly.

**Create (hub):** `POST /api/admin/syndication/platforms` (admin auth).

### Request body (JSON keys)

| Key | Type | Description |
|-----|------|-------------|
| `platformKey` | string | Canonical slug for routing and webhooks (must match what you use in §7 URL). |
| `platformName` | string | Catalog display name. |
| `description` | string | Short description for admins/users. |
| `authType` | string | Same meaning as application: drives **`buildAuthHeaders`** on outbound jobs (`api_key`, `oauth2`, `basic`, …). |
| `config` | object | Platform-specific configuration (see below). |

### `config` object (typical keys)

| Key | Type | Description |
|-----|------|-------------|
| `baseUrl` | string | Partner syndication **root** (same role as in the application). Trailing slashes are stripped by the hub before path resolution. |
| `outboundEnabled` | boolean | If `false`, hub does not dispatch outbound jobs to you. |
| `inboundWebhookEnabled` | boolean | If `false`, hub may reject or no-op your inbound webhook posts (hub policy). |

**Patch platform:** `PATCH /api/admin/syndication/platforms/:id` — partial updates; same `config` keys may appear.

**Status:** `PATCH /api/admin/syndication/platforms/:id/status` with body `{ "status": "approved" | "disabled" }`.

---

## 4. Hub user connection and credentials

When a hub user connects your approved platform:

**Endpoint (hub):** `POST /api/account/syndication/connections` (authenticated hub user session).

### Request body

| Key | Type | Description |
|-----|------|-------------|
| `platformId` | string | `_id` of the approved `SyndicationPlatform` (from `GET /api/account/syndication/platforms`). |
| `credentials` | object | Secrets the hub will send **to you** on each outbound job. |

### `credentials` object (by `authType`)

| `authType` | Keys used by hub outbound | Meaning |
|------------|---------------------------|--------|
| `api_key` | `apiKey` | Plain secret; hub sends `Authorization: Bearer <apiKey>` (see §6). |
| `oauth2` | `accessToken`, optionally `refreshToken`, `tokenExpiresAt` | Hub sends `Authorization: Bearer <accessToken>`. |
| `basic` | `apiKey` (or agreed field) | Hub may send `Authorization: Basic <base64>` per hub implementation. |

**Partner responsibility:** issue, rotate, and revoke these credentials in your product; validate them on every inbound syndication request.

---

## 5. Hub outbound dispatcher — calls **to** the partner

The hub resolves a full URL from **`platform.config.baseUrl`** (or connection override) and **`eventType`**, then `POST`s JSON.

### URL resolution (`resolveEndpointForEvent`)

Given `baseUrl` with trailing slashes removed:

| Hub `eventType` | HTTP method | Path appended to `baseUrl` |
|-----------------|-------------|-----------------------------|
| `property.unpublished` | `POST` | `/listings/unpublish` |
| `property.status_changed` | `POST` | `/listings/status` |
| *(any other event)* | `POST` | `/listings` |

**Example:** if `baseUrl` is `https://api.partner.com/v1/syndication`, the hub calls:

- `https://api.partner.com/v1/syndication/listings`
- `https://api.partner.com/v1/syndication/listings/unpublish`
- `https://api.partner.com/v1/syndication/listings/status`

**Partner must** expose these three routes (same host and path prefix as registered `baseUrl`).

### Headers (`buildAuthHeaders`)

| Header | When |
|--------|------|
| `Content-Type` | `application/json` |
| `Authorization` | Depends on `authType` (see §4): e.g. `Bearer <credentials.apiKey>` for `api_key`. |

### Request body

The hub sends a single JSON object:

```json
{
  "eventType": "<hub job event type>",
  ...<job.payload fields>
}
```

- **`eventType`** — duplicated at the top level for routing/logging.
- **Remaining keys** — come from the hub job payload (listing fields, ids, etc.). Partners should accept flexible nesting: some hubs may wrap details under `listing`, `property`, or `payload` in addition to the root.

### Partner success response (HTTP 2xx)

The hub reads your JSON body to update **`SyndicatedListingMapping`**. Support at least:

| Key | Location | Description |
|-----|----------|-------------|
| `listingId` | root or `data.listingId` | Partner’s stable listing id (string). Often your internal primary key for the created/updated row. |
| `id` | root | Alternative alias for the same id. |
| `url` | root or `data.url` | Public HTTPS URL to the listing on the partner site (for deep links and hub UI). |

Example minimal body:

```json
{
  "listingId": "674abc...",
  "id": "674abc...",
  "url": "https://www.partner.com/listings/674abc",
  "data": {
    "listingId": "674abc...",
    "url": "https://www.partner.com/listings/674abc"
  }
}
```

Non-2xx responses cause the job to be retried/failed per hub policy.

### Partner error responses

Use standard HTTP semantics (`400` bad payload, `401`/`403` auth, `404` unknown resource, `409` conflicts). Hub stores error text for operators.

---

## 6. Partner inbound authentication (recommended patterns)

### `api_key` (most common)

- Hub sends: `Authorization: Bearer <plaintext api key>` (and `Content-Type: application/json`).
- **Partner:** validate the token on every request (constant-time compare against a hash if stored hashed).
- **Per-user keys (recommended):** issue one secret per listing-eligible account; store only a **hash** of the secret; show the plaintext **once** at creation for the user to paste into the hub connection. Map the resolved user to listing ownership so one account cannot modify another’s syndicated rows.

### `oauth2`

- Hub sends: `Authorization: Bearer <access_token>`.
- **Partner:** validate JWT/signature or call introspection, enforce scopes, map to a tenant/user.

### `basic`

- Hub sends: `Authorization: Basic <base64>` per hub rules.
- **Partner:** decode and verify credentials.

---

## 7. Partner outbound — inbound webhook **to** the hub

When your platform changes a listing that originated from (or is linked to) the hub, you may notify the hub so it can update **`SyndicatedListingMapping`** and audit **`WebhookEvent`** records.

### Endpoint (hub)

```http
POST {HUB_ORIGIN}/api/third-party/syndication/webhooks/{platformKey}
Content-Type: application/json
```

- **`{HUB_ORIGIN}`** — hub public API base (e.g. `https://api.hub.example.com`).
- **`{platformKey}`** — the canonical **`platformKey`** assigned at onboarding (same as in admin blueprint and URL path). URL-encode if needed.

### Optional HMAC (agreed with hub operators)

If a shared secret is configured:

1. Serialize the body to a **single JSON string** (UTF-8) exactly as sent in the HTTP body.
2. Compute **HMAC-SHA256** over that string using the shared secret.
3. Send a header (name agreed with hub; example: `X-Syndication-Signature: sha256=<hex>`).

If no secret is agreed, the hub may still accept unsigned JSON (hub policy).

### Payload keys (recommended contract)

The hub’s processor typically expects:

| Key | Type | Description |
|-----|------|-------------|
| `eventId` | string | Unique id for **idempotency** (recommended: UUID or prefixed random). |
| `id` | string | Optional duplicate of `eventId` for compatibility. |
| `type` | string | Event name, e.g. `listing.published`, `listing.updated`, `listing.unpublished`. |
| `eventType` | string | Duplicate of `type` if your stack prefers this name. |
| `externalRef` | string | Hub’s **central property** identifier (MongoDB `ObjectId` string when the hub validates with `ObjectId.isValid`). This is the id of the listing **on the hub** that you stored when ingesting jobs (e.g. as `propertyId` / `hubPropertyId` in your payload). |
| `listingId` | string | **Your** platform’s listing id (the value you returned as `listingId` from inbound upsert). |
| `url` | string | HTTPS public URL to the listing on your site. |

Optional nested context (example):

```json
"syndication": {
  "isActive": true,
  "status": "approved"
}
```

### Hub-side processing note

Some hub versions only update mapping for specific `eventType` values (e.g. `listing.published` / `listing.updated`). Confirm with hub maintainers which types update `SyndicatedListingMapping` vs. audit-only storage.

---

## 8. Partner implementation checklist

| Item | Detail |
|------|--------|
| HTTPS | Production `baseUrl` and listing `url` must use TLS. |
| Three POST routes | `/listings`, `/listings/unpublish`, `/listings/status` under the registered `baseUrl`. |
| Auth | Implement the `authType` you declared; reject missing/invalid credentials with `401`/`403`. |
| Idempotency | Upsert listings by hub’s stable property id (`propertyId` / `hubPropertyId` in payload); avoid duplicates on retries. |
| Success body | Return 2xx with `listingId` and `url` (and optional `data` mirror) for mapping. |
| Webhook to hub | `POST` JSON to `/api/third-party/syndication/webhooks/{platformKey}`; optional HMAC; include `eventId`, `externalRef`, `listingId`, `url`. |
| Docs | Keep `docsUrl` accurate for reviewers and for your own mobile/web teams. |

---

## 9. Hub catalogue and connection APIs (reference)

These are **on the hub** (not the partner):

| Audience | Method | Path | Purpose |
|----------|--------|------|---------|
| Public | `POST` | `/api/third-party/syndication/platform-applications` | Submit onboarding application. |
| Admin | `POST` / `PATCH` / `GET` | `/api/admin/syndication/platforms`… | Manage blueprint. |
| User | `GET` | `/api/account/syndication/platforms` | List approved platforms for connection UI. |
| User | `POST` | `/api/account/syndication/connections` | Connect with `platformId` + `credentials`. |
| User | `PATCH` | `/api/account/syndication/connections/:id/toggle` | Enable/disable connection. |
| User | `GET` | `/api/account/syndication/connections` | List my connections. |

Envelope style is typically `{ success, message, data }` for hub JSON APIs.

---

## 10. Glossary

| Term | Meaning |
|------|--------|
| `platformKey` | Stable hub-side identifier for your brand in URLs and webhooks. |
| `baseUrl` | Root URL to which `/listings`, `/listings/unpublish`, `/listings/status` are appended for outbound jobs. |
| `SyndicationPlatform` | Admin-owned global catalog entry for your integration. |
| `PlatformConnection` | User-owned link storing `credentials` used when the hub calls you. |
| `hubPropertyId` / `propertyId` | In job payloads, usually the hub’s internal property id you must store to correlate unpublish/status and outbound webhooks (`externalRef`). |

---

*This document reflects the syndication integration patterns implemented alongside the central hub. Final field names and hub-only behavior should be confirmed against the hub’s deployed API version and admin documentation.*
