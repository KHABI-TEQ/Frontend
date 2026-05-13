"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Globe, Link2, Power, RefreshCw, X } from "lucide-react";
import { GET_REQUEST, PATCH_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

interface ApprovedPlatform {
  _id: string;
  platformKey: string;
  platformName: string;
  description?: string;
  /** CamelCase (preferred) */
  authType?: string;
  /** Some hub API versions serialize as snake_case */
  auth_type?: string;
  config?: { baseUrl?: string; outboundEnabled?: boolean; inboundWebhookEnabled?: boolean };
}

interface Connection {
  _id: string;
  platformId?: string | {
    _id?: string;
    authType?: string;
    auth_type?: string;
    platformName?: string;
    platformKey?: string;
  };
  platformKey?: string;
  platformName?: string;
  authType?: string;
  auth_type?: string;
  status?: "active" | "inactive" | string;
  config?: { outboundEnabled?: boolean };
}

function normalizeAuthType(value: string | undefined): string {
  return String(value || "api_key")
    .trim()
    .toLowerCase();
}

/** Hub may return authType (camelCase) or auth_type (snake_case). */
function getDeclaredAuthTypeFromPlatform(p: ApprovedPlatform): string {
  const raw = p.authType ?? p.auth_type;
  return normalizeAuthType(raw);
}

function getDeclaredAuthTypeFromConnection(c: Connection): string {
  const nested =
    c.platformId && typeof c.platformId === "object"
      ? (c.platformId.authType ?? c.platformId.auth_type)
      : undefined;
  const raw = c.authType ?? (c as { auth_type?: string }).auth_type ?? nested;
  return normalizeAuthType(raw);
}

function SyndicationConfirmDialog({
  platformName,
  isPartnerLogin,
  isReconnect,
  onCancel,
  onConfirm,
  confirming,
}: {
  platformName: string;
  isPartnerLogin: boolean;
  isReconnect: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirming: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="syndication-confirm-title"
        className="relative w-full max-w-md rounded-2xl border border-[#E3E8EF] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={confirming}
          className="absolute right-3 top-3 rounded-lg p-2 text-[#5A5D63] hover:bg-gray-100 disabled:opacity-50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="p-6 pt-8">
          <h2 id="syndication-confirm-title" className="text-lg font-semibold text-[#09391C] pr-8">
            {isReconnect ? "Confirm updated login" : "Confirm before connecting"}
          </h2>
          <p className="mt-3 text-sm text-[#5A5D63] leading-relaxed">
            {isPartnerLogin ? (
              <>
                Please double-check the email and password for your <strong className="text-[#09391C]">{platformName}</strong>{" "}
                account. They must match what you use to sign in on that platform.
              </>
            ) : (
              <>
                Please confirm the API key for <strong className="text-[#09391C]">{platformName}</strong> is correct.
              </>
            )}
          </p>
          {isPartnerLogin ? (
            <ul className="mt-4 space-y-2 text-sm text-[#5A5D63] list-disc pl-5 leading-relaxed">
              <li>
                The hub does not authenticate or verify these credentials with {platformName}. They are stored and used
                only when sending syndication requests.
              </li>
              <li>
                If the email or password is wrong, property listings and updates from this hub will{" "}
                <strong className="text-[#09391C]">not</strong> appear or stay in sync on the connected platform.
              </li>
              {isReconnect ? (
                <li>You can reconnect here whenever you change your password on the partner platform.</li>
              ) : null}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[#5A5D63] leading-relaxed">
              If the key is invalid, syndication to {platformName} may fail silently from your perspective until you
              update it.
            </p>
          )}
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={confirming}
              className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-[#09391C] hover:bg-gray-50 disabled:opacity-50"
            >
              Go back and review
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirming}
              className="px-4 py-2.5 rounded-lg bg-[#09391C] text-white text-sm font-semibold hover:bg-[#0d4d27] disabled:opacity-50"
            >
              {confirming ? "Processing…" : "I have verified — continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SyndicationConnectionsPanel(props?: { anchorId?: string }) {
  const { anchorId = "syndication-integrations" } = props ?? {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvedPlatforms, setApprovedPlatforms] = useState<ApprovedPlatform[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  /** Legacy api_key credential input per platform id */
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  /** partner_login: email + password per platform id */
  const [partnerLogin, setPartnerLogin] = useState<Record<string, { email: string; password: string }>>({});
  const [connectingPlatformId, setConnectingPlatformId] = useState<string | null>(null);
  const [togglingConnectionId, setTogglingConnectionId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    platformId: string;
    platformName: string;
    authType: "partner_login" | "api_key";
    isReconnect: boolean;
  } | null>(null);

  const token = Cookies.get("token");

  const loadAll = useCallback(
    async (isRefresh = false) => {
      if (!token) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [platformsRes, connectionsRes] = await Promise.all([
          GET_REQUEST<{ data?: ApprovedPlatform[] }>(
            `${URLS.BASE}${URLS.accountSyndicationPlatforms}`,
            token,
          ),
          GET_REQUEST<{ data?: Connection[] }>(
            `${URLS.BASE}${URLS.accountSyndicationConnections}`,
            token,
          ),
        ]);

        const platformsResUnknown = platformsRes as unknown as { data?: ApprovedPlatform[] };
        const connectionsResUnknown = connectionsRes as unknown as { data?: Connection[] };

        const platforms = Array.isArray(platformsResUnknown?.data) ? platformsResUnknown.data : [];
        const conns = Array.isArray(connectionsResUnknown?.data) ? connectionsResUnknown.data : [];

        setApprovedPlatforms(platforms);
        setConnections(conns);
      } catch {
        toast.error("Unable to load syndication integrations.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    void loadAll(false);
  }, [loadAll]);

  const byPlatformId = useMemo(() => {
    const m = new Map<string, Connection>();
    for (const c of connections) {
      const id = typeof c.platformId === "string" ? c.platformId : c.platformId?._id;
      if (id) m.set(id, c);
    }
    return m;
  }, [connections]);

  const getPartnerLoginFields = useCallback(
    (platformId: string) => partnerLogin[platformId] || { email: "", password: "" },
    [partnerLogin],
  );

  const setPartnerLoginFields = useCallback((platformId: string, patch: Partial<{ email: string; password: string }>) => {
    setPartnerLogin((prev) => ({
      ...prev,
      [platformId]: {
        email: patch.email !== undefined ? patch.email : prev[platformId]?.email ?? "",
        password: patch.password !== undefined ? patch.password : prev[platformId]?.password ?? "",
      },
    }));
  }, []);

  const submitConnect = useCallback(
    async (platformId: string, authType: string) => {
      if (!token) return;
      const at = normalizeAuthType(authType);
      setConnectingPlatformId(platformId);
      try {
        let credentials: Record<string, string | null>;

        if (at === "partner_login") {
          const { email, password } = getPartnerLoginFields(platformId);
          const normalizedEmail = email.trim().toLowerCase();
          const trimmedPassword = password;
          credentials = {
            email: normalizedEmail,
            password: trimmedPassword,
          };
        } else {
          const apiKey = String(apiKeys[platformId] || "").trim();
          if (!apiKey) {
            toast.error("Please enter your API key.");
            setConnectingPlatformId(null);
            return;
          }
          credentials = {
            apiKey,
            accessToken: null,
            refreshToken: null,
            tokenExpiresAt: null,
          };
        }

        const res = await POST_REQUEST(
          `${URLS.BASE}${URLS.accountSyndicationConnections}`,
          { platformId, credentials },
          token,
        );
        if (res?.success) {
          toast.success(byPlatformId.has(platformId) ? "Connection updated." : "Platform connected.");
          setPartnerLoginFields(platformId, { password: "" });
          if (at !== "partner_login") {
            setApiKeys((prev) => ({ ...prev, [platformId]: "" }));
          }
          await loadAll(true);
          return;
        }
        toast.error(
          typeof res?.message === "string" ? res.message : "Unable to connect or update this platform.",
        );
      } finally {
        setConnectingPlatformId(null);
        setConfirmDialog(null);
      }
    },
    [apiKeys, byPlatformId, getPartnerLoginFields, loadAll, setPartnerLoginFields, token],
  );

  const requestConnect = useCallback(
    (platform: ApprovedPlatform, isReconnect: boolean) => {
      const at = getDeclaredAuthTypeFromPlatform(platform);
      if (at === "partner_login") {
        const { email, password } = getPartnerLoginFields(platform._id);
        if (!email.trim()) {
          toast.error("Please enter the email for your partner account.");
          return;
        }
        if (!password) {
          toast.error("Please enter the password for your partner account.");
          return;
        }
        setConfirmDialog({
          platformId: platform._id,
          platformName: platform.platformName,
          authType: "partner_login",
          isReconnect,
        });
        return;
      }
      if (at === "api_key") {
        const key = String(apiKeys[platform._id] || "").trim();
        if (!key) {
          toast.error("Please enter your API key.");
          return;
        }
        setConfirmDialog({
          platformId: platform._id,
          platformName: platform.platformName,
          authType: "api_key",
          isReconnect,
        });
        return;
      }
      toast.error(
        `This platform uses auth type "${at}". Please contact support if you need help connecting.`,
      );
    },
    [apiKeys, getPartnerLoginFields],
  );

  const handleToggle = useCallback(
    async (connection: Connection) => {
      if (!token) return;
      const currentEnabled = connection.status === "active";
      setTogglingConnectionId(connection._id);
      try {
        const res = await PATCH_REQUEST(
          `${URLS.BASE}${URLS.accountSyndicationToggleConnection(connection._id)}`,
          { enabled: !currentEnabled },
          token,
        );
        if (res?.success) {
          toast.success(!currentEnabled ? "Connection enabled." : "Connection disabled.");
          await loadAll(true);
          return;
        }
        toast.error(
          typeof res?.message === "string" ? res.message : "Unable to update connection.",
        );
      } finally {
        setTogglingConnectionId(null);
      }
    },
    [loadAll, token],
  );

  const connectionAuthLabel = (c: Connection) => getDeclaredAuthTypeFromConnection(c);

  return (
    <>
      <section id={anchorId} className="scroll-mt-28 bg-white rounded-xl border border-[#E3E8EF] shadow-sm">
        <div className="p-5 border-b border-[#EAEFF5] flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#09391C]">Syndication Integrations</h3>
            <p className="text-sm text-[#5A5D63]">
              Connect approved partner platforms and control dispatch per connection.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadAll(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#09391C] hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#09391C] uppercase tracking-wide">
              Approved Platforms
            </h4>
            {loading ? (
              <p className="text-sm text-[#5A5D63]">Loading platforms...</p>
            ) : approvedPlatforms.length === 0 ? (
              <p className="text-sm text-[#5A5D63]">No approved platforms available yet.</p>
            ) : (
              approvedPlatforms.map((p) => {
                const existing = byPlatformId.get(p._id);
                const connected = Boolean(existing);
                const authType = getDeclaredAuthTypeFromPlatform(p);
                const isPartnerLogin = authType === "partner_login";
                const isApiKeyStyle = authType === "api_key";
                const pl = getPartnerLoginFields(p._id);
                const authLabelRaw = p.authType ?? p.auth_type;

                return (
                  <article key={p._id} className="rounded-xl border border-[#E8EDF3] p-4 bg-[#FAFCFF]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#09391C]">{p.platformName}</p>
                        <p className="text-xs text-[#5A5D63]">{p.platformKey}</p>
                        {authLabelRaw ? (
                          <p className="text-[11px] text-[#5A5D63] mt-1 uppercase tracking-wide">
                            Auth: {authLabelRaw}
                          </p>
                        ) : null}
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-[#E9F7EA] text-[#0F6F32]">
                        {connected ? "Connected" : "Available"}
                      </span>
                    </div>
                    {p.description ? (
                      <p className="text-sm text-[#5A5D63] mt-2">{p.description}</p>
                    ) : null}
                    {p.config?.baseUrl ? (
                      <p className="text-xs text-[#5A5D63] mt-1 inline-flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {p.config.baseUrl}
                      </p>
                    ) : null}

                    {isPartnerLogin ? (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs text-[#5A5D63]">
                          Use the same email and password you use to log in on {p.platformName}. The hub sends them using
                          standard HTTP Basic when syndicating listings (your password is never shown again after you save).
                        </p>
                        <label className="block text-xs font-medium text-[#09391C]">
                          Partner account email
                          <input
                            type="email"
                            autoComplete="email"
                            value={pl.email}
                            onChange={(e) => setPartnerLoginFields(p._id, { email: e.target.value })}
                            placeholder="you@example.com"
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90]"
                          />
                        </label>
                        <label className="block text-xs font-medium text-[#09391C]">
                          Partner account password
                          <input
                            type="password"
                            autoComplete="current-password"
                            value={pl.password}
                            onChange={(e) => setPartnerLoginFields(p._id, { password: e.target.value })}
                            placeholder={connected ? "Enter new password to reconnect" : "Password"}
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90]"
                          />
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {!connected ? (
                            <button
                              type="button"
                              onClick={() => requestConnect(p, false)}
                              disabled={connectingPlatformId === p._id}
                              className="px-4 py-2 rounded-lg bg-[#09391C] text-white text-sm font-medium hover:bg-[#0d4d27] disabled:opacity-50"
                            >
                              {connectingPlatformId === p._id ? "Connecting…" : "Connect"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestConnect(p, true)}
                              disabled={connectingPlatformId === p._id}
                              className="px-4 py-2 rounded-lg border border-[#09391C] text-[#09391C] text-sm font-medium hover:bg-[#F2FBF3] disabled:opacity-50"
                            >
                              {connectingPlatformId === p._id ? "Updating…" : "Reconnect with new password"}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : isApiKeyStyle ? (
                      <div className="mt-3 space-y-2">
                        {!connected ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="password"
                              value={apiKeys[p._id] || ""}
                              onChange={(e) =>
                                setApiKeys((prev) => ({ ...prev, [p._id]: e.target.value }))
                              }
                              placeholder="API key"
                              autoComplete="off"
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90]"
                            />
                            <button
                              type="button"
                              onClick={() => requestConnect(p, false)}
                              disabled={connectingPlatformId === p._id}
                              className="px-4 py-2 rounded-lg bg-[#09391C] text-white text-sm hover:bg-[#0d4d27] disabled:opacity-50"
                            >
                              {connectingPlatformId === p._id ? "Connecting…" : "Connect"}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-[#0F6F32]">This platform is connected.</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="password"
                                value={apiKeys[p._id] || ""}
                                onChange={(e) =>
                                  setApiKeys((prev) => ({ ...prev, [p._id]: e.target.value }))
                                }
                                placeholder="New API key to reconnect"
                                autoComplete="off"
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90]"
                              />
                              <button
                                type="button"
                                onClick={() => requestConnect(p, true)}
                                disabled={connectingPlatformId === p._id}
                                className="px-4 py-2 rounded-lg border border-[#09391C] text-[#09391C] text-sm font-medium hover:bg-[#F2FBF3] disabled:opacity-50"
                              >
                                Reconnect
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        This platform uses auth type <strong>{authType}</strong>. Connecting from this dashboard is not
                        supported yet. Please contact support if you need access.
                      </p>
                    )}
                  </article>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#09391C] uppercase tracking-wide">
              My Connections
            </h4>
            {loading ? (
              <p className="text-sm text-[#5A5D63]">Loading connections...</p>
            ) : connections.length === 0 ? (
              <p className="text-sm text-[#5A5D63]">No connections yet. Connect a platform to begin.</p>
            ) : (
              connections.map((c) => {
                const active = c.status === "active";
                const at = connectionAuthLabel(c);
                return (
                  <article key={c._id} className="rounded-xl border border-[#E8EDF3] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#09391C] inline-flex items-center gap-2">
                          <Link2 className="h-4 w-4" />
                          {c.platformName || c.platformKey || "Platform"}
                        </p>
                        <p className="text-xs text-[#5A5D63] mt-1">Connection ID: {c._id}</p>
                        <p className="text-[11px] text-[#5A5D63] mt-1 uppercase tracking-wide">Auth: {at}</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          active ? "bg-[#E9F7EA] text-[#0F6F32]" : "bg-[#FDECEC] text-[#A12626]"
                        }`}
                      >
                        {active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => void handleToggle(c)}
                        disabled={togglingConnectionId === c._id}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
                          active
                            ? "border-[#F1CACA] text-[#A12626] hover:bg-[#FFF5F5]"
                            : "border-[#CFE8D4] text-[#0F6F32] hover:bg-[#F2FBF3]"
                        } disabled:opacity-50`}
                      >
                        <Power className="h-4 w-4" />
                        {togglingConnectionId === c._id
                          ? "Updating..."
                          : active
                            ? "Disable"
                            : "Enable"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {confirmDialog ? (
        <SyndicationConfirmDialog
          platformName={confirmDialog.platformName}
          isPartnerLogin={confirmDialog.authType === "partner_login"}
          isReconnect={confirmDialog.isReconnect}
          confirming={connectingPlatformId === confirmDialog.platformId}
          onCancel={() => !connectingPlatformId && setConfirmDialog(null)}
          onConfirm={() => {
            const platform = approvedPlatforms.find((x) => x._id === confirmDialog.platformId);
            if (!platform) {
              setConfirmDialog(null);
              return;
            }
            void submitConnect(
              confirmDialog.platformId,
              getDeclaredAuthTypeFromPlatform(platform),
            );
          }}
        />
      ) : null}
    </>
  );
}

export default SyndicationConnectionsPanel;
