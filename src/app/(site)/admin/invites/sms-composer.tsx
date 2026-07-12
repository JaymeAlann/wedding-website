"use client";

import Image from "next/image";
import { useActionState, useEffect, useState, useTransition } from "react";
import { Icon } from "@/components/icons";
import {
  SMS_MEDIA_OPTIONS,
  smsMediaOption,
  type SmsMediaKey,
} from "@/lib/sms-media";
import type { SmsTemplate } from "@/lib/sms-templates";
import {
  addInvitee,
  removeInvitee,
  sendCampaign,
  togglePlusOne,
  type CampaignState,
  type InviteeState,
} from "./actions";

export interface Recipient {
  id: string;
  name: string;
  phone: string;
  tag: string;
  /** Whether their invitation covers a guest. */
  plusOne: boolean;
  /** Whether an RSVP with a matching name has come in. */
  replied: boolean;
}

const labelClass =
  "font-display text-xs uppercase tracking-[0.18em] text-gold-ink";
const inputClass =
  "w-full border border-ink/25 bg-cream px-3.5 py-2.5 text-ink outline-none transition-colors placeholder:text-moss focus:border-gold-deep";
const quickBtnClass =
  "cursor-pointer font-display text-[0.65rem] uppercase tracking-[0.16em] text-fern underline decoration-gold/60 underline-offset-4 transition-colors hover:text-ink";

function defaultMediaForTemplate(templateKey: string): SmsMediaKey {
  if (templateKey === "saveTheDate") return "saveTheDate";
  if (templateKey === "invitation") return "invitation";
  return "none";
}

