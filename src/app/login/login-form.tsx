"use client";

import { useActionState } from "react";
import { Icon } from "@/components/icons";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { attempt: 0 };

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4 text-left">
      {from ? <input type="hidden" name="from" value={from} /> : null}

      <div>
        <label
          htmlFor="password"
          className="font-display text-xs uppercase tracking-[0.2em] text-gold-ink"
        >
          Password from your invitation
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          aria-describedby={state.error ? "login-error" : undefined}
          className="mt-2 w-full border border-ink/25 bg-cream px-4 py-3 text-center text-xl tracking-[0.15em] text-ink shadow-inner outline-none transition-colors placeholder:text-moss focus:border-gold-deep"
          placeholder="…"
        />
      </div>

      {state.error ? (
        <p
          key={state.attempt}
          id="login-error"
          role="alert"
          className="animate-shake border border-blush-deep bg-blush px-4 py-2.5 text-center text-base italic text-ink"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full cursor-pointer items-center justify-center gap-2.5 bg-ink px-4 py-3.5 font-display text-sm uppercase tracking-[0.28em] text-cream transition-colors hover:bg-fern disabled:cursor-default disabled:opacity-60"
      >
        <Icon name="wand" className="h-4.5 w-4.5" />
        {isPending ? "Revealing…" : "Reveal"}
      </button>
    </form>
  );
}
