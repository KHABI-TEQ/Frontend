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
  UserCheck,
  Webhook,
} from "lucide-react";
import { motion } from "framer-motion";
import { PartnerReferenceHandlersSection } from "@/app/syndication-integration-guide/partner-reference-handlers";

function GuideStep({
  description,
  index,
  isLast = false,
}: {
  description: ReactNode;
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
  id,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <motion.section
      id={id}
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

function EndpointLine({ method, path }: { method: string; path: string }) {
  return (
    <p className="mt-3 rounded-lg border border-[#E8EEF4] bg-[#FAFCFE] px-3 py-2.5 text-sm">
      <span className="font-bold text-[#0F6F32]">{method}</span>{" "}
      <code className="text-xs sm:text-sm font-mono text-[#09391C] break-all">{path}</code>
    </p>
  );
}

export default function SyndicationIntegrationGuidePage() {
  const implementationChecklistRows: ReactNode[][] = [
    ["HTTPS", "Production baseUrl and listing url must use TLS."],
    [
      "Three POST routes",
      "/listings, /listings/unpublish, /listings/status under the registered baseUrl.",
    ],
    [
      <>
        Auth (<strong className="text-[#09391C]">Basic Login</strong>)
      </>,
      <>
        For <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">partner_login</code>, accept{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">Authorization: Basic</code> where the
        user:pass pair is the hub user&apos;s <strong className="text-[#09391C]">Basic Login email</strong> and{" "}
        <strong className="text-[#09391C]">Basic Login password</strong> (UTF-8, then Base64 — Section 5). Validate on every
        inbound POST; respond with 401/403 when invalid.
      </>,
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
      "User verification callback",
      <>
        After the hub calls your API Login Full URL, POST the standard authentication body to{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">{"{KHABITEQ_API_BASE_URL}/syndication/user/authentication/webhook"}</code>{" "}
        (see <a href="#user-authentication-webhook" className="text-[#09391C] font-medium underline">User registration verification</a>
        ).
      </>,
    ],
    [
      "Webhook to hub",
      "POST JSON to /api/third-party/syndication/webhooks/{platformKey}; optional HMAC; include eventId, externalRef, listingId, url (see Section 6).",
    ],
    ["Docs", "Keep docsUrl accurate for reviewers and for your own mobile and web teams."],
  ];

  const glossaryRows: ReactNode[][] = [
    ["platformKey", "Stable hub-side identifier for your brand in URLs and webhooks."],
    [
      "baseUrl",
      <>
        On the partner application JSON key <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">baseUrl</code>
        : your <strong className="text-[#09391C]">API Login Full URL</strong> (HTTPS, ending in{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">/login</code>) used for user verification. For
        outbound <strong className="text-[#09391C]">listing</strong> jobs, the hub uses the separate{" "}
        <strong className="text-[#09391C]">syndication API root</strong> from your approval pack, to which{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">/listings</code>,{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">/listings/unpublish</code>, and{" "}
        <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">/listings/status</code> are appended.
      </>,
    ],
    ["SyndicationPlatform", "Hub catalog entry representing your integration once onboarding is complete."],
    [
      "partner_login",
      <>
        <strong className="text-[#09391C]">Basic Login</strong> (<code className="font-mono text-xs">partner_login</code>
        ): the hub stores each hub user&apos;s <strong className="text-[#09391C]">email</strong> and{" "}
        <strong className="text-[#09391C]">password</strong> for your platform (their Basic Login) and sends them as standard
        HTTP Basic on outbound syndication jobs.
      </>,
    ],
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
              What your listing platform must implement: public onboarding (with{" "}
              <strong className="text-white/95">Basic Login</strong> —{" "}
              <code className="text-[#8DDB90] font-mono text-xs">partner_login</code>
              ). Each hub user&apos;s syndication connection is their platform{" "}
              <strong className="text-white/95">email</strong> and{" "}
              <strong className="text-white/95">password</strong> (their Basic Login), sent as HTTP Basic on every outbound
              job (Section 5). You also receive syndication jobs from the hub and may send optional callback webhooks to the hub.
              Hub-facing URLs in this guide use the hub API origin (typically under{" "}
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
              description={
                <>
                  After the hub onboards your integration, hub agents and developers connect using{" "}
                  <strong className="text-[#09391C]">Basic Login</strong>: the same{" "}
                  <strong className="text-[#09391C]">email</strong> and{" "}
                  <strong className="text-[#09391C]">password</strong> they use on your platform (
                  <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">partner_login</code>). The hub uses your
                  registered <strong className="text-[#09391C]">API Login Full URL</strong> to verify they are truly registered on
                  your platform, then expects you to report the outcome to Khabiteq via the authentication webhook (see the
                  section <strong className="text-[#09391C]">User registration verification</strong> below). Verified credentials
                  are stored for outbound syndication; routine listing POSTs use HTTP Basic on each request (Section 5).
                </>
              }
            />
            <GuideStep
              index={2}
              description="When a property event occurs on the hub, a syndication job runs and the hub POSTs JSON to your base URL. Implement the routes described in Section 3."
            />
            <GuideStep
              index={3}
              isLast
              description="Optionally, when your side updates a mirrored listing, POST a callback to the hub so mappings stay accurate. See Section 6."
            />
          </div>
        </SectionShell>

        <SectionShell
          icon={Send}
          title="2. Onboarding — public partner application"
          subtitle="No authentication required. Send JSON with the keys below."
        >
          {/* <EndpointLine method="POST" path="/api/third-party/syndication/platform-applications" /> */}
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
              [
                "authType",
                "string",
                <>
                  Must be <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">partner_login</code> (
                  <strong className="text-[#09391C]">Basic Login</strong> on the Khabiteq partner form). The hub sends outbound
                  syndication using HTTP Basic built from that hub user&apos;s{" "}
                  <strong className="text-[#09391C]">Basic Login email</strong> and{" "}
                  <strong className="text-[#09391C]">Basic Login password</strong> (Section 5).
                </>,
              ],
              [
                "loginFullUrl",
                "string",
                <>
                  <strong className="text-[#09391C]">API Login Full URL</strong> (HTTPS, path ending in{" "}
                  <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">/login</code>). Required: the hub calls this
                  endpoint to confirm that hub <strong className="text-[#09391C]">Agents</strong> and{" "}
                  <strong className="text-[#09391C]">Developers</strong> are registered on your platform before treating their
                  Basic Login as valid. After you complete verification on your side, you must call Khabiteq&apos;s
                  authentication webhook so we can show the correct result in the product (see{" "}
                  <a href="#user-authentication-webhook" className="text-[#09391C] font-medium underline">
                    User registration verification
                  </a>
                  ).
                </>,
              ],
              [
                "acceptedPropertyTypes",
                "string[]",
                <>
                  <strong className="text-[#09391C]">Required.</strong> At least one of{" "}
                  <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">sell</code> (Outright Sale),{" "}
                  <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">rent</code>,{" "}
                  <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">jv</code> (Joint Ventures),{" "}
                  <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">shortlet</code> — listing types your
                  platform allows to be syndicated.
                </>,
              ],
              [
                "webhookSupport",
                "boolean",
                "Whether you will call the hub callback URL described in Section 6 for listing or status updates.",
              ],
              ["docsUrl", "string", "Public URL to your technical documentation for reviewers."],
              ["notes", "string", "Free text (scopes, SLAs, contacts)."],
            ]}
          />
          <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
            The public partner application at{" "}
            <Link href="/partner-api" className="text-[#09391C] font-medium underline">
              /partner-api
            </Link>{" "}
            submits <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">partner_login</code> only,
            labeled <strong className="text-[#09391C]">Basic Login</strong> on the form (no other auth types). End users store
            their platform <strong className="text-[#09391C]">email</strong> and{" "}
            <strong className="text-[#09391C]">password</strong> as the Basic Login the hub sends on syndication POSTs.
          </p>
          <p className="mt-3 text-sm text-[#5A6570] leading-relaxed">
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
          icon={UserCheck}
          title="User registration verification & Khabiteq authentication callback"
          subtitle="End-to-end check that hub Agents and Developers exist on your platform, and a single JSON shape Khabiteq ingests everywhere."
          id="user-authentication-webhook"
        >
          <h3 className="text-sm font-bold text-[#09391C] mb-2">Why we need your API Login Full URL</h3>
          <p className="text-sm text-[#5A6570] leading-relaxed mb-4">
            The <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">loginFullUrl</code> you submit on the{" "}
            <Link href="/partner-api" className="text-[#09391C] font-medium underline">
              partner application
            </Link>{" "}
            is your <strong className="text-[#09391C]">API Login Full URL</strong> (HTTPS, ending with a{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">/login</code> route). Khabiteq calls it
            when hub users want to connect to your platform so we can confirm that the <strong className="text-[#09391C]">Basic Login</strong>{" "}
            email and password they send correspond to a real account on your side.
          </p>
          <h3 className="text-sm font-bold text-[#09391C] mb-2">Callback you must send to Khabiteq</h3>
          <p className="text-sm text-[#5A6570] leading-relaxed mb-3">
            After your API validates the user (or determines they are not registered),{" "}
            <strong className="text-[#09391C]">POST JSON</strong> to Khabiteq so we can display the right message in the hub UI.
            Use the exact path below; prepend the <strong className="text-[#09391C]">Khabiteq API base URL</strong> we issue when
            your integration is approved (we send it to your contact email together with any auth headers or signing rules you
            must follow).
          </p>
          <EndpointLine
            method="POST"
            path="{KHABITEQ_API_BASE_URL}/syndication/user/authentication/webhook"
          />
          <p className="mt-3 text-sm text-[#5A6570] leading-relaxed">
            Replace <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">{"{KHABITEQ_API_BASE_URL}"}</code> with
            the value from your approval email (no trailing slash), for example{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">https://api.khabiteq.example.com</code> — your
            pack will state the production and staging bases clearly.
          </p>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Request the hub sends to your API Login Full URL</h3>
          <p className="text-sm text-[#5A6570] mb-2 leading-relaxed">
            The hub user (Agent or Developer) enters only their <strong className="text-[#09391C]">email</strong> and{" "}
            <strong className="text-[#09391C]">password</strong> in Khabiteq. We forward those credentials to your registered
            API Login Full URL with <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">POST</code> and{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">Content-Type: application/json</code>. The{" "}
            <strong className="text-[#09391C]">JSON body must contain only these two keys</strong> — no correlation id, no
            platform key in the body. Implement your login route to accept exactly that shape (UTF-8 strings as your own login
            would).
          </p>
          <p className="text-sm text-[#5A6570] mb-2 leading-relaxed">
            On the same request, Khabiteq adds out-of-band headers so you can tie the result back when you call our webhook (see
            below): echo <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">X-Khabiteq-Correlation-Id</code> as{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">correlationId</code> in your callback JSON, and
            echo <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">X-Khabiteq-Platform-Key</code> as{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">platformKey</code> when present.
          </p>
          <DataTable
            columns={["Header", "Description"]}
            monoColumns={[0]}
            rows={[
              [
                "X-Khabiteq-Correlation-Id",
                "UUID for this verification attempt; must be echoed as correlationId in your authentication webhook body.",
              ],
              [
                "X-Khabiteq-Platform-Key",
                "Your approved platform key for this integration; echo as platformKey in the webhook body.",
              ],
            ]}
          />
          <CodeBlock title="Verification request body (hub → partner) — only these fields">{`{
  "email": "agent@partner.com",
  "password": "<user-supplied password>"
}`}</CodeBlock>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Expected authentication webhook body (partner → Khabiteq)</h3>
          <p className="text-sm text-[#5A6570] mb-2 leading-relaxed">
            This is the approved<strong className="text-[#09391C]"> JSON model</strong> for every platform so Khabiteq can parse results
            consistently. All keys use camelCase. Send <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">Content-Type: application/json</code>.
          </p>
          <DataTable
            columns={["Key", "Type", "Required", "Description"]}
            monoColumns={[0]}
            rows={[
              [
                "success",
                "boolean",
                "Yes",
                "true when your service produced a definitive verification outcome (even if the user failed verification). false only for internal/partner errors.",
              ],
              [
                "verified",
                "boolean",
                "Yes",
                "true if the email exists on your platform and the supplied Basic Login credentials are valid for that account; otherwise false.",
              ],
              [
                "correlationId",
                "string",
                "Yes",
                "Echo the value of the X-Khabiteq-Correlation-Id header from the verification POST so Khabiteq can match the round trip.",
              ],
              [
                "email",
                "string",
                "Yes",
                "Lowercase email from the verification JSON body (echo).",
              ],
              [
                "platformKey",
                "string",
                "Yes",
                "Echo the X-Khabiteq-Platform-Key header from the verification POST, or your approved key from the onboarding pack if agreed.",
              ],
              [
                "message",
                "string | null",
                "No",
                "Short, user-safe explanation when verified is false (for example “Unknown user” or “Invalid password”). Omit or null when verified is true.",
              ],
              [
                "externalUserId",
                "string",
                "No",
                "Your stable user id when verified is true, if you want the hub to store it for support and auditing.",
              ],
            ]}
          />
          <CodeBlock title="Example — user verified">{`{
  "success": true,
  "verified": true,
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "agent@partner.com",
  "platformKey": "your_approved_platform_key",
  "message": null,
  "externalUserId": "usr_88421a"
}`}</CodeBlock>
          <CodeBlock title="Example — user not verified">{`{
  "success": true,
  "verified": false,
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "unknown@partner.com",
  "platformKey": "your_approved_platform_key",
  "message": "No account found for this email.",
  "externalUserId": null
}`}</CodeBlock>
          <CodeBlock title="Example — partner-side error">{`{
  "success": false,
  "verified": false,
  "correlationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "agent@partner.com",
  "platformKey": "your_approved_platform_key",
  "message": "Temporary database error; please retry.",
  "externalUserId": null
}`}</CodeBlock>
          <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
            Additional headers (API keys, HMAC signatures, or mTLS fingerprints) required to accept your callback will be
            listed in the same approval email as the Khabiteq API base URL. If anything in this contract changes, the hub team
            will communicate a versioned update before enforcement.
          </p>
        </SectionShell>

        <SectionShell
          icon={Code2}
          title="3. Hub outbound jobs — requests your API must accept"
          subtitle="The hub builds listing URLs from your approved syndication API root and the job event type, then POSTs JSON."
        >
          <h3 className="text-sm font-bold text-[#09391C] mb-2">URL resolution</h3>
          <p className="text-sm text-[#5A6570] mb-2 leading-relaxed">
            Listing syndication uses the <strong className="text-[#09391C]">syndication API root</strong> the hub associates with
            your platform after approval (often the same origin as your API Login Full URL with the{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">/login</code> suffix removed, or a separate base
            you confirm in your approval pack). With that root normalized (trailing slashes removed), paths are appended as
            follows:
          </p>
          <DataTable
            columns={["Hub eventType", "HTTP method", "Path appended to syndication root"]}
            monoColumns={[0, 2]}
            rows={[
              ["property.unpublished", "POST", "/listings/unpublish"],
              ["property.status_changed", "POST", "/listings/status"],
              ["(any other event)", "POST", "/listings"],
            ]}
          />
          <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
            <strong className="text-[#09391C]">Example:</strong> if your syndication root is{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">https://api.partner.com/v1/syndication</code>,
            the hub calls{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">…/listings</code>,{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">…/listings/unpublish</code>, and{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">…/listings/status</code>. You must expose
            these three routes on the same host and path prefix the hub has on file for listing jobs.
          </p>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Headers</h3>
          <DataTable
            columns={["Header", "Value"]}
            monoColumns={[0]}
            rows={[
              ["Content-Type", "application/json"],
              [
                "Authorization",
                <>
                  For <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">partner_login</code> (
                  <strong className="text-[#09391C]">Basic Login</strong>): HTTP Basic with Base64(UTF-8(
                  <strong className="text-[#09391C]">Basic Login email</strong>
                  {" + ':' + "}
                  <strong className="text-[#09391C]">Basic Login password</strong>)) — same encoding as standard HTTP Basic
                  user:pass (Section 5).
                </>,
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
              Field-level semantics for each route (required keys, optional hub fields, and example handler logic) are documented in{" "}
              <strong className="text-[#09391C]">Section 4</strong>.
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

        <PartnerReferenceHandlersSection />

        <SectionShell
          icon={KeyRound}
          title="5. Basic Login (partner_login) — authenticating inbound requests from the hub"
          subtitle={
            <>
              New partner integrations use <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">partner_login</code>{" "}
              only. Hub users enter the same <strong className="text-[#09391C]">Basic Login email</strong> and{" "}
              <strong className="text-[#09391C]">Basic Login password</strong> they use on your platform; your API must validate
              standard HTTP Basic on every syndication POST.
            </>
          }
        >
          <p className="text-sm text-[#5A6570] leading-relaxed mb-4">
            When a hub user connects your platform from the dashboard, the hub stores their{" "}
            <strong className="text-[#09391C]">Basic Login</strong> as{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">credentials.email</code> and{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">credentials.password</code> (the{" "}
            <strong className="text-[#09391C]">email</strong> is normalized with trim and lowercase). Responses to the client
            omit secrets. On each outbound syndication job the hub builds:
          </p>
          <DataTable
            columns={["Field", "Role"]}
            monoColumns={[0]}
            rows={[
              [
                "authType",
                "Syndication platform catalog value partner_login (labeled Basic Login on the Khabiteq partner application form).",
              ],
              [
                "credentials.email / credentials.password",
                <>
                  The hub user&apos;s <strong className="text-[#09391C]">Basic Login email</strong> and{" "}
                  <strong className="text-[#09391C]">Basic Login password</strong> — the same sign-in they use on your site; used
                  only to build the <code className="font-mono text-xs bg-[#EEF1F1] px-1 py-0.5 rounded">Authorization</code>{" "}
                  header below.
                </>,
              ],
            ]}
          />
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">Authorization header the hub sends</h3>
          <p className="text-sm text-[#5A6570] mb-2">
            The hub uses standard HTTP Basic: Base64 over UTF-8 of{" "}
            <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">email + &quot;:&quot; + password</code>{" "}
            where <strong className="text-[#09391C]">email</strong> and <strong className="text-[#09391C]">password</strong> are
            that user&apos;s <strong className="text-[#09391C]">Basic Login</strong> on your platform (same encoding Node would
            use for user:pass).
          </p>
          <CodeBlock title="Pattern">{`Authorization: Basic <base64( utf8( email + ":" + password ) )>
// email + password = hub user's Basic Login credentials on your site
Content-Type: application/json`}</CodeBlock>
          <h3 className="text-sm font-bold text-[#09391C] mt-6 mb-2">What you must implement</h3>
          <ul className="text-sm text-[#5A6570] space-y-2 list-disc pl-5 leading-relaxed">
            <li>
              Decode the <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">Authorization</code> header,
              split the Basic user and password (the hub user&apos;s <strong className="text-[#09391C]">Basic Login email</strong>{" "}
              and <strong className="text-[#09391C]">Basic Login password</strong>), and authenticate them the same way your own
              login would (against your user store).
            </li>
            <li>
              Reject missing or invalid credentials with{" "}
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">401</code> or{" "}
              <code className="font-mono text-xs bg-[#EEF1F1] px-1.5 py-0.5 rounded">403</code> on every syndication route.
            </li>
            <li>
              When users change their <strong className="text-[#09391C]">Basic Login password</strong> on your platform, they
              should use the hub dashboard <strong>Reconnect</strong> flow so the stored{" "}
              <strong className="text-[#09391C]">Basic Login password</strong> stays valid for syndication.
            </li>
          </ul>
          <p className="mt-4 text-sm text-[#5A6570] leading-relaxed">
            Routine syndication traffic does not re-run the full registration handshake on every POST; the hub relies on HTTP
            Basic on each listing request (above). If credentials are wrong, listings will not sync until the user reconnects.
            When the user first connects or when a fresh check is required, the hub uses your{" "}
            <strong className="text-[#09391C]">API Login Full URL</strong> and the authentication callback contract described in{" "}
            <a href="#user-authentication-webhook" className="text-[#09391C] font-medium underline">
              User registration verification
            </a>
            .
          </p>
        </SectionShell>

        <SectionShell
          icon={Webhook}
          title="6. Callback webhooks to the hub"
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
          title="7. Partner implementation checklist"
        >
          <DataTable columns={["Item", "Detail"]} rows={implementationChecklistRows} />
        </SectionShell>

        <SectionShell icon={BookOpen} title="8. Glossary">
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
