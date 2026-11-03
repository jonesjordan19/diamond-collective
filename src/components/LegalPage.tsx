import Link from "next/link";
import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export default function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <main className="legal-page">
      <Link href="/" className="legal-back">Back to The Diamond Collective</Link>
      <h1>{title}</h1>
      <p className="legal-updated">Last updated {updated}</p>
      {children}
      <nav className="legal-links" aria-label="Legal">
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Use</Link>
      </nav>
    </main>
  );
}
