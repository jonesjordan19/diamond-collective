"use client";

import React, { useState, useEffect, useMemo } from "react";
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
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

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
    smartAccount: {
      chain: base,
      sponsorGas: true,
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
    q: "What is the National Scouting Scoreboard?",
    a: "A public, honor-code data registry where verified athletes log their hitting, pitching, and 60-yard metrics with timestamps and social links for collegiate transfer portal coaches and professional scouts.",
  },
];

export interface AthleteProfile {
  verificationStatus?: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  state?: string;
  position: string;
  collegeYear: string;
  playerStatus: string;
  verificationLink: string;
  
  // Physical Measurements
  height?: string;
  weight?: string;

  primaryRole: "HITTER" | "PITCHER" | "TWP";
  isProfileVisible: boolean;
  social1_Type?: string;
  social1_Url?: string;
  social2_Type?: string;
  social2_Url?: string;

  // Hitting Benchmarks
  maxExitVelo?: string;
  ninetyEV?: string;
  batSpeed?: string;
  sixtyTime?: string;
  recordedDateHitting?: string;

  // Classic Pitching
  peakFB?: string;
  sittingFB?: string;
  offSpeedVelo?: string;
  offSpeedType?: string;
  fbSpinRate?: string;
  offSpeedSpinRate?: string;
  firstPitchStrike?: string;
  recordedDatePitching?: string;

  // Advanced Pro Pitch Modeling (Pitching+, Stuff+)
  stuffPlus?: string;
  locationPlus?: string;
  pitchingPlus?: string;

  // Ball-Flight & Movement Shapes (TrackMan / Hawkeye)
  inducedVertBreak?: string; // IVB in inches
  horizontalBreak?: string;  // HB in inches
  vertApproachAngle?: string;// VAA in degrees

  // Biomechanics & Release Consistency
  releaseExtension?: string; // Release Extension in ft
  releaseHeight?: string;    // Release Height in ft

  // Command & Game Performance Ratios
  kPercentage?: string;        // K%
  bbPercentage?: string;       // BB%
  kMinusBbPercentage?: string; // K-BB%
}

const emptyProfile: AthleteProfile = {
  verificationStatus: "Pending",
  fullName: "",
  email: "",
  phone: "",
  college: "",
  state: "UT",
  position: "",
  collegeYear: "Freshman",
  playerStatus: "Incoming Freshman",
  verificationLink: "",
  height: "",
  weight: "",
  primaryRole: "HITTER",
  isProfileVisible: true,
  social1_Type: "X",
  social1_Url: "",
  social2_Type: "IG",
  social2_Url: "",
  maxExitVelo: "",
  ninetyEV: "",
  batSpeed: "",
  sixtyTime: "",
  recordedDateHitting: "",
  peakFB: "",
  sittingFB: "",
  offSpeedVelo: "",
  offSpeedType: "Slider",
  fbSpinRate: "",
  offSpeedSpinRate: "",
  firstPitchStrike: "",
  recordedDatePitching: "",
  stuffPlus: "",
  locationPlus: "",
  pitchingPlus: "",
  inducedVertBreak: "",
  horizontalBreak: "",
  vertApproachAngle: "",
  releaseExtension: "",
  releaseHeight: "",
  kPercentage: "",
  bbPercentage: "",
  kMinusBbPercentage: "",
};

