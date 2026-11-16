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
  pending: "You'll be entered as soon as your membership is approved.",
  excluded: "Site admins aren't eligible to win.",
  entered: "✅ You're a member, so you're entered",
  closed: "Entries are closed. Thanks to every member.",
};

// Feature card for the giveaway: big product photo, prize, deadline, and one clear button.
export default function GiveawayCard({ state, onSignIn, onOpenLocker }: GiveawayCardProps) {
  const status = STATUS_TEXT[state];

  return (
    <section id="giveaway" className="giveaway-feature" aria-labelledby="giveaway-title">
      <div className="giveaway-feature-photo">
        <img src="/giveaway-glove-large.jpg" alt="Yardley Y2 Maven Steer 11.5 inch glove in Ibex tan, back and palm views" width={800} height={800} />
        <span className="giveaway-feature-ribbon">Thanksgiving Giveaway</span>
        <span className="giveaway-feature-value">$205 value</span>
      </div>

      <div className="giveaway-feature-body">
        <h2 id="giveaway-title">Win a Yardley Y2 Maven Steer glove</h2>
        <p className="giveaway-feature-meta">11.5&quot; • Ibex tan • Steer leather tanned in Japan</p>
        {state !== "closed" && (
          <p className="giveaway-feature-how">
            Every member is entered automatically. <strong>Ends Thanksgiving Day, 4 PM MT.</strong>
          </p>
        )}

        {state === "signedOut" && <button type="button" className="giveaway-feature-button" onClick={onSignIn}>Join Free &amp; Get Entered</button>}
        {state === "needsProfile" && <button type="button" className="giveaway-feature-button" onClick={onOpenLocker}>Save Your Player Card to Enter</button>}
        {status && <p className={state === "entered" ? "giveaway-feature-status giveaway-feature-status-in" : "giveaway-feature-status"} role="status">{status}</p>}

        <Link href="/giveaway-rules" className="giveaway-feature-rules">Official rules</Link>
      </div>
    </section>
  );
}
