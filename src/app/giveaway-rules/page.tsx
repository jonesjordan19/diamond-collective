import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Thanksgiving Giveaway Rules | The Diamond Collective",
  description: "Official rules for The Diamond Collective Thanksgiving glove giveaway.",
};

export default function GiveawayRulesPage() {
  return (
    <LegalPage title="Thanksgiving Giveaway Rules" updated="November 16, 2026">
      <p><strong>No purchase necessary to enter or win.</strong> A purchase won&apos;t improve your chances of winning.</p>

      <h2>Who runs it</h2>
      <p>The giveaway is run by Manifest Destiny Corp, operator of The Diamond Collective, 14231 S Green Drake Drive, Bluffdale, UT 84065. Questions: jordan@diamondcollective.net. Yardley Sports made the glove and doesn&apos;t sponsor or run this giveaway.</p>

      <h2>Who can enter</h2>
      <p>Current college baseball players who are legal residents of the 50 United States or DC and at least 18 years old when they enter. Employees of Manifest Destiny Corp and their immediate families can&apos;t enter.</p>

      <h2>When</h2>
      <p>Entries open November 16, 2026 and close Thanksgiving Day, November 26, 2026 at 4:00 PM Mountain Time. Entries received after that time don&apos;t count.</p>

      <h2>How to enter</h2>
      <p>Go to <Link href="/">sluggercoin.com</Link>, sign in, save your player card in the Locker, and tap Enter on the Thanksgiving Giveaway card. Limit one entry per person. Extra entries from more than one account will be removed.</p>

      <h2>The prize</h2>
      <p>One Yardley Y2 Maven Steer 11.5&quot; glove in Ibex tan. Approximate retail value: $204.99. The prize can&apos;t be transferred or exchanged for cash. If the prize becomes unavailable, we may substitute a glove of equal or greater value.</p>

      <h2>Picking the winner</h2>
      <p>One winner will be picked at random from all eligible entries after entries close. Your odds depend on the number of eligible entries. We&apos;ll contact the winner by the email on their player card. If the winner doesn&apos;t reply within 7 days, can&apos;t be verified as eligible, or the prize can&apos;t be delivered, we may pick another winner.</p>

      <h2>School and NIL rules</h2>
      <p>You&apos;re responsible for checking any school, conference, association, or state rules before accepting a prize. Check with your compliance office if you&apos;re unsure. The winner is responsible for any taxes on the prize.</p>

      <h2>Your information</h2>
      <p>We use your entry to run the giveaway, contact the winner, and keep a record of entries, as described in our <Link href="/privacy">Privacy Policy</Link>. Entering doesn&apos;t give us permission to use you in promotions. We&apos;ll only announce the winner by name with their permission.</p>

      <h2>Other terms</h2>
      <p>We may disqualify entries that break these rules or our <Link href="/terms">Terms of Use</Link>, and may cancel or change the giveaway if fraud or technical problems affect it. Void where prohibited. This giveaway isn&apos;t sponsored, endorsed, or run by Instagram or Meta.</p>
    </LegalPage>
  );
}
