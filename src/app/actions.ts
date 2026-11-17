"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUser, endSession, requireUser, startSession } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  createDocument,
  grantDocumentAccess,
  saveDocument,
} from "@/lib/documents";
import { verifyPassword } from "@/lib/password";
import { importTextDocument } from "@/lib/text-import";

type FormState = { error: string } | null;

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = form.get("email");
  const password = form.get("password");
  const invalid = { error: "The email or password is incorrect." };

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 254 ||
    password.length > 256 ||
    !email.trim() ||
    !password
  )
    return invalid;

  try {
    const account = getDatabase()
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .get();

    if (!account || !(await verifyPassword(password, account.passwordHash))) {
      return invalid;
    }

    await startSession(account.id);
  } catch (error) {
    console.error("Sign-in failed", error);
    return { error: "Could not sign in. Please try again." };
  }

  redirect("/");
}

export async function signOut() {
  await endSession();
  redirect("/sign-in");
}

export async function createBlankDocument(): Promise<FormState> {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  let id: string;
  try {
    id = createDocument(getDatabase(), user.id);
  } catch (error) {
    console.error("Document creation failed", error);
    return { error: "Could not create the document. Please try again." };
  }
  revalidatePath("/");
  redirect(`/documents/${id}`);
}

export async function importDocument(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const user = await requireUser();
  let result: Awaited<ReturnType<typeof importTextDocument>>;
  try {
    result = await importTextDocument(getDatabase(), user.id, form.get("file"));
  } catch (error) {
    console.error("Text import failed", error);
    return { error: "Could not import the file. Please try again." };
  }
  if ("error" in result) return result;

  revalidatePath("/");
  redirect(`/documents/${result.id}`);
}

export async function saveDocumentDraft(
  id: string,
  title: string,
  content: unknown,
): Promise<{ title: string } | { error: string }> {
  try {
    const user = await currentUser();
    if (!user)
      return {
        error: "Your session expired. Sign in in another tab and retry.",
      };
    if (typeof id !== "string") return { error: "Document not found." };
    const result = saveDocument(getDatabase(), id, user.id, title, content);
    if ("title" in result) revalidatePath("/");
    return result;
  } catch (error) {
    console.error("Document save failed", error);
    return { error: "Could not save your changes. Please try again." };
  }
}

export async function shareDocument(
  id: string,
  _: { success: true } | FormState,
  form: FormData,
): Promise<{ success: true } | FormState> {
  try {
    const user = await currentUser();
    if (!user)
      return { error: "Your session expired. Sign in again to share." };
    if (typeof id !== "string") return { error: "Document not found." };

    const recipientId = form.get("recipientId");
    if (typeof recipientId !== "string" || !recipientId) {
      return { error: "Choose an account to share with." };
    }

    const result = grantDocumentAccess(getDatabase(), id, user.id, recipientId);
    if ("success" in result) revalidatePath(`/documents/${id}`);
    return result;
  } catch (error) {
    console.error("Document sharing failed", error);
    return { error: "Could not share the document. Please try again." };
  }
}
