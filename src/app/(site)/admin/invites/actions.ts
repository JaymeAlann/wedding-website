"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  deleteInvitee,
  listInvitees,
  saveCampaign,
  saveInvitee,
  setPlusOne,
  type CampaignResult,
} from "@/lib/invitee-store";
import { smsMediaOption } from "@/lib/sms-media";
import { firstName } from "@/lib/sms-templates";
import { isTwilioConfigured, normalizePhone, sendSms } from "@/lib/twilio";

export type InviteeState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; name: string; updated: boolean };

export async function addInvitee(
  _prev: InviteeState,
  formData: FormData,
): Promise<InviteeState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const tag = String(formData.get("tag") ?? "").trim() || "Friends";
  const plusOne = formData.get("plusOne") === "on";

  if (!name)
    return { status: "error", message: "Every invitee needs a name." };
  if (name.length > 120 || tag.length > 40)
    return { status: "error", message: "That's a bit long for our quill." };
  const phone = normalizePhone(phoneRaw);
  if (!phone)
    return {
      status: "error",
      message: "That number doesn't look right — try the 10-digit US format.",
    };

  const { updated } = await saveInvitee({ name, phone, tag, plusOne });
  revalidatePath("/admin/invites");
  return { status: "success", name, updated };
}

export async function removeInvitee(id: string): Promise<void> {
  await requireAdmin();
  if (!id) return;
  await deleteInvitee(id);
  revalidatePath("/admin/invites");
}

/** Flip whether an invitation covers a guest; enforced at RSVP time. */
export async function togglePlusOne(id: string, plusOne: boolean): Promise<void> {
  await requireAdmin();
  if (!id) return;
  await setPlusOne(id, plusOne);
  revalidatePath("/admin/invites");
}

export type CampaignState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "success";
      sent: number;
      failures: Array<{ name: string; error: string }>;
    };

export async function sendCampaign(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  await requireAdmin();

  if (!isTwilioConfigured())
    return {
      status: "error",
      message:
        "Twilio isn't configured yet — add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM to .env.local and restart the server.",
    };

  const message = String(formData.get("message") ?? "").trim();
  const templateLabel =
    String(formData.get("templateLabel") ?? "").trim() || "Custom";
  const media = smsMediaOption(String(formData.get("mediaKey") ?? "none"));
  const ids = formData.getAll("recipients").map(String);

  if (!message)
    return { status: "error", message: "The owls won't carry an empty scroll." };
  if (message.length > 640)
    return {
      status: "error",
      message: "That message is over 640 characters — trim it down a bit.",
    };
  if (ids.length === 0)
    return { status: "error", message: "Select at least one recipient." };

  let mediaUrl: string | undefined;
  if (media.publicPath) {
    const siteUrl = process.env.SITE_URL?.trim();
    if (!siteUrl || siteUrl.includes("your-domain.com")) {
      return {
        status: "error",
        message:
          "Set SITE_URL to the deployed site address before sending an image.",
      };
    }
    try {
      const url = new URL(media.publicPath, siteUrl);
      if (url.protocol !== "https:") throw new Error("HTTPS is required");
      mediaUrl = url.href;
    } catch {
      return {
        status: "error",
        message: "SITE_URL must be a valid public HTTPS address for MMS.",
      };
    }
  }

  const invitees = await listInvitees();
  const recipients = invitees.filter((i) => ids.includes(i.id));
  if (recipients.length === 0)
    return { status: "error", message: "Those recipients no longer exist." };

  // Sequential sends keep us well inside Twilio's rate limits; a wedding
  // guest list is small enough that this finishes in seconds.
  const results: CampaignResult[] = [];
  for (const invitee of recipients) {
    const body = message.replaceAll("{first_name}", firstName(invitee.name));
    const result = await sendSms(invitee.phone, body, mediaUrl);
    results.push({
      name: invitee.name,
      phone: invitee.phone,
      ok: result.ok,
      ...(result.ok ? {} : { error: result.error }),
    });
  }

  const loggedLabel = media.publicPath
    ? `${templateLabel} · MMS: ${media.label}`
    : templateLabel;
  await saveCampaign({ templateLabel: loggedLabel, message, results });
  revalidatePath("/admin/invites");

  return {
    status: "success",
    sent: results.filter((r) => r.ok).length,
    failures: results
      .filter((r) => !r.ok)
      .map((r) => ({ name: r.name, error: r.error ?? "unknown error" })),
  };
}
