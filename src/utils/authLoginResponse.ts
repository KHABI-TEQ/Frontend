/**
 * Normalizes POST /auth/login (and similar) JSON bodies.
 * Some backends return 200 with token + user but omit or mis-set `success`, which would
 * otherwise surface as a generic "Login failed" / wrong error to the client.
 */

export type LoginUserPayload = Record<string, unknown>;

export function extractLoginTokenAndUser(body: unknown): { token: string; user: LoginUserPayload } | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;

  const layers: unknown[] = [raw];
  if (raw.data != null && typeof raw.data === "object") layers.push(raw.data);
  const one = raw.data as Record<string, unknown> | undefined;
  if (one && typeof one === "object" && one.data != null && typeof one.data === "object") {
    layers.push(one.data);
  }

  for (const layer of layers) {
    if (!layer || typeof layer !== "object") continue;
    const L = layer as Record<string, unknown>;
    const tokenRaw =
      (typeof L.token === "string" && L.token) ||
      (typeof L.accessToken === "string" && L.accessToken) ||
      (typeof raw.token === "string" && raw.token) ||
      "";
    const token = String(tokenRaw).trim();
    if (!token) continue;

    let user: unknown = L.user;
    if (!user || typeof user !== "object") {
      const hasIdentity = Boolean(L.id || L._id || L.email);
      if (hasIdentity) {
        const { token: _t, accessToken: _a, user: _u, data: _d, success: _s, message: _m, ...rest } = L;
        if (rest.id || rest._id || rest.email) user = rest;
      }
    }
    if (!user || typeof user !== "object") continue;
    const u = user as LoginUserPayload;
    if (u.id || u._id || u.email) {
      return { token, user: u };
    }
  }
  return null;
}

/** True if the body is clearly a successful login (explicit flag or extractable token + user). */
export function isSuccessfulLoginBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (b.success === true || b.success === "true") return true;
  return extractLoginTokenAndUser(body) !== null;
}
