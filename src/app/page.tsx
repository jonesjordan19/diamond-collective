"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { base } from "thirdweb/chains";
import { ThirdwebProvider, ConnectButton, TransactionButton, useActiveAccount, useReadContract, useConnectModal } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { getBalance, claimTo, totalSupply } from "thirdweb/extensions/erc20";
import HomeHero from "../components/HomeHero";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwe5YJxF93X4fJXpODhAGbJQ-1Xs3FiRHuLC2umjkGLGtsJTqj4VjO-0Ai0_hBqZMojdw/exec";
const STRIPE_GRIP_DROP_URL = "https://buy.stripe.com/8x2eVeeW57dgc5I1hX8Vi01";
const NEON_GREEN = "#a6ff00";

const FOUNDERS_POOL_TOTAL = 100000;
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

const client = createThirdwebClient({ clientId: "770a552ed494b40543a6696298d41606" });
const sluggerContract = getContract({ client, chain: base, address: "0xF3f6D32ABCf2fDeAB3c6D0b440230714166Cc4A1" });
const supportedWallets = [inAppWallet({ auth: { options: ["google", "apple", "phone"] }, smartAccount: { chain: base, sponsorGas: true } })];

interface BrandItem {
  name: string; tagline: string; description: string; buttonText: string; type: "email_intro" | "affiliate_link";
  link?: string; brandRepEmail?: string; brandRepName?: string; isPrimary?: boolean; couponCode?: string; couponLabel?: string; categoryTag?: string;
}

interface MarketCategory { title: string; emoji: string; brands: BrandItem[]; }

const MARKET_SECTIONS: MarketCategory[] = [
  {
    title: "Technology", emoji: "📱",
    brands: [
      { name: "TAG Sports", tagline: "Smart Sports Radar & AiCE Coaching", description: "Aerospace-precision velocity tracking with zero subscription fees.", buttonText: "Request Direct Intro ⚡", type: "email_intro", brandRepEmail: "clucas@tagsports.ai", brandRepName: "C. Lucas (TAG Sports)", link: "https://tagsports.ai", couponCode: "DIAMONDCOLLECTIVE", couponLabel: "20% Off Member Code", isPrimary: true },
      { name: "Pocket Radar", tagline: "Smart Coach Velocity & Data Tracking", description: "Quantify throw and exit velocity on every swing, pitch, and throw.", buttonText: "Register Ambassador Unit ↗", type: "affiliate_link", link: "https://af.uppromote.com/pocket-radar-inc/register" },
    ],
  },
  {
    title: "Hitting", emoji: "💥",
    brands: [
      { name: "Frost Gear", tagline: "Cold-Weather Performance Batting Gear", description: "Engineered with advanced thermal materials to keep hands warm, responsive, and game-ready.", buttonText: "Request Direct Intro ⚡", type: "email_intro", brandRepEmail: "parker@maxbp.com", brandRepName: "Parker (MaxBP & Frost Gear)", isPrimary: true },
      { name: "Soldier Sports", tagline: "Team Soldier TANK Ambassador Program", description: "Apply to join the Team Soldier TANK Ambassador Program.", buttonText: "Open Ambassador Application ↗", type: "affiliate_link", link: "https://soldiersports.us/pages/ambassador" },
    ],
  },
  {
    title: "Equipment", emoji: "⚾",
    brands: [
      { name: "MaxBP", tagline: "High-Velocity Reaction & Vision Training", description: "Train fast with the premier small-ball reaction and hitting machines.", buttonText: "Request Direct Intro ⚡", type: "email_intro", brandRepEmail: "parker@maxbp.com", brandRepName: "Parker (MaxBP)", isPrimary: true },
      { name: "Yardley Sports", tagline: "Handcrafted Custom Leather Gloves", description: "Premium handcrafted baseball gloves built with pro patterns.", buttonText: "Request Direct Intro ⚡", type: "email_intro", brandRepEmail: "braden@yardleysports.com", brandRepName: "Braden (Yardley Sports)", isPrimary: true },
      { name: "Rawlings", tagline: "The Official Glove & Ball of MLB", description: "Join the official Rawlings affiliate network.", buttonText: "Open Affiliate Portal ↗", type: "affiliate_link", link: "https://www.rawlings.com/information-affiliate.html" },
      { name: "Wilson Family of Brands", tagline: "A2000, A2K, DeMarini & Louisville Slugger", description: "Access official partner campaigns on Impact.", buttonText: "Join Wilson Network ↗", type: "affiliate_link", link: "https://app.impact.com/campaign-promo-signup/Wilson-Family-of-Brands.brand?execution=e1s1#/?viewkey=signUpPreStart" },
      { name: "HydroJug", tagline: "TikTok Shop Creator Program", description: "Create TikTok content, tag HydroJug gear directly, and earn commissions.", buttonText: "Open Ambassador Program ↗", type: "affiliate_link", link: "https://thehydrojug.com/pages/ambassadors-affiliates" },
    ],
  },
  {
    title: "Eyewear & Vision", emoji: "🕶️",
    brands: [
      { name: "Vision X Sports", tagline: "Cognitive, Visual & Reaction Training", description: "13-level performance series connecting eye tracking and depth perception.", buttonText: "Request Direct Intro ⚡", type: "email_intro", brandRepEmail: "r.curry@visionxsports.com", brandRepName: "R. Curry (Vision X Sports)", isPrimary: true },
    ],
  },
  {
    title: "Clothing & Apparel", emoji: "🧢",
    brands: [
      { name: "Baseballism", tagline: "Premium Baseball Lifestyle & Streetwear", description: "The premier lifestyle brand honoring the game's culture.", buttonText: "Open Collaboration Form ↗", type: "affiliate_link", link: "https://www.baseballism.com/pages/collabs-1?srsltid=AfmBOoqEktT0nGezfmx_xgwZmPpmD3k9pAy5xaq4E8D4suS0UqhDCmVD" },
      { name: "Vuori", tagline: "V1 Community Pro Network", description: "A network of athletes united by movement.", buttonText: "Join V1 Community ↗", type: "affiliate_link", link: "https://vuoriclothing.com/pages/v1-community-program" },
    ],
  },
  {
    title: "Footwear", emoji: "👟",
    brands: [
      { name: "Nike", tagline: "Official Nike Affiliate Network", description: "Earn competitive commissions promoting Nike cleats and gear.", buttonText: "Open Nike Publisher App ↗", type: "affiliate_link", link: "https://public.cj.com/signup/publisher?advertiserId=4942550#/branded" },
      { name: "Mizuno", tagline: "The Mizuno Movement Athlete Program", description: "Gain access to exclusive high-performance diamond footwear.", buttonText: "Join Mizuno Movement ↗", type: "affiliate_link", link: "https://usa.mizuno.com/mizuno-movement/" },
      { name: "Under Armour", tagline: "Under Armour Athlete Partner Program", description: "Earn commissions on referred clickthrough sales.", buttonText: "Open UA Partner Program ↗", type: "affiliate_link", link: "https://www.underarmour.com/en-us/t/ua-affiliate-program/" },
    ],
  },
  {
    title: "Nutrition", emoji: "⚡",
    brands: [
      { name: "Just Ingredients", tagline: "Clean Supplements, Hydration & Electrolytes", description: "Turn your passion into creator commissions.", buttonText: "Open Creator Portal ↗", type: "affiliate_link", link: "https://justingredients.com/pages/creator-program?srsltid=AfmBOoq02ujUzQv9eCCYLpLz1rYNSsFxQed5F2KxhsN-qNQNTshataQw" },
      { name: "King of the Jungle", tagline: "Elite Pre-Workout & Nootropic Performance", description: "Scientifically dosed Nitric Oxide activators and hydration electrolytes.", buttonText: "Join Ambassador Program ↗", type: "affiliate_link", link: "https://kingofthejungle.com/pages/brand-ambassador" },
    ],
  },
  {
    title: "Player Services", emoji: "🤝",
    brands: [
      { name: "Baseball Players of the World", tagline: "Global Playing Opportunities & Media", description: "Helping baseball players maximize the value of their careers.", buttonText: "Submit Player Dossier ↗", type: "affiliate_link", link: "https://docs.google.com/forms/d/e/1FAIpQLSdqJDUk_maSDgFXyYHG0V5VZy7AgT_kBtPHRaSojhqkTyiYDw/viewform" },
    ],
  },
];

const BRAND_COUNT = MARKET_SECTIONS.reduce((total, section) => total + section.brands.length, 0);

const FAQS = [
  { q: "How do I unlock the 20% TAG Sports discount & Brand Intros?", a: "It takes 3 quick steps: (1) Sign in with your Google, Apple, or phone ID, (2) Fill out your player bio in the 'My Locker' tab, and (3) Claim your free 100 $SLUG membership key." },
  { q: "Is this compliant with NCAA and Institutional NIL rules?", a: "Yes. All Slugger Coins ($SLUG) distributed during the Founders phase have zero market cash value and are non-compensatory. Each verified member claims a flat 100 $SLUG allocation used strictly as an access key to unlock brand directories." },
  { q: "How do Member Giveaways & Gear Drops work?", a: "Verified collegiate members holding their 100 $SLUG key and an active Locker profile are automatically eligible for exclusive equipment giveaways, radar drops, and partner gear allocations announced at the top of the dashboard." },
  { q: "I'm a Scout or Coach. How do I view player contact info?", a: "Click 'Coach & Scout Access' in the header to log in. Once you complete your brief Pro Credential profile and are approved by our team, you will unlock full access to the athletes' cell phones, emails, and TrackMan video links directly on their Scoreboard cards." },
];

const US_STATES: [string, string][] = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];

const REGIONS: Record<string, string[]> = {
  "West": ["UT", "AZ", "CA", "NV", "ID", "WA", "OR", "CO", "NM", "MT", "WY", "HI", "AK"],
  "Midwest": ["ND", "SD", "NE", "KS", "MN", "IA", "MO", "WI", "IL", "MI", "IN", "OH"],
  "South": ["TX", "OK", "AR", "LA", "MS", "TN", "KY", "AL", "GA", "FL", "SC", "NC", "VA", "WV"],
  "Northeast": ["PA", "NY", "NJ", "CT", "RI", "MA", "VT", "NH", "ME", "MD", "DE", "DC"]
};

export interface AthleteProfile {
  verificationStatus?: string; fullName: string; email: string; phone: string; college: string; state?: string; position: string; collegeYear: string; playerStatus: string; verificationLink: string;
  height?: string; weight?: string; primaryRole: "HITTER" | "PITCHER" | "TWP"; isProfileVisible: boolean; walletAddress?: string; social1_Type?: string; social1_Url?: string; social2_Type?: string; social2_Url?: string;
  maxExitVelo?: string; ninetyEV?: string; batSpeed?: string; sixtyTime?: string; recordedDateHitting?: string; peakFB?: string; sittingFB?: string; offSpeedVelo?: string; offSpeedType?: string;
  fbSpinRate?: string; offSpeedSpinRate?: string; firstPitchStrike?: string; recordedDatePitching?: string; stuffPlus?: string; locationPlus?: string; pitchingPlus?: string;
  inducedVertBreak?: string; horizontalBreak?: string; vertApproachAngle?: string; releaseExtension?: string; releaseHeight?: string; kPercentage?: string; bbPercentage?: string; kMinusBbPercentage?: string;
}

export interface ScoutProfile {
  fullName: string; organization: string; jobTitle: string; email: string; verificationLink: string; verificationStatus?: string; walletAddress?: string;
}

const emptyProfile: AthleteProfile = {
  verificationStatus: "Pending", fullName: "", email: "", phone: "", college: "", state: "UT", position: "", collegeYear: "Freshman", playerStatus: "Incoming Freshman", verificationLink: "",
  height: "", weight: "", primaryRole: "HITTER", isProfileVisible: true, walletAddress: "", social1_Type: "X", social1_Url: "", social2_Type: "IG", social2_Url: "",
  maxExitVelo: "", ninetyEV: "", batSpeed: "", sixtyTime: "", recordedDateHitting: "", peakFB: "", sittingFB: "", offSpeedVelo: "", offSpeedType: "Slider",
  fbSpinRate: "", offSpeedSpinRate: "", firstPitchStrike: "", recordedDatePitching: "", stuffPlus: "", locationPlus: "", pitchingPlus: "",
  inducedVertBreak: "", horizontalBreak: "", vertApproachAngle: "", releaseExtension: "", releaseHeight: "", kPercentage: "", bbPercentage: "", kMinusBbPercentage: "",
};

