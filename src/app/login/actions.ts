"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession } from "@/lib/auth";

export interface LoginState {
  error?: string;
  /** Bumped on every failure so the error re-animates. */
  attempt: number;
}

export async function login(
  prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "").trim();
  const fromRaw = String(formData.get("from") ?? "/");
  // Only same-site paths — never redirect off-site.
  const from = fromRaw.startsWith("/") && !fromRaw.startsWith("//") ? fromRaw : "/";

  if (!password) {
    return {
      error: "The parchment stays blank until you give the word.",
      attempt: prev.attempt + 1,
    };
  }

  const role = checkPassword(password);
  if (!role) {
    await new Promise((resolve) => setTimeout(resolve, 400)); // damp brute force
    return {
      error: "Not quite the right charm. Check your invitation and try again.",
      attempt: prev.attempt + 1,
    };
  }

  await createSession(role);
  redirect(role === "admin" ? "/admin" : from);
}
