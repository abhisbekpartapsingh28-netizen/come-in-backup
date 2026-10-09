// Come In — API client (Expo React Native Web + native).
//
// Reads REACT_APP_BACKEND_URL at build-time from app config / env, falling
// back to runtime in web dev where process.env is exposed by Expo. All
// requests go to `${BASE}/api/...`.
//
// Bearer token is persisted in the shared `storage` util.

import { storage } from "@/src/utils/storage";

export const TOKEN_KEY = "@comein_auth_token_v1";

function getBaseUrl(): string {
  // Expo Web exposes process.env.* via react-native-dotenv / Metro
  const fromEnv =
    (typeof process !== "undefined" && process.env && (process.env.REACT_APP_BACKEND_URL as string)) ||
    "";
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  // Browser fallback: same-origin
  if (typeof window !== "undefined" && window.location) {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return "";
}

export const API_BASE = getBaseUrl();
export const API_URL = `${API_BASE}/api`;

export type ApiError = {
  status: number;
  message: string;
  detail?: unknown;
};

function toMessage(detail: unknown): string {
  if (detail == null) return "Something went wrong";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e: any) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" · ");
  }
  if (typeof detail === "object" && detail !== null && typeof (detail as any).msg === "string") {
    return (detail as any).msg;
  }
  return String(detail);
}

async function withAuthHeaders(extra: Record<string, string> = {}) {
  const token = await storage.getItem<string>(TOKEN_KEY, "");
  const headers: Record<string, string> = { ...extra };
  if (token && typeof token === "string" && token.length > 0) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean; json?: unknown } = {},
): Promise<T> {
  const { auth = true, json, headers: extraHeaders, ...rest } = init;
  const headers: Record<string, string> = { ...(extraHeaders as any) };
  if (json !== undefined) headers["Content-Type"] = "application/json";
  if (auth) Object.assign(headers, await withAuthHeaders());

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : (rest.body as any),
  });
  let payload: any = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }
  } else {
    try {
      payload = await res.text();
    } catch {
      payload = null;
    }
  }
  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: toMessage(payload?.detail ?? payload),
      detail: payload?.detail,
    };
    throw err;
  }
  return payload as T;
}

export const api = {
  get: <T,>(path: string, auth = true) => request<T>(path, { method: "GET", auth }),
  post: <T,>(path: string, json: unknown, auth = true) =>
    request<T>(path, { method: "POST", json, auth }),
  patch: <T,>(path: string, json: unknown, auth = true) =>
    request<T>(path, { method: "PATCH", json, auth }),
  del: <T,>(path: string, auth = true) => request<T>(path, { method: "DELETE", auth }),
  async upload(file: File | Blob, filename = "image.jpg"): Promise<{ url: string; storage_path: string }> {
    const form = new FormData();
    // On RN Web `File` works directly. On native, callers pass a shim.
    form.append("file", file as any, filename);
    const headers = await withAuthHeaders();
    const res = await fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      body: form,
      headers,
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw { status: res.status, message: toMessage(payload?.detail ?? payload) } as ApiError;
    }
    return payload;
  },
};

/** Prefix relative /api/uploads/... URLs with the backend origin. */
export function resolveImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url}`;
}
