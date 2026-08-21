"use client";

import React, { useState, useEffect } from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { 
  ThirdwebProvider, 
  ConnectButton, 
  TransactionButton, 
  useActiveAccount, 
  useReadContract,
  useConnectModal
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { getBalance, claimTo, totalSupply } from "thirdweb/extensions/erc20";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxhwqCXDFPT0C1I4Zt-ASCpUVbkD9piI-_7pO1Dx5WhHG3JtMrgxm-N1kn4zhKbOXRzIA/exec";
const STRIPE_GRIP_DROP_URL = "https://buy.stripe.com/8x2eVeeW57dgc5I1hX8Vi01";
const NEON_GREEN = "#a6ff00";

const FOUNDERS_POOL_TOTAL = 100000;
const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

const client = createThirdwebClient({
  clientId: "770a552ed494b40543a6696298d41606",
});

const sluggerContract = getContract({
  client,
  chain: base,
  address: "0xF3f6D32ABCf2fDeAB3c6D0b440230714166Cc4A1",
});

const supportedWallets = [
  inAppWallet({
    auth: {
      options: ["google", "apple", "phone"],
    },
  }),
];

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
    title: "Hitting",
    emoji: "💥",
    brands: [
      {
        name: "Frost Gear",
        tagline: "Cold-Weather Performance Batting Gear",
        description: "Engineered with advanced thermal materials to keep hands warm, responsive, and game-ready without sacrificing grip or feel.",
        buttonText: "Request Direct Intro ⚡",
        type: "email_intro",
        brandRepEmail: "parker@maxbp.com",
        brandRepName: "Parker (MaxBP & Frost Gear)",
        isPrimary: true,
      },
      {
        name: "Soldier Sports",
        tagline: "Team Soldier TANK Ambassador Program",
        description: "Apply to join the Team Soldier TANK Ambassador Program and claim exclusive athlete perks, hardware, and performance gear.",
        buttonText: "Open Ambassador Application ↗",
        type: "affiliate_link",
        link: "https://soldiersports.us/pages/ambassador",
      },
    ],
  },
  {
    title: "Equipment",
    emoji: "⚾",
    brands: [
      {
        name: "MaxBP",
        tagline: "High-Velocity Reaction & Vision Training",
        description: "Train fast with the premier small-ball reaction and hitting machines in the game.",
        buttonText: "Request Direct Intro ⚡",
        type: "email_intro",
        brandRepEmail: "parker@maxbp.com",
        brandRepName: "Parker (MaxBP)",
        isPrimary: true,
      },
      {
        name: "Yardley Sports",
        tagline: "Handcrafted Custom Leather Gloves",
        description: "Premium handcrafted baseball gloves built with pro patterns, rich leather, and customized game-ready feel.",
        buttonText: "Request Direct Intro ⚡",
        type: "email_intro",
        brandRepEmail: "braden@yardleysports.com",
        brandRepName: "Braden (Yardley Sports)",
        isPrimary: true,
      },
      {
        name: "Rawlings",
        tagline: "The Official Glove & Ball of MLB",
        description: "Join the official Rawlings affiliate network on CJ Affiliate and monetize referred sales for the finest in the field.",
        buttonText: "Open Affiliate Portal ↗",
        type: "affiliate_link",
        link: "https://www.rawlings.com/information-affiliate.html",
      },
      {
        name: "Wilson Family of Brands",
        tagline: "A2000, A2K, DeMarini & Louisville Slugger",
        description: "Access official partner campaigns on Impact for Wilson, DeMarini, Louisville Slugger, and EvoShield.",
        buttonText: "Join Wilson Network ↗",
        type: "affiliate_link",
        link: "https://app.impact.com/campaign-promo-signup/Wilson-Family-of-Brands.brand?execution=e1s1#/?viewkey=signUpPreStart",
      },
      {
        name: "HydroJug",
        tagline: "TikTok Shop Creator Program",
        description: "Create TikTok content, tag HydroJug gear directly, and earn commission on every sale through TikTok Shop.",
        buttonText: "Open Ambassador Program ↗",
        type: "affiliate_link",
        link: "https://www.thehydrojug.com/pages/ambassadors-affiliates",
      },
    ],
  },
  {
    title: "Eyewear & Vision",
    emoji: "🕶️",
    brands: [
      {
        name: "Vision X Sports",
        tagline: "Cognitive, Visual & Reaction Training",
        description: "13-level performance series connecting eye tracking, depth perception, coordination, and mental conditioning.",
        buttonText: "Request Direct Intro ⚡",
        type: "email_intro",
        brandRepEmail: "r.curry@visionxsports.com",
        brandRepName: "R. Curry (Vision X Sports)",
        isPrimary: true,
      },
    ],
  },
  {
    title: "Clothing & Apparel",
    emoji: "🧢",
    brands: [
      {
        name: "Baseballism",
        tagline: "Premium Baseball Lifestyle & Streetwear",
        description: "The premier lifestyle brand honoring the game's culture. Submit for official creator and NIL collaborations.",
        buttonText: "Open Collaboration Form ↗",
        type: "affiliate_link",
        link: "https://www.baseballism.com/pages/collabs-1?srsltid=AfmBOoqEktT0nGezfmx_xgwZmPpmD3k9pAy5xaq4E8D4suS0UqhDCmVD",
      },
      {
        name: "Vuori",
        tagline: "V1 Community Pro Network",
        description: "A network of athletes united by movement. Members receive exclusive apparel allocations, benefits, and events.",
        buttonText: "Join V1 Community ↗",
        type: "affiliate_link",
        link: "https://vuoriclothing.com/pages/v1-community-program",
      },
    ],
  },
  {
    title: "Footwear",
    emoji: "👟",
    brands: [
      {
        name: "Nike",
        tagline: "Official Nike Affiliate Network",
        description: "Earn competitive commissions promoting Nike cleats, training footwear, and apparel with early product drops.",
        buttonText: "Open Nike Publisher App ↗",
        type: "affiliate_link",
        link: "https://public.cj.com/signup/publisher?advertiserId=4942550#/branded",
      },
      {
        name: "Mizuno",
        tagline: "The Mizuno Movement Athlete Program",
        description: "Gain access to exclusive high-performance diamond footwear and equipment ahead of consumer release.",
        buttonText: "Join Mizuno Movement ↗",
        type: "affiliate_link",
        link: "https://usa.mizuno.com/mizuno-movement/",
      },
      {
        name: "Under Armour",
        tagline: "Under Armour Athlete Partner Program",
        description: "Earn commissions on referred clickthrough sales across UA diamond footwear, HeatGear, and performance apparel.",
        buttonText: "Open UA Partner Program ↗",
        type: "affiliate_link",
        link: "https://www.underarmour.com/en-us/t/ua-affiliate-program/",
      },
    ],
  },
  {
    title: "Nutrition",
    emoji: "⚡",
    brands: [
      {
        name: "Just Ingredients",
        tagline: "Clean Supplements, Hydration & Electrolytes",
        description: "Turn your passion into creator commissions, unique affiliate discount codes, and clean nutrition packages.",
        buttonText: "Open Creator Portal ↗",
        type: "affiliate_link",
        link: "https://justingredients.com/pages/creator-program?srsltid=AfmBOoq02ujUzQv9eCCYLpLz1rYNSsFxQed5F2KxhsN-qNQNTshataQw",
      },
      {
        name: "King of the Jungle",
        tagline: "Elite Pre-Workout & Nootropic Performance",
        description: "Scientifically dosed Nitric Oxide activators, hydration electrolytes, and clean nootropics for diamond endurance.",
        buttonText: "Join Ambassador Program ↗",
        type: "affiliate_link",
        link: "https://kingofthejungle.com/pages/brand-ambassador",
      },
    ],
  },
  {
    title: "Player Services",
    emoji: "🤝",
    brands: [
      {
        name: "Baseball Players of the World",
        tagline: "Global Playing Opportunities & Media",
        description: "Helping baseball players maximize the value of their careers through worldwide placements and strategic media.",
        buttonText: "Submit Player Dossier ↗",
        type: "affiliate_link",
        link: "https://docs.google.com/forms/d/e/1FAIpQLSdqJDUk_maSDgFXyYHG0V5VZy7AgT_kBtPHRaSojhqkTyiYDw/viewform",
      },
    ],
  },
  {
    title: "Technology",
    emoji: "📱",
    brands: [
      {
        name: "Pocket Radar",
        tagline: "Smart Coach Velocity & Data Tracking",
        description: "Quantify throw and exit velocity on every swing, pitch, and throw. Access official collegiate ambassador programs.",
        buttonText: "Register Ambassador Unit ↗",
        type: "affiliate_link",
        link: "https://af.uppromote.com/pocket-radar-inc/register",
      },
    ],
  },
  {
    title: "Coaching & Lessons",
    emoji: "📋",
    brands: [],
  },
  {
    title: "Pitching",
    emoji: "🎯",
    brands: [],
  },
  {
    title: "Training",
    emoji: "🏋️‍♂️",
    brands: [],
  },
];