export function SmsComposer({
  templates,
  invitees,
  twilioReady,
}: {
  templates: SmsTemplate[];
  invitees: Recipient[];
  twilioReady: boolean;
}) {
  const [addState, addAction, addPending] = useActionState<
    InviteeState,
    FormData
  >(addInvitee, { status: "idle" });
  const [sendState, sendAction, sendPending] = useActionState<
    CampaignState,
    FormData
  >(sendCampaign, { status: "idle" });
  // Shared for the row-level fire-and-forget actions (remove, +1 toggle).
  const [, startRemove] = useTransition();

  const [templateKey, setTemplateKey] = useState(templates[0]?.key ?? "");
  const [message, setMessage] = useState(templates[0]?.text ?? "");
  const [mediaKey, setMediaKey] = useState<SmsMediaKey>(() =>
    defaultMediaForTemplate(templates[0]?.key ?? ""),
  );
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(invitees.map((i) => [i.id, true])),
  );

  // Newly added invitees join the selection; deleted ones drop out.
  useEffect(() => {
    setSelected((prev) =>
      Object.fromEntries(invitees.map((i) => [i.id, prev[i.id] ?? true])),
    );
  }, [invitees]);

  const selectedCount = invitees.filter((i) => selected[i.id]).length;
  const templateLabel =
    templates.find((t) => t.key === templateKey)?.label ?? "Custom";
  const selectedMedia = smsMediaOption(mediaKey);

  const pickTemplate = (t: SmsTemplate) => {
    setTemplateKey(t.key);
    setMessage(t.text);
    setMediaKey(defaultMediaForTemplate(t.key));
  };

  const setAll = (predicate: (i: Recipient) => boolean) =>
    setSelected(Object.fromEntries(invitees.map((i) => [i.id, predicate(i)])));

  return (
    <div className="border border-gold/30 bg-white/60 p-6 shadow-soft sm:p-8">
      <h2 className="font-serif text-2xl font-medium italic text-ink">
        Compose Message
      </h2>

      {/* Guest-list entry lives outside the send form — forms can't nest. */}
      <form action={addAction} className="mt-6">
        <p className={labelClass}>Add to the guest list</p>
        <div className="mt-2 flex flex-wrap gap-2.5">
          <input
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="Name"
            className={`${inputClass} min-w-36 flex-[2]`}
          />
          <input
            name="phone"
            type="tel"
            required
            placeholder="Phone"
            className={`${inputClass} min-w-32 flex-[2]`}
          />
          <input
            name="tag"
            type="text"
            maxLength={40}
            placeholder="Tag (Friends)"
            className={`${inputClass} min-w-24 flex-1`}
          />
          <label className="flex cursor-pointer items-center gap-2 border border-ink/25 bg-cream px-3.5 py-2.5 text-sm text-ink">
            <input
              type="checkbox"
              name="plusOne"
              defaultChecked
              className="h-4 w-4 accent-fern"
            />
            +1
          </label>
          <button
            type="submit"
            disabled={addPending}
            className="cursor-pointer bg-ink px-6 py-2.5 font-display text-xs uppercase tracking-[0.2em] text-cream transition-colors hover:bg-fern disabled:cursor-default disabled:opacity-60"
          >
            Add
          </button>
        </div>
        {addState.status === "error" ? (
          <p role="alert" className="mt-2 text-sm italic text-ink">
            {addState.message}
          </p>
        ) : null}
        {addState.status === "success" ? (
          <p role="status" className="mt-2 text-sm italic text-fern">
            {addState.updated
              ? `Updated ${addState.name}'s entry.`
              : `${addState.name} added to the list.`}
          </p>
        ) : null}
      </form>

      <form
        action={sendAction}
        onSubmit={(e) => {
          if (
            !confirm(
              `Send this message to ${selectedCount} recipient${
                selectedCount === 1 ? "" : "s"
              }${
                selectedMedia.publicPath
                  ? ` with the ${selectedMedia.label} image`
                  : ""
              } right now? This cannot be undone.`,
            )
          ) {
            e.preventDefault();
          }
        }}
        className="mt-8"
      >
        <p className={labelClass}>Template</p>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {templates.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => pickTemplate(t)}
              className={`cursor-pointer border px-4 py-2 font-display text-[0.7rem] uppercase tracking-[0.14em] transition-colors ${
                templateKey === t.key
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/40 text-ink hover:border-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="templateLabel" value={templateLabel} />

        <fieldset className="mt-5">
          <legend className={labelClass}>Picture attachment</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {SMS_MEDIA_OPTIONS.map((option) => {
              const selected = option.key === mediaKey;
              return (
                <label
                  key={option.key}
                  className={`cursor-pointer border p-2.5 transition-colors ${
                    selected
                      ? "border-ink bg-parchment/70 shadow-soft"
                      : "border-gold/30 bg-cream/50 hover:border-gold-deep"
                  }`}
                >
                  <input
                    type="radio"
                    name="mediaKey"
                    value={option.key}
                    checked={selected}
                    onChange={() => setMediaKey(option.key)}
                    className="sr-only"
                  />
                  {option.publicPath ? (
                    <Image
                      src={option.publicPath}
                      alt={`${option.label} card preview`}
                      width={1080}
                      height={1350}
                      className="h-36 w-full border border-gold/20 object-contain"
                    />
                  ) : (
                    <div className="grid h-36 place-items-center border border-dashed border-gold/35 bg-white/40">
                      <span className="font-display text-xs uppercase tracking-[0.22em] text-moss">
                        SMS
                      </span>
                    </div>
                  )}
                  <span className="mt-2 block font-display text-[0.68rem] uppercase tracking-[0.14em] text-ink">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-fern">
                    {option.description}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-sm italic text-fern">
            Image attachments are delivered as MMS and may be resized by the
            recipient&rsquo;s carrier.
          </p>
        </fieldset>

        <div className="mt-5">
          <label htmlFor="sms-message" className={labelClass}>
            Message
          </label>
          <textarea
            id="sms-message"
            name="message"
            rows={5}
            maxLength={640}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} mt-2 resize-y`}
          />
          <p className="mt-1.5 text-sm text-fern">
            {`Merge field: {first_name} personalizes with each recipient’s first name · ${message.length}/640`}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
          <p className={labelClass}>
            {`Recipients (${selectedCount} of ${invitees.length} selected)`}
          </p>
          <div className="flex gap-4">
            <button type="button" onClick={() => setAll(() => true)} className={quickBtnClass}>
              All
            </button>
            <button type="button" onClick={() => setAll(() => false)} className={quickBtnClass}>
              None
            </button>
            <button
              type="button"
              onClick={() => setAll((i) => !i.replied)}
              className={quickBtnClass}
            >
              No RSVP yet
            </button>
          </div>
        </div>

        <div className="mt-2 max-h-72 overflow-y-auto border border-gold/30 bg-cream/40">
          {invitees.length === 0 ? (
            <p className="px-4 py-5 italic text-ink-soft">
              No recipients yet — add your guest list above.
            </p>
          ) : (
            invitees.map((i) => (
              <label
                key={i.id}
                className="flex cursor-pointer items-center gap-3.5 border-b border-gold/15 px-4 py-3 last:border-b-0"
              >
                <input
                  type="checkbox"
                  name="recipients"
                  value={i.id}
                  checked={!!selected[i.id]}
                  onChange={() =>
                    setSelected((s) => ({ ...s, [i.id]: !s[i.id] }))
                  }
                  className="h-4 w-4 accent-fern"
                />
                <span className="flex-1">
                  <span className="block text-ink">{i.name}</span>
                  <span className="block text-sm text-fern">
                    {`${i.phone} · ${i.tag}`}
                  </span>
                </span>
                <button
                  type="button"
                  title={
                    i.plusOne
                      ? `${i.name}'s invitation covers a guest — click to make it just them`
                      : `${i.name}'s invitation is just for them — click to allow a guest`
                  }
                  onClick={(e) => {
                    e.preventDefault(); // don't toggle the row checkbox
                    startRemove(() => togglePlusOne(i.id, !i.plusOne));
                  }}
                  className={`cursor-pointer border px-2 py-0.5 font-display text-[0.65rem] uppercase tracking-[0.12em] transition-colors ${
                    i.plusOne
                      ? "border-sage/60 bg-sage/15 text-fern hover:border-fern"
                      : "border-ink/30 bg-cream text-moss line-through hover:border-ink/60"
                  }`}
                >
                  +1
                </button>
                {i.replied ? (
                  <span className="inline-flex items-center gap-1 border border-sage/60 bg-sage/15 px-2 py-0.5 text-xs text-fern">
                    <Icon name="check" className="h-3 w-3" />
                    replied
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-label={`Remove ${i.name} from the guest list`}
                  onClick={(e) => {
                    e.preventDefault(); // don't toggle the row checkbox
                    if (confirm(`Remove ${i.name} from the guest list?`)) {
                      startRemove(() => removeInvitee(i.id));
                    }
                  }}
                  className="cursor-pointer p-1 text-moss transition-colors hover:text-ink"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </label>
            ))
          )}
        </div>

        {sendState.status === "error" ? (
          <p
            role="alert"
            className="mt-4 border border-blush-deep bg-blush px-4 py-2.5 italic text-ink"
          >
            {sendState.message}
          </p>
        ) : null}
        {sendState.status === "success" ? (
          <div
            role="status"
            className="mt-4 border border-sage/60 bg-sage/10 px-4 py-2.5 text-ink"
          >
            <p className="italic">
              {`The owls are away — ${sendState.sent} message${
                sendState.sent === 1 ? "" : "s"
              } sent.`}
            </p>
            {sendState.failures.length > 0 ? (
              <ul className="mt-1.5 text-sm text-ink-soft">
                {sendState.failures.map((f) => (
                  <li key={f.name}>{`Failed for ${f.name}: ${f.error}`}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={sendPending || !twilioReady || selectedCount === 0}
          className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2.5 bg-ink px-4 py-3.5 font-display text-sm uppercase tracking-[0.28em] text-cream transition-colors hover:bg-fern disabled:cursor-default disabled:opacity-60 sm:w-auto sm:px-10"
        >
          <Icon name="owl" className="h-5 w-5" />
          {sendPending ? "Sending…" : "Send Messages"}
        </button>
      </form>
    </div>
  );
}