interface AthleteContact { fullName: string; email?: string; phone?: string; verificationLink?: string; }

const emptyScout: ScoutProfile = { fullName: "", organization: "", jobTitle: "", email: "", verificationLink: "", verificationStatus: "UNREGISTERED" };

function MetricBar({ label, valueStr, unit, min, max, eliteThreshold, invert = false, subLabel }: { label: string; valueStr?: string; unit: string; min: number; max: number; eliteThreshold: number; invert?: boolean; subLabel?: string; }) {
  const num = parseFloat(valueStr || "");
  if (isNaN(num)) return null;
  const isElite = invert ? num <= eliteThreshold : num >= eliteThreshold;
  let pct = invert ? ((max - num) / (max - min)) * 100 : ((num - min) / (max - min)) * 100;
  pct = Math.max(10, Math.min(100, Math.round(pct)));
  const barColor = isElite ? "#ffb800" : NEON_GREEN;

  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", marginBottom: "4px", fontFamily: "monospace" }}>
        <span style={{ color: "#d4d4d8", fontWeight: "800" }}>{label} {subLabel && <span style={{ color: "#71717a", fontWeight: "600" }}>({subLabel})</span>}</span>
        <span style={{ color: isElite ? "#ffb800" : "#ffffff", fontWeight: "950", fontSize: "12px" }}>{isElite ? "🔥 " : ""}{valueStr}{unit}</span>
      </div>
      <div style={{ width: "100%", height: "7px", backgroundColor: "#16161f", borderRadius: "999px", overflow: "hidden", border: "1px solid #262632" }}>
        <div style={{ width: `${pct}%`, height: "100%", backgroundColor: barColor, borderRadius: "999px", boxShadow: isElite ? "0 0 10px rgba(255, 184, 0, 0.5)" : "0 0 8px rgba(166, 255, 0, 0.35)", transition: "width 0.35s ease" }} />
      </div>
    </div>
  );
}

async function triggerMobileScoutShare(athlete: AthleteProfile) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = 1080;
  canvas.height = 1350;
  ctx.fillStyle = "#080808"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 14; ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);

  ctx.fillStyle = "rgba(166, 255, 0, 0.08)"; ctx.fillRect(80, 80, 440, 52);
  ctx.strokeStyle = "#a6ff00"; ctx.lineWidth = 2; ctx.strokeRect(80, 80, 440, 52);
  ctx.fillStyle = "#a6ff00"; ctx.font = "900 20px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText("THE DIAMOND COLLECTIVE", 100, 113);

  const isTWP = athlete.primaryRole === "TWP";
  const isPitcher = athlete.primaryRole === "PITCHER" || isTWP;
  const isHitter = athlete.primaryRole === "HITTER" || isTWP;

  ctx.fillStyle = isTWP ? "#a6ff00" : "#ffffff"; ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "right"; ctx.fillText(isTWP ? "⚡ VERIFIED TWO-WAY SCOUT CARD" : "VERIFIED SCOUT CARD", canvas.width - 80, 115); ctx.textAlign = "left";

  ctx.fillStyle = "#ffffff"; ctx.font = "900 66px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText((athlete.fullName || "MEMBER ATHLETE").toUpperCase(), 80, 230);
  ctx.fillStyle = "#a6ff00"; ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText(`🏛️ ${athlete.college || "Undeclared College"} ${athlete.state ? `(${athlete.state})` : ""}`, 80, 285);
  
  const physicalTag = athlete.height && athlete.weight ? ` • ${athlete.height} / ${athlete.weight} lbs` : (athlete.height ? ` • ${athlete.height}` : "");
  ctx.fillStyle = "#d4d4d8"; ctx.font = "600 26px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText(`${athlete.position || "ATH"}${physicalTag} • ${athlete.playerStatus || "Active Roster"}`, 80, 330);

  ctx.strokeStyle = "#27272a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(80, 365); ctx.lineTo(canvas.width - 80, 365); ctx.stroke();

  if (isTWP || isPitcher) {
    ctx.fillStyle = "#a6ff00"; ctx.font = "900 16px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText("⚾ MOUND TELEMETRY", 80, 400);
    const pMetrics = [];
    if (athlete.peakFB) pMetrics.push({ label: "PEAK FASTBALL", val: `${athlete.peakFB} MPH`, sub: athlete.sittingFB ? `Sitting ${athlete.sittingFB}` : undefined });
    if (athlete.stuffPlus) pMetrics.push({ label: "STUFF+ GRADE", val: athlete.stuffPlus, sub: "100 = Avg" });
    if (athlete.inducedVertBreak) pMetrics.push({ label: "INDUCED VERT BREAK", val: `${athlete.inducedVertBreak}"`, sub: "Carry & Rise" });
    if (athlete.fbSpinRate) pMetrics.push({ label: "FB SPIN RATE", val: `${athlete.fbSpinRate} RPM` });
    
    while (pMetrics.length < 4) pMetrics.push({ label: "METRIC", val: "---" });

    pMetrics.slice(0, 4).forEach((m, idx) => {
      const x = 80 + (idx % 2) * 480; const y = 415 + Math.floor(idx / 2) * 104;
      ctx.fillStyle = "#121214"; ctx.fillRect(x, y, 440, 92);
      ctx.strokeStyle = "#27272a"; ctx.lineWidth = 2; ctx.strokeRect(x, y, 440, 92);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText(m.label, x + 18, y + 26);
      ctx.fillStyle = "#a6ff00"; ctx.font = "900 32px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText(m.val, x + 18, y + 68);
    });
  }

  if (isTWP || isHitter) {
    const startYH = isTWP ? 650 : 400;
    ctx.fillStyle = "#a6ff00"; ctx.font = "900 16px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText("💥 BATTER'S BOX TELEMETRY", 80, startYH - 15);
    const hMetrics = [];
    if (athlete.maxExitVelo) hMetrics.push({ label: "MAX EXIT VELO", val: `${athlete.maxExitVelo} MPH` });
    if (athlete.ninetyEV) hMetrics.push({ label: "90TH% EXIT VELO", val: `${athlete.ninetyEV} MPH`, sub: "Hard-Hit" });
    if (athlete.batSpeed) hMetrics.push({ label: "BAT SPEED", val: `${athlete.batSpeed} MPH`, sub: "Blast" });
    if (athlete.sixtyTime) hMetrics.push({ label: "60-YARD DASH", val: `${athlete.sixtyTime}s`, sub: "Laser" });
    
    while (hMetrics.length < 4) hMetrics.push({ label: "METRIC", val: "---" });

    hMetrics.slice(0, 4).forEach((m, idx) => {
      const x = 80 + (idx % 2) * 480; const y = startYH + Math.floor(idx / 2) * 104;
      ctx.fillStyle = "#121214"; ctx.fillRect(x, y, 440, 92);
      ctx.strokeStyle = "#27272a"; ctx.lineWidth = 2; ctx.strokeRect(x, y, 440, 92);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText(m.label, x + 18, y + 26);
      ctx.fillStyle = "#a6ff00"; ctx.font = "900 32px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText(m.val, x + 18, y + 68);
    });
  }

  ctx.fillStyle = "#121214"; ctx.fillRect(80, 960, 920, 200); ctx.strokeStyle = "#27272a"; ctx.strokeRect(80, 960, 920, 200);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText("HONOR-CODE VERIFIED DATA REGISTRY", 120, 1008);
  ctx.fillStyle = "#d4d4d8"; ctx.font = "400 19px -apple-system, BlinkMacSystemFont, sans-serif"; 
  ctx.fillText("TrackMan, Hawkeye, and verified metrics published on National Scoreboard.", 120, 1046);
  ctx.fillText("Direct scout verification & NIL access powered by Slugger Coin ($SLUG).", 120, 1078);

  ctx.fillStyle = "#ffffff"; ctx.font = "900 24px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.textAlign = "center"; ctx.fillText("SLUGGERCOIN.COM", 540, 1260);
  ctx.fillStyle = "#888888"; ctx.font = "600 16px -apple-system, BlinkMacSystemFont, sans-serif"; ctx.fillText("THE DIAMOND COLLECTIVE • ALL RIGHTS RESERVED", 540, 1295);

  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const fileName = `${(athlete.fullName || "athlete").replace(/\s+/g, "_")}_ScoutCard.png`;
    const file = new File([blob], fileName, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: `${athlete.fullName} Scout Card`, text: `Check out my verified scouting metrics!` }); return; } catch {}
    }
    const link = document.createElement("a"); link.download = fileName; link.href = URL.createObjectURL(blob); link.click();
  }, "image/png");
}

