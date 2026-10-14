import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { authStorage } from "./auth-storage";
import { generateIdempotencyKey } from "./utils";
import type { RefreshResponse } from "@/types/api";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Attach an `Idempotency-Key` header (generated if not provided). */
    idempotencyKey?: string | true;
    _retry?: boolean;
  }
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.idempotencyKey && !config.headers["Idempotency-Key"]) {
    config.headers["Idempotency-Key"] =
      config.idempotencyKey === true
        ? generateIdempotencyKey()
        : config.idempotencyKey;
  }
  return config;
});

// Single in-flight refresh shared by every request that hits a 401.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken() {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  const { data } = await axios.post<RefreshResponse>(
    `${API_URL}/auth/refresh`,
    {
      refreshToken,
    },
  );
  authStorage.setAccessToken(data.accessToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig | undefined;
    const isAuthRoute = original?.url?.startsWith("/auth/");

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthRoute
    ) {
      throw error;
    }

    original._retry = true;
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch {
      authStorage.clear();
      // Outside React, so a full navigation is the only option; it also resets client state.

      if (typeof window !== "undefined")
        window.location.assign("/login?expired=1");
      throw error;
    }
  },
);
