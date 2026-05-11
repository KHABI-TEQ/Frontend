"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { Globe, Link2, Power, RefreshCw } from "lucide-react";
import { GET_REQUEST, PATCH_REQUEST, POST_REQUEST } from "@/utils/requests";
import { URLS } from "@/utils/URLS";

interface ApprovedPlatform {
  _id: string;
  platformKey: string;
  platformName: string;
  description?: string;
  authType?: string;
  config?: { baseUrl?: string; outboundEnabled?: boolean; inboundWebhookEnabled?: boolean };
}

interface Connection {
  _id: string;
  platformId?: string | { _id?: string };
  platformKey?: string;
  platformName?: string;
  status?: "active" | "inactive" | string;
  config?: { outboundEnabled?: boolean };
}

export function SyndicationConnectionsPanel() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvedPlatforms, setApprovedPlatforms] = useState<ApprovedPlatform[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [connectingPlatformId, setConnectingPlatformId] = useState<string | null>(null);
  const [togglingConnectionId, setTogglingConnectionId] = useState<string | null>(null);

  const token = Cookies.get("token");

  const loadAll = useCallback(async (isRefresh = false) => {
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

      const platforms = Array.isArray((platformsRes as any)?.data)
        ? ((platformsRes as any).data as ApprovedPlatform[])
        : [];
      const conns = Array.isArray((connectionsRes as any)?.data)
        ? ((connectionsRes as any).data as Connection[])
        : [];

      setApprovedPlatforms(platforms);
      setConnections(conns);
    } catch (e) {
      toast.error("Unable to load syndication integrations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

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

  const handleConnect = useCallback(
    async (platformId: string) => {
      if (!token) return;
      setConnectingPlatformId(platformId);
      try {
        const apiKey = String(apiKeys[platformId] || "").trim();
        const res = await POST_REQUEST(
          `${URLS.BASE}${URLS.accountSyndicationConnections}`,
          {
            platformId,
            credentials: {
              apiKey: apiKey || "demo_key_placeholder",
              accessToken: null,
              refreshToken: null,
              tokenExpiresAt: null,
            },
          },
          token,
        );
        if (res?.success) {
          toast.success("Platform connected.");
          await loadAll(true);
          return;
        }
        toast.error(res?.message || "Unable to connect platform.");
      } finally {
        setConnectingPlatformId(null);
      }
    },
    [apiKeys, loadAll, token],
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
        toast.error(res?.message || "Unable to update connection.");
      } finally {
        setTogglingConnectionId(null);
      }
    },
    [loadAll, token],
  );

  return (
    <section className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm">
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
              return (
                <article key={p._id} className="rounded-xl border border-[#E8EDF3] p-4 bg-[#FAFCFF]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#09391C]">{p.platformName}</p>
                      <p className="text-xs text-[#5A5D63]">{p.platformKey}</p>
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
                  {!connected ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={apiKeys[p._id] || ""}
                        onChange={(e) =>
                          setApiKeys((prev) => ({ ...prev, [p._id]: e.target.value }))
                        }
                        placeholder="API key (optional)"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DDB90]"
                      />
                      <button
                        type="button"
                        onClick={() => void handleConnect(p._id)}
                        disabled={connectingPlatformId === p._id}
                        className="px-4 py-2 rounded-lg bg-[#09391C] text-white text-sm hover:bg-[#0d4d27] disabled:opacity-50"
                      >
                        {connectingPlatformId === p._id ? "Connecting..." : "Connect"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-[#0F6F32] mt-3">
                      This platform is already connected in your account.
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
              return (
                <article key={c._id} className="rounded-xl border border-[#E8EDF3] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#09391C] inline-flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        {c.platformName || c.platformKey || "Platform"}
                      </p>
                      <p className="text-xs text-[#5A5D63] mt-1">Connection ID: {c._id}</p>
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
  );
}

export default SyndicationConnectionsPanel;
