import Link from "next/link";

// Thanksgiving 2026 giveaway. Entries close Thu, Nov 26 at 4:00 PM Mountain (Nov 26, 23:00 UTC).
// Apps Script checks the same deadline, so changing it here alone won't reopen entries.
export const GIVEAWAY_ID = "thanksgiving-2026";
export const GIVEAWAY_CLOSES_AT = Date.parse("2026-11-26T23:00:00Z");
// The card stays up for a week after entries close so players can see the winner note.
export const GIVEAWAY_HIDE_AT = Date.parse("2026-12-03T07:00:00Z");

export type GiveawayState = "signedOut" | "needsProfile" | "ready" | "entering" | "entered" | "closed";

interface GiveawayCardProps {
  state: GiveawayState;
  error?: string;
  onSignIn: () => void;
  onOpenLocker: () => void;
  onEnter: () => void;
}

const BUTTON_TEXT: Partial<Record<GiveawayState, string>> = {
  signedOut: "Sign In to Enter",
  needsProfile: "Save Your Player Card to Enter",
  ready: "Enter the Giveaway",
  entering: "Entering…",
};

export default function GiveawayCard({ state, error, onSignIn, onOpenLocker, onEnter }: GiveawayCardProps) {
  const handleClick = state === "signedOut" ? onSignIn : state === "needsProfile" ? onOpenLocker : onEnter;
  const buttonText = BUTTON_TEXT[state];

  return (
    <section id="giveaway" className="giveaway-card" aria-labelledby="giveaway-title">
      <img src="/giveaway-glove.jpg" alt="Yardley Y2 Maven Steer glove in Ibex tan" className="giveaway-card-image" width={88} height={88} />
      <div className="giveaway-card-body">
        <p className="giveaway-card-label">Thanksgiving Giveaway</p>
        <h2 id="giveaway-title">Win a Yardley Y2 Maven Steer glove</h2>
        <p className="giveaway-card-meta">11.5&quot; • Ibex tan • $205 value • Free to enter</p>

        {state === "entered" && <p className="giveaway-card-status" role="status">✅ You&apos;re entered. We&apos;ll email the winner after entries close.</p>}
        {state === "closed" && <p className="giveaway-card-status" role="status">Entries are closed. Thanks to everyone who entered.</p>}
        {state !== "entered" && state !== "closed" && <p className="giveaway-card-deadline">Entries close Thanksgiving Day, Nov 26 at 4:00 PM MT</p>}

        {buttonText && (
          <button type="button" className="giveaway-card-button" onClick={handleClick} disabled={state === "entering"}>
            {buttonText}
          </button>
        )}
        {error && <p className="giveaway-card-error" role="alert">{error}</p>}

        <Link href="/giveaway-rules" className="giveaway-card-rules">Official rules</Link>
      </div>
    </section>
  );
}
