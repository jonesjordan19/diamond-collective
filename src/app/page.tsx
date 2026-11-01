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

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwe5YJxF93X4fJXpODhAGbJQ-1Xs3FiRHuLC2umjkGLGtsJTqj4VjO-0Ai0_hBqZMojdw/exec";
const STRIPE_GRIP_DROP_URL = "https://buy.stripe.com/8x2eVeeW57dgc5I1hX8Vi01";
const NEON_GREEN = "#a6ff00";

const FOUNDERS_POOL_TOTAL = 100000;
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
// Halloween Draw: Oct 31, 2026 at 8:00 PM Mountain Time (UTC-6 MDT)
const HALLOWEEN_DRAW_TIMESTAMP = new Date("2026-10-31T20:00:00-06:00").getTime();

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
  couponCode?: string;
  couponLabel?: string;
  categoryTag?: string;
}

interface MarketCategory {
  title: string;
  emoji: string;
  brands: BrandItem[];
}

const MARKET_SECTIONS: MarketCategory[] = [
  {
    title: "Technology",
    emoji: "📱",
    brands: [
      {
        name: "TAG Sports",
        tagline: "Smart Sports Radar & AiCE Coaching",
        description: "Aerospace-precision velocity tracking with zero subscription fees. Captures dual-direction speeds with video highlights overlaid directly onto auto-generated clips.",
        buttonText: "Request Direct Intro ⚡",
        type: "email_intro",
        brandRepEmail: "clucas@tagsports.ai",
        brandRepName: "C. Lucas (TAG Sports)",
        link: "https://tagsports.ai",
        couponCode: "DIAMONDCOLLECTIVE",
        couponLabel: "20% Off Member Code",
        isPrimary: true,
      },
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
        link: "https://thehydrojug.com/pages/ambassadors-affiliates",
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
];

const FAQS = [
  {
    q: "How do I unlock the 20% TAG Sports discount & Brand Intros?",
    a: "It takes 3 quick steps: (1) Sign in with your Google, Apple, or phone ID, (2) Fill out your player bio in the 'My Locker' tab, and (3) Claim your free 100 $SLUG membership key. Once active, all direct brand intros and member codes unlock immediately.",
  },
  {
    q: "Is this compliant with NCAA and Institutional NIL rules?",
    a: "Yes. All Slugger Coins ($SLUG) distributed during the Founders phase have zero market cash value and are non-compensatory. Each verified member claims a flat 100 $SLUG allocation used strictly as an access key to unlock brand directories, discounts, and partner introductions.",
  },
  {
    q: "How does the Halloween TAG Sports Radar Giveaway work?",
    a: "Verified members holding 100 $SLUG who complete their Locker profile can click 'Enter Giveaway' on the top banner. One random winner will be drawn live on Halloween night (Oct 31st at 8:00 PM MST) to receive a free TAG One Sports Radar.",
  },
  {
    q: "How does 'The Big Black Grip' free bat grip drop work?",
    a: "Verified college ballplayers receive 'The Big Black Grip' bat grip 100% free ($0 product cost). A flat $8.99 shipping and handling fee is paid directly through Stripe to cover USPS Ground postage with tracking and fulfillment.",
  },
  {
    q: "Do I need crypto experience or a wallet app to join?",
    a: "None at all. When you sign in using your existing Google, Apple, or phone ID, your member account is generated automatically in the background and all actions are 100% free.",
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
  height?: string;
  weight?: string;
  primaryRole: "HITTER" | "PITCHER" | "TWP";
  isProfileVisible: boolean;
  social1_Type?: string;
  social1_Url?: string;
  social2_Type?: string;
  social2_Url?: string;
  maxExitVelo?: string;
  ninetyEV?: string;
  batSpeed?: string;
  sixtyTime?: string;
  recordedDateHitting?: string;
  peakFB?: string;
  sittingFB?: string;
  offSpeedVelo?: string;
  offSpeedType?: string;
  fbSpinRate?: string;
  offSpeedSpinRate?: string;
  firstPitchStrike?: string;
  recordedDatePitching?: string;
  stuffPlus?: string;
  locationPlus?: string;
  pitchingPlus?: string;
  inducedVertBreak?: string;
  horizontalBreak?: string;
  vertApproachAngle?: string;
  releaseExtension?: string;
  releaseHeight?: string;
  kPercentage?: string;
  bbPercentage?: string;
  kMinusBbPercentage?: string;
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

async function triggerMobileScoutShare(athlete: AthleteProfile) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = 1080;
  canvas.height = 1350;

  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 14;
  ctx.strokeRect(34, 34, canvas.width - 68, canvas.height - 68);

  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.src = "/logo.png";

  try {
    await logo.decode();
    const logoSize = 95;
    ctx.drawImage(logo, 80, 65, logoSize, logoSize);
  } catch {
    ctx.fillStyle = "rgba(166, 255, 0, 0.08)";
    ctx.fillRect(80, 80, 440, 52);
    ctx.strokeStyle = "#a6ff00";
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 80, 440, 52);

    ctx.fillStyle = "#a6ff00";
    ctx.font = "900 20px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("THE DIAMOND COLLECTIVE", 100, 113);
  }

  const isTWP = athlete.primaryRole === "TWP";
  const isPitcher = athlete.primaryRole === "PITCHER" || isTWP;
  const isHitter = athlete.primaryRole === "HITTER" || isTWP;

  ctx.fillStyle = isTWP ? "#a6ff00" : "#ffffff";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(isTWP ? "⚡ VERIFIED TWO-WAY SCOUT CARD" : "VERIFIED SCOUT CARD", canvas.width - 80, 115);
  ctx.textAlign = "left";

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 66px -apple-system, BlinkMacSystemFont, sans-serif";
  const name = (athlete.fullName || "MEMBER ATHLETE").toUpperCase();
  ctx.fillText(name, 80, 230);

  ctx.fillStyle = "#a6ff00";
  ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`🏛️ ${athlete.college || "Undeclared College"} ${athlete.state ? `(${athlete.state})` : ""}`, 80, 285);

  const physicalTag = athlete.height && athlete.weight ? ` • ${athlete.height} / ${athlete.weight} lbs` : (athlete.height ? ` • ${athlete.height}` : "");
  ctx.fillStyle = "#d4d4d8";
  ctx.font = "600 26px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(`${athlete.position || "ATH"}${physicalTag} • ${athlete.playerStatus || "Active Roster"}`, 80, 330);

  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 365);
  ctx.lineTo(canvas.width - 80, 365);
  ctx.stroke();

  if (isTWP) {
    ctx.fillStyle = "#a6ff00";
    ctx.font = "900 16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("⚾ MOUND TELEMETRY", 80, 400);

    const pitchMetrics: { label: string; val: string; sub?: string }[] = [];
    if (athlete.peakFB) pitchMetrics.push({ label: "PEAK FASTBALL", val: `${athlete.peakFB} MPH`, sub: athlete.sittingFB ? `Sitting ${athlete.sittingFB}` : undefined });
    if (athlete.stuffPlus) pitchMetrics.push({ label: "STUFF+ GRADE", val: athlete.stuffPlus, sub: "100 = Avg" });
    if (athlete.inducedVertBreak) pitchMetrics.push({ label: "INDUCED VERT BREAK", val: `${athlete.inducedVertBreak}"`, sub: "Carry & Rise" });
    if (athlete.offSpeedVelo) {
      pitchMetrics.push({ label: `${(athlete.offSpeedType || "SLIDER").toUpperCase()} VELO`, val: `${athlete.offSpeedVelo} MPH`, sub: athlete.offSpeedSpinRate ? `${athlete.offSpeedSpinRate} RPM` : undefined });
    } else if (athlete.fbSpinRate) {
      pitchMetrics.push({ label: "FB SPIN RATE", val: `${athlete.fbSpinRate} RPM` });
    }

    while (pitchMetrics.length < 4) {
      if (!pitchMetrics.some(m => m.label === "PEAK FASTBALL")) pitchMetrics.push({ label: "PEAK FASTBALL", val: "---", sub: "Mound" });
      else if (!pitchMetrics.some(m => m.label === "STUFF+ GRADE")) pitchMetrics.push({ label: "STUFF+ GRADE", val: "---", sub: "100 = Avg" });
      else if (!pitchMetrics.some(m => m.label === "INDUCED VERT BREAK")) pitchMetrics.push({ label: "INDUCED VERT BREAK", val: "---", sub: "Carry" });
      else pitchMetrics.push({ label: "COMMAND & ARSENAL", val: "---", sub: "Loc+" });
    }

    const startYP = 415;
    const boxW = 440;
    const boxH = 92;
    const gapX = 40;
    const gapY = 12;

    pitchMetrics.slice(0, 4).forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 80 + col * (boxW + gapX);
      const y = startYP + row * (boxH + gapY);

      ctx.fillStyle = "#121214";
      ctx.fillRect(x, y, boxW, boxH);
      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxW, boxH);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(m.label, x + 18, y + 26);

      ctx.fillStyle = "#a6ff00";
      ctx.font = "900 32px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(m.val, x + 18, y + 68);

      if (m.sub) {
        ctx.fillStyle = "#d4d4d8";
        ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(m.sub, x + boxW - 18, y + 68);
        ctx.textAlign = "left";
      }
    });

    const startYH_Label = startYP + 2 * (boxH + gapY) + 18;
    ctx.fillStyle = "#a6ff00";
    ctx.font = "900 16px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("💥 BATTER'S BOX TELEMETRY", 80, startYH_Label);

    const hitMetrics: { label: string; val: string; sub?: string }[] = [];
    if (athlete.maxExitVelo) hitMetrics.push({ label: "MAX EXIT VELO", val: `${athlete.maxExitVelo} MPH` });
    if (athlete.ninetyEV) hitMetrics.push({ label: "90TH% EXIT VELO", val: `${athlete.ninetyEV} MPH`, sub: "Hard-Hit" });
    if (athlete.batSpeed) hitMetrics.push({ label: "BAT SPEED", val: `${athlete.batSpeed} MPH`, sub: "Blast" });
    if (athlete.sixtyTime) hitMetrics.push({ label: "60-YARD DASH", val: `${athlete.sixtyTime}s`, sub: "Laser" });

    while (hitMetrics.length < 4) {
      if (!hitMetrics.some(m => m.label === "MAX EXIT VELO")) hitMetrics.push({ label: "MAX EXIT VELO", val: "---" });
      else if (!hitMetrics.some(m => m.label === "90TH% EXIT VELO")) hitMetrics.push({ label: "90TH% EXIT VELO", val: "---" });
      else if (!hitMetrics.some(m => m.label === "BAT SPEED")) hitMetrics.push({ label: "BAT SPEED", val: "---" });
      else hitMetrics.push({ label: "60-YARD DASH", val: "---" });
    }

    const startYH = startYH_Label + 14;
    hitMetrics.slice(0, 4).forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 80 + col * (boxW + gapX);
      const y = startYH + row * (boxH + gapY);

      ctx.fillStyle = "#121214";
      ctx.fillRect(x, y, boxW, boxH);
      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxW, boxH);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(m.label, x + 18, y + 26);

      ctx.fillStyle = "#a6ff00";
      ctx.font = "900 32px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(m.val, x + 18, y + 68);

      if (m.sub) {
        ctx.fillStyle = "#d4d4d8";
        ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(m.sub, x + boxW - 18, y + 68);
        ctx.textAlign = "left";
      }
    });

    const stripY = startYH + 2 * (boxH + gapY) + 12;
    if (athlete.releaseExtension || athlete.releaseHeight || athlete.vertApproachAngle) {
      ctx.fillStyle = "rgba(166, 255, 0, 0.06)";
      ctx.fillRect(80, stripY, canvas.width - 160, 44);
      ctx.strokeStyle = "#3f3f46";
      ctx.strokeRect(80, stripY, canvas.width - 160, 44);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px monospace";
      let biomechText = "";
      if (athlete.releaseExtension) biomechText += `EXTENSION: ${athlete.releaseExtension} FT   `;
      if (athlete.releaseHeight) biomechText += `REL HEIGHT: ${athlete.releaseHeight} FT   `;
      if (athlete.vertApproachAngle) biomechText += `VAA: ${athlete.vertApproachAngle}°`;
      ctx.fillText(biomechText.trim(), 105, stripY + 28);
    }

  } else {
    const metrics: { label: string; val: string; sub?: string }[] = [];

    if (isPitcher) {
      if (athlete.peakFB) metrics.push({ label: "PEAK FASTBALL", val: `${athlete.peakFB} MPH`, sub: athlete.sittingFB ? `Sitting ${athlete.sittingFB}` : undefined });
      if (athlete.stuffPlus) metrics.push({ label: "STUFF+ GRADE", val: athlete.stuffPlus, sub: "100 = Avg" });
      if (athlete.inducedVertBreak) metrics.push({ label: "INDUCED VERT BREAK", val: `${athlete.inducedVertBreak}"`, sub: "Carry & Rise" });
      if (athlete.horizontalBreak) metrics.push({ label: "HORIZONTAL BREAK", val: `${athlete.horizontalBreak}"`, sub: "Arm Run" });
      if (athlete.fbSpinRate) metrics.push({ label: "FB SPIN RATE", val: `${athlete.fbSpinRate} RPM` });
      if (athlete.offSpeedVelo) {
        metrics.push({ label: `${(athlete.offSpeedType || "SLIDER").toUpperCase()} VELO`, val: `${athlete.offSpeedVelo} MPH`, sub: athlete.offSpeedSpinRate ? `${athlete.offSpeedSpinRate} RPM` : undefined });
      }
      if (athlete.kMinusBbPercentage) {
        metrics.push({ label: "K - BB COMMAND %", val: `${athlete.kMinusBbPercentage}%`, sub: athlete.kPercentage ? `${athlete.kPercentage}% K%` : undefined });
      } else if (athlete.firstPitchStrike) {
        metrics.push({ label: "1ST PITCH STRIKE", val: `${athlete.firstPitchStrike}%` });
      }
      if (athlete.pitchingPlus) metrics.push({ label: "PITCHING+ ARSENAL", val: athlete.pitchingPlus, sub: "Stuff + Loc" });
    }

    if (isHitter) {
      if (athlete.maxExitVelo) metrics.push({ label: "MAX EXIT VELO", val: `${athlete.maxExitVelo} MPH` });
      if (athlete.ninetyEV) metrics.push({ label: "90TH% EXIT VELO", val: `${athlete.ninetyEV} MPH`, sub: "Consistency" });
      if (athlete.batSpeed) metrics.push({ label: "BAT SPEED", val: `${athlete.batSpeed} MPH`, sub: "Blast Motion" });
      if (athlete.sixtyTime) metrics.push({ label: "60-YARD DASH", val: `${athlete.sixtyTime}s`, sub: "Laser Timed" });
    }

    const displayList = metrics.slice(0, 8);
    const startY = 395;
    const boxW = 440;
    const boxH = displayList.length > 4 ? 105 : 135;
    const gapX = 40;
    const gapY = 16;

    displayList.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 80 + col * (boxW + gapX);
      const y = startY + row * (boxH + gapY);

      ctx.fillStyle = "#121214";
      ctx.fillRect(x, y, boxW, boxH);
      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, boxW, boxH);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(m.label, x + 20, y + (displayList.length > 4 ? 30 : 38));

      ctx.fillStyle = "#a6ff00";
      ctx.font = `900 ${displayList.length > 4 ? "36px" : "44px"} -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(m.val, x + 20, y + (displayList.length > 4 ? 76 : 94));

      if (m.sub) {
        ctx.fillStyle = "#d4d4d8";
        ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(m.sub, x + boxW - 20, y + (displayList.length > 4 ? 76 : 94));
        ctx.textAlign = "left";
      }
    });

    const stripY = startY + Math.ceil(displayList.length / 2) * (boxH + gapY) + 4;
    if (isPitcher && (athlete.releaseExtension || athlete.releaseHeight || athlete.vertApproachAngle)) {
      ctx.fillStyle = "rgba(166, 255, 0, 0.06)";
      ctx.fillRect(80, stripY, canvas.width - 160, 48);
      ctx.strokeStyle = "#3f3f46";
      ctx.strokeRect(80, stripY, canvas.width - 160, 48);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px monospace";
      let biomechText = "";
      if (athlete.releaseExtension) biomechText += `EXTENSION: ${athlete.releaseExtension} FT   `;
      if (athlete.releaseHeight) biomechText += `REL HEIGHT: ${athlete.releaseHeight} FT   `;
      if (athlete.vertApproachAngle) biomechText += `VAA: ${athlete.vertApproachAngle}°`;
      ctx.fillText(biomechText.trim(), 105, stripY + 30);
    }
  }

  const registryY = 960;
  ctx.fillStyle = "#121214";
  ctx.fillRect(80, registryY, canvas.width - 160, 200);
  ctx.strokeStyle = "#27272a";
  ctx.strokeRect(80, registryY, canvas.width - 160, 200);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("HONOR-CODE VERIFIED DATA REGISTRY", 120, registryY + 48);

  ctx.fillStyle = "#d4d4d8";
  ctx.font = "400 19px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("TrackMan, Hawkeye, and verified metrics published on National Scoreboard.", 120, registryY + 86);
  ctx.fillText("Direct scout verification & NIL access powered by Slugger Coin ($SLUG).", 120, registryY + 118);

  if (athlete.social1_Url || athlete.social2_Url) {
    ctx.fillStyle = "#a6ff00";
    ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText(`Scout Gateway: ${athlete.social1_Url || athlete.social2_Url}`, 120, registryY + 168);
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SLUGGERCOIN.COM/SCOREBOARD", canvas.width / 2, 1260);

  ctx.fillStyle = "#888888";
  ctx.font = "600 16px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("THE DIAMOND COLLECTIVE • ALL RIGHTS RESERVED", canvas.width / 2, 1295);

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

  // 3-TAB PRIMARY NAVIGATION: SCOREBOARD | EXCHANGE (BRAND DEALS) | LOCKER
  const [activeMainTab, setActiveMainTab] = useState<"SCOREBOARD" | "EXCHANGE" | "LOCKER">("SCOREBOARD");
  const [brandCategoryFilter, setBrandCategoryFilter] = useState<"ALL" | "DIRECT" | "PERKS" | "GEAR" | "APPAREL">("ALL");

  // Scoreboard Filters & Expand State
  const [roleFilter, setRoleFilter] = useState<"ALL" | "HITTER" | "PITCHER" | "TWP">("ALL");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "MAX_EV" | "PEAK_FB" | "STUFF_PLUS" | "IVB">("DEFAULT");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);

  const [leaderboardRows, setLeaderboardRows] = useState<AthleteProfile[]>([]);
  const [loadingScoreboard, setLoadingScoreboard] = useState(false);

  // Locker Sub-Tabs & Modals
  const [activeMatrixTab, setActiveMatrixTab] = useState<"BIO" | "HITTING" | "PITCHING">("BIO");
  const [pendingIntroBrand, setPendingIntroBrand] = useState<BrandItem | null>(null);
  const [dispatchedBrand, setDispatchedBrand] = useState<BrandItem | null>(null);
  const [isLockoutModal, setIsLockoutModal] = useState(false);
  const [showClaimPromptModal, setShowClaimPromptModal] = useState(false);
  const [profile, setProfile] = useState<AthleteProfile>(emptyProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [introTimestamps, setIntroTimestamps] = useState<{ [brandName: string]: number }>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // HALLOWEEN RADAR GIVEAWAY, COUNTDOWN & 100 $SLUG GATE STATE
  const [hasEnteredGiveaway, setHasEnteredGiveaway] = useState(false);
  const [isRegisteringGiveaway, setIsRegisteringGiveaway] = useState(false);
  const [giveawayWinner, setGiveawayWinner] = useState<AthleteProfile | null>(null);
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [countdownText, setCountdownText] = useState<string>("02d : 07h : 15m : 00s");

  useEffect(() => {
    setMounted(true);
    const entered = localStorage.getItem("halloween_user_entered_state");
    if (entered) {
      setHasEnteredGiveaway(true);
    }

    const updateCountdown = () => {
      const diff = HALLOWEEN_DRAW_TIMESTAMP - Date.now();
      if (diff <= 0) {
        setCountdownText("🎃 LIVE DRAW IN PROGRESS");
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      const pad = (n: number) => String(n).padStart(2, "0");
      setCountdownText(`${pad(d)}d : ${pad(h)}h : ${pad(m)}m : ${pad(s)}s`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
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

  // Flat 100 $SLUG Membership Key Check
  const balance = balanceData ? Math.min(100, Number(balanceData.displayValue)) : 0;
  const isUnlocked = balance >= 100 || justClaimed;
  const hasProfile = Boolean(profile.fullName && profile.email);

  // Admin access granted solely via secure wallet address (no personal emails in public code)
  const isAdmin = useMemo(() => {
    return account?.address?.toLowerCase() === "0x46cbd713d7440692156e1219153622c45b04d3a";
  }, [account?.address]);

  const handleEnterGiveaway = async () => {
    if (!account?.address) {
      handleOpenLogin();
      return;
    }
    if (!hasProfile) {
      setActiveMainTab("LOCKER");
      return;
    }
    if (!isUnlocked) {
      setShowClaimPromptModal(true);
      return;
    }

    setIsRegisteringGiveaway(true);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          action: "saveProfile",
          walletAddress: account.address.toLowerCase(),
          athleteEmail: profile.email,
          email: profile.email,
          fullName: profile.fullName,
          college: profile.college,
          currentCollege: profile.college,
          position: profile.position,
          playerStatus: profile.playerStatus,
          portalStatus: profile.playerStatus,
          primaryRole: profile.primaryRole,
          isProfileVisible: profile.isProfileVisible !== false,
          verificationLink: profile.verificationLink || "",
          giveawayEntry: "HALLOWEEN_TAG_RADAR_2026",
        }),
      });
    } catch {}

    setTimeout(() => {
      setHasEnteredGiveaway(true);
      localStorage.setItem("halloween_user_entered_state", "true");
      setIsRegisteringGiveaway(false);
    }, 900);
  };

  const selectRandomHalloweenWinner = () => {
    // Exclude your admin wallet/email so you can never win by default
    const eligiblePool = leaderboardRows.filter(ath => {
      const isUserWallet = account?.address && ath.walletAddress && 
        ath.walletAddress.toLowerCase() === account.address.toLowerCase();
      const isUserEmail = ath.email && 
        ath.email.toLowerCase() === "jordan@diamondcollective.net";
      
      return !isUserWallet && !isUserEmail;
    });

    if (eligiblePool.length === 0) {
      alert("No eligible player entries found on the scoreboard yet.");
      return;
    }
    
    setShowWinnerAnimation(true);
    let counter = 0;
    const interval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * eligiblePool.length);
      setGiveawayWinner(eligiblePool[tempIndex]);
      counter++;
      if (counter > 28) {
        clearInterval(interval);
        const win = eligiblePool[Math.floor(Math.random() * eligiblePool.length)];
        setGiveawayWinner(win);
        setShowWinnerAnimation(false);
      }
    }, 85);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText("DIAMONDCOLLECTIVE");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

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
      "https://script.google.com/macros/s/AKfycbwe5YJxF93X4fJXpODhAGbJQ-1Xs3FiRHuLC2umjkGLGtsJTqj4VjO-0Ai0_hBqZMojdw/exec";

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
                verificationLink: item.verificationLink && item.verificationLink !== "HALLOWEEN_RADAR_ENTRY" ? String(item.verificationLink) : "",
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
      const acctEmail = (account as any)?.email || "";
      
      const savedLocal = localStorage.getItem(localKey);
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (parsed.fullName) {
            setProfile((prev) => ({ 
              ...prev, 
              ...parsed, 
              email: parsed.email || acctEmail || prev.email || "",
              college: parsed.college || parsed.currentCollege || prev.college || ""
            }));
          }
        } catch {}
      } else if (acctEmail) {
        setProfile((prev) => ({
          ...prev,
          email: acctEmail || prev.email || ""
        }));
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
          setProfile((prev) => ({ 
            ...prev, 
            ...data.profile,
            email: data.profile.email || data.profile.athleteEmail || acctEmail || prev.email || "",
            college: data.profile.college || data.profile.currentCollege || prev.college || ""
          }));
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
  }, [account]);

  const handleSaveProfile = async () => {
    if (!account?.address) {
      handleOpenLogin();
      return;
    }
    if (!profile.fullName || !profile.email) {
      alert("Please fill in your Full Name and Email in Step 1 (Bio & Roster).");
      setActiveMatrixTab("BIO");
      return;
    }

    setIsSavingProfile(true);

    const lowerWallet = account.address.toLowerCase();
    const localKey = `athlete_profile_${lowerWallet}`;
    const today = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
    
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

    const payload = {
      action: "saveProfile",
      walletAddress: lowerWallet,
      athleteEmail: updatedProfile.email,
      email: updatedProfile.email,
      fullName: updatedProfile.fullName || "",
      college: updatedProfile.college || "",
      currentCollege: updatedProfile.college || "",
      position: updatedProfile.position || "",
      playerStatus: updatedProfile.playerStatus || "",
      portalStatus: updatedProfile.playerStatus || "",
      collegeYear: updatedProfile.collegeYear || "",
      phone: updatedProfile.phone || "",
      state: updatedProfile.state || "UT",
      primaryRole: updatedProfile.primaryRole || "HITTER",
      isProfileVisible: updatedProfile.isProfileVisible !== false,
      verificationLink: updatedProfile.verificationLink || "",
      height: updatedProfile.height || "",
      weight: updatedProfile.weight || "",
      maxExitVelo: updatedProfile.maxExitVelo || "",
      ninetyEV: updatedProfile.ninetyEV || "",
      batSpeed: updatedProfile.batSpeed || "",
      sixtyTime: updatedProfile.sixtyTime || "",
      recordedDateHitting: updatedProfile.recordedDateHitting || "",
      peakFB: updatedProfile.peakFB || "",
      sittingFB: updatedProfile.sittingFB || "",
      offSpeedType: updatedProfile.offSpeedType || "Slider",
      offSpeedVelo: updatedProfile.offSpeedVelo || "",
      fbSpinRate: updatedProfile.fbSpinRate || "",
      offSpeedSpinRate: updatedProfile.offSpeedSpinRate || "",
      firstPitchStrike: updatedProfile.firstPitchStrike || "",
      recordedDatePitching: updatedProfile.recordedDatePitching || "",
      stuffPlus: updatedProfile.stuffPlus || "",
      locationPlus: updatedProfile.locationPlus || "",
      pitchingPlus: updatedProfile.pitchingPlus || "",
      inducedVertBreak: updatedProfile.inducedVertBreak || "",
      horizontalBreak: updatedProfile.horizontalBreak || "",
      vertApproachAngle: updatedProfile.vertApproachAngle || "",
      releaseExtension: updatedProfile.releaseExtension || "",
      releaseHeight: updatedProfile.releaseHeight || "",
      kPercentage: updatedProfile.kPercentage || "",
      bbPercentage: updatedProfile.bbPercentage || "",
      kMinusBbPercentage: updatedProfile.kMinusBbPercentage || "",
      social1_Type: updatedProfile.social1_Type || "X",
      social1_Url: updatedProfile.social1_Url || "",
      social2_Type: updatedProfile.social2_Type || "IG",
      social2_Url: updatedProfile.social2_Url || "",
    };

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
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      setIsSavingProfile(false);

      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq('track', 'CompleteRegistration');
      }

      if (!isUnlocked) {
        setShowClaimPromptModal(true);
      } else {
        alert("Player profile & metrics published to the National Scoreboard!");
      }
    } catch (err: any) {
      setIsSavingProfile(false);
      alert("Error saving profile: " + err.message);
    }
  };

  const handleInitiateIntro = (brand: BrandItem) => {
    if (isIntroActive(brand.name)) {
      setDispatchedBrand(brand);
      setIsLockoutModal(true);
      return;
    }

    if (!account) {
      handleOpenLogin();
      return;
    }

    if (!profile.fullName || !profile.email) {
      setActiveMainTab("LOCKER");
      return;
    }

    if (!isUnlocked) {
      setShowClaimPromptModal(true);
      return;
    }

    setPendingIntroBrand(brand);
  };

  const handleConfirmAndSendIntro = async () => {
    if (!pendingIntroBrand) return;
    const brand = pendingIntroBrand;
    setPendingIntroBrand(null);

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
        headers: { "Content-Type": "text/plain;charset=utf-8" },
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

  const flattenedBrands = useMemo(() => {
    const list: (BrandItem & { sectionTitle: string; sectionEmoji: string })[] = [];
    MARKET_SECTIONS.forEach((sec) => {
      sec.brands.forEach((b) => {
        list.push({ ...b, sectionTitle: sec.title, sectionEmoji: sec.emoji });
      });
    });

    return list.filter((b) => {
      if (brandCategoryFilter === "DIRECT") return b.type === "email_intro";
      if (brandCategoryFilter === "PERKS") return Boolean(b.couponCode) || b.type === "email_intro";
      if (brandCategoryFilter === "GEAR") return ["Technology", "Hitting", "Equipment", "Eyewear & Vision"].includes(b.sectionTitle);
      if (brandCategoryFilter === "APPAREL") return ["Clothing & Apparel", "Footwear", "Nutrition", "Player Services"].includes(b.sectionTitle);
      return true;
    });
  }, [brandCategoryFilter]);

  const filteredScoreboard = useMemo(() => {
    return leaderboardRows
      .filter((ath) => {
        if (ath.isProfileVisible === false || String(ath.isProfileVisible).toLowerCase() === "false") {
          return false;
        }

        if (searchQuery && searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase().trim();
          const name = (ath.fullName || "").toLowerCase();
          const school = (ath.college || "").toLowerCase();
          if (!name.includes(q) && !school.includes(q)) return false;
        }
        
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
  }, [leaderboardRows, searchQuery, roleFilter, positionFilter, statusFilter, stateFilter, sortBy]);

  if (!mounted) return null;

  const isFullyOnboarded = Boolean(account && hasProfile && isUnlocked);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#050507", backgroundImage: "radial-gradient(circle at 50% 0%, rgba(166, 255, 0, 0.07) 0%, transparent 55%)", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", paddingBottom: "80px" }}>
      
      {/* Slim Compliance Bar */}
      <div style={{ backgroundColor: "#0a0a0d", borderBottom: "1px solid #181820", padding: "7px 14px", textAlign: "center", fontSize: "10px", color: "#a1a1aa", letterSpacing: "0.3px" }}>
        <strong style={{ color: "#ffffff" }}>NCAA NIL Compliant:</strong> Slugger Coins ($SLUG) are non-compensatory ($0 cash value) and serve strictly as a flat 100 $SLUG member access key.
      </div>

      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "18px 14px" }}>
        
        {/* Clean Header */}
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          paddingBottom: "16px", 
          borderBottom: "1px solid #1c1c24",
          flexWrap: "wrap", 
          gap: "12px" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "950", letterSpacing: "1px", color: "#ffffff", textTransform: "uppercase" }}>
                The Diamond Collective
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                <span style={{ fontSize: "10px", color: NEON_GREEN, fontWeight: "800", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                  College Scouting & Brand Perks
                </span>
                <span style={{ fontSize: "10px", color: "#71717a" }}>•</span>
                <span style={{ fontSize: "10px", color: "#a1a1aa", fontWeight: "700" }}>
                  {totalSupplyData !== undefined ? `${remainingPercentage}% Founders Keys Left` : "16+ Brand Partners"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isFullyOnboarded && (
              <span style={{
                backgroundColor: "rgba(166, 255, 0, 0.12)",
                border: `1px solid ${NEON_GREEN}`,
                color: NEON_GREEN,
                fontSize: "10px",
                fontWeight: "900",
                padding: "7px 10px",
                borderRadius: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                ✅ 100 $SLUG Member
              </span>
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

        {/* STEP-BY-STEP ONBOARDING BAR (SHOWN UNTIL ALL 3 STEPS ARE COMPLETE) */}
        {!isFullyOnboarded && (
          <div style={{
            backgroundColor: "#0c0c12",
            border: `1.5px solid ${NEON_GREEN}`,
            borderRadius: "16px",
            padding: "14px 16px",
            marginTop: "16px",
            boxShadow: "0 8px 28px rgba(166, 255, 0, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "950", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                🚀 Athlete Quick-Start (Unlock 20% Off TAG Sports, Giveaway & Brand Intros)
              </span>
              <span style={{ fontSize: "10px", color: "#a1a1aa", fontWeight: "700" }}>
                100% Free • Takes 60 Seconds
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px" }}>
              {/* Step 1: Sign In */}
              <button
                onClick={() => !account && handleOpenLogin()}
                style={{
                  backgroundColor: account ? "rgba(166, 255, 0, 0.08)" : NEON_GREEN,
                  color: account ? NEON_GREEN : "#000000",
                  border: account ? `1px solid ${NEON_GREEN}` : "none",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: account ? "default" : "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: "900",
                  fontSize: "11px"
                }}
              >
                <span>1. Sign In (Google / Phone)</span>
                <span>{account ? "✅ Done" : "Tap Here ➔"}</span>
              </button>

              {/* Step 2: Complete Player Bio */}
              <button
                onClick={() => {
                  if (!account) handleOpenLogin();
                  else setActiveMainTab("LOCKER");
                }}
                style={{
                  backgroundColor: hasProfile ? "rgba(166, 255, 0, 0.08)" : account ? NEON_GREEN : "#16161d",
                  color: hasProfile ? NEON_GREEN : account ? "#000000" : "#a1a1aa",
                  border: hasProfile ? `1px solid ${NEON_GREEN}` : "1px solid #2e2e3a",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: "900",
                  fontSize: "11px"
                }}
              >
                <span>2. Fill Out Player Locker</span>
                <span>{hasProfile ? "✅ Done" : account ? "Open Locker ➔" : "🔒 Step 2"}</span>
              </button>

              {/* Step 3: Claim 100 $SLUG Key */}
              <button
                onClick={() => {
                  if (!account) handleOpenLogin();
                  else if (!hasProfile) setActiveMainTab("LOCKER");
                  else setShowClaimPromptModal(true);
                }}
                style={{
                  backgroundColor: isUnlocked ? "rgba(166, 255, 0, 0.08)" : (account && hasProfile) ? NEON_GREEN : "#16161d",
                  color: isUnlocked ? NEON_GREEN : (account && hasProfile) ? "#000000" : "#a1a1aa",
                  border: isUnlocked ? `1px solid ${NEON_GREEN}` : "1px solid #2e2e3a",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontWeight: "900",
                  fontSize: "11px"
                }}
              >
                <span>3. Claim Free 100 $SLUG Key</span>
                <span>{isUnlocked ? "✅ Active" : (account && hasProfile) ? "Claim Now 🔑" : "🔒 Step 3"}</span>
              </button>
            </div>
          </div>
        )}

        {/* COMPACT HALLOWEEN GIVEAWAY BAR */}
        <div style={{
          background: "linear-gradient(135deg, rgba(28, 16, 42, 0.95) 0%, rgba(14, 14, 20, 0.98) 100%)",
          border: "1.5px solid #ff7a00",
          borderRadius: "16px",
          padding: "14px 18px",
          marginTop: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: "1 1 320px" }}>
            <span style={{ backgroundColor: "#09090d", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontSize: "11px", fontWeight: "950", padding: "5px 10px", borderRadius: "8px", fontFamily: "monospace" }}>
              🎃 {countdownText}
            </span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "950", color: "#ffffff", textTransform: "uppercase" }}>
                TAG Sports Radar Giveaway + 20% Off Member Perk
              </div>
              <div style={{ fontSize: "11px", color: "#d4d4d8", marginTop: "2px" }}>
                Live draw Oct 31 @ 8PM MST • {isUnlocked ? <strong style={{ color: NEON_GREEN }}>20% Off Code: DIAMONDCOLLECTIVE</strong> : <span>Unlock your 100 $SLUG key for 20% off & free entry</span>}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={handleEnterGiveaway}
              disabled={hasEnteredGiveaway || isRegisteringGiveaway}
              style={{
                backgroundColor: hasEnteredGiveaway ? "rgba(166, 255, 0, 0.15)" : NEON_GREEN,
                color: hasEnteredGiveaway ? NEON_GREEN : "#000000",
                border: hasEnteredGiveaway ? `1px solid ${NEON_GREEN}` : "none",
                fontWeight: "950",
                padding: "10px 16px",
                borderRadius: "10px",
                cursor: hasEnteredGiveaway ? "default" : "pointer",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {isRegisteringGiveaway ? "Entering..." : hasEnteredGiveaway ? "✅ Entered for Oct 31" : "🎃 Enter Giveaway ➔"}
            </button>

            <button
              onClick={() => {
                setActiveMainTab("EXCHANGE");
                setBrandCategoryFilter("PERKS");
              }}
              style={{
                backgroundColor: "#181822",
                color: "#ffffff",
                border: "1px solid #383846",
                fontWeight: "800",
                padding: "10px 12px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "11px",
                textTransform: "uppercase"
              }}
            >
              20% Code ↗
            </button>

            {isAdmin && (
              <button
                onClick={selectRandomHalloweenWinner}
                style={{
                  backgroundColor: "rgba(255, 122, 0, 0.2)",
                  border: "1px dashed #ff7a00",
                  color: "#ff9933",
                  fontSize: "10px",
                  fontWeight: "900",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  textTransform: "uppercase"
                }}
              >
                {showWinnerAnimation ? "Rolling..." : "🎲 Pick Winner"}
              </button>
            )}
          </div>

          {giveawayWinner && (
            <div style={{ width: "100%", backgroundColor: "#111116", border: `1.5px solid ${NEON_GREEN}`, padding: "10px", borderRadius: "10px", textAlign: "center", marginTop: "4px" }}>
              <span style={{ fontSize: "11px", color: "#ff9933", fontWeight: "900", marginRight: "8px" }}>🏆 HALLOWEEN WINNER:</span>
              <span style={{ fontSize: "14px", color: "#ffffff", fontWeight: "950" }}>{giveawayWinner.fullName}</span>
              <span style={{ fontSize: "12px", color: NEON_GREEN, fontWeight: "800", marginLeft: "6px" }}>• {giveawayWinner.college} ({giveawayWinner.position})</span>
            </div>
          )}
        </div>

        {/* 3-PILLAR NAVIGATION BAR (SCOREBOARD | BRAND DEALS | MY LOCKER) */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr 1fr", 
          gap: "8px", 
          margin: "18px 0 22px 0",
          backgroundColor: "#0b0b0f",
          padding: "6px",
          borderRadius: "16px",
          border: "1px solid #22222c"
        }}>
          <button
            onClick={() => setActiveMainTab("SCOREBOARD")}
            style={{
              backgroundColor: activeMainTab === "SCOREBOARD" ? NEON_GREEN : "transparent",
              color: activeMainTab === "SCOREBOARD" ? "#000000" : "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 8px",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: "950",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              transition: "all 0.15s ease"
            }}
          >
            🏆 Scoreboard ({filteredScoreboard.length})
          </button>

          <button
            onClick={() => setActiveMainTab("EXCHANGE")}
            style={{
              backgroundColor: activeMainTab === "EXCHANGE" ? NEON_GREEN : "transparent",
              color: activeMainTab === "EXCHANGE" ? "#000000" : "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 8px",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: "950",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              transition: "all 0.15s ease"
            }}
          >
            🤝 Brand Deals (16)
          </button>

          <button
            onClick={() => setActiveMainTab("LOCKER")}
            style={{
              backgroundColor: activeMainTab === "LOCKER" ? NEON_GREEN : "transparent",
              color: activeMainTab === "LOCKER" ? "#000000" : "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "12px 8px",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: "950",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              transition: "all 0.15s ease"
            }}
          >
            👤 My Locker {hasProfile ? "✓" : "⚙️"}
          </button>
        </div>

        {/* =====================================================================
            TAB 1: NATIONAL SCOUTING SCOREBOARD (COMPACT & EXPANDABLE)
           ===================================================================== */}
        {activeMainTab === "SCOREBOARD" && (
          <section>
            {/* Search & Quick Filter Bar */}
            <div style={{ backgroundColor: "#0c0c10", border: "1px solid #1e1e26", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search player name or college..."
                  style={{
                    flex: "1 1 220px",
                    backgroundColor: "#14141a",
                    border: `1.5px solid ${searchQuery ? NEON_GREEN : "#2c2c36"}`,
                    color: "#ffffff",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                    outline: "none"
                  }}
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{ backgroundColor: "#14141a", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontWeight: "900", padding: "10px 12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer" }}
                >
                  <option value="DEFAULT">Sort: Latest Added</option>
                  <option value="PEAK_FB">Sort: Peak Fastball ↓</option>
                  <option value="STUFF_PLUS">Sort: Stuff+ Grade ↓</option>
                  <option value="IVB">Sort: Induced Vert Break ↓</option>
                  <option value="MAX_EV">Sort: Max Exit Velo ↓</option>
                </select>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  style={{
                    backgroundColor: showAdvancedFilters ? "#22222c" : "#14141a",
                    border: "1px solid #333340",
                    color: "#ffffff",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer"
                  }}
                >
                  {showAdvancedFilters ? "Hide Filters ▲" : "Filters ▼"}
                </button>
              </div>

              {/* Role Filter Pills */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {(["ALL", "HITTER", "PITCHER", "TWP"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      style={{
                        backgroundColor: roleFilter === r ? NEON_GREEN : "#15151c",
                        color: roleFilter === r ? "#000000" : "#d4d4d8",
                        border: roleFilter === r ? `1px solid ${NEON_GREEN}` : "1px solid #2b2b36",
                        fontWeight: "900",
                        fontSize: "11px",
                        padding: "7px 14px",
                        borderRadius: "999px",
                        textTransform: "uppercase",
                        cursor: "pointer",
                      }}
                    >
                      {r === "TWP" ? "⚡ Two-Way" : r === "ALL" ? "All Players" : `${r}s`}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveMainTab("LOCKER")}
                  style={{
                    backgroundColor: "rgba(166, 255, 0, 0.14)",
                    border: `1px solid ${NEON_GREEN}`,
                    color: NEON_GREEN,
                    fontWeight: "900",
                    padding: "7px 14px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    cursor: "pointer"
                  }}
                >
                  + Post / Edit My Numbers ➔
                </button>
              </div>

              {/* Collapsible Advanced Filters */}
              {showAdvancedFilters && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #1e1e26" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "4px" }}>Position</label>
                    <select
                      value={positionFilter}
                      onChange={(e) => setPositionFilter(e.target.value)}
                      style={{ width: "100%", backgroundColor: "#14141a", border: "1px solid #33333d", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}
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
                    <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "4px" }}>Roster / Portal Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ width: "100%", backgroundColor: "#14141a", border: "1px solid #33333d", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Transfer Portal">Transfer Portal</option>
                      <option value="Juco Uncommitted">Juco Uncommitted</option>
                      <option value="Returning">Returning College</option>
                      <option value="Incoming Freshman">Incoming Freshman</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#a1a1aa", textTransform: "uppercase", marginBottom: "4px" }}>State</label>
                    <select
                      value={stateFilter}
                      onChange={(e) => setStateFilter(e.target.value)}
                      style={{ width: "100%", backgroundColor: "#14141a", border: "1px solid #33333d", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}
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

                  const isEliteFB = parseFloat(ath.peakFB || "0") >= 92;
                  const isEliteStuff = parseFloat(ath.stuffPlus || "0") >= 110;
                  const isEliteIVB = parseFloat(ath.inducedVertBreak || "0") >= 18;
                  const isEliteEV = parseFloat(ath.maxExitVelo || "0") >= 100;
                  const isElite60 = parseFloat(ath.sixtyTime || "99") <= 6.65;

                  // Build Quick Headline Badges for Compact Row
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

                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: "#0d0d12",
                        border: isExpanded ? `1.5px solid ${NEON_GREEN}` : "1px solid #24242e",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {/* Compact Top Row (Always Visible - Click to Expand) */}
                      <div
                        onClick={() => setExpandedCardIdx(isExpanded ? null : idx)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", cursor: "pointer" }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "200px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontWeight: "950", color: "#ffffff", fontSize: "17px" }}>
                              {ath.fullName || "Member Athlete"}
                            </span>
                            <span style={{ backgroundColor: isAthleteTWP ? "rgba(166, 255, 0, 0.16)" : "#1b1b24", border: `1px solid ${isAthleteTWP ? NEON_GREEN : "#383846"}`, color: isAthleteTWP ? NEON_GREEN : "#d4d4d8", padding: "2px 8px", borderRadius: "999px", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}>
                              {ath.position || ath.primaryRole}
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#d4d4d8", fontWeight: "700" }}>
                            <span style={{ color: NEON_GREEN, fontWeight: "800" }}>🏛️ {ath.college || "Undeclared"}</span>
                            {ath.state ? ` (${ath.state})` : ""}
                            {ath.height && ath.weight ? ` • ${ath.height} / ${ath.weight} lbs` : ""}
                            <span> • {ath.playerStatus}</span>
                          </div>
                        </div>

                        {/* Headline Metric Pills & Action Buttons */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          {headlinePills.slice(0, 4).map((p, pIdx) => (
                            <div
                              key={pIdx}
                              style={{
                                backgroundColor: p.elite ? "rgba(255, 184, 0, 0.14)" : "#14141c",
                                border: `1px solid ${p.elite ? "#ffb800" : "#2e2e3a"}`,
                                padding: "5px 10px",
                                borderRadius: "8px",
                                fontFamily: "monospace",
                                fontSize: "12px",
                                fontWeight: "900"
                              }}
                            >
                              <span style={{ color: p.elite ? "#ffb800" : NEON_GREEN }}>{p.elite ? "🔥 " : ""}{p.label}: </span>
                              <span style={{ color: "#ffffff" }}>{p.val}</span>
                            </div>
                          ))}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerMobileScoutShare(ath);
                            }}
                            style={{
                              backgroundColor: "rgba(166, 255, 0, 0.14)",
                              border: `1px solid ${NEON_GREEN}`,
                              color: NEON_GREEN,
                              padding: "6px 10px",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontWeight: "900",
                              cursor: "pointer"
                            }}
                          >
                            📸 4:5 Card
                          </button>

                          <span style={{ fontSize: "11px", color: "#a1a1aa", fontWeight: "800", marginLeft: "4px" }}>
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {/* Expanded Full Telemetry Drawer */}
                      {isExpanded && (
                        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #22222c", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                            {isPitcherRole && (
                              <div style={{ backgroundColor: "#07070a", border: "1px solid #24242e", borderRadius: "12px", padding: "12px", fontSize: "12px", fontFamily: "monospace" }}>
                                <div style={{ color: NEON_GREEN, fontWeight: "900", marginBottom: "6px", textTransform: "uppercase", fontSize: "10px" }}>⚾ Full Mound Telemetry</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", color: "#ffffff", fontWeight: "800" }}>
                                  <span>Peak FB: {ath.peakFB || "--"} mph</span>
                                  {ath.sittingFB && <span>• Sit: {ath.sittingFB}</span>}
                                  {ath.fbSpinRate && <span>• Spin: {ath.fbSpinRate} RPM</span>}
                                  {ath.stuffPlus && <span>• Stuff+: {ath.stuffPlus}</span>}
                                  {ath.inducedVertBreak && <span>• IVB: {ath.inducedVertBreak}"</span>}
                                  {ath.horizontalBreak && <span>• HB: {ath.horizontalBreak}"</span>}
                                  {ath.releaseExtension && <span>• Ext: {ath.releaseExtension}ft</span>}
                                  {ath.vertApproachAngle && <span>• VAA: {ath.vertApproachAngle}°</span>}
                                  {ath.offSpeedVelo && <span>• {ath.offSpeedType || "Slider"}: {ath.offSpeedVelo} mph</span>}
                                  {ath.kMinusBbPercentage && <span>• K-BB%: {ath.kMinusBbPercentage}%</span>}
                                </div>
                              </div>
                            )}

                            {isHitterRole && (
                              <div style={{ backgroundColor: "#07070a", border: "1px solid #24242e", borderRadius: "12px", padding: "12px", fontSize: "12px", fontFamily: "monospace" }}>
                                <div style={{ color: NEON_GREEN, fontWeight: "900", marginBottom: "6px", textTransform: "uppercase", fontSize: "10px" }}>💥 Full Hitting Telemetry</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", color: "#ffffff", fontWeight: "800" }}>
                                  <span>Max EV: {ath.maxExitVelo || "--"} mph</span>
                                  {ath.ninetyEV && <span>• 90th% EV: {ath.ninetyEV} mph</span>}
                                  {ath.batSpeed && <span>• Bat Speed: {ath.batSpeed} mph</span>}
                                  {ath.sixtyTime && <span>• 60-Yd Dash: {ath.sixtyTime}s</span>}
                                </div>
                              </div>
                            )}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                            <div style={{ fontSize: "11px", color: "#a1a1aa", fontFamily: "monospace" }}>
                              {ath.recordedDatePitching && <span>Pitch Date: {String(ath.recordedDatePitching).slice(0, 10)} </span>}
                              {ath.recordedDateHitting && <span>Hit Date: {String(ath.recordedDateHitting).slice(0, 10)}</span>}
                            </div>

                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {ath.verificationLink && ath.verificationLink.startsWith("http") && (
                                <a
                                  href={ath.verificationLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ backgroundColor: "rgba(255, 122, 0, 0.15)", border: "1px solid #ff7a00", color: "#ff9933", padding: "7px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "900" }}
                                >
                                  🎥 Watch Video Clip ↗
                                </a>
                              )}
                              {ath.social1_Url && (
                                <a
                                  href={ath.social1_Url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ backgroundColor: "#1c1c24", border: "1px solid #44444f", color: NEON_GREEN, padding: "7px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "900" }}
                                >
                                  {ath.social1_Type || "Social 1"} ↗
                                </a>
                              )}
                              {ath.social2_Url && (
                                <a
                                  href={ath.social2_Url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ backgroundColor: "#1c1c24", border: "1px solid #44444f", color: NEON_GREEN, padding: "7px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "900" }}
                                >
                                  {ath.social2_Type || "Social 2"} ↗
                                </a>
                              )}
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
            TAB 2: BRAND DEALS & MEMBER PERKS (FLATTENED WITH 1-TAP FILTERS)
           ===================================================================== */}
        {activeMainTab === "EXCHANGE" && (
          <section>
            {/* Member Drop #001 Slim Banner */}
            <div style={{ 
              backgroundColor: "#0d0d12", 
              border: `1.5px solid ${NEON_GREEN}`, 
              borderRadius: "16px", 
              padding: "16px 20px", 
              marginBottom: "18px", 
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px"
            }}>
              <div>
                <span style={{ backgroundColor: NEON_GREEN, color: "#000000", fontSize: "9px", fontWeight: "950", padding: "3px 8px", borderRadius: "999px", textTransform: "uppercase", marginRight: "8px" }}>
                  Free Member Drop #001
                </span>
                <span style={{ fontSize: "15px", fontWeight: "950", color: "#ffffff", textTransform: "uppercase" }}>
                  "The Big Black Grip" Pro Bat Grip ($0.00 Free)
                </span>
                <div style={{ fontSize: "12px", color: "#d4d4d8", marginTop: "3px" }}>
                  Free for college ballplayers — just cover flat $8.99 USPS shipping.
                </div>
              </div>

              <a
                href={STRIPE_GRIP_DROP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: NEON_GREEN,
                  color: "#000000",
                  fontWeight: "950",
                  padding: "10px 18px",
                  borderRadius: "10px",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  whiteSpace: "nowrap"
                }}
              >
                Claim Free Bat Grip ($8.99 S&H) ↗
              </a>
            </div>

            {/* 1-Tap Category Filter Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {[
                { id: "ALL", label: "All Partners (16)" },
                { id: "DIRECT", label: "⚡ Direct Rep Intros (5)" },
                { id: "PERKS", label: "🎁 Member Codes & Perks" },
                { id: "GEAR", label: "⚾ Tech & Equipment" },
                { id: "APPAREL", label: "👟 Apparel, Cleats & Nutrition" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setBrandCategoryFilter(cat.id as any)}
                  style={{
                    backgroundColor: brandCategoryFilter === cat.id ? NEON_GREEN : "#13131a",
                    color: brandCategoryFilter === cat.id ? "#000000" : "#ffffff",
                    border: brandCategoryFilter === cat.id ? `1px solid ${NEON_GREEN}` : "1px solid #2b2b36",
                    padding: "9px 14px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: "900",
                    textTransform: "uppercase",
                    cursor: "pointer"
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Unified Responsive Brand Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "14px" }}>
              {flattenedBrands.map((brand, bIdx) => {
                const isDirectIntro = brand.type === "email_intro";
                const hasCoupon = Boolean(brand.couponCode);
                const activeIntro = isIntroActive(brand.name);

                return (
                  <div 
                    key={bIdx}
                    style={{ 
                      backgroundColor: "#0c0c10", 
                      border: (isDirectIntro || hasCoupon) ? `1.5px solid rgba(166, 255, 0, 0.55)` : "1px solid #1e1e26", 
                      borderRadius: "14px", 
                      padding: "18px", 
                      display: "flex", 
                      flexDirection: "column", 
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "10px", fontWeight: "900", color: isDirectIntro ? NEON_GREEN : "#a1a1aa", textTransform: "uppercase" }}>
                          {brand.sectionEmoji} {brand.sectionTitle}
                        </span>
                        {isDirectIntro && (
                          <span style={{ backgroundColor: "rgba(166, 255, 0, 0.12)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, fontSize: "9px", fontWeight: "900", padding: "2px 7px", borderRadius: "999px", textTransform: "uppercase" }}>
                            ⚡ Direct Rep Intro
                          </span>
                        )}
                      </div>

                      <h4 style={{ fontSize: "18px", fontWeight: "950", color: "#ffffff", margin: "0 0 4px 0", textTransform: "uppercase" }}>
                        {brand.name}
                      </h4>
                      <div style={{ fontSize: "11px", color: NEON_GREEN, fontWeight: "800", marginBottom: "8px" }}>
                        {brand.tagline}
                      </div>
                      <p style={{ fontSize: "12px", color: "#d4d4d8", lineHeight: "1.45", margin: 0 }}>
                        {brand.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                      {hasCoupon && (
                        <div>
                          {!account ? (
                            <button
                              onClick={handleOpenLogin}
                              style={{ width: "100%", backgroundColor: "#16161f", color: NEON_GREEN, border: `1px dashed ${NEON_GREEN}`, fontWeight: "900", padding: "9px", borderRadius: "8px", fontSize: "11px", textTransform: "uppercase", cursor: "pointer" }}
                            >
                              🔒 Sign In to Unlock 20% Off Code
                            </button>
                          ) : !hasProfile ? (
                            <button
                              onClick={() => setActiveMainTab("LOCKER")}
                              style={{ width: "100%", backgroundColor: "#16161f", color: NEON_GREEN, border: `1px dashed ${NEON_GREEN}`, fontWeight: "900", padding: "9px", borderRadius: "8px", fontSize: "11px", textTransform: "uppercase", cursor: "pointer" }}
                            >
                              🔒 Complete Locker for 20% Off Code
                            </button>
                          ) : !isUnlocked ? (
                            <button
                              onClick={() => setShowClaimPromptModal(true)}
                              style={{ width: "100%", backgroundColor: "#16161f", color: NEON_GREEN, border: `1px dashed ${NEON_GREEN}`, fontWeight: "900", padding: "9px", borderRadius: "8px", fontSize: "11px", textTransform: "uppercase", cursor: "pointer" }}
                            >
                              🔑 Claim 100 $SLUG to Unlock 20% Off
                            </button>
                          ) : !codeRevealed ? (
                            <button
                              onClick={() => setCodeRevealed(true)}
                              style={{ width: "100%", backgroundColor: "rgba(166, 255, 0, 0.12)", color: NEON_GREEN, border: `1px dashed ${NEON_GREEN}`, fontWeight: "900", padding: "9px", borderRadius: "8px", fontSize: "11px", textTransform: "uppercase", cursor: "pointer" }}
                            >
                              🔓 Reveal 20% Off Member Code
                            </button>
                          ) : (
                            <div style={{ backgroundColor: "rgba(166, 255, 0, 0.1)", border: `1.5px dashed ${NEON_GREEN}`, borderRadius: "8px", padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <span style={{ display: "block", fontSize: "9px", color: NEON_GREEN, fontWeight: "800", textTransform: "uppercase" }}>
                                  {brand.couponLabel || "20% Off Code"} (<a href={brand.link} target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "underline" }}>Shop ↗</a>)
                                </span>
                                <span style={{ fontSize: "13px", fontWeight: "950", color: "#ffffff", fontFamily: "monospace" }}>
                                  {brand.couponCode}
                                </span>
                              </div>
                              <button
                                onClick={handleCopyCode}
                                style={{ backgroundColor: copiedCode ? NEON_GREEN : "#22222a", color: copiedCode ? "#000000" : NEON_GREEN, border: `1px solid ${NEON_GREEN}`, padding: "5px 9px", borderRadius: "6px", fontSize: "10px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}
                              >
                                {copiedCode ? "Copied!" : "Copy 📋"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {isDirectIntro ? (
                        <button
                          onClick={() => handleInitiateIntro(brand)}
                          style={{ 
                            width: "100%",
                            backgroundColor: activeIntro ? "#18181b" : NEON_GREEN, 
                            color: activeIntro ? "#a1a1aa" : "#000000", 
                            border: activeIntro ? "1px solid #27272a" : "none", 
                            fontWeight: "950", 
                            padding: "11px", 
                            borderRadius: "8px", 
                            fontSize: "11px", 
                            textTransform: "uppercase", 
                            cursor: "pointer"
                          }}
                        >
                          {activeIntro ? `🔒 Intro Sent (${getDaysRemaining(brand.name)}d window)` : brand.buttonText}
                        </button>
                      ) : (
                        <a
                          href={brand.link} 
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ 
                            display: "block", 
                            textAlign: "center", 
                            backgroundColor: "#16161c", 
                            color: "#ffffff", 
                            border: "1px solid #2e2e38", 
                            fontWeight: "800", 
                            padding: "11px", 
                            borderRadius: "8px", 
                            fontSize: "11px", 
                            textTransform: "uppercase", 
                            textDecoration: "none"
                          }}
                        >
                          {brand.buttonText}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* =====================================================================
            TAB 3: MY LOCKER (DIRECT IN-PAGE PROFILE & METRICS EDITOR)
           ===================================================================== */}
        {activeMainTab === "LOCKER" && (
          <section style={{ maxWidth: "720px", margin: "0 auto" }}>
            {!account ? (
              <div style={{ backgroundColor: "#0c0c10", border: `1.5px solid ${NEON_GREEN}`, borderRadius: "18px", padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "34px", marginBottom: "8px" }}>👤</div>
                <h2 style={{ fontSize: "20px", fontWeight: "950", textTransform: "uppercase", margin: "0 0 8px 0" }}>
                  Sign In to Open Your Athlete Locker
                </h2>
                <p style={{ fontSize: "13px", color: "#d4d4d8", maxWidth: "460px", margin: "0 auto 18px auto", lineHeight: "1.5" }}>
                  Use your Google, Apple, or phone ID to create your player card, post verified scouting metrics, and claim your free 100 $SLUG membership key.
                </p>
                <button
                  onClick={handleOpenLogin}
                  style={{ backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "950", padding: "13px 26px", borderRadius: "10px", border: "none", fontSize: "12px", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Athlete Sign In ➔
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: "#0c0c10", border: `1.5px solid ${NEON_GREEN}`, borderRadius: "18px", padding: "22px" }}>
                {/* Locker Status Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #22222a", paddingBottom: "16px", marginBottom: "18px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "950", textTransform: "uppercase" }}>
                      {profile.fullName ? `${profile.fullName}'s Locker` : "My Athlete Locker & Metrics"}
                    </h2>
                    <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#d4d4d8" }}>
                      Fill out your bio and numbers below, then click <strong style={{ color: NEON_GREEN }}>Save Profile</strong>.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {hasProfile && (
                      <button
                        type="button"
                        onClick={() => triggerMobileScoutShare(profile)}
                        style={{ backgroundColor: "rgba(166, 255, 0, 0.14)", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "9px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: "900", cursor: "pointer" }}
                      >
                        📸 Download My 4:5 Card
                      </button>
                    )}

                    {!isUnlocked && hasProfile && (
                      <button
                        type="button"
                        onClick={() => setShowClaimPromptModal(true)}
                        style={{ backgroundColor: NEON_GREEN, color: "#000000", border: "none", padding: "9px 14px", borderRadius: "10px", fontSize: "11px", fontWeight: "950", cursor: "pointer", textTransform: "uppercase" }}
                      >
                        🔑 Claim 100 $SLUG Key
                      </button>
                    )}
                  </div>
                </div>

                {/* 3 Sub-Tabs Inside Locker */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "18px" }}>
                  <button
                    type="button"
                    onClick={() => setActiveMatrixTab("BIO")}
                    style={{
                      backgroundColor: activeMatrixTab === "BIO" ? NEON_GREEN : "#14141a",
                      color: activeMatrixTab === "BIO" ? "#000000" : "#ffffff",
                      border: activeMatrixTab === "BIO" ? `1px solid ${NEON_GREEN}` : "1px solid #33333d",
                      padding: "10px",
                      borderRadius: "10px",
                      fontWeight: "900",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      cursor: "pointer"
                    }}
                  >
                    1. Bio & Roster
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMatrixTab("HITTING")}
                    style={{
                      backgroundColor: activeMatrixTab === "HITTING" ? NEON_GREEN : "#14141a",
                      color: activeMatrixTab === "HITTING" ? "#000000" : "#ffffff",
                      border: activeMatrixTab === "HITTING" ? `1px solid ${NEON_GREEN}` : "1px solid #33333d",
                      padding: "10px",
                      borderRadius: "10px",
                      fontWeight: "900",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      cursor: "pointer"
                    }}
                  >
                    2. Hitting Numbers
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMatrixTab("PITCHING")}
                    style={{
                      backgroundColor: activeMatrixTab === "PITCHING" ? NEON_GREEN : "#14141a",
                      color: activeMatrixTab === "PITCHING" ? "#000000" : "#ffffff",
                      border: activeMatrixTab === "PITCHING" ? `1px solid ${NEON_GREEN}` : "1px solid #33333d",
                      padding: "10px",
                      borderRadius: "10px",
                      fontWeight: "900",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      cursor: "pointer"
                    }}
                  >
                    3. Pitching & Stuff+
                  </button>
                </div>

                {/* Sub-Tab 1: Bio */}
                {activeMatrixTab === "BIO" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#ffffff", marginBottom: "4px" }}>Full Name *</label>
                        <input 
                          type="text" 
                          value={profile.fullName} 
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          placeholder="e.g. Jordan Jones" 
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>College / Program *</label>
                        <input 
                          type="text" 
                          value={profile.college} 
                          onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                          placeholder="e.g. Utah Tech" 
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Height</label>
                        <input 
                          type="text" 
                          value={profile.height || ""} 
                          onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                          placeholder="6'3&quot;" 
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Weight</label>
                        <input 
                          type="number" 
                          value={profile.weight || ""} 
                          onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                          placeholder="210" 
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Position</label>
                        <input 
                          type="text" 
                          value={profile.position} 
                          onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                          placeholder="RHP / OF" 
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "4px" }}>Primary Role</label>
                        <select
                          value={profile.primaryRole}
                          onChange={(e) => setProfile({ ...profile, primaryRole: e.target.value as any })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "10px 4px", borderRadius: "8px", fontSize: "11px", fontWeight: "900" }}
                        >
                          <option value="HITTER">Hitter</option>
                          <option value="PITCHER">Pitcher</option>
                          <option value="TWP">Two-Way</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>State</label>
                        <select
                          value={profile.state || "UT"}
                          onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
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
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Roster Status</label>
                        <select
                          value={profile.playerStatus}
                          onChange={(e) => setProfile({ ...profile, playerStatus: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}
                        >
                          <option value="Transfer Portal">Transfer Portal</option>
                          <option value="Returning College Player">Returning</option>
                          <option value="Incoming Freshman">Incoming Freshman</option>
                          <option value="Juco Uncommitted">Juco Uncommitted</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>Class Year</label>
                        <select
                          value={profile.collegeYear}
                          onChange={(e) => setProfile({ ...profile, collegeYear: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}
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
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: NEON_GREEN, marginBottom: "4px" }}>Email *</label>
                        <input 
                          type="email" 
                          value={profile.email} 
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          placeholder="athlete@school.edu" 
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: `1px solid ${NEON_GREEN}`, color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#ffffff", marginBottom: "4px" }}>Cell Phone *</label>
                        <input 
                          type="tel" 
                          value={profile.phone} 
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="(555) 000-0000" 
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Hitting */}
                {activeMatrixTab === "HITTING" && (
                  <div style={{ backgroundColor: "#060609", border: "1px solid #22222a", borderRadius: "14px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase" }}>
                      💥 Batter's Box Benchmarks
                    </span>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>MAX EXIT VELO (MPH)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="103.2"
                          value={profile.maxExitVelo}
                          onChange={(e) => setProfile({ ...profile, maxExitVelo: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>90TH% EV (CONSISTENCY)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="98.4"
                          value={profile.ninetyEV}
                          onChange={(e) => setProfile({ ...profile, ninetyEV: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>BAT SPEED (MPH)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="76.8"
                          value={profile.batSpeed}
                          onChange={(e) => setProfile({ ...profile, batSpeed: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "800", color: "#ffffff", marginBottom: "4px" }}>60-YARD DASH (SEC)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="6.65"
                          value={profile.sixtyTime}
                          onChange={(e) => setProfile({ ...profile, sixtyTime: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Pitching */}
                {activeMatrixTab === "PITCHING" && (
                  <div style={{ backgroundColor: "#060609", border: "1px solid #22222a", borderRadius: "14px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase" }}>
                      ⚾ Velocity, Stuff+ & Movement Shapes
                    </span>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>PEAK FB</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="94.5"
                          value={profile.peakFB || ""}
                          onChange={(e) => setProfile({ ...profile, peakFB: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>SITTING FB</label>
                        <input
                          type="text"
                          placeholder="91-93"
                          value={profile.sittingFB || ""}
                          onChange={(e) => setProfile({ ...profile, sittingFB: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "3px" }}>STUFF+</label>
                        <input
                          type="number"
                          placeholder="118"
                          value={profile.stuffPlus || ""}
                          onChange={(e) => setProfile({ ...profile, stuffPlus: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: `1px solid ${NEON_GREEN}`, color: NEON_GREEN, padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "900" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>FB SPIN</label>
                        <input
                          type="number"
                          placeholder="2420"
                          value={profile.fbSpinRate || ""}
                          onChange={(e) => setProfile({ ...profile, fbSpinRate: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "3px" }}>IVB (IN)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="18.2"
                          value={profile.inducedVertBreak || ""}
                          onChange={(e) => setProfile({ ...profile, inducedVertBreak: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>HB (IN)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="14.5"
                          value={profile.horizontalBreak || ""}
                          onChange={(e) => setProfile({ ...profile, horizontalBreak: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>EXT (FT)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="6.8"
                          value={profile.releaseExtension || ""}
                          onChange={(e) => setProfile({ ...profile, releaseExtension: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>VAA (°)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="-4.6"
                          value={profile.vertApproachAngle || ""}
                          onChange={(e) => setProfile({ ...profile, vertApproachAngle: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>OFF-SPEED</label>
                        <select
                          value={profile.offSpeedType || "Slider"}
                          onChange={(e) => setProfile({ ...profile, offSpeedType: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px 4px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}
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
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>OS VELO</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="83.4"
                          value={profile.offSpeedVelo || ""}
                          onChange={(e) => setProfile({ ...profile, offSpeedVelo: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>K%</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="30"
                          value={profile.kPercentage || ""}
                          onChange={(e) => setProfile({ ...profile, kPercentage: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#ffffff", marginBottom: "3px" }}>BB%</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="6"
                          value={profile.bbPercentage || ""}
                          onChange={(e) => setProfile({ ...profile, bbPercentage: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000", border: "1px solid #444", color: "#fff", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Video & Social Proof Inputs */}
                <div style={{ borderTop: "1px solid #22222a", paddingTop: "14px", marginTop: "16px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "900", color: "#ff9933", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "6px" }}>
                    🎥 Video / TrackMan / TAG Sports Clip Link (Optional)
                  </span>
                  <input
                    type="url"
                    placeholder="https://x.com/... or YouTube / TAG Sports video link"
                    value={profile.verificationLink || ""}
                    onChange={(e) => setProfile({ ...profile, verificationLink: e.target.value })}
                    style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}
                  />

                  <span style={{ fontSize: "10px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "8px" }}>
                    Public Social Links (For Coaches & Scouts)
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px", marginBottom: "8px" }}>
                    <select
                      value={profile.social1_Type || "X"}
                      onChange={(e) => setProfile({ ...profile, social1_Type: e.target.value })}
                      style={{ backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}
                    >
                      <option value="X">X (Twitter)</option>
                      <option value="IG">Instagram</option>
                      <option value="TIKTOK">TikTok</option>
                    </select>
                    <input
                      type="url"
                      placeholder="https://x.com/athlete"
                      value={profile.social1_Url || ""}
                      onChange={(e) => setProfile({ ...profile, social1_Url: e.target.value })}
                      style={{ backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px" }}>
                    <select
                      value={profile.social2_Type || "IG"}
                      onChange={(e) => setProfile({ ...profile, social2_Type: e.target.value })}
                      style={{ backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px", borderRadius: "8px", fontSize: "11px", fontWeight: "700" }}
                    >
                      <option value="IG">Instagram</option>
                      <option value="X">X (Twitter)</option>
                      <option value="TIKTOK">TikTok</option>
                    </select>
                    <input
                      type="url"
                      placeholder="https://instagram.com/athlete"
                      value={profile.social2_Url || ""}
                      onChange={(e) => setProfile({ ...profile, social2_Url: e.target.value })}
                      style={{ backgroundColor: "#000000", border: "1px solid #444", color: "#ffffff", padding: "9px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }}
                    />
                  </div>
                </div>

                {/* Primary Save Button */}
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  style={{
                    width: "100%",
                    marginTop: "18px",
                    backgroundColor: NEON_GREEN,
                    color: "#000000",
                    border: "none",
                    fontWeight: "950",
                    padding: "14px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "13px",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px"
                  }}
                >
                  {isSavingProfile ? "Saving to National Scoreboard..." : "Save Profile & Publish Metrics 🚀"}
                </button>
              </div>
            )}
          </section>
        )}

        {/* FAQ Accordion */}
        <section style={{ margin: "48px 0 20px 0" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              How It Works
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: "950", color: "#ffffff", textTransform: "uppercase", margin: "4px 0 0 0" }}>
              Frequently Asked Questions
            </h3>
          </div>

          <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {FAQS.map((faq, fIdx) => (
              <div 
                key={fIdx} 
                style={{ backgroundColor: "#0c0c10", border: "1px solid #1e1e26", borderRadius: "12px", overflow: "hidden" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
                  style={{ width: "100%", textAlign: "left", padding: "15px 18px", background: "none", border: "none", color: "#ffffff", fontSize: "14px", fontWeight: "800", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span>{faq.q}</span>
                  <span style={{ color: NEON_GREEN, fontSize: "18px", fontWeight: "900", marginLeft: "12px" }}>
                    {openFaq === fIdx ? "−" : "+"}
                  </span>
                </button>
                {openFaq === fIdx && (
                  <div style={{ padding: "0 18px 16px 18px", color: "#d4d4d8", fontSize: "13px", lineHeight: "1.55" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 100 $SLUG MEMBERSHIP KEY CLAIM MODAL */}
      {showClaimPromptModal && account && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200, padding: "16px" }}>
          <div style={{ backgroundColor: "#0c0c10", border: `2px solid ${NEON_GREEN}`, borderRadius: "22px", width: "100%", maxWidth: "460px", padding: "26px 22px", textAlign: "center", boxShadow: "0 0 45px rgba(166, 255, 0, 0.2)" }}>
            <div style={{ fontSize: "34px", marginBottom: "6px" }}>🔑</div>
            <span style={{ fontSize: "10px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Final Step • 100% Free
            </span>
            <h3 style={{ margin: "6px 0 10px 0", fontSize: "21px", fontWeight: "950", textTransform: "uppercase", color: "#ffffff" }}>
              Activate Your 100 $SLUG Key
            </h3>
            <p style={{ fontSize: "13px", color: "#d4d4d8", lineHeight: "1.5", margin: "0 0 18px 0" }}>
              Your player profile is saved! Tap below to claim your free <strong style={{ color: "#ffffff" }}>100 $SLUG membership key</strong> to unlock the Halloween TAG Radar giveaway, 20% off discount code, and Direct Brand Intros.
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
                style={{ width: "100%", backgroundColor: "transparent", border: "1px solid #33333d", color: "#a1a1aa", fontWeight: "800", padding: "10px", borderRadius: "10px", cursor: "pointer", fontSize: "11px", textTransform: "uppercase" }}
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
                <span style={{ fontSize: "10px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
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
                  fontSize: "11px"
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
                <span style={{ fontSize: "11px", fontWeight: "900", color: isLockoutModal ? "#eab308" : NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px" }}>
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
