/**
 * Resolves whether the current session may use Agent/Developer-only features (e.g. Public Access Page).
 * Must stay aligned with `my-profile.tsx`: that UI can show "Developer" from localStorage while the
 * profile API still sends a different `userType` (or omits it). We OR all known sources so access matches what the user sees.
 */

function normalizeRoleToken(value: unknown): string {
  if (value == null) return "";
  return String(value).trim().toLowerCase();
}

function collectRoleTokensFromUser(
  user: Record<string, unknown> | null | undefined
): string[] {
  if (!user || typeof user !== "object") return [];
  const u = user as Record<string, unknown>;
  const out: string[] = [];
  for (const key of ["userType", "user_type", "accountType", "role", "type"] as const) {
    const v = u[key];
    if (v != null && String(v).trim()) out.push(normalizeRoleToken(v));
  }
  return out;
}

function collectRoleTokensFromBrowserStorage(): string[] {
  if (typeof window === "undefined") return [];
  const out: string[] = [];
  try {
    const stored = localStorage.getItem("userType");
    if (stored != null && stored.trim() !== "") {
      out.push(normalizeRoleToken(stored));
    }
  } catch {
    /* ignore */
  }
  try {
    const sessionUser = sessionStorage.getItem("user");
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser) as Record<string, unknown>;
      const st =
        parsed?.userType ??
        parsed?.user_type ??
        parsed?.role ??
        parsed?.type ??
        parsed?.accountType;
      if (st != null && String(st).trim() !== "") {
        out.push(normalizeRoleToken(st));
      }
    }
  } catch {
    /* ignore */
  }
  return out;
}

/**
 * True if any of user object, localStorage `userType`, or session `user` JSON indicates Agent or Developer.
 */
export function isAgentOrDeveloperEffective(
  user: Record<string, unknown> | null | undefined
): boolean {
  const tokens = new Set<string>([
    ...collectRoleTokensFromUser(user),
    ...collectRoleTokensFromBrowserStorage(),
  ]);
  return tokens.has("agent") || tokens.has("developer");
}

/** Single string label for display/debug (prefers user object, then localStorage). */
export function getEffectiveUserTypeLabel(
  user: Record<string, unknown> | null | undefined
): string | undefined {
  const fromUser = collectRoleTokensFromUser(user)[0];
  if (fromUser) {
    const cap =
      fromUser === "developer"
        ? "Developer"
        : fromUser === "agent"
          ? "Agent"
          : fromUser;
    return cap;
  }
  try {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("userType")?.trim();
      if (s) return s;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}
