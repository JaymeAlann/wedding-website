"use client";

import { useActionState, useEffect, useState } from "react";
import { submitRsvp, type RsvpState } from "@/app/(site)/actions";
import { Icon } from "@/components/icons";
import { OwlSendoff } from "@/components/owl-sendoff";
import { MAX_PARTY_SIZE, wedding } from "@/lib/config";

const initialState: RsvpState = { status: "idle" };

const labelClass =
  "font-display text-xs uppercase tracking-[0.18em] text-gold-ink";
const inputClass =
  "mt-2 w-full border border-ink/25 bg-cream px-3.5 py-2.5 text-ink outline-none transition-colors placeholder:text-moss focus:border-gold-deep";

export function RsvpForm() {
  const [state, formAction, isPending] = useActionState(submitRsvp, initialState);
  const [attending, setAttending] = useState<"yes" | "no" | "">("");
  const [partySize, setPartySize] = useState(1);
  const [editing, setEditing] = useState(false);

  // A fresh submission result should always take over from the form.
  useEffect(() => {
    setEditing(false);
  }, [state]);

  if (state.status === "success" && !editing) {
    return (
      <OwlSendoff
        name={state.name}
        attending={state.attending}
        updated={state.updated}
        onEdit={() => setEditing(true)}
      />
    );
  }

  const radioCard = (checked: boolean) =>
    `block cursor-pointer border px-4 py-3.5 text-center transition-colors focus-within:outline-2 focus-within:outline-gold-deep ${
      checked
        ? "border-gold-deep bg-cream shadow-soft text-ink"
        : "border-ink/20 bg-cream/50 text-ink-soft hover:border-gold/70"
    }`;

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="rsvp-name" className={labelClass}>
          Your full name<span className="text-blush-deep"> *</span>
        </label>
        <input
          id="rsvp-name"
          name="name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          placeholder="As it appears on your invitation"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="rsvp-email" className={labelClass}>
          Email <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="rsvp-email"
          name="email"
          type="email"
          maxLength={200}
          autoComplete="email"
          placeholder="For the occasional update"
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>
          Will you be joining us?<span className="text-blush-deep"> *</span>
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={radioCard(attending === "yes")}>
            <input
              type="radio"
              name="attending"
              value="yes"
              required
              checked={attending === "yes"}
              onChange={() => setAttending("yes")}
              className="sr-only"
            />
            <span className="font-display text-sm uppercase tracking-[0.14em]">
              Joyfully accepts
            </span>
          </label>
          <label className={radioCard(attending === "no")}>
            <input
              type="radio"
              name="attending"
              value="no"
              required
              checked={attending === "no"}
              onChange={() => setAttending("no")}
              className="sr-only"
            />
            <span className="font-display text-sm uppercase tracking-[0.14em]">
              Regretfully declines
            </span>
          </label>
        </div>
      </fieldset>

      {attending === "yes" ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="rsvp-party" className={labelClass}>
                Seats in your party
              </label>
              <select
                id="rsvp-party"
                name="partySize"
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className={`${inputClass} cursor-pointer`}
              >
                {Array.from({ length: MAX_PARTY_SIZE }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n === 1 ? "Just me" : `${n} of us`}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <label htmlFor="rsvp-song" className={labelClass}>
                A song that gets you dancing
              </label>
              <input
                id="rsvp-song"
                name="song"
                type="text"
                maxLength={300}
                placeholder="We'll tip the band"
                className={inputClass}
              />
            </div>
          </div>

          {partySize > 1 ? (
            <div>
              <label htmlFor="rsvp-guests" className={labelClass}>
                Who&rsquo;s coming with you?
              </label>
              <input
                id="rsvp-guests"
                name="guestNames"
                type="text"
                maxLength={300}
                placeholder="Names of the rest of your party"
                className={inputClass}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="rsvp-dietary" className={labelClass}>
              Dietary notes
            </label>
            <input
              id="rsvp-dietary"
              name="dietary"
              type="text"
              maxLength={500}
              placeholder="Allergies, vegetarian, and so on"
              className={inputClass}
            />
          </div>
        </>
      ) : null}

      <div>
        <label htmlFor="rsvp-message" className={labelClass}>
          A note for the couple{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="rsvp-message"
          name="message"
          rows={3}
          maxLength={1000}
          placeholder="Advice, well wishes, embarrassing stories…"
          className={`${inputClass} resize-y`}
        />
      </div>

      {state.status === "error" ? (
        <p
          role="alert"
          className="border border-blush-deep bg-blush px-4 py-2.5 text-center text-base italic text-ink"
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full cursor-pointer items-center justify-center gap-2.5 bg-ink px-4 py-3.5 font-display text-sm uppercase tracking-[0.28em] text-cream transition-colors hover:bg-fern disabled:cursor-default disabled:opacity-60"
      >
        <Icon name="owl" className="h-5 w-5" />
        {isPending ? "Sending the owl…" : "Send your reply"}
      </button>

      <p className="text-center text-base italic text-fern">
        Kindly reply by {wedding.rsvpBy}.
      </p>
    </form>
  );
}
