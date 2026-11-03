import type { Metadata } from "next";
import LegalPage from "../../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | The Diamond Collective",
  description: "How The Diamond Collective collects, uses, and shares information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 3, 2026">
      <p>The Diamond Collective is operated by Manifest Destiny Corp (&quot;we&quot; or &quot;us&quot;). This policy explains how we handle information when you use sluggercoin.com.</p>

      <h2>Information we collect</h2>
      <ul>
        <li><strong>Athlete profile:</strong> your name, email, phone number, school, state, position, class year, roster status, height, weight, stats, video links, and social links.</li>
        <li><strong>Coach and scout applications:</strong> your name, organization, job title, email, and verification link.</li>
        <li><strong>Account details:</strong> your wallet address and sign-in details from Google, Apple, or your phone provider.</li>
        <li><strong>Activity:</strong> brand intro requests, giveaway entries, and permissions you choose.</li>
        <li><strong>Usage data:</strong> pages viewed, device and browser details, and actions on the site.</li>
      </ul>

      <h2>What other people can see</h2>
      <p>Your name, school, state, position, class year, roster status, height, weight, stats, and social links appear on the public scoreboard unless your profile is hidden.</p>
      <p>Your email, phone number, and video links are not public. Coaches and scouts we approve can see them so they can contact you. Please don&apos;t add anything to your profile that you don&apos;t want shared this way.</p>

      <h2>How we use information</h2>
      <ul>
        <li>Run the scoreboard, Locker, brand deals, giveaways, and account approvals.</li>
        <li>Send intros that you request.</li>
        <li>Send updates and marketing emails. You can unsubscribe at any time.</li>
        <li>Keep the site secure, fix problems, and understand how it&apos;s used.</li>
        <li>Advertise the site through analytics and ad tools.</li>
      </ul>

      <h2>Promotional use of your profile</h2>
      <p>We&apos;ll only feature an athlete in our promotions if they choose to allow it in their Locker or by approving an email request from us. This permission is optional and is not required to use the site.</p>
      <p>If you allow it, we may use your name, school, position, public stats, and player card in The Diamond Collective&apos;s website, social media, email, and advertising. We won&apos;t use your phone number or email in promotions, sell your name or image to another company, or use your profile to advertise another company&apos;s products.</p>
      <p>You won&apos;t be paid for this use. You can withdraw permission in your Locker or by emailing us. We&apos;ll stop using your profile in new promotions and make reasonable efforts to remove it from materials we control, but we can&apos;t recall content others have already shared or saved.</p>
      <p>Athletes under 18 need a parent or guardian&apos;s approval before giving this permission.</p>

      <h2>When we share information</h2>
      <ul>
        <li><strong>Brands:</strong> when you request an intro, we email your name, school, and email address to that brand&apos;s rep and copy you.</li>
        <li><strong>Approved coaches and scouts:</strong> as described above.</li>
        <li><strong>Service providers:</strong> including Vercel for hosting, Google for storage, email, and analytics, Meta for advertising measurement, and thirdweb for sign-in and wallets.</li>
        <li><strong>Legal reasons:</strong> when required by law or needed to protect people or the site.</li>
      </ul>
      <p>We don&apos;t sell your contact details.</p>

      <h2>Blockchain activity</h2>
      <p>Wallet addresses and token transactions on a public blockchain are public and may not be changeable or removable.</p>

      <h2>Your choices</h2>
      <ul>
        <li>Update your profile in your Locker.</li>
        <li>Unsubscribe from marketing emails with the link in those emails.</li>
        <li>Ask us to access, correct, or delete your information by emailing us. Some records may need to be kept for legal or security reasons.</li>
      </ul>

      <h2>Age</h2>
      <p>The site is for college athletes, incoming college athletes, coaches, and scouts. It isn&apos;t for children under 13. If you&apos;re under 18, ask a parent or guardian to review this policy with you.</p>

      <h2>Security</h2>
      <p>We use safeguards to protect information, but no website or system is completely secure.</p>

      <h2>Changes</h2>
      <p>We&apos;ll update this page when this policy changes and change the date at the top.</p>

      <h2>Contact</h2>
      <p>Email <a href="mailto:jordan@diamondcollective.net">jordan@diamondcollective.net</a>.</p>
      <p>Manifest Destiny Corp<br />14231 S Green Drake Drive<br />Bluffdale, UT 84065</p>
    </LegalPage>
  );
}
