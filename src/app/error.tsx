"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-state">
      <h1>We couldn’t load this page.</h1>
      <p>Your data hasn’t been changed. Please try again.</p>
      <button className="btn primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
