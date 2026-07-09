"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/auth";
import { MAX_PARTY_SIZE } from "@/lib/config";
import { saveRsvp } from "@/lib/rsvp-store";

export type RsvpState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; attending: boolean; name: string; updated: boolean };

const error = (message: string): RsvpState => ({ status: "error", message });

export async function submitRsvp(
  _prev: RsvpState,
  formData: FormData,
): Promise<RsvpState> {
  // Server actions are their own endpoints — never trust the page gate alone.
  if (!(await getSession())) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const attendingRaw = formData.get("attending");
  const partySizeRaw = Number(formData.get("partySize") ?? 1);
  const guestNames = String(formData.get("guestNames") ?? "").trim();
  const dietary = String(formData.get("dietary") ?? "").trim();
  const song = String(formData.get("song") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return error("Please tell us your name — the seating chart insists.");
  if (name.length > 120) return error("That name is a bit long for our quill.");
  if (email && !/^\S+@\S+\.\S+$/.test(email))
    return error("That email address doesn't look quite right.");
  if (attendingRaw !== "yes" && attendingRaw !== "no")
    return error("Let us know whether you'll be joining us.");

  const attending = attendingRaw === "yes";
  if (
    attending &&
    (!Number.isInteger(partySizeRaw) ||
      partySizeRaw < 1 ||
      partySizeRaw > MAX_PARTY_SIZE)
  ) {
    return error("Please pick how many seats you'll need.");
  }

  for (const [value, max] of [
    [email, 200],
    [guestNames, 300],
    [dietary, 500],
    [song, 300],
    [message, 1000],
  ] as const) {
    if (value.length > max)
      return error("One of your answers is a little too long — mind trimming it?");
  }

  const { updated } = await saveRsvp({
    name,
    email,
    attending,
    partySize: attending ? partySizeRaw : 0,
    guestNames: attending && partySizeRaw > 1 ? guestNames : "",
    dietary: attending ? dietary : "",
    song: attending ? song : "",
    message,
  });

  revalidatePath("/admin");
  return { status: "success", attending, name, updated };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
