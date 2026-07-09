import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { Icon } from "@/components/icons";
import { Flourish } from "@/components/ornaments";
import { wedding } from "@/lib/config";
import { listCampaigns, listInvitees } from "@/lib/invitee-store";
import { listRsvps } from "@/lib/rsvp-store";
import { smsTemplates } from "@/lib/sms-templates";
import { isTwilioConfigured } from "@/lib/twilio";
import { AdminTabs } from "../tabs";
import { SmsComposer } from "./sms-composer";

export const metadata: Metadata = { title: "SMS Invitations" };

// The guest list and message log live on disk, so always render fresh.
export const dynamic = "force-dynamic";

const sentAtFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: wedding.timeZone,
});

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

export default async function InvitesPage() {
  await requireAdmin();
  const [invitees, campaigns, rsvps] = await Promise.all([
    listInvitees(),
    listCampaigns(),
    listRsvps(),
  ]);

  const replied = new Set(rsvps.map((r) => normalize(r.name)));
  const recipients = invitees.map((i) => ({
    id: i.id,
    name: i.name,
    phone: i.phone,
    tag: i.tag,
    plusOne: i.plusOne,
    replied: replied.has(normalize(i.name)),
  }));
  const twilioReady = isTwilioConfigured();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-28 sm:px-6">
      <div>
        <p className="font-script text-3xl text-gold-deep">Send word by owl</p>
        <h1 className="mt-1 font-display text-2xl uppercase tracking-[0.16em] text-ink">
          SMS Invitations
        </h1>
      </div>

      <Flourish className="mt-6 w-52 text-gold" />
      <AdminTabs active="/admin/invites" />

      {!twilioReady ? (
        <div className="mt-8 border border-gold-deep/50 bg-parchment/80 px-5 py-4 text-ink-soft">
          <p className="font-display text-xs uppercase tracking-[0.18em] text-gold-ink">
            Twilio not configured
          </p>
          <p className="mt-1.5">
            Add <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>,
            and <code>TWILIO_FROM</code> (or{" "}
            <code>TWILIO_MESSAGING_SERVICE_SID</code>) to{" "}
            <code>.env.local</code>, then restart the server. You can build the
            guest list in the meantime — sending is disabled until then.
          </p>
        </div>
      ) : null}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.6fr_1fr]">
        <SmsComposer
          templates={smsTemplates()}
          invitees={recipients}
          twilioReady={twilioReady}
        />

        <div className="border border-gold/30 bg-white/60 p-6 shadow-soft sm:p-7">
          <h2 className="flex items-center gap-2.5 font-serif text-2xl font-medium italic text-ink">
            <Icon name="quill" className="h-5 w-5 text-gold-ink" />
            Message Log
          </h2>
          {campaigns.length === 0 ? (
            <p className="mt-4 italic text-ink-soft">No messages sent yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-gold/15">
              {campaigns.map((c) => {
                const failed = c.results.filter((r) => !r.ok);
                return (
                  <li key={c.id} className="py-3.5">
                    <p className="font-medium text-ink">
                      {c.templateLabel} · {c.results.length} recipient
                      {c.results.length === 1 ? "" : "s"}
                      {failed.length > 0 ? (
                        <span className="text-blush-deep">
                          {" "}
                          ({failed.length} failed)
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-fern">
                      {sentAtFmt.format(new Date(c.sentAt))}
                    </p>
                    <details className="mt-1.5 text-sm text-ink-soft">
                      <summary className="cursor-pointer font-display text-[0.65rem] uppercase tracking-[0.16em] text-gold-ink">
                        Details
                      </summary>
                      <p className="mt-2 whitespace-pre-line italic">
                        {c.message}
                      </p>
                      <p className="mt-2">
                        To: {c.results.map((r) => r.name).join(", ")}
                      </p>
                      {failed.length > 0 ? (
                        <ul className="mt-1.5">
                          {failed.map((f) => (
                            <li key={f.phone}>
                              Failed for {f.name}: {f.error}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
