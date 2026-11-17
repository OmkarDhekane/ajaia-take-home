import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { SignInForm } from "../forms";

export default async function SignInPage() {
  if (await currentUser()) redirect("/");

  return (
    <main className="sign-in">
      <div className="sign-in-card">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            A
          </span>{" "}
          Ajaia Docs
        </div>
        <h1>Sign in</h1>
        <SignInForm />
      </div>
    </main>
  );
}
