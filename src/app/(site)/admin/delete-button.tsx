"use client";

import { Icon } from "@/components/icons";
import { removeRsvp } from "./actions";

export function DeleteRsvpButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={removeRsvp}
      onSubmit={(e) => {
        if (!confirm(`Remove the reply from ${name}? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={`Remove reply from ${name}`}
        className="cursor-pointer p-1.5 text-moss transition-colors hover:text-ink"
      >
        <Icon name="close" className="h-4 w-4" />
      </button>
    </form>
  );
}
