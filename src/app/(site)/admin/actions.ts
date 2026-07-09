"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteRsvp } from "@/lib/rsvp-store";

export async function removeRsvp(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteRsvp(id);
  revalidatePath("/admin");
}