function AppContent() {
  const account = useActiveAccount();
  const { connect } = useConnectModal();
  const [justClaimed, setJustClaimed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [intendedRole, setIntendedRole] = useState<"ATHLETE" | "SCOUT" | null>(null);
  const [userRole, setUserRole] = useState<"GUEST" | "ATHLETE" | "SCOUT">("GUEST");

  const [activeMainTab, setActiveMainTab] = useState<"SCOREBOARD" | "EXCHANGE" | "LOCKER">("SCOREBOARD");
  const [brandCategoryFilter, setBrandCategoryFilter] = useState<"ALL" | "DIRECT" | "PERKS" | "GEAR" | "APPAREL">("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "HITTER" | "PITCHER" | "TWP">("ALL");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [regionFilter, setRegionFilter] = useState<string>("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "MAX_EV" | "PEAK_FB" | "STUFF_PLUS" | "IVB">("DEFAULT");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);
  const [copiedPlayerName, setCopiedPlayerName] = useState<string | null>(null);

  const [leaderboardRows, setLeaderboardRows] = useState<AthleteProfile[]>([]);
  const [loadingScoreboard, setLoadingScoreboard] = useState(false);

  const [activeMatrixTab, setActiveMatrixTab] = useState<"BIO" | "HITTING" | "PITCHING">("BIO");
  const [pendingIntroBrand, setPendingIntroBrand] = useState<BrandItem | null>(null);
  const [dispatchedBrand, setDispatchedBrand] = useState<BrandItem | null>(null);
  const [isLockoutModal, setIsLockoutModal] = useState(false);
  const [showClaimPromptModal, setShowClaimPromptModal] = useState(false);
  const [showScoutPendingModal, setShowScoutPendingModal] = useState(false);
  
  const [profile, setProfile] = useState<AthleteProfile>(emptyProfile);
  const [scoutProfile, setScoutProfile] = useState<ScoutProfile>(emptyScout);
  
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingScout, setIsSavingScout] = useState(false);
  
  const [introTimestamps, setIntroTimestamps] = useState<{ [brandName: string]: number }>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [contactsByName, setContactsByName] = useState<Record<string, AthleteContact>>({});
  const [accountLoaded, setAccountLoaded] = useState(false);
  const [openedPlayerLink, setOpenedPlayerLink] = useState(false);
  const [saveNotice, setSaveNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const authRef = useRef<{ wallet: string; message: string; signature: string; issuedAt: number } | null>(null);

  // Every private request is signed by the signed-in wallet and checked on the server.
  const secureCall = async (action: string, data: Record<string, unknown> = {}) => {
    if (!account) throw new Error("Sign in to continue.");
    const wallet = account.address.toLowerCase();
    const now = Date.now();
    let auth = authRef.current;
    if (!auth || auth.wallet !== wallet || now - auth.issuedAt > 10 * 60 * 1000) {
      const message = `The Diamond Collective secure request\nWallet: ${wallet}\nIssued: ${new Date(now).toISOString()}`;
      const signature = await account.signMessage({ message });
      auth = { wallet, message, signature, issuedAt: now };
      authRef.current = auth;
    }
    const response = await fetch("/api/secure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, auth: { message: auth.message, signature: auth.signature }, data }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result || result.status === "error") throw new Error(result?.message || "The request didn't go through. Try again in a moment.");
    return result;
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sharedPlayer = params.get("player");
      if (sharedPlayer && sharedPlayer.trim() !== "") {
        setSearchQuery(sharedPlayer.trim());
        setOpenedPlayerLink(true);
        setActiveMainTab("SCOREBOARD");
        setExpandedCardIdx(0);
      }
    }
  }, []);

  const handleCopyPlayerLink = (athleteName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cleanName = athleteName || "Athlete";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sluggercoin.com";
    const shareUrl = `${origin}/?player=${encodeURIComponent(cleanName)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedPlayerName(cleanName);
    setTimeout(() => setCopiedPlayerName(null), 2500);
  };

  const handleOpenLogin = (roleTarget: "ATHLETE" | "SCOUT") => {
    setIntendedRole(roleTarget);
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_login_role", roleTarget);
    }
    connect({
      client, wallets: supportedWallets,
      accountAbstraction: { chain: base, sponsorGas: true },
      chain: base, theme: "dark",
    });
  };

  const { data: balanceData, refetch: refetchBalance } = useReadContract(getBalance, { contract: sluggerContract, address: account?.address || "" });
  const { data: totalSupplyData, refetch: refetchSupply } = useReadContract(totalSupply, { contract: sluggerContract });
  
  const totalMinted = totalSupplyData ? Number(totalSupplyData) / 1e18 : 0;
  const remainingPercentage = Math.max(0, Math.min(100, Math.round(((FOUNDERS_POOL_TOTAL - totalMinted) / FOUNDERS_POOL_TOTAL) * 100)));
  const balance = balanceData ? Math.min(100, Number(balanceData.displayValue)) : 0;
  
  const isUnlocked = balance >= 100 || justClaimed;
  
  const hasProfile = Boolean(profile.fullName && profile.email);
  const isFullyOnboardedAthlete = Boolean(account && hasProfile && isUnlocked && userRole === "ATHLETE");

  const isScoutOnboarded = scoutProfile.verificationStatus !== "UNREGISTERED";
  const isScoutApproved = scoutProfile.verificationStatus === "Approved";

  const handleCopyCode = () => { navigator.clipboard.writeText("DIAMONDCOLLECTIVE"); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2500); };
  const isIntroActive = (bName: string) => introTimestamps[bName] ? Date.now() - introTimestamps[bName] < SIXTY_DAYS_MS : false;
  const getDaysRemaining = (bName: string) => Math.max(1, Math.ceil((SIXTY_DAYS_MS - (Date.now() - (introTimestamps[bName] || 0))) / 86400000));
  const activeIntroList = useMemo(() => Object.keys(introTimestamps).filter(isIntroActive), [introTimestamps]);

  useEffect(() => {
    const sheetUrl = process.env.NEXT_PUBLIC_SCOUTING_SHEET_URL || "https://script.google.com/macros/s/AKfycbwe5YJxF93X4fJXpODhAGbJQ-1Xs3FiRHuLC2umjkGLGtsJTqj4VjO-0Ai0_hBqZMojdw/exec";
    if (sheetUrl) {
      setLoadingScoreboard(true);
      fetch(sheetUrl).then((res) => res.json()).then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: AthleteProfile[] = data.map((item) => {
            const rawRole = (item.primaryRole || "HITTER").toUpperCase();
            return {
              ...emptyProfile,
              fullName: item.fullName || (item.athleteEmail ? item.athleteEmail.split("@")[0] : "Member Athlete"),
              email: item.athleteEmail || item.email || "", phone: item.phone ? String(item.phone) : "",
              walletAddress: item.walletAddress ? String(item.walletAddress) : "", college: item.currentCollege || item.college || "Undeclared",
              state: item.state || "", position: item.position || (rawRole === "PITCHER" || rawRole === "TWP" ? rawRole : "HITTER"),
              primaryRole: (rawRole === "PITCHER" || rawRole === "TWP" ? rawRole : "HITTER") as any,
              playerStatus: item.portalStatus || item.playerStatus || "Active", isProfileVisible: String(item.isProfileVisible).toUpperCase() !== "FALSE",
              verificationLink: item.verificationLink && item.verificationLink !== "HALLOWEEN_RADAR_ENTRY" ? String(item.verificationLink) : "",
              height: item.height ? String(item.height) : "", weight: item.weight ? String(item.weight) : "",
              maxExitVelo: item.maxExitVelo ? String(item.maxExitVelo) : "", ninetyEV: item.ninetyEV ? String(item.ninetyEV) : "",
              batSpeed: item.batSpeed ? String(item.batSpeed) : "", sixtyTime: item.sixtyTime ? String(item.sixtyTime) : "",
              peakFB: item.peakFB ? String(item.peakFB) : "", sittingFB: item.sittingFB ? String(item.sittingFB) : "",
              offSpeedVelo: item.offSpeedVelo ? String(item.offSpeedVelo) : "", offSpeedType: item.offSpeedType || "Slider",
              fbSpinRate: item.fbSpinRate ? String(item.fbSpinRate) : "", offSpeedSpinRate: item.offSpeedSpinRate ? String(item.offSpeedSpinRate) : "",
              firstPitchStrike: item.firstPitchStrike ? String(item.firstPitchStrike) : "", recordedDateHitting: item.recordedDateHitting || "",
              recordedDatePitching: item.recordedDatePitching || "", stuffPlus: item.stuffPlus ? String(item.stuffPlus) : "",
              locationPlus: item.locationPlus ? String(item.locationPlus) : "", pitchingPlus: item.pitchingPlus ? String(item.pitchingPlus) : "",
              inducedVertBreak: item.inducedVertBreak ? String(item.inducedVertBreak) : "", horizontalBreak: item.horizontalBreak ? String(item.horizontalBreak) : "",
              vertApproachAngle: item.vertApproachAngle ? String(item.vertApproachAngle) : "", releaseExtension: item.releaseExtension ? String(item.releaseExtension) : "",
              releaseHeight: item.releaseHeight ? String(item.releaseHeight) : "", kPercentage: item.kPercentage ? String(item.kPercentage) : "",
              bbPercentage: item.bbPercentage ? String(item.bbPercentage) : "", kMinusBbPercentage: item.kMinusBbPercentage ? String(item.kMinusBbPercentage) : "",
              social1_Type: item.social1_Type || "X", social1_Url: item.social1_Url || "", social2_Type: item.social2_Type || "IG", social2_Url: item.social2_Url || "",
            };
          });
          const uniqueMap = new Map();
          mapped.forEach((item) => uniqueMap.set((item.email || item.fullName).toLowerCase().trim(), item));
          setLeaderboardRows(Array.from(uniqueMap.values()));
        }
        setLoadingScoreboard(false);
      }).catch(() => setLoadingScoreboard(false));
    }
  }, []);

  useEffect(() => {
    if (account?.address) {
      const lowerWallet = account.address.toLowerCase();
      const localRoleKey = `app_role_${lowerWallet}`;
      const localProfileKey = `athlete_profile_${lowerWallet}`;
      const localScoutKey = `scout_profile_${lowerWallet}`;
      const acctEmail = (account as any)?.email || "";
      
      const pendingRole = localStorage.getItem("pending_login_role");
      const savedRole = localStorage.getItem(localRoleKey);
      
      let finalRole = "ATHLETE";
      if (pendingRole) {
        finalRole = pendingRole;
        localStorage.removeItem("pending_login_role"); 
      } else if (savedRole) {
        finalRole = savedRole;
      } else if (intendedRole) {
        finalRole = intendedRole;
      }

      if (finalRole === "SCOUT") {
        setUserRole("SCOUT");
        localStorage.setItem(localRoleKey, "SCOUT");
        const savedScout = localStorage.getItem(localScoutKey);
        if (savedScout) {
          try { setScoutProfile(prev => ({ ...emptyScout, ...JSON.parse(savedScout), email: JSON.parse(savedScout).email || acctEmail })); } catch {}
        } else { setScoutProfile(prev => ({ ...emptyScout, email: acctEmail })); }
      } else {
        setUserRole("ATHLETE");
        localStorage.setItem(localRoleKey, "ATHLETE");
        const savedLocal = localStorage.getItem(localProfileKey);
        if (savedLocal) {
          try { const p = JSON.parse(savedLocal); if (p.fullName) setProfile(prev => ({ ...prev, ...p, email: p.email || acctEmail })); } catch {}
        } else if (acctEmail) { setProfile(prev => ({ ...prev, email: acctEmail })); }
      }

      // Loads this account's saved details without wiping out anything being typed.
      setAccountLoaded(false);
      secureCall("getAccount").then((data) => {
        if (data && data.scoutProfile && data.scoutProfile.fullName) {
          setScoutProfile(prev => ({ ...prev, ...data.scoutProfile }));
          localStorage.setItem(localScoutKey, JSON.stringify(data.scoutProfile));
          if (data.scoutProfile.verificationStatus === "Pending") setShowScoutPendingModal(true);
        }
        if (data && data.profile && data.profile.fullName) {
          setProfile(prev => ({ ...prev, ...data.profile }));
          localStorage.setItem(localProfileKey, JSON.stringify(data.profile));
        }
        if (data && data.existingIntros) {
          const introsMap: { [brandName: string]: number } = {};
          Object.keys(data.existingIntros).forEach((brandName) => { introsMap[brandName] = Number(data.existingIntros[brandName]); });
          setIntroTimestamps(introsMap);
        }
      }).catch((err) => console.error("Couldn't load account", err)).finally(() => setAccountLoaded(true));
    } else {
      setUserRole("GUEST");
    }
  }, [account, intendedRole]);

  // Coaches and scouts land on the scoreboard, since the athlete tabs are hidden for them.
  useEffect(() => {
    if (userRole === "SCOUT") setActiveMainTab("SCOREBOARD");
  }, [userRole]);

  // Approved coaches and scouts load contact details only after the server confirms their approval.
  useEffect(() => {
    if (!account || userRole !== "SCOUT" || !isScoutApproved) { setContactsByName({}); return; }
    secureCall("getContacts").then((data) => {
      const byName: Record<string, AthleteContact> = {};
      (data.contacts || []).forEach((item: AthleteContact) => { if (item.fullName) byName[item.fullName.toLowerCase().trim()] = item; });
      setContactsByName(byName);
    }).catch((err) => console.error("Couldn't load contact details", err));
  }, [account?.address, userRole, isScoutApproved]);

  const handleSaveScoutProfile = async () => {
    if (!account?.address) return;
    if (!scoutProfile.fullName || !scoutProfile.organization || !scoutProfile.verificationLink) {
      alert("Please complete all required fields including your verification link to proceed.");
      return;
    }
    setIsSavingScout(true);
    const lowerWallet = account.address.toLowerCase();
    
    const newScoutState = { ...scoutProfile, verificationStatus: "Pending" };
    setScoutProfile(newScoutState);
    localStorage.setItem(`scout_profile_${lowerWallet}`, JSON.stringify(newScoutState));
    setUserRole("SCOUT");

    try {
      await secureCall("saveScout", { fullName: scoutProfile.fullName, organization: scoutProfile.organization, jobTitle: scoutProfile.jobTitle, email: scoutProfile.email, verificationLink: scoutProfile.verificationLink });
      setIsSavingScout(false);
      setShowScoutPendingModal(true);
    } catch (err) { setIsSavingScout(false); alert(err instanceof Error ? err.message : "Your details weren't saved. Try again."); }
  };

  const handleSaveProfile = async () => {
    if (!account?.address) return;
    if (!profile.fullName || !profile.email) { alert("Please fill in your Full Name and Email."); setActiveMatrixTab("BIO"); return; }
    setIsSavingProfile(true);
    setSaveNotice(null);
    const lowerWallet = account.address.toLowerCase();
    let kMinusBB = profile.kMinusBbPercentage;
    if (profile.kPercentage && profile.bbPercentage && !kMinusBB) kMinusBB = (parseFloat(profile.kPercentage) - parseFloat(profile.bbPercentage)).toFixed(1);

    const updatedProfile: AthleteProfile = { ...profile, walletAddress: lowerWallet, kMinusBbPercentage: kMinusBB };
    setProfile(updatedProfile);
    localStorage.setItem(`athlete_profile_${lowerWallet}`, JSON.stringify(updatedProfile));

    setLeaderboardRows((prev) => {
      const exists = prev.some((p) => p.email.toLowerCase() === updatedProfile.email.toLowerCase() || p.fullName.toLowerCase() === updatedProfile.fullName.toLowerCase());
      if (exists) return prev.map((p) => (p.email.toLowerCase() === updatedProfile.email.toLowerCase() || p.fullName.toLowerCase() === updatedProfile.fullName.toLowerCase() ? updatedProfile : p));
      return [updatedProfile, ...prev];
    });

    try {
      await secureCall("saveProfile", { ...updatedProfile, athleteEmail: updatedProfile.email });
      setIsSavingProfile(false);
      setSaveNotice({ ok: true, text: "Profile saved. Your numbers are on the scoreboard." });
      if (!isUnlocked) setShowClaimPromptModal(true);
    } catch (err) { setIsSavingProfile(false); setSaveNotice({ ok: false, text: err instanceof Error ? err.message : "Your profile wasn't saved. Try again." }); }
  };

  const handleInitiateIntro = (brand: BrandItem) => {
    if (isIntroActive(brand.name)) { setDispatchedBrand(brand); setIsLockoutModal(true); return; }
    if (!account) { handleOpenLogin("ATHLETE"); return; }
    if (!profile.fullName || !profile.email) { setActiveMainTab("LOCKER"); return; }
    if (!isUnlocked) { setShowClaimPromptModal(true); return; }
    setPendingIntroBrand(brand);
  };

  const handleConfirmAndSendIntro = async () => {
    if (!pendingIntroBrand) return;
    const brand = pendingIntroBrand; setPendingIntroBrand(null);
    try {
      await secureCall("requestIntro", { brandName: brand.name });
      setIntroTimestamps((prev) => ({ ...prev, [brand.name]: Date.now() }));
      setDispatchedBrand(brand); setIsLockoutModal(false);
    } catch (err) { alert(err instanceof Error ? err.message : "Your intro wasn't sent. Try again."); }
  };

  const flattenedBrands = useMemo(() => {
    const list: (BrandItem & { sectionTitle: string; sectionEmoji: string })[] = [];
    MARKET_SECTIONS.forEach((sec) => sec.brands.forEach((b) => list.push({ ...b, sectionTitle: sec.title, sectionEmoji: sec.emoji })));
    return list.filter((b) => {
      if (brandCategoryFilter === "DIRECT") return b.type === "email_intro";
      if (brandCategoryFilter === "PERKS") return Boolean(b.couponCode) || b.type === "email_intro";
      if (brandCategoryFilter === "GEAR") return ["Technology", "Hitting", "Equipment", "Eyewear & Vision"].includes(b.sectionTitle);
      if (brandCategoryFilter === "APPAREL") return ["Clothing & Apparel", "Footwear", "Nutrition", "Player Services"].includes(b.sectionTitle);
      return true;
    });
  }, [brandCategoryFilter]);

  const filteredScoreboard = useMemo(() => {
    return leaderboardRows.filter((ath) => {
      if (ath.isProfileVisible === false || String(ath.isProfileVisible).toLowerCase() === "false") return false;
      if (searchQuery && searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        if (!(ath.fullName || "").toLowerCase().includes(q) && !(ath.college || "").toLowerCase().includes(q) && !(ath.state || "").toLowerCase().includes(q)) return false;
      }
      if (regionFilter !== "ALL" && (!ath.state || !(REGIONS[regionFilter] || []).includes(ath.state.toUpperCase()))) return false;
      if (roleFilter !== "ALL") {
        if (roleFilter === "TWP" && ath.primaryRole !== "TWP") return false;
        if (roleFilter === "HITTER" && ath.primaryRole !== "HITTER" && ath.primaryRole !== "TWP") return false;
        if (roleFilter === "PITCHER" && ath.primaryRole !== "PITCHER" && ath.primaryRole !== "TWP") return false;
      }
      if (positionFilter !== "ALL" && ath.position && !ath.position.toUpperCase().includes(positionFilter.toUpperCase())) return false;
      if (statusFilter !== "ALL" && ath.playerStatus && !ath.playerStatus.toLowerCase().includes(statusFilter.toLowerCase())) return false;
      if (stateFilter !== "ALL" && ath.state && ath.state.toUpperCase() !== stateFilter.toUpperCase()) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "MAX_EV") return (parseFloat(b.maxExitVelo || "0") || 0) - (parseFloat(a.maxExitVelo || "0") || 0);
      if (sortBy === "PEAK_FB") return (parseFloat(b.peakFB || "0") || 0) - (parseFloat(a.peakFB || "0") || 0);
      if (sortBy === "STUFF_PLUS") return (parseFloat(b.stuffPlus || "0") || 0) - (parseFloat(a.stuffPlus || "0") || 0);
      if (sortBy === "IVB") return (parseFloat(b.inducedVertBreak || "0") || 0) - (parseFloat(a.inducedVertBreak || "0") || 0);
      return 0;
    });
  }, [leaderboardRows, searchQuery, roleFilter, positionFilter, statusFilter, regionFilter, stateFilter, sortBy]);

  if (!mounted) return null;

  return (
    <div className="app-shell" style={{ minHeight: "100vh", backgroundColor: "#050507", backgroundImage: "radial-gradient(circle at 50% 0%, rgba(166, 255, 0, 0.07) 0%, transparent 55%)", color: "#ffffff", fontFamily: "var(--font-body), sans-serif", paddingBottom: "96px" }}>
      
      {/* PRO SCOUT / AGENT ONBOARDING MODAL OVERLAY */}
      {userRole === "SCOUT" && !isScoutOnboarded && account && accountLoaded && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(5, 5, 7, 0.98)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "16px" }}>
          <div style={{ backgroundColor: "#0c0c10", border: `2px solid ${NEON_GREEN}`, borderRadius: "22px", width: "100%", maxWidth: "480px", padding: "26px", boxShadow: "0 0 45px rgba(166, 255, 0, 0.15)" }}>
            <span style={{ fontSize: "12px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>Verified Pro Gateway</span>
            <h3 style={{ margin: "6px 0 10px 0", fontSize: "22px", fontWeight: "950", textTransform: "uppercase", color: "#ffffff" }}>Submit Your Credentials</h3>
            <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: "1.5", margin: "0 0 20px 0" }}>Provide your professional credentials below. Once verified by our team, you will unlock immediate access to athlete phone numbers, emails, and full video links on the National Scoreboard.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ffffff", marginBottom: "4px", textTransform: "uppercase" }}>Full Name *</label><input type="text" value={scoutProfile.fullName || ""} onChange={(e) => setScoutProfile(prev => ({ ...prev, fullName: e.target.value }))} placeholder="e.g. Jason Smith" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
              <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ffffff", marginBottom: "4px", textTransform: "uppercase" }}>University / Agency / MLB Org *</label><input type="text" value={scoutProfile.organization || ""} onChange={(e) => setScoutProfile(prev => ({ ...prev, organization: e.target.value }))} placeholder="e.g. State University Baseball" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ffffff", marginBottom: "4px", textTransform: "uppercase" }}>Job Title</label><input type="text" value={scoutProfile.jobTitle || ""} onChange={(e) => setScoutProfile(prev => ({ ...prev, jobTitle: e.target.value }))} placeholder="Recruiting Coord." style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
                <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ffffff", marginBottom: "4px", textTransform: "uppercase" }}>Work Email</label><input type="email" value={scoutProfile.email || ""} onChange={(e) => setScoutProfile(prev => ({ ...prev, email: e.target.value }))} placeholder="coach@state.edu" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
              </div>
              <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ff9933", marginBottom: "4px", textTransform: "uppercase" }}>Identity Verification Link (Required) *</label><input type="url" value={scoutProfile.verificationLink || ""} onChange={(e) => setScoutProfile(prev => ({ ...prev, verificationLink: e.target.value }))} placeholder="Link to your LinkedIn or official staff directory page" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #ff7a00", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
            </div>

            <button onClick={handleSaveScoutProfile} disabled={isSavingScout} style={{ width: "100%", backgroundColor: NEON_GREEN, color: "#000", fontWeight: "950", padding: "14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px", textTransform: "uppercase" }}>{isSavingScout ? "Submitting..." : "Submit for Verification ➔"}</button>
          </div>
        </div>
      )}

      {/* SCOUT PENDING VERIFICATION NOTIFICATION MODAL */}
      {showScoutPendingModal && account && userRole === "SCOUT" && !isScoutApproved && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(5, 5, 7, 0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1900, padding: "16px" }}>
          <div style={{ backgroundColor: "#0c0c10", border: `2px solid #ffb800`, borderRadius: "22px", width: "100%", maxWidth: "460px", padding: "26px", textAlign: "center", boxShadow: "0 0 45px rgba(255, 184, 0, 0.15)" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏳</div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "22px", fontWeight: "950", textTransform: "uppercase", color: "#ffffff" }}>Credentials Under Review</h3>
            <p style={{ fontSize: "14px", color: "#d4d4d8", lineHeight: "1.5", margin: "0 0 24px 0" }}>Your application for Verified Pro Access has been submitted successfully and is currently under review by our administration team. <br/><br/>To protect the privacy of our athletes, player contact information and unlisted video links will remain locked during this holding period. You will receive an email as soon as your credentials are approved.</p>
            <button onClick={() => setShowScoutPendingModal(false)} style={{ width: "100%", backgroundColor: "#181822", color: "#ffffff", border: "1px solid #383846", fontWeight: "900", padding: "14px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", textTransform: "uppercase" }}>Understood, Return to Scoreboard</button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "18px 14px" }}>
        
        {/* Clean Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #1c1c24", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div>
              <div style={{ fontFamily: "var(--font-display), sans-serif", fontSize: "26px", fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>The Diamond Collective</div>
              <div className="header-tagline" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                <span style={{ fontSize: "12px", color: NEON_GREEN, fontWeight: "800", letterSpacing: "0.8px", textTransform: "uppercase" }}>College Scouting & Brand Perks</span>
                {account && <><span style={{ fontSize: "12px", color: "#71717a" }}>•</span>
                <span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: "700" }}>{totalSupplyData !== undefined ? `${remainingPercentage}% Founders Keys Left` : `${BRAND_COUNT} Brand Partners`}</span></>}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {account ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {userRole === "SCOUT" && isScoutOnboarded && (
                   <span onClick={() => { if (!isScoutApproved) setShowScoutPendingModal(true); }} style={{ backgroundColor: isScoutApproved ? "rgba(166, 255, 0, 0.12)" : "rgba(255, 184, 0, 0.12)", border: `1px solid ${isScoutApproved ? NEON_GREEN : "#ffb800"}`, color: isScoutApproved ? NEON_GREEN : "#ffb800", fontSize: "12px", fontWeight: "900", padding: "7px 10px", borderRadius: "8px", textTransform: "uppercase", cursor: isScoutApproved ? "default" : "pointer" }}>
                     {isScoutApproved ? "Verified Pro" : "Pro Review Pending"}
                   </span>
                )}
                {userRole === "ATHLETE" && isUnlocked && <span style={{ backgroundColor: "rgba(166, 255, 0, 0.12)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontSize: "12px", fontWeight: "900", padding: "7px 10px", borderRadius: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>✅ 100 $SLUG Member</span>}
                <ConnectButton client={client} wallets={supportedWallets} accountAbstraction={{ chain: base, sponsorGas: true }} chain={base} theme="dark" connectButton={{ label: "Manage Account" }} />
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleOpenLogin("SCOUT")} style={{ backgroundColor: "transparent", border: "1px solid #383846", color: "#d4d4d8", fontSize: "13px", fontWeight: "800", padding: "8px 12px", borderRadius: "8px", cursor: "pointer" }}>Coach & Scout Access</button>
                <button onClick={() => handleOpenLogin("ATHLETE")} style={{ backgroundColor: NEON_GREEN, border: "none", color: "#000000", fontSize: "13px", fontWeight: "900", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}>Athlete Sign In</button>
              </div>
            )}
          </div>
        </header>

        {!account && activeMainTab === "SCOREBOARD" && !openedPlayerLink && (
          <HomeHero brandCount={BRAND_COUNT} onJoinClick={() => handleOpenLogin("ATHLETE")} onBrandsClick={() => setActiveMainTab("EXCHANGE")} onCoachClick={() => handleOpenLogin("SCOUT")} />
        )}

        {/* STEP-BY-STEP ONBOARDING BAR */}
        {account && !isFullyOnboardedAthlete && userRole !== "SCOUT" && (
          <div style={{ backgroundColor: "#0c0c12", border: `1.5px solid ${NEON_GREEN}`, borderRadius: "16px", padding: "14px 16px", marginTop: "16px", boxShadow: "0 8px 28px rgba(166, 255, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}><span style={{ fontSize: "13px", fontWeight: "950", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "0.8px" }}>🚀 Athlete Quick-Start</span><span style={{ fontSize: "12px", color: "#a1a1aa", fontWeight: "700" }}>Takes 60 Seconds</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
              <button onClick={() => !account && handleOpenLogin("ATHLETE")} style={{ backgroundColor: account ? "rgba(166, 255, 0, 0.08)" : NEON_GREEN, color: account ? NEON_GREEN : "#000000", border: account ? `1px solid ${NEON_GREEN}` : "none", borderRadius: "10px", padding: "10px 12px", textAlign: "left", cursor: account ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "900", fontSize: "13px" }}><span>1. Sign In</span><span>{account ? "✅ Done" : "Tap Here ➔"}</span></button>
              <button onClick={() => { if (!account) handleOpenLogin("ATHLETE"); else setActiveMainTab("LOCKER"); }} style={{ backgroundColor: hasProfile ? "rgba(166, 255, 0, 0.08)" : account ? NEON_GREEN : "#16161d", color: hasProfile ? NEON_GREEN : account ? "#000000" : "#a1a1aa", border: hasProfile ? `1px solid ${NEON_GREEN}` : "1px solid #2e2e3a", borderRadius: "10px", padding: "10px 12px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "900", fontSize: "13px" }}><span>2. Fill Locker</span><span>{hasProfile ? "✅ Done" : account ? "Open Locker ➔" : "🔒 Step 2"}</span></button>
              <button onClick={() => { if (!account) handleOpenLogin("ATHLETE"); else if (!hasProfile) setActiveMainTab("LOCKER"); else setShowClaimPromptModal(true); }} style={{ backgroundColor: isUnlocked ? "rgba(166, 255, 0, 0.08)" : (account && hasProfile) ? NEON_GREEN : "#16161d", color: isUnlocked ? NEON_GREEN : (account && hasProfile) ? "#000000" : "#a1a1aa", border: isUnlocked ? `1px solid ${NEON_GREEN}` : "1px solid #2e2e3a", borderRadius: "10px", padding: "10px 12px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "900", fontSize: "13px" }}><span>3. Claim 100 $SLUG</span><span>{isUnlocked ? "✅ Active" : (account && hasProfile) ? "Claim Now 🔑" : "🔒 Step 3"}</span></button>
            </div>
          </div>
        )}

        {/* 3-PILLAR TOP NAVIGATION BAR */}
        <div className="top-tabs" style={{ display: "grid", gridTemplateColumns: userRole === "SCOUT" ? "1fr" : "1fr 1fr 1fr", gap: "8px", margin: "18px 0 22px 0", backgroundColor: "#0b0b0f", padding: "6px", borderRadius: "16px", border: "1px solid #22222c" }}>
          <button onClick={() => setActiveMainTab("SCOREBOARD")} style={{ backgroundColor: activeMainTab === "SCOREBOARD" ? NEON_GREEN : "transparent", color: activeMainTab === "SCOREBOARD" ? "#000000" : "#ffffff", border: "none", borderRadius: "12px", padding: "12px 8px", cursor: "pointer", textAlign: "center", fontWeight: "950", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.4px", transition: "all 0.15s ease" }}>🏆 Scoreboard ({filteredScoreboard.length})</button>
          {userRole !== "SCOUT" && (
            <>
              <button onClick={() => setActiveMainTab("EXCHANGE")} style={{ backgroundColor: activeMainTab === "EXCHANGE" ? NEON_GREEN : "transparent", color: activeMainTab === "EXCHANGE" ? "#000000" : "#ffffff", border: "none", borderRadius: "12px", padding: "12px 8px", cursor: "pointer", textAlign: "center", fontWeight: "950", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.4px", transition: "all 0.15s ease" }}>🤝 Brand Deals ({BRAND_COUNT})</button>
              <button onClick={() => setActiveMainTab("LOCKER")} style={{ backgroundColor: activeMainTab === "LOCKER" ? NEON_GREEN : "transparent", color: activeMainTab === "LOCKER" ? "#000000" : "#ffffff", border: "none", borderRadius: "12px", padding: "12px 8px", cursor: "pointer", textAlign: "center", fontWeight: "950", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.4px", transition: "all 0.15s ease" }}>👤 My Locker {hasProfile ? "✓" : "⚙️"}</button>
            </>
          )}
        </div>

        {/* =====================================================================
            TAB 1: NATIONAL SCOUTING SCOREBOARD
           ===================================================================== */}
        {activeMainTab === "SCOREBOARD" && (
          <section>
            {/* Search & Quick Filter Bar */}
            <div style={{ backgroundColor: "#0c0c10", border: "1px solid #1e1e26", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Search player name, state, or college..." style={{ flex: "1 1 220px", backgroundColor: "#14141a", border: `1.5px solid ${searchQuery ? NEON_GREEN : "#2c2c36"}`, color: "#ffffff", padding: "11px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", outline: "none" }} />
                {searchQuery && <button onClick={() => { setSearchQuery(""); if (typeof window !== "undefined" && window.location.search) window.history.replaceState({}, "", window.location.pathname); }} style={{ backgroundColor: "#22222c", border: "1px solid #3f3f4e", color: "#ffffff", padding: "10px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}>Clear ✕</button>}
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} style={{ backgroundColor: "#14141a", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontWeight: "900", padding: "10px 12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer" }}><option value="DEFAULT">Sort: Latest Added</option><option value="PEAK_FB">Sort: Peak Fastball ↓</option><option value="STUFF_PLUS">Sort: Stuff+ Grade ↓</option><option value="IVB">Sort: Induced Vert Break ↓</option><option value="MAX_EV">Sort: Max Exit Velo ↓</option></select>
                <button onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} style={{ backgroundColor: showAdvancedFilters ? "#22222c" : "#14141a", border: "1px solid #333340", color: "#ffffff", padding: "10px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}>{showAdvancedFilters ? "Hide Filters ▲" : "Filters ▼"}</button>
              </div>

              {/* Role Filter Pills */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {(["ALL", "HITTER", "PITCHER", "TWP"] as const).map((r) => (
                    <button key={r} onClick={() => setRoleFilter(r)} style={{ backgroundColor: roleFilter === r ? NEON_GREEN : "#15151c", color: roleFilter === r ? "#000000" : "#d4d4d8", border: roleFilter === r ? `1px solid ${NEON_GREEN}` : "1px solid #2b2b36", fontWeight: "900", fontSize: "13px", padding: "7px 14px", borderRadius: "999px", textTransform: "uppercase", cursor: "pointer" }}>{r === "TWP" ? "⚡ Two-Way" : r === "ALL" ? "All Players" : `${r}s`}</button>
                  ))}
                </div>
                {userRole !== "SCOUT" && <button onClick={() => setActiveMainTab("LOCKER")} style={{ backgroundColor: "rgba(166, 255, 0, 0.14)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontWeight: "900", padding: "7px 14px", borderRadius: "999px", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>+ Post / Edit My Numbers ➔</button>}
              </div>

              {showAdvancedFilters && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #1e1e26" }}>
                  <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "4px" }}>Scouting Region</label><select value={regionFilter} onChange={(e) => { setRegionFilter(e.target.value); setStateFilter("ALL"); }} style={{ width: "100%", backgroundColor: "#14141a", border: "1px solid #33333d", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="ALL">All Regions</option>{Object.keys(REGIONS).map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                  <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "4px" }}>State</label><select value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setRegionFilter("ALL"); }} style={{ width: "100%", backgroundColor: "#14141a", border: "1px solid #33333d", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="ALL">All States</option>{US_STATES.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></div>
                  <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "4px" }}>Position</label><select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} style={{ width: "100%", backgroundColor: "#14141a", border: "1px solid #33333d", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="ALL">All Positions</option><option value="RHP">RHP</option><option value="LHP">LHP</option><option value="C">Catcher (C)</option><option value="MIF">Middle Inf (MIF)</option><option value="SS">Shortstop (SS)</option><option value="3B">Third Base (3B)</option><option value="1B">First Base (1B)</option><option value="OF">Outfield (OF)</option></select></div>
                  <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "4px" }}>Roster / Portal Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: "100%", backgroundColor: "#14141a", border: "1px solid #33333d", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="ALL">All Statuses</option><option value="Transfer Portal">Transfer Portal</option><option value="Juco Uncommitted">Juco Uncommitted</option><option value="Returning">Returning College</option><option value="Incoming Freshman">Incoming Freshman</option></select></div>
                </div>
              )}
            </div>

            {/* Scannable Player List */}
            {filteredScoreboard.length === 0 ? (
              <div style={{ backgroundColor: "#0a0a0d", border: "1px solid #1e1e26", borderRadius: "16px", padding: "36px 20px", textAlign: "center", color: "#d4d4d8" }}>
                {loadingScoreboard ? "Loading live national scoreboard..." : "No players match these filters."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredScoreboard.map((ath, idx) => {
                  const isExpanded = expandedCardIdx === idx;
                  const isAthleteTWP = ath.primaryRole === "TWP";
                  const isPitcherRole = ath.primaryRole === "PITCHER" || isAthleteTWP;
                  const isHitterRole = ath.primaryRole === "HITTER" || isAthleteTWP;

                  const isCurrentUser = Boolean(account && profile.fullName && ath.fullName && profile.fullName.toLowerCase().trim() === ath.fullName.toLowerCase().trim());
                  const canViewContact = (userRole === "SCOUT" && isScoutApproved) || isCurrentUser;
                  const contact: AthleteContact | undefined = isCurrentUser ? { fullName: profile.fullName, email: profile.email, phone: profile.phone, verificationLink: profile.verificationLink } : contactsByName[(ath.fullName || "").toLowerCase().trim()];

                  const isEliteFB = parseFloat(ath.peakFB || "0") >= 92; const isEliteStuff = parseFloat(ath.stuffPlus || "0") >= 110; const isEliteIVB = parseFloat(ath.inducedVertBreak || "0") >= 18; const isEliteEV = parseFloat(ath.maxExitVelo || "0") >= 100; const isElite60 = parseFloat(ath.sixtyTime || "99") <= 6.65;
                  const headlinePills: { label: string; val: string; elite?: boolean }[] = [];
                  if (isPitcherRole) {
                    if (ath.peakFB) headlinePills.push({ label: "FB", val: `${ath.peakFB} mph`, elite: isEliteFB });
                    if (ath.stuffPlus) headlinePills.push({ label: "Stuff+", val: ath.stuffPlus, elite: isEliteStuff });
                    if (ath.inducedVertBreak) headlinePills.push({ label: "IVB", val: `${ath.inducedVertBreak}"`, elite: isEliteIVB });
                  }
                  if (isHitterRole) {
                    if (ath.maxExitVelo) headlinePills.push({ label: "Max EV", val: `${ath.maxExitVelo} mph`, elite: isEliteEV });
                    if (ath.batSpeed) headlinePills.push({ label: "Bat", val: `${ath.batSpeed} mph` });
                    if (ath.sixtyTime) headlinePills.push({ label: "60yd", val: `${ath.sixtyTime}s`, elite: isElite60 });
                  }

                  const isLinkCopied = copiedPlayerName === (ath.fullName || "Athlete");

                  return (
                    <div key={idx} style={{ backgroundColor: "#0d0d12", border: isExpanded || isCurrentUser ? `1.5px solid ${NEON_GREEN}` : "1px solid #24242e", borderRadius: "14px", padding: "14px 16px", transition: "all 0.15s ease" }}>
                      <div onClick={() => setExpandedCardIdx(isExpanded ? null : idx)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", cursor: "pointer" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "200px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: "950", color: "#ffffff", fontSize: "17px" }}>{ath.fullName || "Member Athlete"}</span>
                            {isCurrentUser && <span style={{ backgroundColor: NEON_GREEN, color: "#000000", padding: "2px 7px", borderRadius: "999px", fontSize: "11px", fontWeight: "950", textTransform: "uppercase" }}>⭐ YOU</span>}
                            <span style={{ backgroundColor: isAthleteTWP ? "rgba(166, 255, 0, 0.16)" : "#1b1b24", border: `1px solid ${isAthleteTWP ? NEON_GREEN : "#383846"}`, color: isAthleteTWP ? NEON_GREEN : "#d4d4d8", padding: "2px 8px", borderRadius: "999px", fontSize: "12px", fontWeight: "900", textTransform: "uppercase" }}>{ath.position || ath.primaryRole}</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#d4d4d8", fontWeight: "700" }}><span style={{ color: NEON_GREEN, fontWeight: "800" }}>🏛️ {ath.college || "Undeclared"}</span>{ath.state ? ` (${ath.state})` : ""} {ath.height && ath.weight ? ` • ${ath.height} / ${ath.weight} lbs` : ""} <span> • {ath.playerStatus}</span></div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          {headlinePills.slice(0, 4).map((p, pIdx) => (
                            <div key={pIdx} style={{ backgroundColor: p.elite ? "rgba(255, 184, 0, 0.14)" : "#14141c", border: `1px solid ${p.elite ? "#ffb800" : "#2e2e3a"}`, padding: "5px 10px", borderRadius: "8px", fontFamily: "monospace", fontSize: "12px", fontWeight: "900" }}><span style={{ color: p.elite ? "#ffb800" : NEON_GREEN }}>{p.elite ? "🔥 " : ""}{p.label}: </span><span style={{ color: "#ffffff" }}>{p.val}</span></div>
                          ))}
                          <button onClick={(e) => handleCopyPlayerLink(ath.fullName, e)} title="Copy direct link" style={{ backgroundColor: isLinkCopied ? NEON_GREEN : "#16161f", border: `1px solid ${isLinkCopied ? NEON_GREEN : "#383846"}`, color: isLinkCopied ? "#000000" : "#ffffff", padding: "6px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: "900", cursor: "pointer" }}>{isLinkCopied ? "✓ Link Copied" : "🔗 Link"}</button>
                          <button onClick={(e) => { e.stopPropagation(); triggerMobileScoutShare(ath); }} style={{ backgroundColor: "rgba(166, 255, 0, 0.14)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "6px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: "900", cursor: "pointer" }}>📸 4:5 Card</button>
                          <span style={{ fontSize: "13px", color: "#a1a1aa", fontWeight: "800", marginLeft: "4px" }}>{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #22222c", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                            {isPitcherRole && (
                              <div style={{ backgroundColor: "#07070a", border: "1px solid #24242e", borderRadius: "12px", padding: "14px" }}>
                                <div style={{ color: NEON_GREEN, fontWeight: "900", marginBottom: "10px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.8px" }}>⚾ Mound Telemetry & Visual Benchmarks</div>
                                <MetricBar label="PEAK FASTBALL" valueStr={ath.peakFB} unit=" mph" min={78} max={98} eliteThreshold={92} subLabel={ath.sittingFB ? `Sit ${ath.sittingFB}` : undefined} />
                                <MetricBar label="STUFF+ GRADE" valueStr={ath.stuffPlus} unit="" min={80} max={140} eliteThreshold={110} subLabel="100 = Avg" />
                                <MetricBar label="INDUCED VERT BREAK" valueStr={ath.inducedVertBreak} unit='"' min={8} max={24} eliteThreshold={18} subLabel="Carry" />
                                <MetricBar label="FASTBALL SPIN" valueStr={ath.fbSpinRate} unit=" RPM" min={1800} max={2700} eliteThreshold={2400} />
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", color: "#d4d4d8", fontSize: "13px", fontFamily: "monospace", fontWeight: "800", marginTop: "8px" }}>
                                  {ath.horizontalBreak && <span style={{ backgroundColor: "#121218", padding: "4px 8px", borderRadius: "6px" }}>HB: {ath.horizontalBreak}"</span>}
                                  {ath.releaseExtension && <span style={{ backgroundColor: "#121218", padding: "4px 8px", borderRadius: "6px" }}>Ext: {ath.releaseExtension}ft</span>}
                                  {ath.vertApproachAngle && <span style={{ backgroundColor: "#121218", padding: "4px 8px", borderRadius: "6px" }}>VAA: {ath.vertApproachAngle}°</span>}
                                  {ath.offSpeedVelo && <span style={{ backgroundColor: "#121218", padding: "4px 8px", borderRadius: "6px" }}>{ath.offSpeedType || "Slider"}: {ath.offSpeedVelo} mph</span>}
                                  {ath.kMinusBbPercentage && <span style={{ backgroundColor: "#121218", padding: "4px 8px", borderRadius: "6px" }}>K-BB%: {ath.kMinusBbPercentage}%</span>}
                                </div>
                              </div>
                            )}

                            {isHitterRole && (
                              <div style={{ backgroundColor: "#07070a", border: "1px solid #24242e", borderRadius: "12px", padding: "14px" }}>
                                <div style={{ color: NEON_GREEN, fontWeight: "900", marginBottom: "10px", textTransform: "uppercase", fontSize: "12px", letterSpacing: "0.8px" }}>💥 Hitting & Speed Visual Benchmarks</div>
                                <MetricBar label="MAX EXIT VELO" valueStr={ath.maxExitVelo} unit=" mph" min={82} max={110} eliteThreshold={100} />
                                <MetricBar label="90TH% EXIT VELO" valueStr={ath.ninetyEV} unit=" mph" min={78} max={105} eliteThreshold={95} subLabel="Consistency" />
                                <MetricBar label="BAT SPEED" valueStr={ath.batSpeed} unit=" mph" min={62} max={85} eliteThreshold={75} subLabel="Blast" />
                                <MetricBar label="60-YARD DASH" valueStr={ath.sixtyTime} unit="s" min={6.2} max={7.5} eliteThreshold={6.65} invert={true} subLabel="Laser" />
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                              {canViewContact ? (
                                <>
                                  {contact?.verificationLink && contact.verificationLink.startsWith("http") && <a href={contact.verificationLink} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "rgba(255, 122, 0, 0.15)", border: "1px solid #ff7a00", color: "#ff9933", padding: "7px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: "900" }}>🎥 Watch Video Clip ↗</a>}
                                  {contact?.phone && <a href={`tel:${contact.phone}`} style={{ backgroundColor: "#181822", border: "1px solid #3f3f4e", color: "#ffffff", padding: "7px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: "900" }}>📞 {contact.phone}</a>}
                                  {contact?.email && <a href={`mailto:${contact.email}`} style={{ backgroundColor: "#181822", border: "1px solid #3f3f4e", color: "#ffffff", padding: "7px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: "900" }}>✉️ {contact.email}</a>}
                                </>
                              ) : (
                                <button onClick={() => { if (!account) handleOpenLogin("SCOUT"); else if (userRole === "SCOUT" && !isScoutApproved) setShowScoutPendingModal(true); }} style={{ backgroundColor: "#121218", border: `1px dashed ${NEON_GREEN}`, color: NEON_GREEN, padding: "7px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}>
                                  🔒 Contact & Video: {userRole === "SCOUT" && !isScoutApproved ? "[Pro Verification Pending]" : "[Verified Pro Login Required]"}
                                </button>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {ath.social1_Url && <a href={ath.social1_Url} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#1c1c24", border: "1px solid #44444f", color: NEON_GREEN, padding: "7px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: "900" }}>{ath.social1_Type || "Social 1"} ↗</a>}
                              {ath.social2_Url && <a href={ath.social2_Url} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#1c1c24", border: "1px solid #44444f", color: NEON_GREEN, padding: "7px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: "900" }}>{ath.social2_Type || "Social 2"} ↗</a>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* =====================================================================
            TAB 2: BRAND DEALS & TAB 3: LOCKER (ATHLETES ONLY)
           ===================================================================== */}
        {activeMainTab === "EXCHANGE" && userRole !== "SCOUT" && (
          <section>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "14px" }}>
              {flattenedBrands.map((brand, bIdx) => {
                const isDirectIntro = brand.type === "email_intro"; const hasCoupon = Boolean(brand.couponCode); const activeIntro = isIntroActive(brand.name);
                return (
                  <div key={bIdx} style={{ backgroundColor: "#0c0c10", border: (isDirectIntro || hasCoupon) ? `1.5px solid rgba(166, 255, 0, 0.55)` : "1px solid #1e1e26", borderRadius: "14px", padding: "18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", fontWeight: "900", color: isDirectIntro ? NEON_GREEN : "#a1a1aa", textTransform: "uppercase" }}>{brand.sectionEmoji} {brand.sectionTitle}</span>
                        {isDirectIntro && <span style={{ backgroundColor: "rgba(166, 255, 0, 0.12)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontSize: "11px", fontWeight: "900", padding: "2px 7px", borderRadius: "999px", textTransform: "uppercase" }}>⚡ Direct Rep Intro</span>}
                      </div>
                      <h4 style={{ fontSize: "18px", fontWeight: "950", color: "#ffffff", margin: "0 0 4px 0", textTransform: "uppercase" }}>{brand.name}</h4>
                      <div style={{ fontSize: "13px", color: NEON_GREEN, fontWeight: "800", marginBottom: "8px" }}>{brand.tagline}</div>
                      <p style={{ fontSize: "12px", color: "#d4d4d8", lineHeight: "1.45", margin: 0 }}>{brand.description}</p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                      {hasCoupon && (
                        <div>
                          {!account ? <button onClick={() => handleOpenLogin("ATHLETE")} style={{ width: "100%", backgroundColor: "#16161f", color: NEON_GREEN, border: `1px dashed ${NEON_GREEN}`, fontWeight: "900", padding: "9px", borderRadius: "8px", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>🔒 Sign In to Unlock 20% Off Code</button> : !hasProfile ? <button onClick={() => setActiveMainTab("LOCKER")} style={{ width: "100%", backgroundColor: "#16161f", color: NEON_GREEN, border: `1px dashed ${NEON_GREEN}`, fontWeight: "900", padding: "9px", borderRadius: "8px", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>🔒 Complete Locker for 20% Off Code</button> : !isUnlocked ? <button onClick={() => setShowClaimPromptModal(true)} style={{ width: "100%", backgroundColor: "#16161f", color: NEON_GREEN, border: `1px dashed ${NEON_GREEN}`, fontWeight: "900", padding: "9px", borderRadius: "8px", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>🔑 Claim 100 $SLUG to Unlock 20% Off</button> : !codeRevealed ? <button onClick={() => setCodeRevealed(true)} style={{ width: "100%", backgroundColor: "rgba(166, 255, 0, 0.12)", color: NEON_GREEN, border: `1px dashed ${NEON_GREEN}`, fontWeight: "900", padding: "9px", borderRadius: "8px", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>🔓 Reveal 20% Off Member Code</button> : (
                            <div style={{ backgroundColor: "rgba(166, 255, 0, 0.1)", border: `1.5px dashed ${NEON_GREEN}`, borderRadius: "8px", padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <span style={{ display: "block", fontSize: "11px", color: NEON_GREEN, fontWeight: "800", textTransform: "uppercase" }}>{brand.couponLabel || "20% Off Code"} (<a href={brand.link} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "underline" }}>Shop ↗</a>)</span>
                                <span style={{ fontSize: "13px", fontWeight: "950", color: "#ffffff", fontFamily: "monospace" }}>{brand.couponCode}</span>
                              </div>
                              <button onClick={handleCopyCode} style={{ backgroundColor: copiedCode ? NEON_GREEN : "#22222a", color: copiedCode ? "#000000" : NEON_GREEN, border: `1px solid ${NEON_GREEN}`, padding: "5px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}>{copiedCode ? "Copied!" : "Copy 📋"}</button>
                            </div>
                          )}
                        </div>
                      )}
                      {isDirectIntro ? (
                        <button onClick={() => handleInitiateIntro(brand)} style={{ width: "100%", backgroundColor: activeIntro ? "#18181b" : NEON_GREEN, color: activeIntro ? "#a1a1aa" : "#000000", border: activeIntro ? "1px solid #27272a" : "none", fontWeight: "950", padding: "11px", borderRadius: "8px", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>{activeIntro ? `🔒 Intro Sent (${getDaysRemaining(brand.name)}d window)` : brand.buttonText}</button>
                      ) : (
                        <a href={brand.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", backgroundColor: "#16161c", color: "#ffffff", border: "1px solid #2e2e38", fontWeight: "800", padding: "11px", borderRadius: "8px", fontSize: "13px", textTransform: "uppercase", textDecoration: "none" }}>{brand.buttonText}</a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeMainTab === "LOCKER" && userRole !== "SCOUT" && (
          <section style={{ maxWidth: "720px", margin: "0 auto" }}>
            {!account ? (
              <div style={{ backgroundColor: "#0c0c10", border: `1.5px solid ${NEON_GREEN}`, borderRadius: "18px", padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "34px", marginBottom: "8px" }}>👤</div>
                <h2 style={{ fontSize: "20px", fontWeight: "950", textTransform: "uppercase", margin: "0 0 8px 0" }}>Sign In to Open Your Athlete Locker</h2>
                <p style={{ fontSize: "13px", color: "#d4d4d8", maxWidth: "460px", margin: "0 auto 18px auto", lineHeight: "1.5" }}>Use your Google, Apple, or phone ID to create your player card, post verified scouting metrics, and claim your free 100 $SLUG membership key.</p>
                <button onClick={() => handleOpenLogin("ATHLETE")} style={{ backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "950", padding: "13px 26px", borderRadius: "10px", border: "none", fontSize: "12px", textTransform: "uppercase", cursor: "pointer" }}>Athlete Sign In ➔</button>
              </div>
            ) : (
              <div style={{ backgroundColor: "#0c0c10", border: `1.5px solid ${NEON_GREEN}`, borderRadius: "18px", padding: "22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #22222a", paddingBottom: "16px", marginBottom: "18px" }}>
                  <div><h2 style={{ margin: 0, fontSize: "18px", fontWeight: "950", textTransform: "uppercase" }}>{profile.fullName ? `${profile.fullName}'s Locker` : "My Athlete Locker & Metrics"}</h2><p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#d4d4d8" }}>Fill out your bio and numbers below, then click <strong style={{ color: NEON_GREEN }}>Save Profile</strong>.</p></div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {hasProfile && <button type="button" onClick={() => handleCopyPlayerLink(profile.fullName)} style={{ backgroundColor: "#16161f", border: "1px solid #383846", color: "#ffffff", padding: "9px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "900", cursor: "pointer" }}>{copiedPlayerName === profile.fullName ? "✓ Profile Link Copied!" : "🔗 Copy My Profile Link"}</button>}
                    {hasProfile && <button type="button" onClick={() => triggerMobileScoutShare(profile)} style={{ backgroundColor: "rgba(166, 255, 0, 0.14)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "9px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "900", cursor: "pointer" }}>📸 Download 4:5 Card</button>}
                    {!isUnlocked && hasProfile && <button type="button" onClick={() => setShowClaimPromptModal(true)} style={{ backgroundColor: NEON_GREEN, color: "#000000", border: "none", padding: "9px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "950", cursor: "pointer", textTransform: "uppercase" }}>🔑 Claim 100 $SLUG Key</button>}
                  </div>
                </div>

                {activeIntroList.length > 0 && (
                  <div style={{ backgroundColor: "#07070a", border: "1px solid #24242e", borderRadius: "12px", padding: "12px 14px", marginBottom: "18px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", marginBottom: "6px" }}>⚡ Active Direct Brand Intros (60-Day Review Window)</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {activeIntroList.map((bName, idx) => <span key={idx} style={{ backgroundColor: "#14141c", border: "1px solid #333340", padding: "4px 10px", borderRadius: "999px", fontSize: "13px", fontWeight: "800", color: "#ffffff" }}>{bName} <span style={{ color: "#a1a1aa" }}>({getDaysRemaining(bName)}d left)</span></span>)}
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "18px" }}>
                  <button type="button" onClick={() => setActiveMatrixTab("BIO")} style={{ backgroundColor: activeMatrixTab === "BIO" ? NEON_GREEN : "#14141a", color: activeMatrixTab === "BIO" ? "#000000" : "#ffffff", border: activeMatrixTab === "BIO" ? `1px solid ${NEON_GREEN}` : "1px solid #33333d", padding: "10px", borderRadius: "10px", fontWeight: "900", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>1. Bio & Roster</button>
                  <button type="button" onClick={() => setActiveMatrixTab("HITTING")} style={{ backgroundColor: activeMatrixTab === "HITTING" ? NEON_GREEN : "#14141a", color: activeMatrixTab === "HITTING" ? "#000000" : "#ffffff", border: activeMatrixTab === "HITTING" ? `1px solid ${NEON_GREEN}` : "1px solid #33333d", padding: "10px", borderRadius: "10px", fontWeight: "900", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>2. Hitting Numbers</button>
                  <button type="button" onClick={() => setActiveMatrixTab("PITCHING")} style={{ backgroundColor: activeMatrixTab === "PITCHING" ? NEON_GREEN : "#14141a", color: activeMatrixTab === "PITCHING" ? "#000000" : "#ffffff", border: activeMatrixTab === "PITCHING" ? `1px solid ${NEON_GREEN}` : "1px solid #33333d", padding: "10px", borderRadius: "10px", fontWeight: "900", fontSize: "13px", textTransform: "uppercase", cursor: "pointer" }}>3. Pitching & Stuff+</button>
                </div>

                {activeMatrixTab === "BIO" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#ffffff", marginBottom: "4px" }}>Full Name *</label><input type="text" value={profile.fullName || ""} onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))} placeholder="e.g. Jordan Jones" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>College / Program *</label><input type="text" value={profile.college || ""} onChange={(e) => setProfile(prev => ({ ...prev, college: e.target.value }))} placeholder="e.g. Utah Tech" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                    </div>
                    <div className="form-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Height</label><input type="text" value={profile.height || ""} onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))} placeholder="6'3&quot;" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Weight</label><input type="number" value={profile.weight || ""} onChange={(e) => setProfile(prev => ({ ...prev, weight: e.target.value }))} placeholder="210" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Position</label><input type="text" value={profile.position || ""} onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))} placeholder="RHP / OF" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: NEON_GREEN, marginBottom: "4px" }}>Primary Role</label><select value={profile.primaryRole} onChange={(e) => setProfile(prev => ({ ...prev, primaryRole: e.target.value as any }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "10px 4px", borderRadius: "8px", fontSize: "13px", fontWeight: "900" }}><option value="HITTER">Hitter</option><option value="PITCHER">Pitcher</option><option value="TWP">Two-Way</option></select></div>
                    </div>
                    <div className="form-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>State</label><select value={profile.state || "UT"} onChange={(e) => setProfile(prev => ({ ...prev, state: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}>{US_STATES.map(([code]) => <option key={code} value={code}>{code}</option>)}</select></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Roster Status</label><select value={profile.playerStatus} onChange={(e) => setProfile(prev => ({ ...prev, playerStatus: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="Transfer Portal">Transfer Portal</option><option value="Returning College Player">Returning</option><option value="Incoming Freshman">Incoming Freshman</option><option value="Juco Uncommitted">Juco Uncommitted</option></select></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Class Year</label><select value={profile.collegeYear} onChange={(e) => setProfile(prev => ({ ...prev, collegeYear: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="Freshman">Freshman</option><option value="Sophomore">Sophomore</option><option value="Junior">Junior</option><option value="Senior">Senior</option><option value="Graduate">Graduate</option></select></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Email *</label><input type="email" value={profile.email || ""} onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} placeholder="athlete@school.edu" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: `1px solid ${NEON_GREEN}`, color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#ffffff", marginBottom: "4px" }}>Cell Phone *</label><input type="tel" value={profile.phone || ""} onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))} placeholder="(555) 000-0000" style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                    </div>
                  </div>
                )}

                {activeMatrixTab === "HITTING" && (
                  <div style={{ backgroundColor: "#060609", border: "1px solid #22222a", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase" }}>💥 Batter's Box Benchmarks</span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>MAX EXIT VELO (MPH)</label><input type="number" step="0.1" placeholder="103.2" value={profile.maxExitVelo || ""} onChange={(e) => setProfile(prev => ({ ...prev, maxExitVelo: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>90TH% EV (CONSISTENCY)</label><input type="number" step="0.1" placeholder="98.4" value={profile.ninetyEV || ""} onChange={(e) => setProfile(prev => ({ ...prev, ninetyEV: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>BAT SPEED (MPH)</label><input type="number" step="0.1" placeholder="76.8" value={profile.batSpeed || ""} onChange={(e) => setProfile(prev => ({ ...prev, batSpeed: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "12px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>60-YARD DASH (SEC)</label><input type="number" step="0.01" placeholder="6.65" value={profile.sixtyTime || ""} onChange={(e) => setProfile(prev => ({ ...prev, sixtyTime: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }} /></div>
                    </div>
                  </div>
                )}

                {activeMatrixTab === "PITCHING" && (
                  <div style={{ backgroundColor: "#060609", border: "1px solid #22222a", borderRadius: "14px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase" }}>⚾ Velocity, Stuff+ & Movement Shapes</span>
                    <div className="form-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>PEAK FB</label><input type="number" step="0.1" placeholder="94.5" value={profile.peakFB || ""} onChange={(e) => setProfile(prev => ({ ...prev, peakFB: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>SITTING FB</label><input type="text" placeholder="91-93" value={profile.sittingFB || ""} onChange={(e) => setProfile(prev => ({ ...prev, sittingFB: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: NEON_GREEN, marginBottom: "3px" }}>STUFF+</label><input type="number" placeholder="118" value={profile.stuffPlus || ""} onChange={(e) => setProfile(prev => ({ ...prev, stuffPlus: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "900" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>FB SPIN</label><input type="number" placeholder="2420" value={profile.fbSpinRate || ""} onChange={(e) => setProfile(prev => ({ ...prev, fbSpinRate: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                    </div>
                    <div className="form-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: NEON_GREEN, marginBottom: "3px" }}>IVB (IN)</label><input type="number" step="0.1" placeholder="18.2" value={profile.inducedVertBreak || ""} onChange={(e) => setProfile(prev => ({ ...prev, inducedVertBreak: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>HB (IN)</label><input type="number" step="0.1" placeholder="14.5" value={profile.horizontalBreak || ""} onChange={(e) => setProfile(prev => ({ ...prev, horizontalBreak: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>EXT (FT)</label><input type="number" step="0.1" placeholder="6.8" value={profile.releaseExtension || ""} onChange={(e) => setProfile(prev => ({ ...prev, releaseExtension: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>VAA (°)</label><input type="number" step="0.1" placeholder="-4.6" value={profile.vertApproachAngle || ""} onChange={(e) => setProfile(prev => ({ ...prev, vertApproachAngle: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                    </div>
                    <div className="form-grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>OFF-SPEED</label>
                        <select value={profile.offSpeedType || "Slider"} onChange={(e) => setProfile(prev => ({ ...prev, offSpeedType: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px 4px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="Slider">Slider</option><option value="Sweeper">Sweeper</option><option value="Curveball">Curveball</option><option value="Changeup">Changeup</option><option value="Cutter">Cutter</option><option value="Splitter">Splitter</option></select>
                      </div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>OS VELO</label><input type="number" step="0.1" placeholder="83.4" value={profile.offSpeedVelo || ""} onChange={(e) => setProfile(prev => ({ ...prev, offSpeedVelo: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>K%</label><input type="number" step="0.1" placeholder="30" value={profile.kPercentage || ""} onChange={(e) => setProfile(prev => ({ ...prev, kPercentage: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                      <div><label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>BB%</label><input type="number" step="0.1" placeholder="6" value={profile.bbPercentage || ""} onChange={(e) => setProfile(prev => ({ ...prev, bbPercentage: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} /></div>
                    </div>
                  </div>
                )}

                {/* Video & Social Proof Inputs */}
                <div style={{ borderTop: "1px solid #22222a", paddingTop: "14px", marginTop: "16px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "900", color: "#ff9933", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "6px" }}>🎥 Video / TrackMan / TAG Sports Clip Link (Optional)</span>
                  <input type="url" placeholder="https://x.com/... or YouTube / TAG Sports video link" value={profile.verificationLink || ""} onChange={(e) => setProfile(prev => ({ ...prev, verificationLink: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }} />
                  <span style={{ fontSize: "12px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>Public Social Links (For Coaches & Scouts)</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px", marginBottom: "8px" }}>
                    <select value={profile.social1_Type || "X"} onChange={(e) => setProfile(prev => ({ ...prev, social1_Type: e.target.value }))} style={{ backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="X">X (Twitter)</option><option value="IG">Instagram</option><option value="TIKTOK">TikTok</option></select>
                    <input type="url" placeholder="https://x.com/athlete" value={profile.social1_Url || ""} onChange={(e) => setProfile(prev => ({ ...prev, social1_Url: e.target.value }))} style={{ backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px" }}>
                    <select value={profile.social2_Type || "IG"} onChange={(e) => setProfile(prev => ({ ...prev, social2_Type: e.target.value }))} style={{ backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}><option value="IG">Instagram</option><option value="X">X (Twitter)</option><option value="TIKTOK">TikTok</option></select>
                    <input type="url" placeholder="https://instagram.com/athlete" value={profile.social2_Url || ""} onChange={(e) => setProfile(prev => ({ ...prev, social2_Url: e.target.value }))} style={{ backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }} />
                  </div>
                </div>

                <button onClick={handleSaveProfile} disabled={isSavingProfile} style={{ width: "100%", marginTop: "18px", backgroundColor: NEON_GREEN, color: "#000000", border: "none", fontWeight: "950", padding: "14px", borderRadius: "12px", cursor: "pointer", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {isSavingProfile ? "Saving to National Scoreboard..." : "Save Profile & Publish Metrics 🚀"}
                </button>
                {saveNotice && <p role="status" style={{ margin: "12px 0 0 0", textAlign: "center", fontSize: "13px", fontWeight: "800", color: saveNotice.ok ? NEON_GREEN : "#ff9933" }}>{saveNotice.text}</p>}
              </div>
            )}
          </section>
        )}

        {/* FAQ Accordion */}
        <section style={{ margin: "48px 0 20px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}><span style={{ fontSize: "12px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>How It Works</span><h3 style={{ fontSize: "20px", fontWeight: "950", color: "#ffffff", textTransform: "uppercase", margin: "4px 0 0 0" }}>Frequently Asked Questions</h3></div>
          <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {FAQS.map((faq, fIdx) => (
              <div key={fIdx} style={{ backgroundColor: "#0c0c10", border: "1px solid #1e1e26", borderRadius: "12px", overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)} style={{ width: "100%", textAlign: "left", padding: "15px 18px", background: "none", border: "none", color: "#ffffff", fontSize: "14px", fontWeight: "800", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{faq.q}</span><span style={{ color: NEON_GREEN, fontSize: "18px", fontWeight: "900", marginLeft: "12px" }}>{openFaq === fIdx ? "−" : "+"}</span>
                </button>
                {openFaq === fIdx && <div style={{ padding: "0 18px 16px 18px", color: "#d4d4d8", fontSize: "13px", lineHeight: "1.55" }}>{faq.a}</div>}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Slim Compliance Bar */}
      <div style={{ backgroundColor: "#0a0a0d", borderTop: "1px solid #181820", borderBottom: "1px solid #181820", padding: "14px", marginTop: "24px", textAlign: "center", fontSize: "12px", lineHeight: "1.5", color: "#a1a1aa", letterSpacing: "0.3px" }}>
        <strong style={{ color: "#ffffff" }}>NCAA NIL Compliant:</strong> Slugger Coins ($SLUG) are non-compensatory ($0 cash value) and serve strictly as a flat 100 $SLUG member access key.
      </div>

      {/* STICKY BOTTOM NAVIGATION BAR */}
      <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(10, 10, 14, 0.92)", backdropFilter: "blur(14px)", borderTop: "1px solid #242430", padding: "8px 12px 12px 12px", zIndex: 950, display: "flex", justifyContent: "center", boxShadow: "0 -8px 25px rgba(0, 0, 0, 0.7)" }}>
        <div style={{ width: "100%", maxWidth: "540px", display: "grid", gridTemplateColumns: userRole === "SCOUT" ? "1fr" : "1fr 1fr 1fr", gap: "8px" }}>
          <button onClick={() => { setActiveMainTab("SCOREBOARD"); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ backgroundColor: activeMainTab === "SCOREBOARD" ? "rgba(166, 255, 0, 0.15)" : "transparent", color: activeMainTab === "SCOREBOARD" ? NEON_GREEN : "#a1a1aa", border: activeMainTab === "SCOREBOARD" ? `1px solid ${NEON_GREEN}` : "1px solid transparent", borderRadius: "10px", padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", fontWeight: "900", fontSize: "12px", textTransform: "uppercase" }}><span style={{ fontSize: "15px" }}>🏆</span><span>Scoreboard</span></button>
          {userRole !== "SCOUT" && (
            <>
              <button onClick={() => { setActiveMainTab("EXCHANGE"); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ backgroundColor: activeMainTab === "EXCHANGE" ? "rgba(166, 255, 0, 0.15)" : "transparent", color: activeMainTab === "EXCHANGE" ? NEON_GREEN : "#a1a1aa", border: activeMainTab === "EXCHANGE" ? `1px solid ${NEON_GREEN}` : "1px solid transparent", borderRadius: "10px", padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", fontWeight: "900", fontSize: "12px", textTransform: "uppercase" }}><span style={{ fontSize: "15px" }}>🤝</span><span>Brand Deals</span></button>
              <button onClick={() => { setActiveMainTab("LOCKER"); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ backgroundColor: activeMainTab === "LOCKER" ? "rgba(166, 255, 0, 0.15)" : "transparent", color: activeMainTab === "LOCKER" ? NEON_GREEN : "#a1a1aa", border: activeMainTab === "LOCKER" ? `1px solid ${NEON_GREEN}` : "1px solid transparent", borderRadius: "10px", padding: "8px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", fontWeight: "900", fontSize: "12px", textTransform: "uppercase" }}><span style={{ fontSize: "15px" }}>👤</span><span>My Locker {hasProfile ? "✓" : ""}</span></button>
            </>
          )}
        </div>
      </nav>

      {/* 100 $SLUG MEMBERSHIP KEY CLAIM MODAL */}
      {showClaimPromptModal && account && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200, padding: "16px" }}>
          <div style={{ backgroundColor: "#0c0c10", border: `2px solid ${NEON_GREEN}`, borderRadius: "22px", width: "100%", maxWidth: "460px", padding: "26px 22px", textAlign: "center", boxShadow: "0 0 45px rgba(166, 255, 0, 0.2)" }}>
            <div style={{ fontSize: "34px", marginBottom: "6px" }}>🔑</div>
            <span style={{ fontSize: "12px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Final Step • 100% Free
            </span>
            <h3 style={{ margin: "6px 0 10px 0", fontSize: "21px", fontWeight: "950", textTransform: "uppercase", color: "#ffffff" }}>
              Activate Your 100 $SLUG Key
            </h3>
            <p style={{ fontSize: "13px", color: "#d4d4d8", lineHeight: "1.5", margin: "0 0 18px 0" }}>
              Your player profile is saved! Tap below to claim your free <strong style={{ color: "#ffffff" }}>100 $SLUG membership key</strong> to unlock upcoming member giveaways, your 20% off TAG Sports code, and Direct Brand Intros.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                  setShowClaimPromptModal(false);
                }}
                onError={(err) => alert(`Claim error: ${err.message}`)}
                style={{ width: "100%", backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "950", textTransform: "uppercase", letterSpacing: "1px", padding: "14px", borderRadius: "10px", border: "none", cursor: "pointer", fontSize: "13px" }}
              >
                🔑 Claim 100 Free $SLUG Now
              </TransactionButton>

              <button
                onClick={() => setShowClaimPromptModal(false)}
                style={{ width: "100%", backgroundColor: "transparent", border: "1px solid #33333d", color: "#a1a1aa", fontWeight: "800", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "13px", textTransform: "uppercase" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRE-SEND PROFILE VERIFICATION MODAL (ALL DIRECT INTROS) */}
      {pendingIntroBrand && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1150, padding: "16px" }}>
          <div style={{ backgroundColor: "#0c0c10", border: `2px solid ${NEON_GREEN}`, borderRadius: "22px", width: "100%", maxWidth: "540px", padding: "24px", boxShadow: "0 0 45px rgba(166, 255, 0, 0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  Verify Your Dossier
                </span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "950", textTransform: "uppercase", color: "#ffffff" }}>
                  Send Intro to {pendingIntroBrand.name}?
                </h3>
              </div>
              <button
                onClick={() => setPendingIntroBrand(null)}
                style={{ background: "none", border: "none", color: "#ffffff", fontSize: "20px", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#d4d4d8", lineHeight: "1.5", margin: "0 0 14px 0" }}>
              We will email your player profile directly to <strong style={{ color: "#ffffff" }}>{pendingIntroBrand.brandRepName || pendingIntroBrand.name}</strong> and CC you so you can connect directly.
            </p>

            <div style={{ backgroundColor: "#07070a", border: "1px solid #262632", borderRadius: "14px", padding: "14px", marginBottom: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#a1a1aa", fontWeight: "700" }}>Athlete & School:</span>
                <span style={{ color: "#ffffff", fontWeight: "900" }}>{profile.fullName} • <span style={{ color: NEON_GREEN }}>{profile.college || "Undeclared"}</span></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#a1a1aa", fontWeight: "700" }}>Position / Class:</span>
                <span style={{ color: "#ffffff", fontWeight: "800" }}>{profile.position || "ATH"} ({profile.primaryRole}) • {profile.collegeYear}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#a1a1aa", fontWeight: "700" }}>Contact:</span>
                <span style={{ color: "#ffffff", fontWeight: "800" }}>{profile.email} {profile.phone ? `• ${profile.phone}` : ""}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setPendingIntroBrand(null);
                  setActiveMainTab("LOCKER");
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#181820",
                  color: "#ffffff",
                  border: "1px solid #3f3f4e",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  padding: "13px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                Edit Locker First ⚙️
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSendIntro}
                style={{
                  flex: 1.4,
                  backgroundColor: NEON_GREEN,
                  color: "#000000",
                  border: "none",
                  fontWeight: "950",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  padding: "13px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "12px"
                }}
              >
                Confirm & Send Intro ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 60-DAY LOCKOUT NOTIFICATION MODAL */}
      {dispatchedBrand && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, padding: "16px" }}>
          <div style={{ backgroundColor: "#0d0d12", border: `2px solid ${isLockoutModal ? "#eab308" : NEON_GREEN}`, borderRadius: "24px", width: "100%", maxWidth: "500px", padding: "26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "28px" }}>{isLockoutModal ? "⏳" : "⚡"}</span>
              <div>
                <span style={{ fontSize: "13px", fontWeight: "900", color: isLockoutModal ? "#eab308" : NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
                  {isLockoutModal ? "Direct Intro Already Active" : "Direct Intro Dispatched"}
                </span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "22px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff" }}>
                  {dispatchedBrand.name}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#d4d4d8", lineHeight: "1.5", margin: "12px 0 18px 0" }}>
              {isLockoutModal 
                ? `You already sent an intro to ${dispatchedBrand.name}. Check your email inbox for your CC'd introduction thread (~${getDaysRemaining(dispatchedBrand.name)} days left in current window).`
                : `Your verified player dossier has been emailed directly to ${dispatchedBrand.name} with you CC'd on the thread!`}
            </p>

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
                padding: "13px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Done ➔
            </button>
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
