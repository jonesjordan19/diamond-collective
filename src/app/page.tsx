"use client";

import React, { useState, useEffect } from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { 
  ThirdwebProvider, 
  ConnectButton, 
  TransactionButton, 
  useActiveAccount, 
  useReadContract 
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { getBalance, claimTo } from "thirdweb/extensions/erc20";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhwqCXDFPT0C1I4Zt-ASCpUVbkD9piI-_7pO1Dx5WhHG3JtMrgxm-N1kn4zhKbOXRzIA/exec";
const NEON_GREEN = "#a6ff00";

const client = createThirdwebClient({
  clientId: "770a552ed494b40543a6696298d41606",
});

const sluggerContract = getContract({
  client,
  chain: base,
  address: "0xF3f6D32ABCf2fDeAB3c6D0b440230714166Cc4A1",
});

interface BrandItem {
  name: string;
  tagline: string;
  description: string;
  buttonText: string;
  type: "email_intro" | "affiliate_link";
  link?: string;
  brandRepEmail?: string;
  brandRepName?: string;
  isPrimary?: boolean;
}

interface MarketCategory {
  title: string;
  emoji: string;
  brands: BrandItem[];
}

const MARKET_SECTIONS: MarketCategory[] = [
  {
    title: "Clothing & Apparel",
    emoji: "🧢",
    brands: [],
  },
  {
    title: "Coaching",
    emoji: "📋",
    brands: [],
  },
  {
    title: "Equipment",
    emoji: "⚾",
    brands: [],
  },
  {
    title: "Eyewear & Vision",
    emoji: "🕶️",
    brands: [],
  },
  {
    title: "Footwear",
    emoji: "👟",
    brands: [],
  },
  {
    title: "Hitting",
    emoji: "💥",
    brands: [],
  },
  {
    title: "Lessons & Coaching",
    emoji: "🎓",
    brands: [],
  },
  {
    title: "Nutrition",
    emoji: "⚡",
    brands: [
      {
        name: "Just Ingredients",
        tagline: "Clean Supplements & Electrolytes",
        description: "Access exclusive athlete allocations, discount codes, and clean nutrition packages.",
        buttonText: "Request Direct Intro ⚡",
        type: "email_intro",
        brandRepEmail: "partnerships@justingredients.us",
        brandRepName: "Partnerships Team",
      },
    ],
  },
  {
    title: "Pitching",
    emoji: "🎯",
    brands: [],
  },
  {
    title: "Player Services",
    emoji: "🤝",
    brands: [],
  },
  {
    title: "Tech",
    emoji: "📱",
    brands: [
      {
        name: "Pocket Radar",
        tagline: "Velocity & Data Tracking",
        description: "Collegiate ambassador units, Smart Coach app access, and velocity tracking programs.",
        buttonText: "Request Direct Intro ⚡",
        type: "email_intro",
        brandRepEmail: "nil@pocketradar.com",
        brandRepName: "Pocket Radar Team",
      },
    ],
  },
  {
    title: "Training",
    emoji: "🏋️‍♂️",
    brands: [],
  },
];

interface AthleteProfile {
  verificationStatus?: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  position: string;
  collegeYear: string;
  playerStatus: string;
  verificationLink: string;
  instagramUrl: string;
  instagramFollowers: string;
  tiktokUrl: string;
  tiktokFollowers: string;
  xUrl: string;
  xFollowers: string;
}

const emptyProfile: AthleteProfile = {
  verificationStatus: "Pending",
  fullName: "",
  email: "",
  phone: "",
  college: "",
  position: "",
  collegeYear: "Freshman",
  playerStatus: "Incoming Freshman",
  verificationLink: "",
  instagramUrl: "",
  instagramFollowers: "",
  tiktokUrl: "",
  tiktokFollowers: "",
  xUrl: "",
  xFollowers: "",
};

function AppContent() {
  const account = useActiveAccount();
  const [justClaimed, setJustClaimed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<AthleteProfile>(emptyProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [introStatus, setIntroStatus] = useState<{ [brandName: string]: string }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: balanceData, isLoading, refetch } = useReadContract(getBalance, {
    contract: sluggerContract,
    address: account?.address || "",
  });

  const balance = balanceData ? Number(balanceData.displayValue) : 0;
  const isUnlocked = balance >= 100 || justClaimed;
  const isApproved = profile.verificationStatus === "Approved";
  const hasProfile = Boolean(profile.fullName && profile.email);

  useEffect(() => {
    if (account?.address) {
      const localKey = `athlete_profile_${account.address.toLowerCase()}`;
      const savedLocal = localStorage.getItem(localKey);
      if (savedLocal) {
        try {
          setProfile(JSON.parse(savedLocal));
        } catch {}
      }

      fetch(`${GOOGLE_SCRIPT_URL}?walletAddress=${encodeURIComponent(account.address)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.profile && data.profile.fullName) {
            setProfile(data.profile);
            localStorage.setItem(localKey, JSON.stringify(data.profile));
          } else {
            localStorage.removeItem(localKey);
            setProfile(emptyProfile);
          }
        })
        .catch(() => {});
    }
  }, [account?.address]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account?.address) return;
    setIsSavingProfile(true);

    const localKey = `athlete_profile_${account.address.toLowerCase()}`;
    localStorage.setItem(localKey, JSON.stringify(profile));

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "saveProfile",
          walletAddress: account.address,
          ...profile,
        }),
      });

      setIsSavingProfile(false);
      setShowProfileModal(false);
      alert("Application submitted for verification! Our team will review your collegiate status.");
    } catch {
      setIsSavingProfile(false);
      setShowProfileModal(false);
      alert("Profile saved!");
    }
  };

  const handleRequestIntro = async (brand: BrandItem) => {
    if (!profile.fullName || !profile.email) {
      setShowProfileModal(true);
      return;
    }

    setIntroStatus((prev) => ({ ...prev, [brand.name]: "sending" }));

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "requestIntro",
          walletAddress: account?.address,
          brandName: brand.name,
          brandRepEmail: brand.brandRepEmail,
          brandRepName: brand.brandRepName,
          ...profile,
        }),
      });

      setIntroStatus((prev) => ({ ...prev, [brand.name]: "sent" }));
    } catch {
      setIntroStatus((prev) => ({ ...prev, [brand.name]: "error" }));
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Compliance Header */}
      <div style={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "10px 16px", textAlign: "center", fontSize: "11px", color: "#888888", letterSpacing: "0.5px", lineHeight: "1.4" }}>
        <strong style={{ color: "#ffffff" }}>NCAA NIL Compliance Note:</strong> All SLUGGER COINS distributed during the Founders phase have no current market value and are non-compensatory. Tokens are issued solely for community participation and access purposes.
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "36px 20px" }}>
        {/* Navigation */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a1a1a", paddingBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "900", letterSpacing: "1.5px", color: "#ffffff", textTransform: "uppercase" }}>
              The Diamond Collective
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: NEON_GREEN, fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
              Powered by Slugger Coin ($SLUG)
            </p>
          </div>

          <ConnectButton
            client={client}
            wallets={[
              inAppWallet({
                auth: {
                  options: ["google", "apple", "phone"],
                },
              }),
            ]}
            accountAbstraction={{
              chain: base,
              sponsorGas: true,
            }}
            chain={base}
            theme="dark"
            connectButton={{ label: "Athlete Sign In" }}
          />
        </header>

        {/* Hero Section */}
        <section style={{ textAlign: "center", margin: "48px 0 36px 0" }}>
          <div style={{ display: "inline-block", backgroundColor: "rgba(166, 255, 0, 0.08)", border: `1px solid ${NEON_GREEN}`, borderRadius: "999px", padding: "6px 16px", fontSize: "11px", fontWeight: "800", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>
            Only Available to College Baseball Players
          </div>
          <h2 style={{ fontSize: "38px", fontWeight: "900", color: "#ffffff", margin: "0 0 16px 0", letterSpacing: "-0.5px", textTransform: "uppercase", lineHeight: "1.1" }}>
            The Baseball Blockchain Utility Token
          </h2>
          <p style={{ fontSize: "16px", color: "#a1a1aa", maxWidth: "640px", margin: "0 auto", lineHeight: "1.6" }}>
            A digital society connecting players, coaches, and brands through access, education, and opportunity.
          </p>
        </section>

        {/* Dynamic Gatekeeper Flow */}
        {!account ? (
          /* Step 1: Sign in */
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "24px", padding: "48px 24px", textAlign: "center", maxWidth: "540px", margin: "0 auto" }}>
            <h3 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 8px 0", color: "#ffffff", textTransform: "uppercase" }}>
              Step 1: Open Your Athlete Locker
            </h3>
            <p style={{ fontSize: "14px", color: "#888888", margin: "0 0 28px 0", lineHeight: "1.5" }}>
              Sign in with your Google or Apple ID in the top right corner to submit your collegiate verification application.
            </p>
            <div style={{ display: "inline-block", backgroundColor: "#000000", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "14px 28px", fontSize: "13px", color: "#ffffff", fontWeight: "700" }}>
              🔒 Sign in above to begin verification
            </div>
          </div>
        ) : !hasProfile ? (
          /* Step 2: Fill profile form */
          <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "24px", padding: "40px 24px", textAlign: "center", maxWidth: "540px", margin: "0 auto", boxShadow: "0 0 30px rgba(166, 255, 0, 0.12)" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>📋</div>
            <h3 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 6px 0", color: "#ffffff", textTransform: "uppercase" }}>
              Complete Athlete Verification
            </h3>
            <p style={{ fontSize: "14px", color: "#888888", margin: "0 0 24px 0", lineHeight: "1.5" }}>
              The Diamond Collective is exclusive to active collegiate baseball players. Submit your locker profile and proof link for approval.
            </p>
            <button
              onClick={() => setShowProfileModal(true)}
              style={{ width: "100%", backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", padding: "16px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px" }}
            >
              Fill Out Locker Profile ✍️
            </button>
          </div>
        ) : !isApproved && balance < 100 ? (
          /* Step 3: Pending review state */
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #eab308", borderRadius: "24px", padding: "40px 24px", textAlign: "center", maxWidth: "540px", margin: "0 auto", boxShadow: "0 0 30px rgba(234, 179, 8, 0.1)" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>⏳</div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 6px 0", color: "#ffffff", textTransform: "uppercase" }}>
              Verification Under Review
            </h3>
            <p style={{ fontSize: "14px", color: "#a1a1aa", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              Thanks, <strong style={{ color: "#ffffff" }}>{profile.fullName}</strong>. Your profile at <strong style={{ color: "#ffffff" }}>{profile.college}</strong> is currently being verified against roster records.
            </p>
            <div style={{ backgroundColor: "#000000", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "12px 18px", fontSize: "12px", color: "#eab308", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block" }}>
              Status: Pending Approval
            </div>
            <p style={{ fontSize: "12px", color: "#666666", margin: "16px 0 0 0" }}>
              Once approved by collective admins, your 100 $SLUG claim button will activate automatically.
            </p>
          </div>
        ) : !isUnlocked ? (
          /* Step 4: Approved - Claim button active */
          <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "24px", padding: "40px 24px", textAlign: "center", maxWidth: "540px", margin: "0 auto", boxShadow: "0 0 30px rgba(166, 255, 0, 0.12)" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>⚾</div>
            <div style={{ display: "inline-block", backgroundColor: "rgba(166, 255, 0, 0.1)", border: `1px solid ${NEON_GREEN}`, borderRadius: "999px", padding: "4px 12px", fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", marginBottom: "12px" }}>
              ✓ Verified Collegiate Athlete
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 6px 0", color: "#ffffff", textTransform: "uppercase" }}>
              Claim Your 100 Slugger Coins
            </h3>
            <p style={{ fontSize: "13px", color: "#888888", margin: "0 0 24px 0" }}>
              {profile.fullName} • {profile.college} ({profile.position})
            </p>

            <TransactionButton
              transaction={() =>
                claimTo({
                  contract: sluggerContract,
                  to: account.address,
                  quantity: "100",
                })
              }
              onTransactionConfirmed={() => {
                setJustClaimed(true);
                refetch();
              }}
              onError={(err) => alert(`Claim error: ${err.message}`)}
              style={{ width: "100%", backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", padding: "16px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px" }}
            >
              Claim 100 Free Slugger Coins
            </TransactionButton>
            <p style={{ fontSize: "12px", color: "#666666", margin: "16px 0 0 0", fontWeight: "600" }}>
              Claims remaining: <span style={{ color: NEON_GREEN }}>91%</span> • Instant & Gasless on Base
            </p>
          </div>
        ) : (
          /* Step 5: Unlocked Dugout */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "18px", padding: "22px 28px", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ height: "10px", width: "10px", borderRadius: "50%", backgroundColor: NEON_GREEN, display: "inline-block", boxShadow: `0 0 10px ${NEON_GREEN}` }}></span>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase" }}>
                    The Brand Dugout (Unlocked)
                  </h3>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#888888" }}>
                  Verified Member • Holding {balance >= 100 ? balance : "100"} $SLUG • {profile.fullName} ({profile.college})
                </p>
              </div>
              <button
                onClick={() => setShowProfileModal(true)}
                style={{ backgroundColor: "#141414", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontWeight: "800", padding: "10px 18px", borderRadius: "10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", cursor: "pointer" }}
              >
                Edit Athlete Profile 👤
              </button>
            </div>

            {/* Brand Market Directory */}
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {MARKET_SECTIONS.map((section, idx) => (
                <div key={idx} style={{ borderBottom: "1px solid #141414", paddingBottom: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                    <span style={{ fontSize: "20px" }}>{section.emoji}</span>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", color: "#ffffff" }}>
                      {section.title}
                    </h3>
                    <span style={{ fontSize: "11px", color: "#666666", fontWeight: "700", marginLeft: "auto" }}>
                      {section.brands.length} {section.brands.length === 1 ? "Partner" : "Partners"}
                    </span>
                  </div>

                  {section.brands.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                      {section.brands.map((brand, bIdx) => (
                        <div 
                          key={bIdx}
                          style={{ 
                            backgroundColor: "#0a0a0a", 
                            border: brand.isPrimary ? `1px solid ${NEON_GREEN}` : "1px solid #1f1f1f", 
                            borderRadius: "16px", 
                            padding: "24px", 
                            display: "flex", 
                            flexDirection: "column", 
                            justifyContent: "space-between" 
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px" }}>
                              {brand.tagline}
                            </span>
                            <h4 style={{ fontSize: "18px", fontWeight: "900", color: "#ffffff", margin: "10px 0 6px 0", textTransform: "uppercase" }}>
                              {brand.name}
                            </h4>
                            <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.5", margin: 0 }}>
                              {brand.description}
                            </p>
                          </div>

                          {brand.type === "email_intro" ? (
                            <button
                              onClick={() => handleRequestIntro(brand)}
                              disabled={introStatus[brand.name] === "sending" || introStatus[brand.name] === "sent"}
                              style={{ 
                                width: "100%",
                                backgroundColor: introStatus[brand.name] === "sent" ? "#15803d" : NEON_GREEN, 
                                color: introStatus[brand.name] === "sent" ? "#ffffff" : "#000000", 
                                border: "none", 
                                fontWeight: "900", 
                                padding: "13px", 
                                borderRadius: "10px", 
                                fontSize: "12px", 
                                textTransform: "uppercase", 
                                letterSpacing: "1px", 
                                cursor: "pointer", 
                                marginTop: "22px" 
                              }}
                            >
                              {introStatus[brand.name] === "sending" 
                                ? "Dispatching Intro..." 
                                : introStatus[brand.name] === "sent" 
                                ? "Intro Dispatched ✓" 
                                : brand.buttonText}
                            </button>
                          ) : (
                            <a
                              href={brand.link} 
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ 
                                display: "block", 
                                textAlign: "center", 
                                backgroundColor: "#141414", 
                                color: "#ffffff", 
                                border: "1px solid #2a2a2a", 
                                fontWeight: "900", 
                                padding: "13px", 
                                borderRadius: "10px", 
                                fontSize: "12px", 
                                textTransform: "uppercase", 
                                letterSpacing: "1px", 
                                textDecoration: "none", 
                                marginTop: "22px" 
                              }}
                            >
                              {brand.buttonText}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: "#050505", border: "1px dashed #1a1a1a", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
                      <p style={{ margin: 0, fontSize: "12px", color: "#555555", fontWeight: "600" }}>
                        Partner announcements dropping soon for {section.title}.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Validated Athlete Profile Modal */}
      {showProfileModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "20px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", padding: "26px" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "20px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff" }}>
              Athlete Locker Profile
            </h3>
            <p style={{ fontSize: "13px", color: "#888888", margin: "0 0 18px 0" }}>
              Enter your athletic details and verification link to unlock the collegiate collective.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={profile.fullName} 
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="e.g. Jordan Jones" 
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Email *</label>
                  <input 
                    type="email" 
                    required
                    value={profile.email} 
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="player@gmail.com" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Cell Phone *</label>
                  <input 
                    type="tel" 
                    required
                    pattern="[0-9+() -]{10,}"
                    title="Please enter a valid phone number"
                    value={profile.phone} 
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="(555) 000-0000" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>College / Program *</label>
                  <input 
                    type="text" 
                    required
                    value={profile.college} 
                    onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                    placeholder="e.g. BYU Baseball" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Position *</label>
                  <input 
                    type="text" 
                    required
                    value={profile.position} 
                    onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                    placeholder="e.g. RHP / Shortstop" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Class Year *</label>
                  <select
                    value={profile.collegeYear}
                    onChange={(e) => setProfile({ ...profile, collegeYear: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate / 5th Year">Graduate / 5th Year</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Player Status *</label>
                  <select
                    value={profile.playerStatus}
                    onChange={(e) => setProfile({ ...profile, playerStatus: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  >
                    <option value="Incoming Freshman">Incoming Freshman</option>
                    <option value="Transfer Portal / Juco">Transfer Portal / Juco</option>
                    <option value="Returning College Player">Returning College Player</option>
                  </select>
                </div>
              </div>

              {/* Verification Link */}
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>
                  Verification Proof Link *
                </label>
                <input 
                  type="url" 
                  required
                  value={profile.verificationLink} 
                  onChange={(e) => setProfile({ ...profile, verificationLink: e.target.value })}
                  placeholder="Roster Bio URL, Signing Announcement Link, or Prep Profile" 
                  style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                />
                <span style={{ display: "block", fontSize: "11px", color: "#666666", marginTop: "4px" }}>
                  Past Roster link, X/IG commitment post, or recruiting bio (PG / Prep Baseball).
                </span>
              </div>

              {/* Instagram */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Instagram Profile Link</label>
                  <input 
                    type="url" 
                    value={profile.instagramUrl} 
                    onChange={(e) => setProfile({ ...profile, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/handle" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Followers</label>
                  <input 
                    type="number" 
                    min="0"
                    value={profile.instagramFollowers} 
                    onChange={(e) => setProfile({ ...profile, instagramFollowers: e.target.value })}
                    placeholder="e.g. 3500" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* TikTok */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>TikTok Profile Link</label>
                  <input 
                    type="url" 
                    value={profile.tiktokUrl} 
                    onChange={(e) => setProfile({ ...profile, tiktokUrl: e.target.value })}
                    placeholder="https://tiktok.com/@handle" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Followers</label>
                  <input 
                    type="number" 
                    min="0"
                    value={profile.tiktokFollowers} 
                    onChange={(e) => setProfile({ ...profile, tiktokFollowers: e.target.value })}
                    placeholder="e.g. 12000" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              {/* X */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>X (Twitter) Profile Link</label>
                  <input 
                    type="url" 
                    value={profile.xUrl} 
                    onChange={(e) => setProfile({ ...profile, xUrl: e.target.value })}
                    placeholder="https://x.com/handle" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Followers</label>
                  <input 
                    type="number" 
                    min="0"
                    value={profile.xFollowers} 
                    onChange={(e) => setProfile({ ...profile, xFollowers: e.target.value })}
                    placeholder="e.g. 850" 
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "10px 12px", borderRadius: "8px", fontSize: "13px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  style={{ flex: 1, backgroundColor: "#141414", border: "1px solid #2a2a2a", color: "#888888", fontWeight: "700", padding: "12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", textTransform: "uppercase" }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{ flex: 2, backgroundColor: NEON_GREEN, color: "#000000", border: "none", fontWeight: "900", padding: "12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                >
                  {isSavingProfile ? "Submitting..." : "Submit Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ThirdwebProvider>
      <AppContent />
    </ThirdwebProvider>
  );
}
