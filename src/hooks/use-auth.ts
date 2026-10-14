"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { authStorage, decodeSubject, recallName, rememberName } from "@/lib/auth-storage";
import type { LoginInput, RegisterInput } from "@/lib/validators";
import type { LoginResponse, RegisterResponse, SessionUser } from "@/types/api";

let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

function getUserSnapshot() {
  const raw = localStorage.getItem("dw.user");
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = authStorage.getUser();
  }
  return cachedUser;
}

/**
 * Current session user: `undefined` while unknown (server render and hydration),
 * `null` when signed out.
 */
export function useSession(): SessionUser | null | undefined {
  return useSyncExternalStore(authStorage.subscribe, getUserSnapshot, () => undefined);
}

async function login(input: LoginInput, name?: string) {
  const { data } = await api.post<LoginResponse>("/auth/login", input);
  authStorage.setSession(data, {
    id: decodeSubject(data.accessToken),
    email: input.email,
    name: name ?? recallName(input.email),
  });
  return data;
}

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => router.replace("/overview"),
  });
}

export function useRegister() {
  const router = useRouter();
  return useMutation({
    mutationFn: async ({ name, email, password }: RegisterInput) => {
      const { data } = await api.post<RegisterResponse>("/auth/register", {
        name,
        email,
        password,
      });
      rememberName(email, data.name);
      // Sign in right after registering so the user lands on the dashboard.
      await login({ email, password }, data.name);
      return data;
    },
    onSuccess: () => router.replace("/overview"),
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    authStorage.clear();
    queryClient.clear();
    router.replace("/login");
  };
}
