import type { SessionUser } from "@/types/api";

const ACCESS_KEY = "dw.accessToken";
const REFRESH_KEY = "dw.refreshToken";
const USER_KEY = "dw.user";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export const authStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_KEY),

  getUser(): SessionUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  },

  setSession(tokens: { accessToken: string; refreshToken: string }, user: SessionUser) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    emit();
  },

  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_KEY, token);
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    emit();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Reads the `sub` claim (user id) from a JWT without verifying it. */
export function decodeSubject(token: string): string {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return (JSON.parse(atob(payload)) as { sub: string }).sub;
  } catch {
    return "";
  }
}

// Names are only returned on register, so remember them per email for later logins.
const NAMES_KEY = "dw.knownNames";

export function rememberName(email: string, name: string) {
  const names = JSON.parse(localStorage.getItem(NAMES_KEY) ?? "{}") as Record<string, string>;
  names[email] = name;
  localStorage.setItem(NAMES_KEY, JSON.stringify(names));
}

export function recallName(email: string): string | undefined {
  const names = JSON.parse(localStorage.getItem(NAMES_KEY) ?? "{}") as Record<string, string>;
  return names[email];
}