const FAQS = [
  {
    q: "Is this compliant with NCAA and Institutional NIL rules?",
    a: "Yes. All Slugger Coins ($SLUG) distributed during the Founders phase have zero market cash value and are non-compensatory. Tokens are issued exclusively as an access key to unlock brand directories, educational resources, and partner introductions.",
  },
  {
    q: "How does 'The Big Black Grip' member drop work?",
    a: "The first 60 verified college ballplayers to claim receive 'The Big Black Grip' bat grip 100% free ($0 product cost). A flat $8.99 shipping and handling fee is paid directly through Stripe to cover USPS Ground postage with tracking, bubble mailer packaging, and fulfillment.",
  },
  {
    q: "Do I need crypto experience or a crypto wallet to join?",
    a: "None at all. When you sign in using your existing Google, Apple, or phone ID, an embedded smart wallet is generated automatically in the background. All blockchain transactions are 100% free and gas-sponsored on Base.",
  },
  {
    q: "Who is eligible to join The Diamond Collective?",
    a: "Membership is exclusive to active collegiate baseball players (NCAA D1, D2, D3, NAIA, and NJCAA) as well as committed incoming freshmen. Each athlete's roster status is verified prior to token distribution.",
  },
  {
    q: "What happens when I request a Direct Brand Intro?",
    a: "Our automated system packages your athletic dossier, verified roster bio, contact information, and social media reach into a formal introduction dispatched directly to the brand's partnership team and CC'd to your email.",
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
  const { connect } = useConnectModal();
  const [justClaimed, setJustClaimed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dispatchedBrand, setDispatchedBrand] = useState<BrandItem | null>(null);
  const [profile, setProfile] = useState<AthleteProfile>(emptyProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Stored as { [brandName]: timestampNumber }
  const [introTimestamps, setIntroTimestamps] = useState<{ [brandName: string]: number }>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenLogin = () => {
    connect({
      client,
      wallets: supportedWallets,
      accountAbstraction: {
        chain: base,
        sponsorGas: true,
      },
      chain: base,
      theme: "dark",
    });
  };

  const { data: balanceData, refetch: refetchBalance } = useReadContract(getBalance, {
    contract: sluggerContract,
    address: account?.address || "",
  });

  const { data: totalSupplyData, refetch: refetchSupply } = useReadContract(totalSupply, {
    contract: sluggerContract,
  });

  const totalMinted = totalSupplyData ? Number(totalSupplyData) / 1e18 : 0;
  const rawRemaining = ((FOUNDERS_POOL_TOTAL - totalMinted) / FOUNDERS_POOL_TOTAL) * 100;
  const remainingPercentage = Math.max(0, Math.min(100, Math.round(rawRemaining)));

  const balance = balanceData ? Number(balanceData.displayValue) : 0;
  const isUnlocked = balance >= 100 || justClaimed;
  const isApproved = profile.verificationStatus === "Approved";
  const hasProfile = Boolean(profile.fullName && profile.email);

  // Check if an intro is active (<90 days old)
  const isIntroActive = (brandName: string): boolean => {
    const timestamp = introTimestamps[brandName];
    if (!timestamp) return false;
    return Date.now() - timestamp < NINETY_DAYS_MS;
  };

  useEffect(() => {
    if (account?.address) {
      const localKey = `athlete_profile_${account.address.toLowerCase()}`;
      const localIntroKey = `athlete_intros_${account.address.toLowerCase()}`;
      
      const savedLocal = localStorage.getItem(localKey);
      if (savedLocal) {
        try {
          setProfile(JSON.parse(savedLocal));
        } catch {}
      }

      const savedIntros = localStorage.getItem(localIntroKey);
      if (savedIntros) {
        try {
          const parsed = JSON.parse(savedIntros);
          const formatted: { [bName: string]: number } = {};
          // Backward compatibility: handle old "sent" string or number timestamp
          Object.keys(parsed).forEach((k) => {
            formatted[k] = typeof parsed[k] === "number" ? parsed[k] : Date.now();
          });
          setIntroTimestamps(formatted);
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

          if (data?.existingIntros && Array.isArray(data.existingIntros)) {
            const introsMap: { [brandName: string]: number } = {};
            data.existingIntros.forEach((bName: string) => {
              introsMap[bName] = Date.now();
            });
            setIntroTimestamps((prev) => {
              const updated = { ...prev, ...introsMap };
              localStorage.setItem(localIntroKey, JSON.stringify(updated));
              return updated;
            });
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
      alert("Application submitted! Our team will review your collegiate status.");
    } catch {
      setIsSavingProfile(false);
      setShowProfileModal(false);
      alert("Profile submitted!");
    }
  };

  const handleRequestIntro = async (brand: BrandItem) => {
    // If already active within 90 days, clicking shows the notification modal
    if (isIntroActive(brand.name)) {
      setDispatchedBrand(brand);
      return;
    }

    if (!profile.fullName || !profile.email) {
      setShowProfileModal(true);
      return;
    }

    const now = Date.now();
    const localIntroKey = `athlete_intros_${account?.address?.toLowerCase()}`;
    setIntroTimestamps((prev) => {
      const updated = { ...prev, [brand.name]: now };
      localStorage.setItem(localIntroKey, JSON.stringify(updated));
      return updated;
    });

    // Trigger the informational success popup for the athlete
    setDispatchedBrand(brand);

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
    } catch {}
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Compliance Header */}
      <div style={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "10px 16px", textAlign: "center", fontSize: "11px", color: "#888888", letterSpacing: "0.5px", lineHeight: "1.4" }}>
        <strong style={{ color: "#ffffff" }}>NCAA NIL Compliance Note:</strong> All SLUGGER COINS distributed during the Founders phase have no current market value and are non-compensatory. Tokens are issued solely for community participation and access purposes.
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Navigation */}
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          borderBottom: "1px solid #1a1a1a", 
          paddingBottom: "24px", 
          flexWrap: "wrap", 
          gap: "16px" 
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "900", letterSpacing: "1.5px", color: "#ffffff", textTransform: "uppercase" }}>
              The Diamond Collective
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: NEON_GREEN, fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
              Powered by Slugger Coin ($SLUG)
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <ConnectButton
              client={client}
              wallets={supportedWallets}
              accountAbstraction={{
                chain: base,
                sponsorGas: true,
              }}
              chain={base}
              theme="dark"
              connectButton={{ label: "Athlete Sign In" }}
            />
          </div>
        </header>

        {/* Hero Section */}
        <section style={{ textAlign: "center", margin: "44px 0 28px 0" }}>
          <div style={{ display: "inline-block", backgroundColor: "rgba(166, 255, 0, 0.08)", border: `1px solid ${NEON_GREEN}`, borderRadius: "999px", padding: "6px 16px", fontSize: "11px", fontWeight: "800", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>
            Exclusively for College Baseball Players
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#ffffff", margin: "0 0 16px 0", letterSpacing: "-0.5px", textTransform: "uppercase", lineHeight: "1.15" }}>
            Your Digital Clubhouse for Deals, Gear & Access
          </h2>
          <p style={{ fontSize: "16px", color: "#a1a1aa", maxWidth: "680px", margin: "0 auto", lineHeight: "1.6" }}>
            Step into the collective. Claim your free 100 $SLUG allocation, unlock exclusive member gear drops, and connect directly with sponsor brands.
          </p>
        </section>

        {/* Live Metrics Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", maxWidth: "860px", margin: "0 auto 40px auto" }}>
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "20px", fontWeight: "900", color: NEON_GREEN }}>15+</span>
            <span style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Brand Partners</span>
          </div>
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "20px", fontWeight: "900", color: "#ffffff" }}>Drop #001</span>
            <span style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>60 Grips Live</span>
          </div>
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "20px", fontWeight: "900", color: NEON_GREEN }}>100 $SLUG</span>
            <span style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Free Allocation</span>
          </div>
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "20px", fontWeight: "900", color: "#ffffff" }}>
              {totalSupplyData !== undefined ? `${remainingPercentage}% Remaining` : "Live Sync..."}
            </span>
            <span style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Founders Phase</span>
          </div>
        </div>

        {/* Dynamic Gatekeeper Flow */}
        {!account ? (
          <div>
            {/* Drop #001 Teaser Card for Logged Out Players */}
            <div style={{ backgroundColor: "#080808", border: `1px solid ${NEON_GREEN}`, borderRadius: "24px", padding: "32px 24px", maxWidth: "800px", margin: "0 auto 40px auto", boxShadow: "0 0 35px rgba(166, 255, 0, 0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <span style={{ backgroundColor: NEON_GREEN, color: "#000000", fontSize: "11px", fontWeight: "900", padding: "6px 14px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  🔥 Exclusive Member Drop #001
                </span>
                <span style={{ fontSize: "12px", color: "#888888", fontWeight: "800", textTransform: "uppercase" }}>
                  Limited to First 60 Verified Athletes
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                <div style={{ flex: "1 1 340px" }}>
                  <h3 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 8px 0", color: "#ffffff", textTransform: "uppercase" }}>
                    "The Big Black Grip" Bat Grip ($0.00 Free)
                  </h3>
                  <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: "1.5", margin: 0 }}>
                    We're hooking up the first 60 verified college players with our premium pro-feel bat grip for $0.00 (just cover flat $8.99 USPS shipping & handling).
                  </p>
                </div>
                <button
                  onClick={handleOpenLogin}
                  style={{ 
                    backgroundColor: "#111111", 
                    border: `1px solid ${NEON_GREEN}`, 
                    color: NEON_GREEN, 
                    fontWeight: "900", 
                    textTransform: "uppercase", 
                    letterSpacing: "1px", 
                    padding: "14px 24px", 
                    borderRadius: "12px", 
                    cursor: "pointer", 
                    fontSize: "13px",
                    whiteSpace: "nowrap"
                  }}
                >
                  Sign In to Claim ➔
                </button>
              </div>
            </div>

            {/* Step 1: Sign in Hero Box */}
            <div style={{ backgroundColor: "#0a0a0a", border: `1px solid #222222`, borderRadius: "24px", padding: "44px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto 48px auto" }}>
              <h3 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 8px 0", color: "#ffffff", textTransform: "uppercase" }}>
                Step 1: Open Your Athlete Locker
              </h3>
              <p style={{ fontSize: "14px", color: "#888888", margin: "0 0 24px 0", lineHeight: "1.5" }}>
                Tap below to connect with your Google, Apple, or phone ID and submit your collegiate verification.
              </p>
              <button
                onClick={handleOpenLogin}
                style={{ 
                  backgroundColor: NEON_GREEN, 
                  color: "#000000", 
                  fontWeight: "900", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.8px", 
                  padding: "16px 28px", 
                  borderRadius: "12px", 
                  border: "none", 
                  cursor: "pointer", 
                  fontSize: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: "8px",
                  lineHeight: "1.2",
                  width: "100%",
                  maxWidth: "380px"
                }}
              >
                <span>Athlete Sign In & Verification</span>
                <span style={{ fontSize: "16px", fontWeight: "900" }}>↗</span>
              </button>
            </div>

            {/* 3-Step "How It Works" Section */}
            <section style={{ margin: "56px 0" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Seamless Onboarding
                </span>
                <h3 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", margin: "6px 0 0 0" }}>
                  How The Diamond Collective Works
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "18px", padding: "28px 24px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(166, 255, 0, 0.1)", color: NEON_GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", marginBottom: "16px" }}>
                    1
                  </div>
                  <h4 style={{ fontSize: "18px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff", margin: "0 0 8px 0" }}>
                    Authenticate
                  </h4>
                  <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: 0 }}>
                    Sign in with your standard Google or Apple account. No seed phrases, crypto knowledge, or browser extensions required.
                  </p>
                </div>

                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "18px", padding: "28px 24px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(166, 255, 0, 0.1)", color: NEON_GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", marginBottom: "16px" }}>
                    2
                  </div>
                  <h4 style={{ fontSize: "18px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff", margin: "0 0 8px 0" }}>
                    Verify Roster Status
                  </h4>
                  <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: 0 }}>
                    Submit your collegiate program details and verification proof link (roster bio, commitment post, or recruiting profile).
                  </p>
                </div>

                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "18px", padding: "28px 24px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(166, 255, 0, 0.1)", color: NEON_GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "900", marginBottom: "16px" }}>
                    3
                  </div>
                  <h4 style={{ fontSize: "18px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff", margin: "0 0 8px 0" }}>
                    Claim & Unlock Intros
                  </h4>
                  <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.6", margin: 0 }}>
                    Claim your 100 $SLUG tokens gas-free on Base to unlock Drop #001, direct brand intros, and partner gear deals.
                  </p>
                </div>
              </div>
            </section>

            {/* Public Partner Dugout Preview */}
            <section style={{ margin: "56px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                    Partner Network
                  </span>
                  <h3 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", margin: "6px 0 0 0" }}>
                    Featured Brand Opportunities
                  </h3>
                </div>
                <span style={{ fontSize: "12px", color: "#888888", fontWeight: "600" }}>
                  15 Partner Brands Live in the Dugout
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
                {MARKET_SECTIONS.flatMap(s => s.brands).map((brand, bIdx) => (
                  <div 
                    key={bIdx}
                    style={{ 
                      backgroundColor: "#0a0a0a", 
                      border: brand.isPrimary ? `1px solid rgba(166, 255, 0, 0.3)` : "1px solid #1a1a1a", 
                      borderRadius: "16px", 
                      padding: "22px", 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between" 
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "0.8px", flex: 1, lineHeight: "1.3" }}>
                          {brand.tagline}
                        </span>
                        {brand.type === "email_intro" && (
                          <span style={{ 
                            fontSize: "10px", 
                            fontWeight: "900", 
                            backgroundColor: "rgba(166, 255, 0, 0.12)", 
                            color: NEON_GREEN, 
                            border: `1px solid ${NEON_GREEN}`, 
                            padding: "4px 10px", 
                            borderRadius: "999px", 
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                            whiteSpace: "nowrap",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: "1",
                            flexShrink: 0
                          }}>
                            Direct Intro
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: "18px", fontWeight: "900", color: "#ffffff", margin: "6px 0 8px 0", textTransform: "uppercase" }}>
                        {brand.name}
                      </h4>
                      <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.5", margin: 0 }}>
                        {brand.description}
                      </p>
                    </div>

                    <button
                      onClick={handleOpenLogin}
                      style={{ 
                        width: "100%",
                        marginTop: "20px", 
                        backgroundColor: "#0d0d0d", 
                        border: "1px solid #2a2a2a", 
                        borderRadius: "10px", 
                        padding: "13px", 
                        textAlign: "center", 
                        fontSize: "11px", 
                        fontWeight: "900", 
                        color: NEON_GREEN, 
                        textTransform: "uppercase", 
                        letterSpacing: "0.8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.15s ease"
                      }}
                    >
                      Sign In & Verify to Unlock ↗
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Accordion */}
            <section style={{ margin: "56px 0" }}>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Got Questions?
                </span>
                <h3 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", margin: "6px 0 0 0" }}>
                  Frequently Asked Questions
                </h3>
              </div>

              <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>
                {FAQS.map((faq, fIdx) => (
                  <div 
                    key={fIdx} 
                    style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", overflow: "hidden" }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
                      style={{ width: "100%", textAlign: "left", padding: "18px 20px", background: "none", border: "none", color: "#ffffff", fontSize: "15px", fontWeight: "800", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                      <span>{faq.q}</span>
                      <span style={{ color: NEON_GREEN, fontSize: "18px", fontWeight: "900", marginLeft: "12px" }}>
                        {openFaq === fIdx ? "−" : "+"}
                      </span>
                    </button>
                    {openFaq === fIdx && (
                      <div style={{ padding: "0 20px 20px 20px", color: "#a1a1aa", fontSize: "13px", lineHeight: "1.6" }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Brand Inbound Footer CTA */}
            <section style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "36px 24px", textAlign: "center", margin: "48px 0 20px 0" }}>
              <h4 style={{ fontSize: "18px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff", margin: "0 0 8px 0" }}>
                Are You a Baseball Brand or Service Provider?
              </h4>
              <p style={{ fontSize: "13px", color: "#888888", maxWidth: "540px", margin: "0 auto 20px auto", lineHeight: "1.5" }}>
                Join The Diamond Collective to connect directly with verified collegiate baseball players across the country.
              </p>
              <a
                href="mailto:partnerships@diamondcollective.net?subject=Brand%20Partnership%20Inquiry%20-%20The%20Diamond%20Collective"
                style={{ display: "inline-block", backgroundColor: "#141414", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontWeight: "900", padding: "12px 24px", borderRadius: "10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", textDecoration: "none" }}
              >
                Inquire About Brand Partnerships ↗
              </a>
            </section>
          </div>
        ) : !hasProfile ? (
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
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #eab308", borderRadius: "24px", padding: "40px 24px", textAlign: "center", maxWidth: "540px", margin: "0 auto", boxShadow: "0 0 30px rgba(234, 179, 8, 0.1)" }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>⏳</div>
            <h3 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 6px 0", color: "#ffffff", textTransform: "uppercase" }}>
              Verification Under Review
            </h3>
            <p style={{ fontSize: "14px", color: "#a1a1aa", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              Thanks, <strong style={{ color: "#ffffff" }}>{profile.fullName}</strong>. Your profile at <strong style={{ color: "#ffffff" }}>{profile.college}</strong> is currently being verified.
            </p>
            <div style={{ backgroundColor: "#000000", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "12px 18px", fontSize: "12px", color: "#eab308", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block" }}>
              Status: Pending Approval
            </div>
            <p style={{ fontSize: "12px", color: "#666666", margin: "16px 0 0 0" }}>
              Once approved by collective admins, your 100 $SLUG claim button will unlock here automatically.
            </p>
          </div>
        ) : !isUnlocked ? (
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
                refetchBalance();
                refetchSupply();
              }}
              onError={(err) => alert(`Claim error: ${err.message}`)}
              style={{ width: "100%", backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", padding: "16px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px" }}
            >
              Claim 100 Free Slugger Coins
            </TransactionButton>
            <p style={{ fontSize: "12px", color: "#666666", margin: "16px 0 0 0", fontWeight: "600" }}>
              Claims remaining: <span style={{ color: NEON_GREEN }}>{remainingPercentage}%</span> • Instant & Gasless on Base
            </p>
          </div>
        ) : (
          <div>
            {/* Athlete Status Pill */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "18px", padding: "22px 28px", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
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

            {/* 🔥 FEATURED EXCLUSIVE MEMBER DROP #001 CARD */}
            <div style={{ 
              backgroundColor: "#0d0d0d", 
              border: `2px solid ${NEON_GREEN}`, 
              borderRadius: "22px", 
              padding: "30px 24px", 
              marginBottom: "40px", 
              boxShadow: "0 0 35px rgba(166, 255, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ backgroundColor: NEON_GREEN, color: "#000000", fontSize: "11px", fontWeight: "900", padding: "4px 12px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      Member Drop #001
                    </span>
                    <span style={{ fontSize: "12px", color: "#888888", fontWeight: "800", textTransform: "uppercase" }}>
                      First 60 Members Only
                    </span>
                  </div>
                  <h3 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    "The Big Black Grip" Bat Grip
                  </h3>
                  <p style={{ fontSize: "14px", color: "#a1a1aa", margin: 0, maxWidth: "600px", lineHeight: "1.5" }}>
                    Single-sleeve, one-piece seamless bat grip with ultra durability and zero tape unraveling. 100% free for verified members (<span style={{ color: "#ffffff", textDecoration: "line-through" }}>$16.00 retail</span> → <strong style={{ color: NEON_GREEN }}>$0.00</strong>). Flat $8.99 USPS shipping & handling.
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ display: "block", fontSize: "28px", fontWeight: "900", color: NEON_GREEN }}>$0.00</span>
                  <span style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase", fontWeight: "700" }}>+ $8.99 Flat S&H</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1f1f1f", paddingTop: "18px", flexWrap: "wrap", gap: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ height: "8px", width: "8px", borderRadius: "50%", backgroundColor: NEON_GREEN }}></span>
                  <span style={{ fontSize: "12px", color: "#cccccc", fontWeight: "700" }}>
                    📦 60 Units in Vault • USPS Ground with Tracking
                  </span>
                </div>

                <a
                  href={STRIPE_GRIP_DROP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: NEON_GREEN,
                    color: "#000000",
                    fontWeight: "900",
                    padding: "14px 28px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span>Claim Your Free Grip ($8.99 S&H)</span>
                  <span style={{ fontSize: "16px" }}>↗</span>
                </a>
              </div>
            </div>

            {/* Unlocked Brand Dugout Directory */}
            <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
              {MARKET_SECTIONS.map((section, idx) => (
                <div key={idx} style={{ borderBottom: "1px solid #141414", paddingBottom: "36px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
                    <span style={{ fontSize: "22px" }}>{section.emoji}</span>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", color: "#ffffff" }}>
                      {section.title}
                    </h3>
                    <span style={{ fontSize: "11px", color: "#666666", fontWeight: "700", marginLeft: "auto" }}>
                      {section.brands.length} {section.brands.length === 1 ? "Partner" : "Partners"}
                    </span>
                  </div>

                  {section.brands.length > 0 ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                      {section.brands.map((brand, bIdx) => {
                        const activeIntro = isIntroActive(brand.name);
                        return (
                          <div 
                            key={bIdx}
                            style={{ 
                              backgroundColor: "#0a0a0a", 
                              border: brand.isPrimary ? `1px solid ${NEON_GREEN}` : "1px solid #1f1f1f", 
                              borderRadius: "16px", 
                              padding: "24px", 
                              display: "flex", 
                              flexDirection: "column", 
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
                                <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "0.8px", flex: 1, lineHeight: "1.3" }}>
                                  {brand.tagline}
                                </span>
                                {brand.type === "email_intro" && (
                                  <span style={{ 
                                    fontSize: "10px", 
                                    fontWeight: "900", 
                                    backgroundColor: "rgba(166, 255, 0, 0.12)", 
                                    color: NEON_GREEN, 
                                    border: `1px solid ${NEON_GREEN}`, 
                                    padding: "4px 10px", 
                                    borderRadius: "999px", 
                                    textTransform: "uppercase",
                                    letterSpacing: "0.6px",
                                    whiteSpace: "nowrap",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    lineHeight: "1",
                                    flexShrink: 0
                                  }}>
                                    Direct Intro
                                  </span>
                                )}
                              </div>
                              <h4 style={{ fontSize: "19px", fontWeight: "900", color: "#ffffff", margin: "8px 0 10px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {brand.name}
                              </h4>
                              <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.55", margin: 0 }}>
                                {brand.description}
                              </p>
                            </div>

                            {brand.type === "email_intro" ? (
                              <button
                                onClick={() => handleRequestIntro(brand)}
                                style={{ 
                                  width: "100%",
                                  backgroundColor: activeIntro ? "#15803d" : NEON_GREEN, 
                                  color: activeIntro ? "#ffffff" : "#000000", 
                                  border: "none", 
                                  fontWeight: "900", 
                                  padding: "14px", 
                                  borderRadius: "10px", 
                                  fontSize: "12px", 
                                  textTransform: "uppercase", 
                                  letterSpacing: "1px", 
                                  cursor: "pointer", 
                                  marginTop: "22px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "6px"
                                }}
                              >
                                {activeIntro ? (
                                  <>
                                    <span>Intro Dispatched ✓</span>
                                    <span style={{ fontSize: "11px", opacity: 0.8 }}>(View Details ℹ️)</span>
                                  </>
                                ) : (
                                  brand.buttonText
                                )}
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
                                  padding: "14px", 
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
                        );
                      })}
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

      {/* 🚀 POST-INTRO CONFIRMATION NOTIFICATION MODAL */}
      {dispatchedBrand && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, padding: "16px" }}>
          <div style={{ backgroundColor: "#0d0d0d", border: `2px solid ${NEON_GREEN}`, borderRadius: "24px", width: "100%", maxWidth: "520px", padding: "30px 26px", boxShadow: "0 0 45px rgba(166, 255, 0, 0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "28px" }}>⚡</span>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Direct Intro Dispatched
                </span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff" }}>
                  {dispatchedBrand.name}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "#ffffff", fontWeight: "700", lineHeight: "1.5", margin: "16px 0 14px 0" }}>
              Your athletic dossier is officially on the decision-maker's desk.
            </p>

            <div style={{ backgroundColor: "#050505", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "16px", marginBottom: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ fontSize: "14px" }}>📬</span>
                <div style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: "1.4" }}>
                  <strong style={{ color: "#ffffff" }}>Direct Delivery:</strong> A verified snapshot with your college bio, position, contact info, and social reach has been delivered straight to the {dispatchedBrand.name} partnerships team.
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ fontSize: "14px" }}>🔍</span>
                <div style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: "1.4" }}>
                  <strong style={{ color: "#ffffff" }}>Brand Review:</strong> The brand rep will review your profile to evaluate fit for upcoming athlete rosters, creator campaigns, or product testing.
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ fontSize: "14px" }}>🤝</span>
                <div style={{ fontSize: "12px", color: "#a1a1aa", lineHeight: "1.4" }}>
                  <strong style={{ color: "#ffffff" }}>Next Steps:</strong> If there's an alignment for an upcoming campaign, their team will reach out directly to your email or phone to discuss next steps.
                </div>
              </div>
            </div>

            <p style={{ fontSize: "11px", color: "#666666", lineHeight: "1.4", margin: "0 0 20px 0" }}>
              *Note: While individual brand responses depend on current campaign budgets and roster openings, your verified profile has been delivered directly into the hands of the decision-maker. This intro window resets after 90 days if you wish to resubmit updated seasonal stats or metrics.
            </p>

            <button
              onClick={() => setDispatchedBrand(null)}
              style={{
                width: "100%",
                backgroundColor: NEON_GREEN,
                color: "#000000",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "1px",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px"
              }}
            >
              Got It — Back to Dugout ➔
            </button>
          </div>
        </div>
      )}

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
                    placeholder="e.g. GCU Baseball" 
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
