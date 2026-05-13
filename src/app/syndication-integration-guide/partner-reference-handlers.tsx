/** @format */

"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Terminal } from "lucide-react";
import { motion } from "framer-motion";

function DataTable({
  columns,
  rows,
  monoColumns,
}: {
  columns: string[];
  rows: ReactNode[][];
  monoColumns?: number[];
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-[#E8EEF4] shadow-sm">
      <table className="w-full min-w-[520px] text-sm text-left">
        <thead>
          <tr className="bg-[#FAFCFE] border-b border-[#E8EEF4]">
            {columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="px-4 py-3 font-semibold text-[#09391C] whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[#4A5560]">
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[#E8EEF4] last:border-0 hover:bg-[#FAFCFE]/90 transition-colors"
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 align-top ${
                    monoColumns?.includes(j) ? "font-mono text-xs text-[#2d3748]" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IdeCodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800 bg-[#030303] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_48px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex items-center gap-2 border-b border-zinc-800/90 bg-[#0a0a0b] px-3 py-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]"
          aria-hidden
        />
        <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-500 truncate">
          {title}
        </span>
      </div>
      <pre className="max-h-[min(480px,60vh)] overflow-auto p-4 text-[10px] sm:text-[11px] leading-relaxed text-zinc-200 font-mono whitespace-pre-wrap [tab-size:2] selection:bg-emerald-500/25">
        {children}
      </pre>
    </div>
  );
}

function EndpointLine({ method, path }: { method: string; path: string }) {
  return (
    <p className="mt-3 rounded-lg border border-[#E8EEF4] bg-[#FAFCFE] px-3 py-2.5 text-sm">
      <span className="font-bold text-[#0F6F32]">{method}</span>{" "}
      <code className="text-xs sm:text-sm font-mono text-[#09391C] break-all">{path}</code>
    </p>
  );
}

function SectionShell({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-[#DDE5EE] bg-white p-6 sm:p-8 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF7ED] text-[#09391C]">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#09391C] tracking-tight">{title}</h2>
          {subtitle ? (
            <div className="text-sm text-[#5A6570] mt-1 max-w-3xl leading-relaxed">{subtitle}</div>
          ) : null}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

export function PartnerReferenceHandlersSection() {
  const upsertRequiredRows = [
    [
      "externalRef or propertyId (or legacy ids)",
      "string",
      "Central listing id from Khabiteq (hub property id).",
    ],
    ["title", "string", "Trimmed; must be non-empty."],
    ["price", "number (or numeric string)", "Must parse to a finite number."],
    [
      "location",
      "string or object",
      "If object, flatten from area, city, localGovernment / lga, state, optional address.",
    ],
  ];

  const upsertOptionalRows = [
    ["eventType", "Logged / informational; ingest logic does not branch on it in this handler."],
    ["description", "Stored on the property."],
    [
      "propertyCategory",
      "Stored in propertyType display (e.g. Residential) — not the same as transactional propertyType (sell / rent).",
    ],
    [
      "propertyType",
      "Transactional: sell / sale → availability for-sale; rent / lease → for-rent. If availability is already for-sale or for-rent, that wins.",
    ],
    ["availability", "If exactly for-sale or for-rent, used as-is for availability."],
    [
      "media",
      "Object with pictures (array of URL strings or { url }) → images[]; videos → first URL for videoLink if videoLink not set.",
    ],
    ["videoLink", "Overrides video from media.videos when non-empty."],
    [
      "listingStatus",
      "Drives syndication.isActive: active → true; inactive, archived, draft, delisted, unpublished → false; otherwise defaults true on ingest.",
    ],
    [
      "khabiteqStatus",
      "Maps to property status: approved / empty → approved; pending → pending; rejected → rejected; other non-empty → pending.",
    ],
    [
      "inspectionUrl",
      "Stored on syndication.inspectionUrl; exposed as inspectionBookingUrl when non-empty.",
    ],
    ["dealsiteUrl", "Stored on syndication.dealsiteUrl."],
    ["platformKey", "Stored on syndication.platformKey when non-empty."],
    ["tags", "Array of strings or comma-separated string."],
    ["bedrooms, bathrooms", "Numbers when present."],
    ["featured, isEstate", "Booleans."],
  ];

  const upsertErrorsRows: ReactNode[][] = [
    ["400", "Missing central id, or missing/invalid title / price / location."],
    [
      "403",
      <>
        Listing already linked to another agent than the one resolved from this request&apos;s{" "}
        <strong className="text-[#09391C]">Basic Login</strong> (<strong className="text-[#09391C]">email</strong> /{" "}
        <strong className="text-[#09391C]">password</strong>).
      </>,
    ],
    [
      "401 / 403",
      <>
        Auth failures: missing or wrong <strong className="text-[#09391C]">Basic Login email</strong> or{" "}
        <strong className="text-[#09391C]">Basic Login password</strong> (Section 5).
      </>,
    ],
    ["500", "Syndication ingest failed."],
  ];

  const unpublishErrorsRows: ReactNode[][] = [
    ["400", "Missing central id."],
    [
      "401 / 403",
      <>
        Missing or invalid <strong className="text-[#09391C]">Basic Login</strong> (
        <strong className="text-[#09391C]">email</strong> / <strong className="text-[#09391C]">password</strong>) (Section 5).
      </>,
    ],
    ["500", "Syndication unpublish failed."],
  ];

  const statusErrorsRows: ReactNode[][] = [
    ["400", "Missing central id, or visibility not derivable."],
    [
      "401 / 403",
      <>
        Missing or invalid <strong className="text-[#09391C]">Basic Login</strong> (
        <strong className="text-[#09391C]">email</strong> / <strong className="text-[#09391C]">password</strong>) (Section 5).
      </>,
    ],
    ["500", "Syndication status update failed."],
  ];

  return (
    <SectionShell
      icon={Terminal}
      title="4. Partner reference handlers — Khabiteq → your API"
      subtitle={
        <>
          Example logic a partner backend can implement for <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">POST /listings</code> (upsert),{" "}
          <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">POST /listings/unpublish</code>, and{" "}
          <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">POST /listings/status</code>. Authenticate with
          HTTP Basic first: resolve the agent from the hub user&apos;s <strong className="text-[#09391C]">Basic Login email</strong>{" "}
          and <strong className="text-[#09391C]">Basic Login password</strong> (Section 5).
        </>
      }
    >
      <p className="text-sm text-[#5A6570] leading-relaxed mb-4">
        The black panels below show illustrative TypeScript-style handler bodies and JSON payloads after Khabiteq merges{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">eventType</code> with job fields. Adjust names
        to your stack; the field semantics should stay compatible with the hub dispatcher.
      </p>

      <h3 className="text-base font-bold text-[#09391C] mt-2">POST /listings — handleListingsUpsert</h3>
      <p className="text-sm text-[#5A6570] mt-1">
        Used for create/update syndication (hub default route for events such as{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">property.created</code>,{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">property.updated</code>, etc., depending on hub
        routing).
      </p>
      <EndpointLine method="POST" path="{baseUrl}/listings" />

      <h4 className="text-sm font-semibold text-[#09391C] mt-5 mb-1">Required body fields</h4>
      <DataTable
        columns={["Field", "Type", "Notes"]}
        monoColumns={[0]}
        rows={upsertRequiredRows}
      />

      <h4 className="text-sm font-semibold text-[#09391C] mt-5 mb-1">Optional / hub-specific body fields</h4>
      <DataTable columns={["Field", "How this server consumes it"]} monoColumns={[0]} rows={upsertOptionalRows} />

      <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
        <strong className="text-[#09391C]">Listing ownership:</strong> if a syndicated listing with the same{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">hubPropertyId</code> already exists and is bound
        to <strong>another</strong> agent than the one resolved from this request&apos;s{" "}
        <strong className="text-[#09391C]">Basic Login</strong> (<strong className="text-[#09391C]">email</strong> /{" "}
        <strong className="text-[#09391C]">password</strong>), return <strong>403</strong> and do not overwrite.
      </p>

      <h4 className="text-sm font-semibold text-[#09391C] mt-5 mb-1">Success response (2xx)</h4>
      <p className="text-sm text-[#5A6570] mb-2">
        JSON includes the created/updated listing id and public URL. The hub may read{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">listingId</code>,{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">id</code>, or{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">data.listingId</code> for mapping.
      </p>
      <IdeCodeBlock title="successListingResponse.json">{`{
  "listingId": "<MongoDB ObjectId string>",
  "id": "<same>",
  "url": "https://<client-site>/property/<id>",
  "data": { "listingId": "<id>", "url": "<url>" }
}`}</IdeCodeBlock>

      <h4 className="text-sm font-semibold text-[#09391C] mt-5 mb-1">Errors</h4>
      <DataTable columns={["HTTP", "Typical cause"]} monoColumns={[0]} rows={upsertErrorsRows} />

      <IdeCodeBlock title="handleListingsUpsert.ts — payload processing (illustrative)">{`async function handleListingsUpsert(req: Request) {
  const body = await req.json();
  const hubPropertyId =
    body.externalRef ?? body.propertyId ?? body.hubPropertyId ?? body.listingId;
  const {
    eventType, title, price, location, description, propertyCategory, propertyType,
    availability, media, videoLink, listingStatus, khabiteqStatus, inspectionUrl,
    dealsiteUrl, platformKey, tags, bedrooms, bathrooms, featured, isEstate,
  } = body;

  // 1) Auth: Basic Login email + password → resolve agent (Section 5)
  // 2) Validate: hubPropertyId, trimmed non-empty title, finite price, location string|object
  // 3) Ownership: existing syndication.hubPropertyId + different agent → 403
  // 4) Map propertyType / availability / media / listingStatus / khabiteqStatus per field rules above
  // 5) Upsert document; flatten location for display string
  // 6) return successListingResponse(listing);
}`}</IdeCodeBlock>

      <h3 className="text-base font-bold text-[#09391C] mt-10 pt-2 border-t border-[#EEF2F6]">
        POST /listings/unpublish — handleListingsUnpublish
      </h3>
      <p className="text-sm text-[#5A6570] mt-1">
        Used when the hub sends <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">property.unpublished</code>{" "}
        to your configured <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">baseUrl</code>.
      </p>
      <EndpointLine method="POST" path="{baseUrl}/listings/unpublish" />

      <ul className="mt-3 text-sm text-[#5A6570] list-disc pl-5 space-y-1">
        <li>
          <strong>Required:</strong> <code className="font-mono text-xs">externalRef</code> or{" "}
          <code className="font-mono text-xs">propertyId</code> (or legacy id fields), same as upsert.
        </li>
        <li>Other payload fields are ignored for the core unpublish action.</li>
      </ul>
      <p className="mt-3 text-sm text-[#5A6570] leading-relaxed">
        <strong>Effect:</strong> find a syndicated property with matching{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">syndication.hubPropertyId</code>,{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">source: &quot;syndicated&quot;</code>, and{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">syndication.agentId</code> equal to the agent
        resolved from this request&apos;s <strong className="text-[#09391C]">Basic Login</strong> (
        <strong className="text-[#09391C]">email</strong> / <strong className="text-[#09391C]">password</strong>). Set{" "}
        <code className="font-mono text-xs">syndication.isActive</code> to <strong>false</strong> and{" "}
        <code className="font-mono text-xs">syndication.listingStatus</code> to{" "}
        <strong>&quot;unpublished&quot;</strong>.
      </p>
      <p className="mt-2 text-sm text-[#5A6570]">
        <strong>Success:</strong> same JSON shape as upsert. If no document matched, the handler may still return 200 with an
        empty acknowledgement (per your <code className="font-mono text-xs">successListingResponse</code> helper).
      </p>
      <DataTable columns={["HTTP", "Typical cause"]} monoColumns={[0]} rows={unpublishErrorsRows} />

      <IdeCodeBlock title="handleListingsUnpublish.ts — payload processing (illustrative)">{`async function handleListingsUnpublish(req: Request) {
  const body = await req.json();
  const hubPropertyId =
    body.externalRef ?? body.propertyId ?? body.hubPropertyId ?? body.listingId;
  const agentId = await authenticateBasicAgent(req); // Basic Login email/password (Section 5)

  // Find: syndication.hubPropertyId === hubPropertyId && source === "syndicated"
  //   && syndication.agentId === agentId
  // Update: syndication.isActive = false; syndication.listingStatus = "unpublished"
  // return successListingResponse(...) or 200 acknowledgement if none matched
}`}</IdeCodeBlock>

      <h3 className="text-base font-bold text-[#09391C] mt-10 pt-2 border-t border-[#EEF2F6]">
        POST /listings/status — handleListingsStatus
      </h3>
      <p className="text-sm text-[#5A6570] mt-1">
        Used when the hub sends <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">property.status_changed</code>.
      </p>
      <EndpointLine method="POST" path="{baseUrl}/listings/status" />

      <ul className="mt-3 text-sm text-[#5A6570] list-disc pl-5 space-y-1">
        <li>
          <strong>Required:</strong> <code className="font-mono text-xs">externalRef</code> or{" "}
          <code className="font-mono text-xs">propertyId</code> (or legacy ids).
        </li>
        <li>
          <strong>Visibility</strong> must be derivable from the body (see{" "}
          <code className="font-mono text-xs">interpretVisibilityActive</code> below).
        </li>
      </ul>

      <h4 className="text-sm font-semibold text-[#09391C] mt-5 mb-2">interpretVisibilityActive (order of inspection)</h4>
      <ol className="text-sm text-[#5A6570] list-decimal pl-5 space-y-2 leading-relaxed">
        <li>
          <code className="font-mono text-xs">listingStatus</code>, then <code className="font-mono text-xs">status</code>, then{" "}
          <code className="font-mono text-xs">visibility</code> (string): substrings such as active, published, live, approved,
          listed → <strong>active</strong>; draft, unpublished, archived, inactive, rejected, delist, hidden, pending →{" "}
          <strong>inactive</strong>.
        </li>
        <li>
          If still ambiguous: booleans <code className="font-mono text-xs">published</code>,{" "}
          <code className="font-mono text-xs">isPublished</code>, or <code className="font-mono text-xs">isActive</code>.
        </li>
        <li>
          If it cannot decide: <strong>400</strong> with a message mentioning{" "}
          <code className="font-mono text-xs">listingStatus</code>, <code className="font-mono text-xs">status</code>,{" "}
          <code className="font-mono text-xs">published</code>, <code className="font-mono text-xs">isPublished</code>, or{" "}
          <code className="font-mono text-xs">isActive</code>.
        </li>
      </ol>

      <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
        <strong>When visibility is known:</strong> <strong>Active</strong> →{" "}
        <code className="font-mono text-xs">syndication.isActive = true</code>,{" "}
        <code className="font-mono text-xs">status = &quot;approved&quot;</code> (then possibly overridden by{" "}
        <code className="font-mono text-xs">khabiteqStatus</code>). <strong>Inactive</strong> →{" "}
        <code className="font-mono text-xs">syndication.isActive = false</code>. Optional passthrough:{" "}
        <code className="font-mono text-xs">listingStatus</code> → <code className="font-mono text-xs">syndication.listingStatus</code>;{" "}
        <code className="font-mono text-xs">inspectionUrl</code> → <code className="font-mono text-xs">syndication.inspectionUrl</code>;{" "}
        <code className="font-mono text-xs">dealsiteUrl</code> → <code className="font-mono text-xs">syndication.dealsiteUrl</code>.{" "}
        <code className="font-mono text-xs">khabiteqStatus</code> when set can adjust <code className="font-mono text-xs">status</code>{" "}
        (rejected → rejected; pending → pending; approved with active visibility → approved). A hub webhook may fire after update.
      </p>
      <p className="mt-2 text-sm text-[#5A6570]">
        <strong>Success:</strong> same shape as upsert success.
      </p>
      <DataTable columns={["HTTP", "Typical cause"]} monoColumns={[0]} rows={statusErrorsRows} />

      <IdeCodeBlock title="handleListingsStatus.ts — payload processing (illustrative)">{`async function handleListingsStatus(req: Request) {
  const body = await req.json();
  const hubPropertyId =
    body.externalRef ?? body.propertyId ?? body.hubPropertyId ?? body.listingId;
  const active = interpretVisibilityActive(body); // 400 if undecidable

  // active → syndication.isActive = true; status = "approved" (then khabiteqStatus overrides)
  // inactive → syndication.isActive = false
  // passthrough listingStatus, inspectionUrl, dealsiteUrl; khabiteqStatus → status rules
  // return successListingResponse(...)
}`}</IdeCodeBlock>

      <h3 className="text-base font-bold text-[#09391C] mt-10 pt-2 border-t border-[#EEF2F6]">
        Example hub job payload (illustrative)
      </h3>
      <p className="text-sm text-[#5A6570] mt-1 mb-2">
        Typical central hub job merged with <code className="font-mono text-xs">eventType</code> at the top level. After ingest,{" "}
        <code className="font-mono text-xs">location</code> is often stored as one display string (for example comma-separated
        area, LGA, state).
      </p>
      <IdeCodeBlock title="hubSyndicationPayload.example.json">{`{
  "eventType": "property.created",
  "propertyId": "64f0c0c0c0c0c0c0c0c0c0c0",
  "externalRef": "64f0c0c0c0c0c0c0c0c0c0c0",
  "title": "sell in Ipaja",
  "propertyType": "sell",
  "propertyCategory": "Residential",
  "description": "Standard",
  "price": 50000000,
  "location": {
    "state": "Lagos",
    "localGovernment": "Alimosho",
    "area": "Ipaja"
  },
  "media": {
    "pictures": ["https://cdn.example.com/photo1.jpg"],
    "videos": []
  },
  "listingStatus": "active",
  "khabiteqStatus": "approved",
  "inspectionUrl": "https://partner.example.com/api/third-party/syndication/inspection/...",
  "dealsiteUrl": ""
}`}</IdeCodeBlock>
    </SectionShell>
  );
}
