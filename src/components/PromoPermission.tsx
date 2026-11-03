"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type RequestState = "LOADING" | "PENDING" | "APPROVED" | "DECLINED" | "EXPIRED" | "REPLACED" | "INVALID" | "ERROR";

async function promoCall(action: string, data: Record<string, unknown> = {}) {
  const response = await fetch("/api/secure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.request?.state) throw new Error("The request didn't go through.");
  return result.request as { state: RequestState; firstName?: string };
}

const RESULT_COPY: Partial<Record<RequestState, { title: string; body: string }>> = {
  APPROVED: { title: "You're all set", body: "Thanks for approving this. You can change it anytime in your Locker." },
  DECLINED: { title: "No problem", body: "We won't feature you in our promotions. If you change your mind, you can turn this on in your Locker." },
  EXPIRED: { title: "This link expired", body: "Your permission hasn't changed. You can turn this on in your Locker, or ask Jordan for a new link." },
  REPLACED: { title: "There's a newer link", body: "Use the most recent email we sent you. Your permission hasn't changed." },
  INVALID: { title: "This link didn't work", body: "Open the button in your email again. If it still doesn't work, email jordan@diamondcollective.net." },
  ERROR: { title: "That didn't go through", body: "Your permission hasn't changed. Check your connection and open the button in your email again." },
};

export default function PromoPermission() {
  const [state, setState] = useState<RequestState>("LOADING");
  const [firstName, setFirstName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    promoCall("getPromoRequest")
      .then((request) => { setState(request.state); setFirstName(request.firstName || ""); })
      .catch(() => setState("ERROR"));
  }, []);

  const answer = async (value: "yes" | "no") => {
    setSaving(true);
    try {
      const request = await promoCall("answerPromoRequest", { answer: value });
      setState(request.state);
    } catch {
      setState("ERROR");
    }
    setSaving(false);
  };

  const result = RESULT_COPY[state];

  return (
    <main className="promo-page">
      <p className="promo-brand">The Diamond Collective</p>
      {state === "LOADING" && <p className="promo-text" role="status">Loading your request...</p>}

      {state === "PENDING" && (
        <>
          <h1>{firstName ? `${firstName}, can we feature you?` : "Can we feature you?"}</h1>
          <p className="promo-text">This is optional. It&apos;s your call.</p>
          <div className="promo-terms">
            <p>The Diamond Collective can feature my name, school, position, public stats, and player card in its promotions and ads.</p>
            <p>I won&apos;t be paid, and I can change this anytime. If I&apos;m under 18, a parent or guardian has approved.</p>
          </div>
          <p className="promo-note">We won&apos;t use your phone number or email, or use your profile to advertise another company. <Link href="/privacy">Learn more</Link></p>
          <div className="promo-actions">
            <button type="button" className="promo-button promo-button-yes" disabled={saving} onClick={() => answer("yes")}>{saving ? "Saving..." : "Yes, Feature Me"}</button>
            <button type="button" className="promo-button" disabled={saving} onClick={() => answer("no")}>No Thanks</button>
          </div>
        </>
      )}

      {result && (
        <>
          <h1>{result.title}</h1>
          <p className="promo-text">{result.body}</p>
          <Link href="/" className="promo-button promo-link">Go to The Diamond Collective</Link>
        </>
      )}
    </main>
  );
}
