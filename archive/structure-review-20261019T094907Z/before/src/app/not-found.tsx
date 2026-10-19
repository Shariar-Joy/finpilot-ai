import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-state">
      <h1>This page has wandered off.</h1>
      <p>Let’s get you back to your financial picture.</p>
      <Link className="btn primary" href="/dashboard">
        Back to dashboard
      </Link>
    </main>
  );
}