// =========================================================================
// INSTANT MOBILE 4:5 SCOUT GRAPHIC ENGINE WITH PRO PITCHING MATRIX
// =========================================================================
async function triggerMobileScoutShare(athlete: AthleteProfile) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = 1080;
  canvas.height = 1350;

  // 1. Carbon Dark Base
  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border Frame
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 14;
  ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);

  // 2. Load & Draw Square 95x95 Logo
  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = "/logo.png";

  try {
    await logo.decode();
    const logoSize = 95;
    ctx.drawImage(logo, 80, 65, logoSize, logoSize);
  } catch (err) {
    ctx.fillStyle = "rgba(166, 255, 0, 0.08)";
    ctx.fillRect(80, 80, 440, 52);
    ctx.strokeStyle = "#a6ff00";
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, 440, 52);

    ctx.fillStyle = "#a6ff00";
    ctx.font = "900 20px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("THE DIAMOND COLLECTIVE", 100, 113);
  }

  // Verification Header Tag
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("VERIFIED SCOUT CARD", canvas.width - 80, 115);
  ctx.textAlign = "left";

  // 3. Athlete Bio & Physical Dimensions
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 66px -apple-system, BlinkMacSystemFont, sans-serif";
  const name = (athlete.fullName || "MEMBER ATHLETE").toUpperCase();
  ctx.fillText(name, 80, 230);

  ctx.fillStyle = "#a6ff00";
  ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`🏛️ ${athlete.college || "Undeclared College"} ${athlete.state ? `(${athlete.state})` : ""}`, 80, 285);

  const physicalTag = athlete.height && athlete.weight ? ` • ${athlete.height} / ${athlete.weight} lbs` : (athlete.height ? ` • ${athlete.height}` : "");
  ctx.fillStyle = "#aaaaaa";
  ctx.font = "600 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${athlete.position || "ATH"}${physicalTag} • ${athlete.playerStatus || "Active Roster"}`, 80, 330);

  // Divider
  ctx.strokeStyle = "#222222";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(80, 370);
  ctx.lineTo(canvas.width - 80, 370);
  ctx.stroke();

  // 4. Metric Grid Prioritization (Pro Pitch Modeling & Ball Shape)
  const isPitcher = athlete.primaryRole === "PITCHER" || athlete.primaryRole === "TWP";
  const isHitter = athlete.primaryRole === "HITTER" || athlete.primaryRole === "TWP";

  const metrics: { label: string; val: string; sub?: string }[] = [];

  if (isPitcher) {
    if (athlete.peakFB) metrics.push({ label: "PEAK FASTBALL", val: `${athlete.peakFB} MPH`, sub: athlete.sittingFB ? `Sitting ${athlete.sittingFB}` : undefined });
    if (athlete.stuffPlus) metrics.push({ label: "STUFF+ GRADE", val: athlete.stuffPlus, sub: "100 = League Avg" });
    if (athlete.inducedVertBreak) metrics.push({ label: "INDUCED VERT BREAK", val: `${athlete.inducedVertBreak}"`, sub: "Carry & Rise" });
    if (athlete.fbSpinRate) metrics.push({ label: "FB SPIN RATE", val: `${athlete.fbSpinRate} RPM` });
    if (athlete.releaseExtension) metrics.push({ label: "RELEASE EXTENSION", val: `${athlete.releaseExtension} FT`, sub: "Perceived Velo" });
    if (athlete.kMinusBbPercentage) metrics.push({ label: "K - BB COMMAND %", val: `${athlete.kMinusBbPercentage}%` });
    if (athlete.offSpeedVelo) metrics.push({ label: `${(athlete.offSpeedType || "SLIDER").toUpperCase()} VELO`, val: `${athlete.offSpeedVelo} MPH` });
    if (athlete.vertApproachAngle) metrics.push({ label: "VERT APPROACH ANGLE", val: `${athlete.vertApproachAngle}°` });
    if (athlete.pitchingPlus) metrics.push({ label: "PITCHING+ ARSENAL", val: athlete.pitchingPlus });
    if (athlete.firstPitchStrike) metrics.push({ label: "1ST PITCH STRIKE", val: `${athlete.firstPitchStrike}%` });
  }

  if (isHitter) {
    if (athlete.maxExitVelo) metrics.push({ label: "MAX EXIT VELO", val: `${athlete.maxExitVelo} MPH` });
    if (athlete.ninetyEV) metrics.push({ label: "90TH% EXIT VELO", val: `${athlete.ninetyEV} MPH` });
    if (athlete.batSpeed) metrics.push({ label: "BAT SPEED", val: `${athlete.batSpeed} MPH` });
    if (athlete.sixtyTime) metrics.push({ label: "60-YARD DASH", val: `${athlete.sixtyTime}s` });
  }

  // Draw 2x2 Metric Grid Boxes (Top 4 highlights)
  const startY = 410;
  const boxW = 430;
  const boxH = 180;
  const gap = 30;

  metrics.slice(0, 4).forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 80 + col * (boxW + gap + 30);
    const y = startY + row * (boxH + gap);

    ctx.fillStyle = "#111111";
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = "#222222";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boxW, boxH);

    ctx.fillStyle = "#888888";
    ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(m.label, x + 24, y + 44);

    ctx.fillStyle = "#a6ff00";
    ctx.font = "900 48px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(m.val, x + 24, y + 106);

    if (m.sub) {
      ctx.fillStyle = "#666666";
      ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(m.sub, x + 24, y + 148);
    }
  });

  // 5. Verification Registry Stamp
  ctx.fillStyle = "#111111";
  ctx.fillRect(80, 890, canvas.width - 160, 260);
  ctx.strokeStyle = "#1f1f1f";
  ctx.strokeRect(80, 890, canvas.width - 160, 260);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("HONOR-CODE VERIFIED DATA REGISTRY", 120, 950);

  ctx.fillStyle = "#888888";
  ctx.font = "400 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("TrackMan, Hawkeye, and verified metrics published on National Scoreboard.", 120, 995);
  ctx.fillText("Direct scout verification & NIL access powered by Slugger Coin ($SLUG).", 120, 1030);

  if (athlete.social1_Url || athlete.social2_Url) {
    ctx.fillStyle = "#a6ff00";
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(`Scout Gateway: ${athlete.social1_Url || athlete.social2_Url}`, 120, 1095);
  }

  // 6. Bottom Domain Stamp
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SLUGGERCOIN.COM/SCOREBOARD", canvas.width / 2, 1260);

  ctx.fillStyle = "#555555";
  ctx.font = "600 16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("THE DIAMOND COLLECTIVE • ALL RIGHTS RESERVED", canvas.width / 2, 1295);

  // 7. Mobile First: Open Phone Share Drawer
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const cleanName = (athlete.fullName || "athlete").replace(/\s+/g, "_");
    const fileName = `${cleanName}_ScoutCard.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `${athlete.fullName} Scout Card`,
          text: `Check out my verified pitching & scouting metrics on The Diamond Collective Scoreboard!`,
        });
        return;
      } catch {
        return;
      }
    }

    // Direct download fallback
    const link = document.createElement("a");
    link.download = fileName;
    link.href = URL.createObjectURL(blob);
    link.click();
  }, "image/png");
}

function AppContent() {
  const account = useActiveAccount();
  const { connect } = useConnectModal();
  const [justClaimed, setJustClaimed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [activeMainTab, setActiveMainTab] = useState<"EXCHANGE" | "SCOREBOARD">("SCOREBOARD");
  
  const [roleFilter, setRoleFilter] = useState<"ALL" | "HITTER" | "PITCHER" | "TWP">("ALL");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "MAX_EV" | "PEAK_FB" | "STUFF_PLUS" | "IVB">("DEFAULT");

  const [leaderboardRows, setLeaderboardRows] = useState<AthleteProfile[]>([]);
  const [loadingScoreboard, setLoadingScoreboard] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dispatchedBrand, setDispatchedBrand] = useState<BrandItem | null>(null);
  const [isLockoutModal, setIsLockoutModal] = useState(false);
  const [profile, setProfile] = useState<AthleteProfile>(emptyProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
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
  const hasProfile = Boolean(profile.fullName && profile.email);

  const isIntroActive = (brandName: string): boolean => {
    const timestamp = introTimestamps[brandName];
    if (!timestamp) return false;
    return Date.now() - timestamp < SIXTY_DAYS_MS;
  };

  const getDaysRemaining = (brandName: string): number => {
    const timestamp = introTimestamps[brandName];
    if (!timestamp) return 0;
    const elapsed = Date.now() - timestamp;
    const remainingMs = SIXTY_DAYS_MS - elapsed;
    return Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  };

  useEffect(() => {
    const sheetUrl = 
      process.env.NEXT_PUBLIC_SCOUTING_SHEET_URL || 
      "https://script.google.com/macros/s/AKfycbxhwqCXDFPT0C1I4Zt-ASCpUVbkD9piI-_7pO1Dx5WhHG3JtMrgxm-N1kn4zhKbOXRzIA/exec";

    if (sheetUrl) {
      setLoadingScoreboard(true);
      fetch(sheetUrl)
        .then((res) => res.json())
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: AthleteProfile[] = data.map((item) => {
              const nameFromEmail = item.athleteEmail ? item.athleteEmail.split("@")[0] : "Member Athlete";
              const rawRole = (item.primaryRole || "HITTER").toUpperCase();
              const validRole = rawRole === "PITCHER" || rawRole === "TWP" ? rawRole : "HITTER";

              return {
                ...emptyProfile,
                fullName: item.fullName && item.fullName.trim() !== "" ? item.fullName : nameFromEmail,
                email: item.athleteEmail || item.email || "",
                college: item.currentCollege || item.college || "Undeclared",
                state: item.state || "",
                position: item.position || validRole,
                primaryRole: validRole as "HITTER" | "PITCHER" | "TWP",
                playerStatus: item.portalStatus || item.playerStatus || "Active",
                isProfileVisible: String(item.isProfileVisible).toUpperCase() !== "FALSE",
                height: item.height ? String(item.height) : "",
                weight: item.weight ? String(item.weight) : "",
                maxExitVelo: item.maxExitVelo ? String(item.maxExitVelo) : "",
                ninetyEV: item.ninetyEV ? String(item.ninetyEV) : "",
                batSpeed: item.batSpeed ? String(item.batSpeed) : "",
                sixtyTime: item.sixtyTime ? String(item.sixtyTime) : "",
                peakFB: item.peakFB ? String(item.peakFB) : "",
                sittingFB: item.sittingFB ? String(item.sittingFB) : "",
                offSpeedVelo: item.offSpeedVelo ? String(item.offSpeedVelo) : "",
                offSpeedType: item.offSpeedType || "Slider",
                fbSpinRate: item.fbSpinRate ? String(item.fbSpinRate) : "",
                offSpeedSpinRate: item.offSpeedSpinRate ? String(item.offSpeedSpinRate) : "",
                firstPitchStrike: item.firstPitchStrike ? String(item.firstPitchStrike) : "",
                recordedDateHitting: item.recordedDateHitting || "",
                recordedDatePitching: item.recordedDatePitching || "",
                stuffPlus: item.stuffPlus ? String(item.stuffPlus) : "",
                locationPlus: item.locationPlus ? String(item.locationPlus) : "",
                pitchingPlus: item.pitchingPlus ? String(item.pitchingPlus) : "",
                inducedVertBreak: item.inducedVertBreak ? String(item.inducedVertBreak) : "",
                horizontalBreak: item.horizontalBreak ? String(item.horizontalBreak) : "",
                vertApproachAngle: item.vertApproachAngle ? String(item.vertApproachAngle) : "",
                releaseExtension: item.releaseExtension ? String(item.releaseExtension) : "",
                releaseHeight: item.releaseHeight ? String(item.releaseHeight) : "",
                kPercentage: item.kPercentage ? String(item.kPercentage) : "",
                bbPercentage: item.bbPercentage ? String(item.bbPercentage) : "",
                kMinusBbPercentage: item.kMinusBbPercentage ? String(item.kMinusBbPercentage) : "",
                social1_Type: item.social1_Type || "X",
                social1_Url: item.social1_Url || "",
                social2_Type: item.social2_Type || "IG",
                social2_Url: item.social2_Url || "",
              };
            });

            const uniqueMap = new Map();
            mapped.forEach((item) => {
              const key = (item.email || item.fullName).toLowerCase().trim();
              uniqueMap.set(key, item);
            });
            setLeaderboardRows(Array.from(uniqueMap.values()));
          }
          setLoadingScoreboard(false);
        })
        .catch(() => {
          setLoadingScoreboard(false);
        });
    }
  }, []);

  useEffect(() => {
    if (account?.address) {
      const lowerWallet = account.address.toLowerCase();
      const localKey = `athlete_profile_${lowerWallet}`;
      const localIntroKey = `athlete_intros_${lowerWallet}`;
      
      const savedLocal = localStorage.getItem(localKey);
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (parsed.fullName) setProfile((prev) => ({ ...prev, ...parsed }));
        } catch {}
      }

      const savedIntros = localStorage.getItem(localIntroKey);
      if (savedIntros) {
        try {
          const parsed = JSON.parse(savedIntros);
          const formatted: { [bName: string]: number } = {};
          Object.keys(parsed).forEach((k) => {
            formatted[k] = typeof parsed[k] === "number" ? parsed[k] : Date.now();
          });
          setIntroTimestamps(formatted);
        } catch {}
      }

      const callbackName = `cb_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      (window as any)[callbackName] = (data: any) => {
        if (data && data.profile && data.profile.fullName) {
          setProfile((prev) => ({ ...prev, ...data.profile }));
          localStorage.setItem(localKey, JSON.stringify(data.profile));
        }

        if (data && data.existingIntros) {
          const introsMap: { [brandName: string]: number } = {};
          Object.keys(data.existingIntros).forEach((bName: string) => {
            introsMap[bName] = Number(data.existingIntros[bName]);
          });
          setIntroTimestamps((prev) => {
            const updated = { ...prev, ...introsMap };
            localStorage.setItem(localIntroKey, JSON.stringify(updated));
            return updated;
          });
        }

        try {
          delete (window as any)[callbackName];
          const elem = document.getElementById(callbackName);
          if (elem) elem.remove();
        } catch {}
      };

      const script = document.createElement("script");
      script.id = callbackName;
      script.src = `${GOOGLE_SCRIPT_URL}?walletAddress=${encodeURIComponent(lowerWallet)}&callback=${callbackName}&_t=${Date.now()}`;
      document.body.appendChild(script);
    }
  }, [account?.address]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account?.address) return;
    setIsSavingProfile(true);

    const lowerWallet = account.address.toLowerCase();
    const localKey = `athlete_profile_${lowerWallet}`;
    
    const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    
    // Auto-calculate K-BB% if both are provided
    let computedKminusBB = profile.kMinusBbPercentage;
    if (profile.kPercentage && profile.bbPercentage && !computedKminusBB) {
      computedKminusBB = (parseFloat(profile.kPercentage) - parseFloat(profile.bbPercentage)).toFixed(1);
    }

    const updatedProfile: AthleteProfile = {
      ...profile,
      kMinusBbPercentage: computedKminusBB,
      recordedDateHitting: profile.maxExitVelo ? (profile.recordedDateHitting || today) : "",
      recordedDatePitching: (profile.peakFB || profile.stuffPlus) ? (profile.recordedDatePitching || today) : "",
    };

    setProfile(updatedProfile);
    localStorage.setItem(localKey, JSON.stringify(updatedProfile));

    setLeaderboardRows((prev) => {
      const exists = prev.some((p) => p.email.toLowerCase() === updatedProfile.email.toLowerCase() || p.fullName.toLowerCase() === updatedProfile.fullName.toLowerCase());
      if (exists) {
        return prev.map((p) => (p.email.toLowerCase() === updatedProfile.email.toLowerCase() || p.fullName.toLowerCase() === updatedProfile.fullName.toLowerCase() ? updatedProfile : p));
      }
      return [updatedProfile, ...prev];
    });

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "saveProfile",
          walletAddress: lowerWallet,
          ...updatedProfile,
        }),
      });

      setIsSavingProfile(false);
      setShowProfileModal(false);
      alert("Pro metrics saved to national scoreboard!");
    } catch {
      setIsSavingProfile(false);
      setShowProfileModal(false);
      alert("Metrics saved locally.");
    }
  };

  const handleRequestIntro = async (brand: BrandItem) => {
    if (isIntroActive(brand.name)) {
      setDispatchedBrand(brand);
      setIsLockoutModal(true);
      return;
    }

    if (!profile.fullName || !profile.email) {
      setShowProfileModal(true);
      return;
    }

    const now = Date.now();
    const lowerWallet = account?.address?.toLowerCase() || "";
    const localIntroKey = `athlete_intros_${lowerWallet}`;
    setIntroTimestamps((prev) => {
      const updated = { ...prev, [brand.name]: now };
      localStorage.setItem(localIntroKey, JSON.stringify(updated));
      return updated;
    });

    setDispatchedBrand(brand);
    setIsLockoutModal(false);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
          action: "requestIntro",
          walletAddress: lowerWallet,
          brandName: brand.name,
          brandRepEmail: brand.brandRepEmail,
          brandRepName: brand.brandRepName,
          ...profile,
        }),
      });
    } catch {}
  };

  const filteredScoreboard = useMemo(() => {
    return leaderboardRows
      .filter((ath) => {
        if (ath.isProfileVisible === false) return false;
        
        if (roleFilter !== "ALL") {
          if (roleFilter === "TWP" && ath.primaryRole !== "TWP") return false;
          if (roleFilter === "HITTER" && ath.primaryRole !== "HITTER" && ath.primaryRole !== "TWP") return false;
          if (roleFilter === "PITCHER" && ath.primaryRole !== "PITCHER" && ath.primaryRole !== "TWP") return false;
        }
        
        if (positionFilter !== "ALL" && ath.position) {
          const p = ath.position.toUpperCase();
          if (!p.includes(positionFilter.toUpperCase())) return false;
        }

        if (statusFilter !== "ALL" && ath.playerStatus) {
          if (!ath.playerStatus.toLowerCase().includes(statusFilter.toLowerCase())) {
            return false;
          }
        }

        if (stateFilter !== "ALL" && ath.state && ath.state.trim() !== "") {
          if (ath.state.toUpperCase() !== stateFilter.toUpperCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "MAX_EV") {
          return (parseFloat(b.maxExitVelo || "0") || 0) - (parseFloat(a.maxExitVelo || "0") || 0);
        }
        if (sortBy === "PEAK_FB") {
          return (parseFloat(b.peakFB || "0") || 0) - (parseFloat(a.peakFB || "0") || 0);
        }
        if (sortBy === "STUFF_PLUS") {
          return (parseFloat(b.stuffPlus || "0") || 0) - (parseFloat(a.stuffPlus || "0") || 0);
        }
        if (sortBy === "IVB") {
          return (parseFloat(b.inducedVertBreak || "0") || 0) - (parseFloat(a.inducedVertBreak || "0") || 0);
        }
        return 0;
      });
  }, [leaderboardRows, roleFilter, positionFilter, statusFilter, stateFilter, sortBy]);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Compliance Header */}
      <div style={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "10px 16px", textAlign: "center", fontSize: "11px", color: "#888888", letterSpacing: "0.5px", lineHeight: "1.4" }}>
        <strong style={{ color: "#ffffff" }}>NCAA NIL Compliance Note:</strong> All SLUGGER COINS distributed during the Founders phase have no current market value and are non-compensatory. Tokens are issued solely for community participation and access purposes.
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 16px" }}>
        {/* Navigation */}
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          borderBottom: "1px solid #1a1a1a", 
          paddingBottom: "20px", 
          flexWrap: "wrap", 
          gap: "14px" 
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", letterSpacing: "1.5px", color: "#ffffff", textTransform: "uppercase" }}>
              The Diamond Collective
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: NEON_GREEN, fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
              Powered by Slugger Coin ($SLUG)
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {account && (
              <div style={{
                backgroundColor: "#0d0d0d",
                border: `1px solid ${NEON_GREEN}`,
                borderRadius: "10px",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN }}>
                  🪙 {balance !== undefined ? balance.toLocaleString() : "0"} $SLUG
                </span>
              </div>
            )}

            {account && (
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  backgroundColor: "#111111",
                  border: `1px solid ${NEON_GREEN}`,
                  color: NEON_GREEN,
                  fontSize: "11px",
                  fontWeight: "800",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}
              >
                Locker Matrix ⚙️
              </button>
            )}

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

        {/* STATS TRACKER */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", margin: "24px 0 28px 0" }}>
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "18px", fontWeight: "900", color: NEON_GREEN }}>15+</span>
            <span style={{ fontSize: "10px", color: "#888888", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Brand Partners</span>
          </div>
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "18px", fontWeight: "900", color: "#ffffff" }}>Drop #001</span>
            <span style={{ fontSize: "10px", color: "#888888", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>60 Grips Live</span>
          </div>
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "18px", fontWeight: "900", color: NEON_GREEN }}>100 $SLUG</span>
            <span style={{ fontSize: "10px", color: "#888888", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Free Allocation</span>
          </div>
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: "18px", fontWeight: "900", color: "#ffffff" }}>
              {totalSupplyData !== undefined ? `${remainingPercentage}% Remaining` : "Live Sync..."}
            </span>
            <span style={{ fontSize: "10px", color: "#888888", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>Founders Phase</span>
          </div>
        </div>

        {/* 50/50 PRIMARY NAV SPLIT */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
          <button
            onClick={() => setActiveMainTab("SCOREBOARD")}
            style={{
              backgroundColor: activeMainTab === "SCOREBOARD" ? "#111111" : "#050505",
              border: activeMainTab === "SCOREBOARD" ? `2px solid ${NEON_GREEN}` : "1px solid #222222",
              boxShadow: activeMainTab === "SCOREBOARD" ? `0 0 25px rgba(166, 255, 0, 0.15)` : "none",
              borderRadius: "16px",
              padding: "16px 12px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ display: "block", fontSize: "10px", fontWeight: "900", color: NEON_GREEN, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>
              Scouting & Portal
            </span>
            <span style={{ display: "block", fontSize: "16px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              📊 National Scoreboard
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab("EXCHANGE")}
            style={{
              backgroundColor: activeMainTab === "EXCHANGE" ? "#111111" : "#050505",
              border: activeMainTab === "EXCHANGE" ? `2px solid ${NEON_GREEN}` : "1px solid #222222",
              boxShadow: activeMainTab === "EXCHANGE" ? `0 0 25px rgba(166, 255, 0, 0.15)` : "none",
              borderRadius: "16px",
              padding: "16px 12px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ display: "block", fontSize: "10px", fontWeight: "900", color: NEON_GREEN, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>
              Monetization & Gear
            </span>
            <span style={{ display: "block", fontSize: "16px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              🤝 The Brand Dugout
            </span>
          </button>
        </div>

        {/* PILLAR 1: THE NATIONAL SCOUTING SCOREBOARD */}
        {activeMainTab === "SCOREBOARD" && (
          <section style={{ marginBottom: "60px" }}>
            <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "24px 18px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
                <div>
                  <div style={{ display: "inline-block", backgroundColor: "rgba(166, 255, 0, 0.08)", border: `1px solid ${NEON_GREEN}`, borderRadius: "999px", padding: "4px 12px", fontSize: "10px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                    Verified Collegiate Data Registry
                  </div>
                  <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    National Scouting Scoreboard
                  </h2>
                  <p style={{ fontSize: "13px", color: "#a1a1aa", maxWidth: "680px", margin: 0, lineHeight: "1.5" }}>
                    Direct scout discovery for active college ballplayers and transfer portal candidates. Filter verified bat speeds, pitch modeling (Stuff+), IVB, and release extension.
                  </p>
                </div>

                <button
                  onClick={() => (account ? setShowProfileModal(true) : handleOpenLogin())}
                  style={{
                    backgroundColor: NEON_GREEN,
                    color: "#000000",
                    fontWeight: "900",
                    padding: "12px 20px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    whiteSpace: "nowrap"
                  }}
                >
                  {account ? "Update My Metrics ➔" : "Sign In to Post Data ➔"}
                </button>
              </div>

              {/* ROLE TOGGLE PILLS */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {(["ALL", "HITTER", "PITCHER", "TWP"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    style={{
                      backgroundColor: roleFilter === r ? NEON_GREEN : "#141414",
                      color: roleFilter === r ? "#000000" : "#cccccc",
                      border: roleFilter === r ? `1px solid ${NEON_GREEN}` : "1px solid #262626",
                      fontWeight: "800",
                      fontSize: "11px",
                      padding: "7px 14px",
                      borderRadius: "999px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      cursor: "pointer",
                    }}
                  >
                    {r === "TWP" ? "⚡ Two-Way" : r === "ALL" ? "All Athletes" : `${r}s`}
                  </button>
                ))}
              </div>

              {/* ADVANCED FILTER BAR WITH PRO METRIC SORT */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", backgroundColor: "#050505", border: "1px solid #161616", borderRadius: "14px", padding: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#666", textTransform: "uppercase", marginBottom: "3px" }}>Position</label>
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#111", border: "1px solid #262626", color: "#fff", padding: "6px 8px", borderRadius: "8px", fontSize: "11px" }}
                  >
                    <option value="ALL">All Positions</option>
                    <option value="RHP">RHP</option>
                    <option value="LHP">LHP</option>
                    <option value="C">Catcher (C)</option>
                    <option value="MIF">Middle Inf (MIF)</option>
                    <option value="SS">Shortstop (SS)</option>
                    <option value="3B">Third Base (3B)</option>
                    <option value="1B">First Base (1B)</option>
                    <option value="OF">Outfield (OF)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#666", textTransform: "uppercase", marginBottom: "3px" }}>Portal Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#111", border: "1px solid #262626", color: "#fff", padding: "6px 8px", borderRadius: "8px", fontSize: "11px" }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Transfer Portal">Transfer Portal</option>
                    <option value="Juco Uncommitted">Juco Uncommitted</option>
                    <option value="Returning">Returning College</option>
                    <option value="Incoming Freshman">Incoming Freshman</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#666", textTransform: "uppercase", marginBottom: "3px" }}>Region / State</label>
                  <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#111", border: "1px solid #262626", color: "#fff", padding: "6px 8px", borderRadius: "8px", fontSize: "11px" }}
                  >
                    <option value="ALL">All States</option>
                    <option value="UT">Utah (UT)</option>
                    <option value="AZ">Arizona (AZ)</option>
                    <option value="CA">California (CA)</option>
                    <option value="TX">Texas (TX)</option>
                    <option value="FL">Florida (FL)</option>
                    <option value="NV">Nevada (NV)</option>
                    <option value="CO">Colorado (CO)</option>
                    <option value="ID">Idaho (ID)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, textTransform: "uppercase", marginBottom: "3px" }}>Sort Leaderboard</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{ width: "100%", backgroundColor: "#111", border: `1px solid rgba(166, 255, 0, 0.4)`, color: NEON_GREEN, fontWeight: "700", padding: "6px 8px", borderRadius: "8px", fontSize: "11px" }}
                  >
                    <option value="DEFAULT">Latest Update</option>
                    <option value="PEAK_FB">Peak Fastball ↓</option>
                    <option value="STUFF_PLUS">Stuff+ Grade ↓</option>
                    <option value="IVB">Induced Vert Break (IVB) ↓</option>
                    <option value="MAX_EV">Max Exit Velo ↓</option>
                  </select>
                </div>
              </div>
            </div>

            {/* RESPONSIVE SCOREBOARD CONTAINER */}
            <div style={{ width: "100%" }}>
              {filteredScoreboard.length === 0 ? (
                <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "16px", padding: "40px 20px", textAlign: "center", color: "#666666" }}>
                  {loadingScoreboard ? "Loading live national scoreboard..." : "No athletes match these filter criteria. Reset filters to view all."}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {filteredScoreboard.map((ath, idx) => {
                    const isTWP = ath.primaryRole === "TWP";
                    const isPitcher = ath.primaryRole === "PITCHER" || isTWP;
                    const isHitter = ath.primaryRole === "HITTER" || isTWP;

                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "#0a0a0a",
                          border: "1px solid #1c1c1c",
                          borderRadius: "16px",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                          <div>
                            <div style={{ fontWeight: "900", color: "#ffffff", fontSize: "16px", letterSpacing: "0.3px" }}>
                              {ath.fullName || "Member Athlete"}
                            </div>
                            <div style={{ color: NEON_GREEN, fontSize: "13px", fontWeight: "800", marginTop: "2px" }}>
                              🏛️ {ath.college || "Undeclared College"} {ath.state ? `(${ath.state})` : ""}
                            </div>
                            <div style={{ color: "#888888", fontSize: "11px", marginTop: "2px" }}>
                              <strong style={{ color: "#cccccc" }}>{ath.position}</strong>
                              {ath.height && ath.weight && <span> • {ath.height}, {ath.weight} lbs</span>}
                              <span> • {ath.playerStatus}</span>
                            </div>
                          </div>

                          <div>
                            {isTWP ? (
                              <span style={{ backgroundColor: "rgba(166, 255, 0, 0.15)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "4px 8px", borderRadius: "999px", fontSize: "9px", fontWeight: "900", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                ⚡ TWO-WAY
                              </span>
                            ) : (
                              <span style={{ backgroundColor: "#171717", border: "1px solid #2a2a2a", color: "#cccccc", padding: "4px 8px", borderRadius: "999px", fontSize: "9px", fontWeight: "800", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                {ath.primaryRole}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Performance Data Matrix */}
                        <div style={{ backgroundColor: "#050505", border: "1px solid #161616", borderRadius: "10px", padding: "12px", display: "grid", gridTemplateColumns: isTWP ? "1fr 1fr" : "1fr", gap: "12px", fontFamily: "monospace" }}>
                          {isPitcher && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "9px", color: "#888", textTransform: "uppercase", fontWeight: "800" }}>Pitching & Modeling</span>
                                {ath.stuffPlus && (
                                  <span style={{ backgroundColor: "rgba(166, 255, 0, 0.1)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "900" }}>
                                    Stuff+ {ath.stuffPlus}
                                  </span>
                                )}
                              </div>

                              <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>
                                <span style={{ color: NEON_GREEN }}>FB:</span> {ath.peakFB ? `${ath.peakFB} mph` : "Unrecorded"} {ath.sittingFB ? `(${ath.sittingFB})` : ""}
                                {ath.fbSpinRate && <span style={{ color: "#888", fontWeight: "400", fontSize: "11px" }}> • {ath.fbSpinRate} RPM</span>}
                              </div>

                              {/* Flight & Release Analytics Pill Grid */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "10px", color: "#cccccc" }}>
                                {ath.inducedVertBreak && <span style={{ backgroundColor: "#121212", border: "1px solid #222", padding: "3px 6px", borderRadius: "4px" }}>IVB: <strong style={{ color: NEON_GREEN }}>{ath.inducedVertBreak}"</strong></span>}
                                {ath.horizontalBreak && <span style={{ backgroundColor: "#121212", border: "1px solid #222", padding: "3px 6px", borderRadius: "4px" }}>HB: <strong>{ath.horizontalBreak}"</strong></span>}
                                {ath.releaseExtension && <span style={{ backgroundColor: "#121212", border: "1px solid #222", padding: "3px 6px", borderRadius: "4px" }}>Ext: <strong>{ath.releaseExtension}ft</strong></span>}
                                {ath.vertApproachAngle && <span style={{ backgroundColor: "#121212", border: "1px solid #222", padding: "3px 6px", borderRadius: "4px" }}>VAA: <strong>{ath.vertApproachAngle}°</strong></span>}
                                {ath.kMinusBbPercentage && <span style={{ backgroundColor: "#121212", border: "1px solid #222", padding: "3px 6px", borderRadius: "4px" }}>K-BB: <strong style={{ color: NEON_GREEN }}>{ath.kMinusBbPercentage}%</strong></span>}
                              </div>

                              {ath.offSpeedVelo && (
                                <div style={{ color: "#888888", fontSize: "11px" }}>
                                  {ath.offSpeedType || "SL"}: {ath.offSpeedVelo} mph {ath.offSpeedSpinRate ? `(${ath.offSpeedSpinRate} RPM)` : ""}
                                </div>
                              )}
                            </div>
                          )}

                          {isHitter && (
                            <div>
                              <div style={{ fontSize: "9px", color: "#666666", textTransform: "uppercase", marginBottom: "3px", fontWeight: "700" }}>Hitting Metrics</div>
                              {ath.maxExitVelo ? (
                                <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>
                                  <span style={{ color: NEON_GREEN }}>Max EV:</span> {ath.maxExitVelo} mph
                                </div>
                              ) : (
                                <div style={{ color: "#444444", fontSize: "11px" }}>EV: Unrecorded</div>
                              )}
                              {ath.ninetyEV && <div style={{ color: "#aaaaaa", fontSize: "11px" }}>90th%: {ath.ninetyEV} mph</div>}
                              {ath.batSpeed && <div style={{ color: "#888888", fontSize: "11px" }}>Bat Speed: {ath.batSpeed} mph</div>}
                              {ath.sixtyTime && <div style={{ color: "#888888", fontSize: "11px" }}>60-Yard: {ath.sixtyTime}s</div>}
                            </div>
                          )}
                        </div>

                        {/* Footer: Date Stamp, Native Mobile 4:5 Card Share & Socials */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px", flexWrap: "wrap", gap: "8px" }}>
                          <div style={{ fontSize: "10px", color: "#666666", fontFamily: "monospace" }}>
                            {ath.recordedDatePitching && <span>Pitch: {ath.recordedDatePitching} </span>}
                            {ath.recordedDateHitting && <span>Hit: {ath.recordedDateHitting}</span>}
                            {!ath.recordedDatePitching && !ath.recordedDateHitting && <span>Member Verified</span>}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              onClick={() => triggerMobileScoutShare(ath)}
                              style={{
                                backgroundColor: "rgba(166, 255, 0, 0.1)",
                                border: `1px solid ${NEON_GREEN}`,
                                color: NEON_GREEN,
                                padding: "6px 12px",
                                borderRadius: "8px",
                                fontSize: "11px",
                                fontWeight: "800",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                whiteSpace: "nowrap"
                              }}
                            >
                              <span>Share 4:5 Card</span>
                              <span>📸</span>
                            </button>

                            {ath.social1_Url && (
                              <a
                                href={ath.social1_Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: "#141414", border: "1px solid #2a2a2a", color: NEON_GREEN, padding: "6px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "800" }}
                              >
                                {ath.social1_Type || "Social 1"} ↗
                              </a>
                            )}
                            {ath.social2_Url && (
                              <a
                                href={ath.social2_Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: "#141414", border: "1px solid #2a2a2a", color: NEON_GREEN, padding: "6px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "800" }}
                              >
                                {ath.social2_Type || "Social 2"} ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* PILLAR 2: THE BRAND EXCHANGE & MONETIZATION */}
        {activeMainTab === "EXCHANGE" && (
          <div>
            {!account ? (
              <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #222222", borderRadius: "20px", padding: "24px 20px", textAlign: "center", maxWidth: "680px", margin: "0 auto 36px auto" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "900", margin: "0 0 6px 0", color: "#ffffff", textTransform: "uppercase" }}>
                  Active College Ballplayer?
                </h3>
                <p style={{ fontSize: "13px", color: "#888888", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                  Sign in with your Google, Apple, or phone ID to unlock direct intro requests and claim 100 $SLUG.
                </p>
                <button
                  onClick={handleOpenLogin}
                  style={{ backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.8px", padding: "12px 24px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "12px" }}
                >
                  Athlete Sign In ➔
                </button>
              </div>
            ) : !hasProfile ? (
              <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "20px", padding: "24px 20px", textAlign: "center", maxWidth: "680px", margin: "0 auto 36px auto" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "900", margin: "0 0 6px 0", color: "#ffffff", textTransform: "uppercase" }}>
                  Complete Roster Verification
                </h3>
                <p style={{ fontSize: "13px", color: "#888888", margin: "0 0 16px 0" }}>
                  Submit your college bio to enable 1-click Direct Intros with our brand network.
                </p>
                <button
                  onClick={() => setShowProfileModal(true)}
                  style={{ backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.8px", padding: "12px 24px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "12px" }}
                >
                  Fill Out Locker Profile ✍️
                </button>
              </div>
            ) : !isUnlocked ? (
              <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "20px", padding: "24px 20px", textAlign: "center", maxWidth: "680px", margin: "0 auto 36px auto" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "900", margin: "0 0 6px 0", color: "#ffffff", textTransform: "uppercase" }}>
                  Claim Your 100 Slugger Coins
                </h3>
                <p style={{ fontSize: "13px", color: "#888888", margin: "0 0 16px 0" }}>
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
                  style={{ backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", padding: "12px 24px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px" }}
                >
                  Claim 100 Free Slugger Coins
                </TransactionButton>
              </div>
            ) : null}

            {/* Member Drop Banner */}
            <div style={{ 
              backgroundColor: "#0d0d0d", 
              border: `2px solid ${NEON_GREEN}`, 
              borderRadius: "20px", 
              padding: "24px", 
              marginBottom: "40px", 
              boxShadow: "0 0 30px rgba(166, 255, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px"
            }}>
              <div style={{ flex: "1 1 320px" }}>
                <span style={{ backgroundColor: NEON_GREEN, color: "#000000", fontSize: "10px", fontWeight: "900", padding: "4px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "1px", display: "inline-block", marginBottom: "8px" }}>
                  Member Drop #001
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "0 0 4px 0", textTransform: "uppercase" }}>
                  "The Big Black Grip" Bat Grip ($0.00 Free)
                </h3>
                <p style={{ fontSize: "13px", color: "#a1a1aa", margin: 0, lineHeight: "1.4" }}>
                  Seamless pro bat grip free for college ballplayers. Just cover flat $8.99 USPS postage.
                </p>
              </div>

              <a
                href={STRIPE_GRIP_DROP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: NEON_GREEN,
                  color: "#000000",
                  fontWeight: "900",
                  padding: "12px 22px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  textDecoration: "none",
                  whiteSpace: "nowrap"
                }}
              >
                Claim Free Grip ($8.99 S&H) ↗
              </a>
            </div>

            {/* Brand Directory */}
            <div style={{ display: "flex", flexDirection: "column", gap: "36px" }}>
              {MARKET_SECTIONS.filter((s) => s.brands.length > 0).map((section, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    backgroundColor: "#0d0d0d",
                    border: "1px solid #1f1f1f",
                    borderLeft: `4px solid ${NEON_GREEN}`,
                    borderRadius: "12px",
                    padding: "12px 16px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "18px" }}>{section.emoji}</span>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.8px", color: "#ffffff" }}>
                        {section.title}
                      </h3>
                    </div>
                    <span style={{ fontSize: "10px", color: "#888888", fontWeight: "800", textTransform: "uppercase" }}>
                      {section.brands.length} {section.brands.length === 1 ? "Partner" : "Partners"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                    {section.brands.map((brand, bIdx) => {
                      const isDirectIntro = brand.type === "email_intro";
                      const activeIntro = isIntroActive(brand.name);

                      return (
                        <div 
                          key={bIdx}
                          style={{ 
                            backgroundColor: "#0a0a0a", 
                            border: isDirectIntro ? `1px solid rgba(166, 255, 0, 0.4)` : "1px solid #1a1a1a", 
                            borderRadius: "14px", 
                            padding: "20px", 
                            display: "flex", 
                            flexDirection: "column", 
                            justifyContent: "space-between" 
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                              <span style={{ fontSize: "10px", fontWeight: "900", color: isDirectIntro ? NEON_GREEN : "#888888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                {isDirectIntro ? "⚡ DIRECT PARTNER INTRO" : "PORTAL COLLAB"}
                              </span>
                              {isDirectIntro && (
                                <span style={{ backgroundColor: "rgba(166, 255, 0, 0.1)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontSize: "8px", fontWeight: "900", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>
                                  Decision Maker Direct
                                </span>
                              )}
                            </div>
                            <h4 style={{ fontSize: "18px", fontWeight: "900", color: "#ffffff", margin: "0 0 6px 0", textTransform: "uppercase" }}>
                              {brand.name}
                            </h4>
                            <p style={{ fontSize: "12px", color: "#888888", lineHeight: "1.5", margin: 0 }}>
                              {brand.description}
                            </p>
                          </div>

                          {isDirectIntro ? (
                            <button
                              onClick={() => {
                                if (activeIntro) {
                                  setDispatchedBrand(brand);
                                  setIsLockoutModal(true);
                                  return;
                                }
                                if (!account) {
                                  handleOpenLogin();
                                } else if (!hasProfile) {
                                  setShowProfileModal(true);
                                } else {
                                  handleRequestIntro(brand);
                                }
                              }}
                              style={{ 
                                width: "100%",
                                backgroundColor: activeIntro ? "#18181b" : NEON_GREEN, 
                                color: activeIntro ? "#71717a" : "#000000", 
                                border: activeIntro ? "1px solid #27272a" : "none", 
                                fontWeight: "900", 
                                padding: "12px", 
                                borderRadius: "8px", 
                                fontSize: "11px", 
                                textTransform: "uppercase", 
                                letterSpacing: "0.8px", 
                                cursor: "pointer", 
                                marginTop: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px"
                              }}
                            >
                              {activeIntro ? (
                                <>
                                  <span>🔒 Intro Dispatched</span>
                                  <span style={{ fontSize: "10px", color: "#a1a1aa" }}>({getDaysRemaining(brand.name)}d left)</span>
                                </>
                              ) : !account ? (
                                "Sign In to Request Intro ⚡"
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
                                fontWeight: "800", 
                                padding: "12px", 
                                borderRadius: "8px", 
                                fontSize: "11px", 
                                textTransform: "uppercase", 
                                letterSpacing: "0.8px", 
                                textDecoration: "none", 
                                marginTop: "18px" 
                              }}
                            >
                              {brand.buttonText}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
      </div>

      {/* 60-DAY LOCKOUT NOTIFICATION MODAL */}
      {dispatchedBrand && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, padding: "16px" }}>
          <div style={{ backgroundColor: "#0d0d0d", border: `2px solid ${isLockoutModal ? "#eab308" : NEON_GREEN}`, borderRadius: "24px", width: "100%", maxWidth: "520px", padding: "30px 26px", boxShadow: isLockoutModal ? "0 0 45px rgba(234, 179, 8, 0.18)" : "0 0 45px rgba(166, 255, 0, 0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "28px" }}>{isLockoutModal ? "⏳" : "⚡"}</span>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "900", color: isLockoutModal ? "#eab308" : NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  {isLockoutModal ? "Direct Intro Already Active" : "Direct Intro Dispatched"}
                </span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff" }}>
                  {dispatchedBrand.name}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "#ffffff", fontWeight: "700", lineHeight: "1.5", margin: "16px 0 14px 0" }}>
              {isLockoutModal 
                ? "You have already submitted a direct introduction request for this brand partner."
                : "Your athletic dossier is officially on the decision-maker's desk."}
            </p>

            <div style={{ backgroundColor: "#050505", border: "1px solid #1f1f1f", borderRadius: "14px", padding: "16px", marginBottom: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "13px", color: "#cccccc", lineHeight: "1.5" }}>
                Brand representatives are provided a <strong style={{ color: "#ffffff" }}>60-day contact window</strong> to review your verified metrics, collegiate roster status, and initiate direct communication.
              </div>
              <div style={{ fontSize: "12px", color: isLockoutModal ? "#eab308" : NEON_GREEN, fontWeight: "800" }}>
                🔒 60-Day Review Window: ~{getDaysRemaining(dispatchedBrand.name)} days remaining before re-submission unlocks.
              </div>
            </div>

            <button
              onClick={() => {
                setDispatchedBrand(null);
                setIsLockoutModal(false);
              }}
              style={{
                width: "100%",
                backgroundColor: isLockoutModal ? "#262626" : NEON_GREEN,
                color: isLockoutModal ? "#ffffff" : "#000000",
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
              Back to Dugout ➔
            </button>
          </div>
        </div>
      )}

      {/* ATHLETE PROFILE & PRO SCOUTING MATRIX MODAL */}
      {showProfileModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "20px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto", padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff" }}>
                  Athlete Locker & Scouting Matrix
                </h3>
                <p style={{ fontSize: "12px", color: "#888888", margin: "2px 0 0 0" }}>
                  Collegiate bio, physical dimensions, and pro pitch modeling analytics.
                </p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ background: "none", border: "none", color: "#888888", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* SECTION 1: ROSTER & PHYSICAL DIMENSIONS */}
              <div style={{ borderBottom: "1px solid #1f1f1f", paddingBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>
                  1. Roster & Physical Profile
                </span>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={profile.fullName} 
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      placeholder="e.g. Jordan Jones" 
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Current College / Program *</label>
                    <input 
                      type="text" 
                      required
                      value={profile.college} 
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                      placeholder="e.g. University of Utah" 
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </div>
                </div>

                {/* Physical Measurements Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Height (e.g. 6'3")</label>
                    <input 
                      type="text" 
                      value={profile.height || ""} 
                      onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                      placeholder="6'3\"" 
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Weight (lbs)</label>
                    <input 
                      type="number" 
                      value={profile.weight || ""} 
                      onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                      placeholder="210" 
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Position *</label>
                    <input 
                      type="text" 
                      required
                      value={profile.position} 
                      onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                      placeholder="e.g. RHP / OF" 
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Role *</label>
                    <select
                      value={profile.primaryRole}
                      onChange={(e) => setProfile({ ...profile, primaryRole: e.target.value as any })}
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    >
                      <option value="HITTER">Hitter</option>
                      <option value="PITCHER">Pitcher</option>
                      <option value="TWP">Two-Way (TWP)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>State *</label>
                    <select
                      value={profile.state || "UT"}
                      onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    >
                      <option value="UT">UT</option>
                      <option value="AZ">AZ</option>
                      <option value="CA">CA</option>
                      <option value="TX">TX</option>
                      <option value="FL">FL</option>
                      <option value="NV">NV</option>
                      <option value="CO">CO</option>
                      <option value="ID">ID</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Status *</label>
                    <select
                      value={profile.playerStatus}
                      onChange={(e) => setProfile({ ...profile, playerStatus: e.target.value })}
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    >
                      <option value="Transfer Portal">Transfer Portal</option>
                      <option value="Returning College Player">Returning</option>
                      <option value="Incoming Freshman">Incoming Freshman</option>
                      <option value="Juco Uncommitted">Juco Uncommitted</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Class Year</label>
                    <select
                      value={profile.collegeYear}
                      onChange={(e) => setProfile({ ...profile, collegeYear: e.target.value })}
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    >
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Email *</label>
                    <input 
                      type="email" 
                      required
                      value={profile.email} 
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      placeholder="athlete@school.edu" 
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Cell Phone *</label>
                    <input 
                      type="tel" 
                      required
                      value={profile.phone} 
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="(555) 000-0000" 
                      style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #2a2a2a", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "12px" }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRO SCOUTING & PITCH MODELING METRICS */}
              <div style={{ borderBottom: "1px solid #1f1f1f", paddingBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>
                  2. Performance & TrackMan Analytics
                </span>

                {/* HITTER INPUTS */}
                {(profile.primaryRole === "HITTER" || profile.primaryRole === "TWP") && (
                  <div style={{ backgroundColor: "#050505", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "12px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                      💥 Hitter Benchmarks
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>MAX EXIT VELO</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="103.2"
                          value={profile.maxExitVelo}
                          onChange={(e) => setProfile({ ...profile, maxExitVelo: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>90TH% EV</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="99.4"
                          value={profile.ninetyEV}
                          onChange={(e) => setProfile({ ...profile, ninetyEV: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>BAT SPEED</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="76.8"
                          value={profile.batSpeed}
                          onChange={(e) => setProfile({ ...profile, batSpeed: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>60-YD TIME</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="6.65"
                          value={profile.sixtyTime}
                          onChange={(e) => setProfile({ ...profile, sixtyTime: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ADVANCED PRO PITCHER INPUTS */}
                {(profile.primaryRole === "PITCHER" || profile.primaryRole === "TWP") && (
                  <div style={{ backgroundColor: "#050505", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    
                    {/* A. Velocity & Pitch Shapes */}
                    <div>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                        ⚾ 1. Velocity & Primary Shapes
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>PEAK FASTBALL</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 94.5"
                            value={profile.peakFB}
                            onChange={(e) => setProfile({ ...profile, peakFB: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>SITTING FB</label>
                          <input
                            type="text"
                            placeholder="91-93"
                            value={profile.sittingFB}
                            onChange={(e) => setProfile({ ...profile, sittingFB: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>OFF-SPEED TYPE</label>
                          <select
                            value={profile.offSpeedType}
                            onChange={(e) => setProfile({ ...profile, offSpeedType: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          >
                            <option value="Slider">Slider</option>
                            <option value="Sweeper">Sweeper</option>
                            <option value="Curveball">Curveball</option>
                            <option value="Changeup">Changeup</option>
                            <option value="Cutter">Cutter</option>
                            <option value="Splitter">Splitter</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>OFF-SPEED VELO</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="83.4"
                            value={profile.offSpeedVelo}
                            onChange={(e) => setProfile({ ...profile, offSpeedVelo: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* B. Pitch Modeling (Stuff+, Location+, Pitching+) */}
                    <div style={{ borderTop: "1px solid #161616", paddingTop: "10px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                        📊 2. Pitch Modeling (100 = League Avg)
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "2px" }}>STUFF+ (GRADE)</label>
                          <input
                            type="number"
                            placeholder="e.g. 118"
                            value={profile.stuffPlus || ""}
                            onChange={(e) => setProfile({ ...profile, stuffPlus: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: `1px solid rgba(166, 255, 0, 0.4)`, color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>LOCATION+ (COMMAND)</label>
                          <input
                            type="number"
                            placeholder="e.g. 106"
                            value={profile.locationPlus || ""}
                            onChange={(e) => setProfile({ ...profile, locationPlus: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>PITCHING+ (OVERALL)</label>
                          <input
                            type="number"
                            placeholder="e.g. 112"
                            value={profile.pitchingPlus || ""}
                            onChange={(e) => setProfile({ ...profile, pitchingPlus: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* C. Ball-Flight & Movement Shapes */}
                    <div style={{ borderTop: "1px solid #161616", paddingTop: "10px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                        🎯 3. Ball-Flight & Movement Shapes (TrackMan / Hawkeye)
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "2px" }}>IVB (INCHES)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 18.2"
                            value={profile.inducedVertBreak || ""}
                            onChange={(e) => setProfile({ ...profile, inducedVertBreak: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>HORIZ BREAK (IN)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 14.5"
                            value={profile.horizontalBreak || ""}
                            onChange={(e) => setProfile({ ...profile, horizontalBreak: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>FB SPIN (RPM)</label>
                          <input
                            type="number"
                            placeholder="e.g. 2420"
                            value={profile.fbSpinRate || ""}
                            onChange={(e) => setProfile({ ...profile, fbSpinRate: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>VAA (DEGREES)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. -4.6"
                            value={profile.vertApproachAngle || ""}
                            onChange={(e) => setProfile({ ...profile, vertApproachAngle: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* D. Release Biomechanics & Box Score Performance */}
                    <div style={{ borderTop: "1px solid #161616", paddingTop: "10px" }}>
                      <span style={{ fontSize: "10px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                        📐 4. Release Metrics & Strike Indicators
                      </span>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>EXTENSION (FT)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 6.8"
                            value={profile.releaseExtension || ""}
                            onChange={(e) => setProfile({ ...profile, releaseExtension: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>REL HEIGHT (FT)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 5.9"
                            value={profile.releaseHeight || ""}
                            onChange={(e) => setProfile({ ...profile, releaseHeight: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>K% (STRIKE OUT)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 31.5"
                            value={profile.kPercentage || ""}
                            onChange={(e) => setProfile({ ...profile, kPercentage: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#888888", marginBottom: "2px" }}>BB% (WALK RATE)</label>
                          <input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 7.2"
                            value={profile.bbPercentage || ""}
                            onChange={(e) => setProfile({ ...profile, bbPercentage: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "2px" }}>1ST PITCH STRIKE%</label>
                          <input
                            type="number"
                            placeholder="e.g. 68"
                            value={profile.firstPitchStrike || ""}
                            onChange={(e) => setProfile({ ...profile, firstPitchStrike: e.target.value })}
                            style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* SECTION 3: SOCIAL GATEWAYS */}
              <div>
                <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>
                  3. Public Social Gateways (Scoreboard Links)
                </span>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px", marginBottom: "8px" }}>
                  <select
                    value={profile.social1_Type}
                    onChange={(e) => setProfile({ ...profile, social1_Type: e.target.value })}
                    style={{ backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "8px", borderRadius: "8px", fontSize: "11px" }}
                  >
                    <option value="X">X (Twitter)</option>
                    <option value="IG">Instagram</option>
                    <option value="TIKTOK">TikTok</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Link 1: e.g. https://x.com/athlete"
                    value={profile.social1_Url}
                    onChange={(e) => setProfile({ ...profile, social1_Url: e.target.value })}
                    style={{ backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "11px" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px", marginBottom: "14px" }}>
                  <select
                    value={profile.social2_Type}
                    onChange={(e) => setProfile({ ...profile, social2_Type: e.target.value })}
                    style={{ backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "8px", borderRadius: "8px", fontSize: "11px" }}
                  >
                    <option value="IG">Instagram</option>
                    <option value="X">X (Twitter)</option>
                    <option value="TIKTOK">TikTok</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Link 2: e.g. https://instagram.com/athlete"
                    value={profile.social2_Url}
                    onChange={(e) => setProfile({ ...profile, social2_Url: e.target.value })}
                    style={{ backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "8px 10px", borderRadius: "8px", fontSize: "11px" }}
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#cccccc", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={profile.isProfileVisible !== false}
                    onChange={(e) => setProfile({ ...profile, isProfileVisible: e.target.checked })}
                  />
                  <span>Publish my profile & verified numbers to the National Scouting Scoreboard</span>
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  style={{ flex: 1, backgroundColor: "#141414", border: "1px solid #2a2a2a", color: "#888888", fontWeight: "700", padding: "12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", textTransform: "uppercase" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  style={{ flex: 2, backgroundColor: NEON_GREEN, color: "#000000", border: "none", fontWeight: "900", padding: "12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}
                >
                  {isSavingProfile ? "Saving Pro Metrics..." : "Save Metrics & Profile"}
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
