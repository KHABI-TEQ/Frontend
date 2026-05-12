"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Code2,
  KeyRound,
  Network,
  Radio,
  Send,
  Sparkles,
  Webhook,
} from "lucide-react";
import { motion } from "framer-motion";

function GuideStep({
  description,
  index,
  isLast = false,
}: {
  description: string;
  index: number;
  isLast?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#09391C]/15 bg-white text-xs font-bold text-[#09391C] shadow-sm">
          {index + 1}
        </div>
        {!isLast ? (
          <div
            className="w-px flex-1 min-h-[14px] bg-gradient-to-b from-[#09391C]/20 to-[#09391C]/08 mt-1"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="flex-1 rounded-2xl border border-[#DDE5EE] bg-gradient-to-br from-white to-[#FAFCFE] p-4 sm:p-5 shadow-sm mb-1">
        <p className="text-sm text-[#4A5560] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function DataTable({
  columns,
  rows,
  monoColumns,
}: {
  columns: string[];
  rows: string[][];
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
                    monoColumns?.includes(j)
                      ? "font-mono text-xs text-[#2d3748]"
                      : ""
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

function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="mt-4 rounded-xl border border-[#1e293b] bg-[#0f172a] overflow-hidden shadow-inner">
      {title ? (
        <div className="px-4 py-2.5 text-xs font-medium text-slate-400 border-b border-white/10 bg-black/20">
          {title}
        </div>
      ) : null}
      <pre className="p-4 text-xs sm:text-sm text-slate-100 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
        {children}
      </pre>
    </div>
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
  subtitle?: string;
  children: ReactNode;
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
            <p className="text-sm text-[#5A6570] mt-1 max-w-3xl leading-relaxed">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </motion.section>
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

export default function SyndicationIntegrationGuidePage() {
  const implementationChecklistRows = [
    [
      "HTTPS",
      "Production baseUrl and listing url must use TLS.",
    ],
    [
      "Three POST routes",
      "/listings, /listings/unpublish, /listings/status under the registered baseUrl.",
    ],
    [
      "Auth",
      "Implement the authType you declared; reject missing/invalid credentials with 401/403.",
    ],
    [
      "Idempotency",
      "Upsert listings by hub stable property id (propertyId / hubPropertyId); avoid duplicates on retries.",
    ],
    [
      "Success body",
      "Return 2xx with listingId and url (and optional data mirror) for mapping.",
    ],
    [
      "Webhook to hub",
      "POST JSON to /api/third-party/syndication/webhooks/{platformKey}; optional HMAC; include eventId, externalRef, listingId, url (see Section 5).",
    ],
    [
      "Docs",
      "Keep docsUrl accurate for reviewers and for your own mobile and web teams.",
    ],
  ];

  const glossaryRows = [
    ["platformKey", "Stable hub-side identifier for your brand in URLs and webhooks."],
    ["baseUrl", "Root URL to which /listings, /listings/unpublish, /listings/status are appended for outbound jobs."],
    ["SyndicationPlatform", "Hub catalog entry representing your integration once onboarding is complete."],
    ["PlatformConnection", "Per-user link on the hub that stores the secrets the hub sends to your API on each job."],
    [
      "hubPropertyId / propertyId",
      "In job payloads, usually the hub internal property id you must store to correlate unpublish, status events, and webhook externalRef.",
    ],
  ];

  return (
    <main className="min-h-screen bg-[#F0F4F8]">
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#061512] via-[#0B2A24] to-[#0A1E2E]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 25%, rgba(141, 219, 144, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 60%, rgba(96, 165, 250, 0.09) 0%, transparent 40%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 opacity-[0.05] bg-[length:20px_20px] bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)]" aria-hidden />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href="/new-homepage"
            className="inline-flex items-center gap-2 text-sm text-white/75 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to homepage
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#8DDB90]/95 mb-3">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Partner integration
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-white tracking-tight leading-tight">
              Central hub syndication
            </h1>
            <p className="mt-2 text-lg sm:text-xl font-semibold text-white/90">
              Partner integration guide
            </p>
            <p className="mt-4 text-sm sm:text-base text-[#B8C9C4] leading-relaxed">
              What your listing platform must implement: public onboarding, receiving syndication jobs from the hub, and
              optional callback webhooks to the hub. Hub-facing URLs in this guide use the hub API origin (typically under{" "}
              <code className="text-[#8DDB90] font-mono text-xs">/api</code>).
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            <div className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm px-4 py-3.5 text-sm text-[#D6E8E3] flex items-center gap-3">
              <Network className="h-5 w-5 text-[#8DDB90] shrink-0" aria-hidden />
              <span>
                <span className="font-semibold text-white/95">Hub</span> — queues jobs and calls your registered base URL
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm px-4 py-3.5 text-sm text-[#D6E8E3] flex items-center gap-3">
              <Radio className="h-5 w-5 text-[#8DDB90] shrink-0" aria-hidden />
              <span>
                <span className="font-semibold text-white/95">Partner</span> — your API implements the routes below
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-sm px-4 py-3.5 text-sm text-[#D6E8E3] flex items-center gap-3">
              <Webhook className="h-5 w-5 text-[#8DDB90] shrink-0" aria-hidden />
              <span>Optional callbacks to the hub to keep listing state aligned</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        <SectionShell
          icon={ClipboardList}
          title="1. End-to-end flow"
          subtitle="What happens from your first request through live syndication."
        >
          <div className="space-y-0">
            <GuideStep
              index={0}
              description="You submit a public onboarding application (no authentication) using Section 2."
            />
            <GuideStep
              index={1}
              description="After the hub onboards your integration, hub users can select your platform and paste credentials that your product issued (API keys, tokens, and so on)."
            />
            <GuideStep
              index={2}
              description="When a property event occurs on the hub, a syndication job runs and the hub POSTs JSON to your base URL. Implement the routes described in Section 3."
            />
            <GuideStep
              index={3}
              isLast
              description="Optionally, when your side updates a mirrored listing, POST a callback to the hub so mappings stay accurate. See Section 5."
            />
          </div>
        </SectionShell>

        <SectionShell
          icon={Send}
          title="2. Onboarding — public partner application"
          subtitle="No authentication required. Send JSON with the keys below."
        >
          <EndpointLine method="POST" path="/api/third-party/syndication/platform-applications" />
          <DataTable
            columns={["Key", "Type", "Description"]}
            monoColumns={[0]}
            rows={[
              ["companyName", "string", "Legal or product company name."],
              ["contactName", "string", "Primary integration contact."],
              ["contactEmail", "string", "Operational email for the hub team."],
              ["contactPhone", "string", "E.164 or agreed format."],
              ["platformName", "string", "Display name shown to hub users."],
              [
                "platformKeySuggestion",
                "string",
                "Desired stable slug (lowercase, URL-safe); the hub may normalize or override it when your integration is approved.",
              ],
              ["authType", "string", "How the hub authenticates outbound calls to you, for example api_key (see Section 4)."],
              [
                "baseUrl",
                "string",
                "Root URL for syndication traffic (no trailing slash recommended). The hub appends fixed paths from Section 3. Use HTTPS in production.",
              ],
              [
                "webhookSupport",
                "boolean",
                "Whether you will call the hub callback URL described in Section 5 for listing or status updates.",
              ],
              ["docsUrl", "string", "Public URL to your technical documentation for reviewers."],
              ["notes", "string", "Free text (scopes, SLAs, contacts)."],
            ]}
          />
          <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
            Success: the hub returns <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">201</code> with
            an envelope <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">{"{ success, message, data }"}</code>{" "}
            where <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">data</code> includes at least
            application <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">_id</code>,{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">platformName</code>,{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">platformKeySuggestion</code>,{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">status</code> (for example pending),{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">createdAt</code>.
          </p>
        </SectionShell>

        <SectionShell
          icon={Code2}
          title="3. Hub outbound jobs — requests your API must accept"
          subtitle="The hub builds a URL from your registered base URL and the job event type, then POSTs JSON."
        >
          <h3 className="text-sm font-bold text-[#09391C] mb-2">URL resolution</h3>
          <p className="text-sm text-[#5A6570] mb-2">
            With <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">baseUrl</code> normalized (trailing
            slashes removed):
          </p>
          <DataTable
            columns={["Hub eventType", "HTTP method", "Path appended to baseUrl"]}
            monoColumns={[0, 2]}
            rows={[
              ["property.unpublished", "POST", "/listings/unpublish"],
              ["property.status_changed", "POST", "/listings/status"],
              ["(any other event)", "POST", "/listings"],
            ]}
          />
          <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
            <strong className="text-[#09391C]">Example:</strong> if{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">baseUrl</code> is{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">https://api.partner.com/v1/syndication</code>,
            the hub calls{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">…/listings</code>,{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">…/listings/unpublish</code>, and{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">…/listings/status</code>. You must expose
            these three routes on the same host and path prefix you register.
          </p>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Headers</h3>
          <DataTable
            columns={["Header", "Value"]}
            monoColumns={[0]}
            rows={[
              ["Content-Type", "application/json"],
              [
                "Authorization",
                "Set from the authType you declared and the user-supplied credentials; see Section 4 (for example Bearer and your API key).",
              ],
            ]}
          />
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Request body</h3>
          <CodeBlock title="Shape">
            {`{
  "eventType": "<hub job event type>",
  ...<job.payload fields>
}`}
          </CodeBlock>
          <ul className="mt-3 text-sm text-[#5A6570] space-y-1 list-disc pl-5">
            <li>
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">eventType</code> appears at the top
              level for routing and logging.
            </li>
            <li>
              Other fields come from the hub job payload. Accept flexible nesting when present (for example under{" "}
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">listing</code>,{" "}
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">property</code>, or{" "}
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">payload</code>).
            </li>
          </ul>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Success response (HTTP 2xx)</h3>
          <p className="text-sm text-[#5A6570] mb-2">
            Return JSON the hub can use to update listing mappings. Include at least:
          </p>
          <DataTable
            columns={["Key", "Location", "Description"]}
            monoColumns={[0, 1]}
            rows={[
              ["listingId", "root or data.listingId", "Your stable listing id (string)."],
              ["id", "root", "Optional alias for the same id."],
              ["url", "root or data.url", "Public HTTPS URL for the listing on your site."],
            ]}
          />
          <CodeBlock title="Example minimal body">{`{
  "listingId": "674abc...",
  "id": "674abc...",
  "url": "https://www.partner.com/listings/674abc",
  "data": {
    "listingId": "674abc...",
    "url": "https://www.partner.com/listings/674abc"
  }
}`}</CodeBlock>
          <p className="mt-3 text-sm text-[#5A6570]">
            Non-2xx responses may be retried or marked failed according to hub policy. Use conventional status codes (400
            invalid payload, 401 or 403 auth, 404 not found, 409 conflict); error text is stored for operators.
          </p>
        </SectionShell>

        <SectionShell
          icon={KeyRound}
          title="4. Authenticating inbound requests from the hub"
          subtitle="Hub users paste secrets your product issued. Your API must validate them on every syndication POST."
        >
          <h3 className="text-sm font-bold text-[#09391C] mb-1">What the hub stores and sends (by authType)</h3>
          <p className="text-sm text-[#5A6570] mb-2">
            The hub persists the credential object the user provides and maps it to outbound headers when calling you.
          </p>
          <DataTable
            columns={["authType", "Credential keys", "Outbound Authorization (from hub to you)"]}
            monoColumns={[0, 1]}
            rows={[
              ["api_key", "apiKey", "Bearer with the plaintext API key value."],
              [
                "oauth2",
                "accessToken; optionally refreshToken, tokenExpiresAt",
                "Bearer with the current access token.",
              ],
              ["basic", "apiKey or agreed field", "Basic authentication per hub rules."],
            ]}
          />
          <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
            <strong className="text-[#09391C]">Your responsibilities:</strong> issue, rotate, and revoke credentials in your
            product; reject missing or invalid credentials with{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">401</code> or{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">403</code>.
          </p>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Recommended patterns</h3>
          <div className="space-y-5 text-sm text-[#5A6570] leading-relaxed">
            <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFE] p-4">
              <h3 className="font-bold text-[#09391C] mb-2">api_key (most common)</h3>
              <p>
                Expect <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">Authorization: Bearer &lt;plaintext api key&gt;</code> and{" "}
                <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">Content-Type: application/json</code>.
                Validate the token on every request (constant-time compare against a stored hash when you do not keep plaintext).
                Prefer per-user keys: one secret per listing-eligible account, store only a hash, show the plaintext once at
                creation for the user to paste into the hub, and map the resolved user to listing ownership.
              </p>
            </div>
            <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFE] p-4">
              <h3 className="font-bold text-[#09391C] mb-2">oauth2</h3>
              <p>
                Expect <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">Authorization: Bearer &lt;access_token&gt;</code>.
                Validate the token (signature, introspection, or equivalent), enforce scopes, and map to a tenant or user.
              </p>
            </div>
            <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFE] p-4">
              <h3 className="font-bold text-[#09391C] mb-2">basic</h3>
              <p>
                Expect <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">Authorization: Basic &lt;base64&gt;</code> per hub rules.
                Decode and verify credentials on every request.
              </p>
            </div>
          </div>
        </SectionShell>

        <SectionShell
          icon={Webhook}
          title="5. Callback webhooks to the hub"
          subtitle="When your platform changes a listing that is linked to the hub, you can notify the hub so listing mappings and audit records stay aligned."
        >
          <CodeBlock title="Endpoint (on the hub)">{`POST {HUB_ORIGIN}/api/third-party/syndication/webhooks/{platformKey}
Content-Type: application/json`}</CodeBlock>
          <ul className="mt-3 text-sm text-[#5A6570] space-y-1 list-disc pl-5">
            <li>
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">{"{HUB_ORIGIN}"}</code> is the hub public
              API base (for example <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">https://api.hub.example.com</code>).
            </li>
            <li>
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">{"{platformKey}"}</code> is the canonical
              key assigned when your integration is onboarded; URL-encode if needed.
            </li>
          </ul>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Optional HMAC (agree with the hub team)</h3>
          <ol className="text-sm text-[#5A6570] space-y-2 list-decimal pl-5">
            <li>Serialize the body to a single JSON string in UTF-8 exactly as sent in the HTTP body.</li>
            <li>Compute HMAC-SHA256 over that string with the shared secret.</li>
            <li>
              Send a header agreed with operators (example:{" "}
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">X-Syndication-Signature: sha256=&lt;hex&gt;</code>).
            </li>
          </ol>
          <p className="mt-2 text-sm text-[#5A6570]">
            If no shared secret is configured, the hub may still accept unsigned JSON depending on hub policy.
          </p>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Payload keys (recommended contract)</h3>
          <DataTable
            columns={["Key", "Type", "Description"]}
            monoColumns={[0]}
            rows={[
              ["eventId", "string", "Unique id for idempotency (UUID or similar)."],
              ["id", "string", "Optional duplicate of eventId for compatibility."],
              ["type", "string", "Event name, for example listing.published, listing.updated, listing.unpublished."],
              ["eventType", "string", "Same as type if your stack prefers this name."],
              [
                "externalRef",
                "string",
                "Hub property identifier (often a MongoDB ObjectId string). Use the hub property id from inbound jobs (propertyId or hubPropertyId).",
              ],
              ["listingId", "string", "Your listing id (the value you returned as listingId from inbound upserts)."],
              ["url", "string", "HTTPS public URL to the listing on your site."],
            ]}
          />
          <CodeBlock title="Optional nested context (example)">{`"syndication": {
  "isActive": true,
  "status": "approved"
}`}</CodeBlock>
          <p className="mt-3 text-sm text-[#5A6570]">
            Some hub versions only update mappings for certain event types (for example{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">listing.published</code> or{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">listing.updated</code>). Confirm with the hub
            team which values update live mapping versus audit-only storage.
          </p>
        </SectionShell>

        <SectionShell
          icon={CheckCircle2}
          title="6. Partner implementation checklist"
        >
          <DataTable columns={["Item", "Detail"]} rows={implementationChecklistRows} />
        </SectionShell>

        <SectionShell icon={BookOpen} title="7. Glossary">
          <DataTable columns={["Term", "Meaning"]} monoColumns={[0]} rows={glossaryRows} />
        </SectionShell>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-[#DDE5EE] bg-white p-6 sm:p-8 shadow-sm"
        >
          <p className="text-sm text-[#5A6570] leading-relaxed">
            This guide reflects syndication integration patterns used with the central hub. Confirm field names and
            behavior against the hub environment your integration targets and any supplementary documentation the hub team
            provides.
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border-2 border-[#09391C]/20 bg-gradient-to-br from-[#09391C] to-[#0B2A24] p-6 sm:p-8 text-center shadow-lg"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white">Ready to submit your platform?</h3>
          <p className="mt-2 text-sm text-[#B8C9C4] max-w-lg mx-auto">
            Use the partner onboarding form when your team is ready — we will follow up after review.
          </p>
          <Link
            href="/partner-api"
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#8DDB90] px-6 py-3 text-sm font-semibold text-[#09391C] shadow-md transition hover:bg-[#9ee4a1] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09391C]"
          >
            Go to partner application
            <Send className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
