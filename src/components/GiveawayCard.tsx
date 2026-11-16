import Link from "next/link";

// Thanksgiving 2026 giveaway. Membership is the entry: approved members are entered automatically.
// Entries close Thu, Nov 26 at 4:00 PM Mountain (Nov 26, 23:00 UTC). Apps Script uses the same deadline.
export const GIVEAWAY_CLOSES_AT = Date.parse("2026-11-26T23:00:00Z");
// The card stays up for a week after entries close.
export const GIVEAWAY_HIDE_AT = Date.parse("2026-12-03T07:00:00Z");

export type GiveawayState = "signedOut" | "needsProfile" | "checking" | "pending" | "excluded" | "entered" | "closed";

interface GiveawayCardProps {
  state: GiveawayState;
  onSignIn: () => void;
  onOpenLocker: () => void;
}

const STATUS_TEXT: Partial<Record<GiveawayState, string>> = {
  pending: "You're registered. You'll be entered as soon as your membership is approved.",
  excluded: "Site admins aren't eligible to win.",
  entered: "✅ You're a member, so you're entered. We'll email the winner after entries close.",
  closed: "Entries are closed. Thanks to every member.",
};

export default function GiveawayCard({ state, onSignIn, onOpenLocker }: GiveawayCardProps) {
  const status = STATUS_TEXT[state];

  return (
    <section id="giveaway" className="giveaway-card" aria-labelledby="giveaway-title">
      <img src="/giveaway-glove.jpg" alt="Yardley Y2 Maven Steer glove in Ibex tan" className="giveaway-card-image" width={88} height={88} />
      <div className="giveaway-card-body">
        <p className="giveaway-card-label">Thanksgiving Giveaway</p>
        <h2 id="giveaway-title">Win a Yardley Y2 Maven Steer glove</h2>
        <p className="giveaway-card-meta">11.5&quot; • Ibex tan • $205 value</p>
        {state !== "closed" && <p className="giveaway-card-deadline">Every member is entered automatically. Join free by Thanksgiving Day, Nov 26 at 4:00 PM MT.</p>}

        {status && <p className="giveaway-card-status" role="status">{status}</p>}

        {state === "signedOut" && <button type="button" className="giveaway-card-button" onClick={onSignIn}>Join Free to Be Entered</button>}
        {state === "needsProfile" && <button type="button" className="giveaway-card-button" onClick={onOpenLocker}>Save Your Player Card to Join</button>}

        <Link href="/giveaway-rules" className="giveaway-card-rules">Official rules</Link>
      </div>
    </section>
  );
}
