import Link from "next/link";

export default function NotFound() {
  return (
    <main className="sign-in">
      <div className="sign-in-card">
        <h1>Document not found</h1>
        <p>The document may have moved or you may not have access.</p>
        <Link href="/">Back to documents</Link>
      </div>
    </main>
  );
}
