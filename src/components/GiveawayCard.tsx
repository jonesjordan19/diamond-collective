import Link from "next/link";

// Thanksgiving 2026 giveaway. Membership is the entry: approved members are entered automatically.
// Entries close Thu, Nov 26 at 4:00 PM Mountain (Nov 26, 23:00 UTC). Apps Script uses the same deadline.
export const GIVEAWAY_CLOSES_AT = Date.parse("2026-11-26T23:00:00Z");
// The strip stays up for a week after entries close.
export const GIVEAWAY_HIDE_AT = Date.parse("2026-12-03T07:00:00Z");

export type GiveawayState = "signedOut" | "needsProfile" | "checking" | "pending" | "excluded" | "entered" | "closed";

interface GiveawayCardProps {
  state: GiveawayState;
  onSignIn: () => void;
  onOpenLocker: () => void;
}

const STATUS_TEXT: Record<GiveawayState, string> = {
  signedOut: "All members entered · Ends Nov 26 ›",
  needsProfile: "Save your player card to be entered ›",
  checking: "Every member is entered automatically.",
  pending: "You'll be entered once your membership is approved.",
  excluded: "Site admins aren't eligible to win.",
  entered: "✅ You're a member, so you're entered.",
  closed: "Entries are closed. Thanks to every member.",
};

// A slim strip so the hero and player card stay on the first phone screen.
export default function GiveawayCard({ state, onSignIn, onOpenLocker }: GiveawayCardProps) {
  const action = state === "signedOut" ? onSignIn : state === "needsProfile" ? onOpenLocker : undefined;
  const content = (
    <>
      <img src="/giveaway-glove.jpg" alt="" className="giveaway-strip-image" width={52} height={52} />
      <span className="giveaway-strip-text">
        <span className="giveaway-strip-label">Thanksgiving Giveaway</span>
        <span className="giveaway-strip-title">Win a $205 Yardley glove</span>
        <span className={state === "entered" ? "giveaway-strip-status giveaway-strip-status-in" : "giveaway-strip-status"}>{STATUS_TEXT[state]}</span>
      </span>
    </>
  );

  return (
    <section id="giveaway" className="giveaway-strip" aria-label="Thanksgiving Giveaway: win a Yardley Y2 Maven Steer glove">
      {action ? (
        <button type="button" className="giveaway-strip-main" onClick={action}>{content}</button>
      ) : (
        <div className="giveaway-strip-main" role="status">{content}</div>
      )}
      <Link href="/giveaway-rules" className="giveaway-strip-rules">Rules</Link>
    </section>
  );
}
