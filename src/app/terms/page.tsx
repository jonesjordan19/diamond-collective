import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use | The Diamond Collective",
  description: "The terms for using The Diamond Collective.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="November 3, 2026">
      <p>These terms apply to your use of sluggercoin.com and The Diamond Collective. By using the site, you agree to these terms and our <Link href="/privacy">Privacy Policy</Link>.</p>

      <h2>Who can use the site</h2>
      <p>You must be at least 13. If you&apos;re under 18, a parent or guardian must agree to these terms for you. Coach and scout access is subject to our approval, and we can decline or remove access.</p>

      <h2>Your account and profile</h2>
      <p>Keep your sign-in secure and your information accurate. Only post stats, links, and content that are truthful and that you have the right to share.</p>
      <p>Stats on the site are entered by players unless we say otherwise. We don&apos;t guarantee that they are accurate.</p>

      <h2>Permission to display your content</h2>
      <p>You keep ownership of what you post. You give us permission to host and display it so we can run the site, including the scoreboard, player cards, and features you choose to use.</p>
      <p>This doesn&apos;t give us permission to feature you in advertising. That requires the separate, optional permission in your Locker, described in our <Link href="/privacy">Privacy Policy</Link>.</p>

      <h2>Coaches and scouts</h2>
      <p>Use player contact details only for legitimate recruiting or scouting. Don&apos;t sell, share, or export them, add them to marketing lists, or use them to harass anyone.</p>

      <h2>Brand deals and giveaways</h2>
      <p>We don&apos;t guarantee that a brand will respond, offer a deal, or keep a program available. Brand programs are run by those brands and have their own terms. Giveaways may have separate rules.</p>

      <h2>Eligibility and NIL rules</h2>
      <p>You&apos;re responsible for checking any school, conference, association, or state rules before accepting a deal, discount, gear, giveaway, or promotional use of your name, image, or likeness. Check with your compliance office if you&apos;re unsure.</p>

      <h2>Slugger Coin</h2>
      <p>Slugger Coin ($SLUG) is offered as a membership key for site features. It isn&apos;t payment for your athletic ability or participation, and we don&apos;t promise that it has any cash value or will keep working in any particular way.</p>

      <h2>Acceptable use</h2>
      <p>Don&apos;t misuse the site, impersonate anyone, post unlawful content, scrape data, or try to access information or accounts that aren&apos;t yours. We may remove content or accounts that break these terms.</p>

      <h2>No guarantees</h2>
      <p>The site is provided as is. We don&apos;t promise recruiting results, roster spots, scholarships, or brand deals, or that the site will always be available or free of errors.</p>

      <h2>Limit of liability</h2>
      <p>To the extent allowed by law, The Diamond Collective isn&apos;t liable for indirect or consequential losses from your use of the site.</p>

      <h2>Changes</h2>
      <p>We may update these terms. If you keep using the site after an update, the new terms apply.</p>

      <h2>Contact</h2>
      <p>Email <a href="mailto:jordan@diamondcollective.net">jordan@diamondcollective.net</a>.</p>
    </LegalPage>
  );
}
