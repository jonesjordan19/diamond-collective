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
  instagramUrl: string;
  instagramFollowers: string;
  tiktokUrl: string;
  tiktokFollowers: string;
  xUrl: string;
  xFollowers: string;
  
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
  instagramUrl: "",
  instagramFollowers: "",
  tiktokUrl: "",
  tiktokFollowers: "",
  xUrl: "",
  xFollowers: "",
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
};

// Initial roster so visitors always see that the board is active
const INITIAL_PUBLIC_ROSTER: AthleteProfile[] = [];
  {
    ...emptyProfile,
    fullName: "Jordan Jones",
    college: "University of Utah",
    state: "UT",
    position: "LHP",
    primaryRole: "PITCHER",
    playerStatus: "Incoming Freshman",
    peakFB: "85.0",
    sittingFB: "82-84",
    offSpeedType: "Curveball",
    offSpeedVelo: "74.0",
    fbSpinRate: "2280",
    offSpeedSpinRate: "2410",
    firstPitchStrike: "66",
    recordedDatePitching: "09/17/2026",
    social1_Type: "X",
    social1_Url: "https://x.com",
    social2_Type: "IG",
    social2_Url: "https://instagram.com",
  },
  {
    ...emptyProfile,
    fullName: "Carter Davis",
    college: "Salt Lake CC",
    state: "UT",
    position: "OF / RHP",
    primaryRole: "TWP",
    playerStatus: "Transfer Portal",
    maxExitVelo: "104.2",
    ninetyEV: "100.8",
    batSpeed: "77.5",
    sixtyTime: "6.58",
    peakFB: "93.4",
    sittingFB: "90-92",
    offSpeedType: "Slider",
    offSpeedVelo: "82.5",
    fbSpinRate: "2450",
    offSpeedSpinRate: "2610",
    firstPitchStrike: "70",
    recordedDateHitting: "09/15/2026",
    recordedDatePitching: "09/15/2026",
    social1_Type: "X",
    social1_Url: "https://x.com",
    social2_Type: "IG",
    social2_Url: "https://instagram.com",
  },
  {
    ...emptyProfile,
    fullName: "Tyler Brooks",
    college: "Central Arizona",
    state: "AZ",
    position: "SS",
    primaryRole: "HITTER",
    playerStatus: "Juco Uncommitted",
    maxExitVelo: "99.4",
    ninetyEV: "96.2",
    batSpeed: "75.1",
    sixtyTime: "6.64",
    recordedDateHitting: "09/12/2026",
    social1_Type: "IG",
    social1_Url: "https://instagram.com",
  },
];

function AppContent() {
  const account = useActiveAccount();
  const { connect } = useConnectModal();
  const [justClaimed, setJustClaimed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 50/50 Dual Tab
  const [activeMainTab, setActiveMainTab] = useState<"EXCHANGE" | "SCOREBOARD">("SCOREBOARD");
  
  // High-Utility Scout Filter State
  const [roleFilter, setRoleFilter] = useState<"ALL" | "HITTER" | "PITCHER" | "TWP">("ALL");
  const [positionFilter, setPositionFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"DEFAULT" | "MAX_EV" | "PEAK_FB" | "SIXTY">("DEFAULT");

  const [leaderboardRows, setLeaderboardRows] = useState<AthleteProfile[]>([]);
  const [loadingScoreboard, setLoadingScoreboard] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [dispatchedBrand, setDispatchedBrand] = useState<BrandItem | null>(null);
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
  const isApproved = profile.verificationStatus === "Approved";
  const hasProfile = Boolean(profile.fullName && profile.email);

  const isIntroActive = (brandName: string): boolean => {
    const timestamp = introTimestamps[brandName];
    if (!timestamp) return false;
    return Date.now() - timestamp < NINETY_DAYS_MS;
  };

  // Fetch Public Scoreboard (Loads for ALL visitors immediately)
  useEffect(() => {
    const sheetUrl = process.env.NEXT_PUBLIC_SCOUTING_SHEET_URL;
    if (sheetUrl) {
      setLoadingScoreboard(true);
      fetch(sheetUrl)
        .then((res) => res.json())
        .then((data: any[]) => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: AthleteProfile[] = data.map((item) => ({
              ...emptyProfile,
              fullName: item.fullName || item.athleteEmail?.split("@")[0] || "Member Athlete",
              email: item.athleteEmail || item.email || "",
              college: item.currentCollege || item.college || "Undeclared",
              state: item.state || "UT",
              position: item.position || item.primaryRole || "ATH",
              primaryRole: (item.primaryRole as any) || "HITTER",
              playerStatus: item.portalStatus || item.playerStatus || "Active",
              isProfileVisible: String(item.isProfileVisible).toUpperCase() !== "FALSE",
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
              social1_Type: item.social1_Type || "X",
              social1_Url: item.social1_Url || "",
              social2_Type: item.social2_Type || "IG",
              social2_Url: item.social2_Url || "",
            }));

            // Merge sheet records with local initial public roster, avoiding duplicates
            setLeaderboardRows((prev) => {
              const combined = [...mapped];
              INITIAL_PUBLIC_ROSTER.forEach((initRow) => {
                if (!combined.some((c) => c.fullName.toLowerCase() === initRow.fullName.toLowerCase())) {
                  combined.push(initRow);
                }
              });
              return combined;
            });
          }
          setLoadingScoreboard(false);
        })
        .catch(() => {
          setLoadingScoreboard(false);
        });
    }
  }, []);

  // Sync user profile when logged in
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

        if (data && Array.isArray(data.existingIntros)) {
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
    const updatedProfile: AthleteProfile = {
      ...profile,
      recordedDateHitting: profile.maxExitVelo ? (profile.recordedDateHitting || today) : "",
      recordedDatePitching: profile.peakFB ? (profile.recordedDatePitching || today) : "",
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
      alert("Metrics saved to national scoreboard!");
    } catch {
      setIsSavingProfile(false);
      setShowProfileModal(false);
      alert("Metrics saved locally.");
    }
  };

  const handleRequestIntro = async (brand: BrandItem) => {
    if (isIntroActive(brand.name)) {
      setDispatchedBrand(brand);
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

  // High-performance filter and sort pipeline
  const filteredScoreboard = useMemo(() => {
    return leaderboardRows
      .filter((ath) => {
        if (ath.isProfileVisible === false) return false;
        
        // Role filter
        if (roleFilter !== "ALL" && ath.primaryRole !== roleFilter) return false;
        
        // Position filter
        if (positionFilter !== "ALL") {
          const p = (ath.position || "").toUpperCase();
          if (!p.includes(positionFilter.toUpperCase())) return false;
        }

        // Status / Portal filter
        if (statusFilter !== "ALL") {
          if (!ath.playerStatus || !ath.playerStatus.toLowerCase().includes(statusFilter.toLowerCase())) {
            return false;
          }
        }

        // State / Region filter
        if (stateFilter !== "ALL") {
          if (ath.state && ath.state !== stateFilter) return false;
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
        if (sortBy === "SIXTY") {
          const aTime = parseFloat(a.sixtyTime || "99") || 99;
          const bTime = parseFloat(b.sixtyTime || "99") || 99;
          return aTime - bTime;
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

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {account && hasProfile && (
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  backgroundColor: "#111111",
                  border: `1px solid ${NEON_GREEN}`,
                  color: NEON_GREEN,
                  fontSize: "12px",
                  fontWeight: "800",
                  padding: "10px 16px",
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

        {/* 50/50 PRIMARY NAV SPLIT PILLARS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "32px", marginBottom: "32px" }}>
          <button
            onClick={() => setActiveMainTab("SCOREBOARD")}
            style={{
              backgroundColor: activeMainTab === "SCOREBOARD" ? "#111111" : "#050505",
              border: activeMainTab === "SCOREBOARD" ? `2px solid ${NEON_GREEN}` : "1px solid #222222",
              boxShadow: activeMainTab === "SCOREBOARD" ? `0 0 25px rgba(166, 255, 0, 0.15)` : "none",
              borderRadius: "16px",
              padding: "18px 14px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ display: "block", fontSize: "10px", fontWeight: "900", color: NEON_GREEN, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>
              Scouting & Portal
            </span>
            <span style={{ display: "block", fontSize: "17px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
              padding: "18px 14px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.2s ease"
            }}
          >
            <span style={{ display: "block", fontSize: "10px", fontWeight: "900", color: NEON_GREEN, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "4px" }}>
              Monetization & Gear
            </span>
            <span style={{ display: "block", fontSize: "17px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              🤝 The Brand Dugout
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* PILLAR 1: THE NATIONAL SCOUTING SCOREBOARD (PUBLIC DISCOVERY + FILTERS)  */}
        {/* ========================================================================= */}
        {activeMainTab === "SCOREBOARD" && (
          <section style={{ marginBottom: "60px" }}>
            <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: "20px", padding: "26px 20px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <div style={{ display: "inline-block", backgroundColor: "rgba(166, 255, 0, 0.08)", border: `1px solid ${NEON_GREEN}`, borderRadius: "999px", padding: "4px 12px", fontSize: "10px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
                    Verified Collegiate Data Registry
                  </div>
                  <h2 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", margin: "0 0 6px 0" }}>
                    National Scouting Scoreboard
                  </h2>
                  <p style={{ fontSize: "13px", color: "#a1a1aa", maxWidth: "680px", margin: 0, lineHeight: "1.5" }}>
                    Direct scout discovery for active college ballplayers and transfer portal candidates. Filter verified bat speeds, velocities, and contact channels.
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

              {/* ADVANCED MULTI-DIMENSIONAL SCOUT FILTER BAR */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px", backgroundColor: "#050505", border: "1px solid #161616", borderRadius: "14px", padding: "12px" }}>
                {/* Specific Position */}
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: "#666", textTransform: "uppercase", marginBottom: "3px" }}>Position</label>
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    style={{ width: "100%", backgroundColor: "#111", border: "1px solid #262626", color: "#fff", padding: "6px 8px", borderRadius: "8px", fontSize: "11px" }}
                  >
                    <option value="ALL">All Positions</option>
                    <option value="C">Catcher (C)</option>
                    <option value="MIF">Middle Inf (MIF)</option>
                    <option value="SS">Shortstop (SS)</option>
                    <option value="3B">Third Base (3B)</option>
                    <option value="1B">First Base (1B)</option>
                    <option value="OF">Outfield (OF)</option>
                    <option value="RHP">RHP</option>
                    <option value="LHP">LHP</option>
                  </select>
                </div>

                {/* Status / Portal */}
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

                {/* State / Region */}
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

                {/* Leaderboard Metric Sort */}
                <div>
                  <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, textTransform: "uppercase", marginBottom: "3px" }}>Sort Leaderboard</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    style={{ width: "100%", backgroundColor: "#111", border: `1px solid rgba(166, 255, 0, 0.4)`, color: NEON_GREEN, fontWeight: "700", padding: "6px 8px", borderRadius: "8px", fontSize: "11px" }}
                  >
                    <option value="DEFAULT">Latest Update</option>
                    <option value="MAX_EV">Max Exit Velo ↓</option>
                    <option value="PEAK_FB">Peak Fastball ↓</option>
                    <option value="SIXTY">Fastest 60-Yd ↑</option>
                  </select>
                </div>
              </div>
            </div>

            {/* RESPONSIVE SCOREBOARD CONTAINER (NO HORIZONTAL OVERFLOW) */}
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
                        {/* Header: Athlete Name, School, State & Role Badge */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                          <div>
                            <div style={{ fontWeight: "900", color: "#ffffff", fontSize: "16px", letterSpacing: "0.3px" }}>
                              {ath.fullName || "Member Athlete"}
                            </div>
                            <div style={{ color: NEON_GREEN, fontSize: "13px", fontWeight: "800", marginTop: "2px" }}>
                              🏛️ {ath.college || "Undeclared College"} {ath.state ? `(${ath.state})` : ""}
                            </div>
                            <div style={{ color: "#888888", fontSize: "11px", marginTop: "2px" }}>
                              <strong style={{ color: "#cccccc" }}>{ath.position}</strong> • {ath.playerStatus}
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

                        {/* Mid Section: Performance Data Matrix */}
                        <div style={{ backgroundColor: "#050505", border: "1px solid #161616", borderRadius: "10px", padding: "10px 12px", display: "grid", gridTemplateColumns: isTWP ? "1fr 1fr" : "1fr", gap: "10px", fontFamily: "monospace" }}>
                          {isPitcher && (
                            <div>
                              <div style={{ fontSize: "9px", color: "#666666", textTransform: "uppercase", marginBottom: "3px", fontWeight: "700" }}>Pitching Metrics</div>
                              {ath.peakFB ? (
                                <div style={{ color: "#ffffff", fontWeight: "800", fontSize: "13px" }}>
                                  <span style={{ color: NEON_GREEN }}>FB:</span> {ath.peakFB} mph {ath.sittingFB ? `(${ath.sittingFB})` : ""}
                                </div>
                              ) : (
                                <div style={{ color: "#444444", fontSize: "11px" }}>FB: Unrecorded</div>
                              )}
                              {ath.fbSpinRate && <div style={{ color: "#aaaaaa", fontSize: "11px" }}>FB Spin: {ath.fbSpinRate} RPM</div>}
                              {ath.offSpeedVelo && (
                                <div style={{ color: "#888888", fontSize: "11px", marginTop: "2px" }}>
                                  {ath.offSpeedType || "SL"}: {ath.offSpeedVelo} mph {ath.offSpeedSpinRate ? `(${ath.offSpeedSpinRate} RPM)` : ""}
                                </div>
                              )}
                              {ath.firstPitchStrike && (
                                <div style={{ color: NEON_GREEN, fontSize: "10px", fontWeight: "700", marginTop: "2px" }}>
                                  First-Pitch Strike: {ath.firstPitchStrike}%
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

                        {/* Footer: Date Stamp & Verified Social Links */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "4px" }}>
                          <div style={{ fontSize: "10px", color: "#666666", fontFamily: "monospace" }}>
                            {ath.recordedDatePitching && <span>Pitch: {ath.recordedDatePitching} </span>}
                            {ath.recordedDateHitting && <span>Hit: {ath.recordedDateHitting}</span>}
                            {!ath.recordedDatePitching && !ath.recordedDateHitting && <span>Member Verified</span>}
                          </div>

                          <div style={{ display: "flex", gap: "6px" }}>
                            {ath.social1_Url && (
                              <a
                                href={ath.social1_Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: "#141414", border: "1px solid #2a2a2a", color: NEON_GREEN, padding: "5px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "800" }}
                              >
                                {ath.social1_Type || "Social 1"} ↗
                              </a>
                            )}
                            {ath.social2_Url && (
                              <a
                                href={ath.social2_Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ backgroundColor: "#141414", border: "1px solid #2a2a2a", color: NEON_GREEN, padding: "5px 10px", borderRadius: "8px", textDecoration: "none", fontSize: "11px", fontWeight: "800" }}
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

            {!account ? (
              <div>
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

                {/* Directory */}
                <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                  {MARKET_SECTIONS.map((section, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between",
                        backgroundColor: "#0d0d0d",
                        border: "1px solid #1f1f1f",
                        borderLeft: `4px solid ${NEON_GREEN}`,
                        borderRadius: "14px",
                        padding: "14px 18px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
                        flexWrap: "wrap",
                        gap: "10px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ 
                            fontSize: "22px", 
                            backgroundColor: "rgba(166, 255, 0, 0.08)", 
                            border: "1px solid rgba(166, 255, 0, 0.2)",
                            width: "38px", 
                            height: "38px", 
                            borderRadius: "10px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center" 
                          }}>
                            {section.emoji}
                          </span>
                          <div>
                            <span style={{ fontSize: "10px", color: NEON_GREEN, fontWeight: "900", letterSpacing: "1.5px", textTransform: "uppercase", display: "block" }}>
                              Category
                            </span>
                            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "1px", color: "#ffffff" }}>
                              {section.title}
                            </h3>
                          </div>
                        </div>

                        <span style={{ 
                          fontSize: "11px", 
                          color: "#a1a1aa", 
                          fontWeight: "800", 
                          backgroundColor: "#171717", 
                          border: "1px solid #262626",
                          padding: "6px 14px", 
                          borderRadius: "999px", 
                          textTransform: "uppercase", 
                          letterSpacing: "0.5px" 
                        }}>
                          {section.brands.length} {section.brands.length === 1 ? "Partner" : "Partners"}
                        </span>
                      </div>

                      {section.brands.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
                          {section.brands.map((brand, bIdx) => {
                            const activeIntro = isIntroActive(brand.name);
                            return (
                              <div 
                                key={bIdx}
                                style={{ 
                                  backgroundColor: "#0a0a0a", 
                                  border: brand.isPrimary ? `1px solid ${NEON_GREEN}` : "1px solid #1f1f1f", 
                                  borderRadius: "18px", 
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
                                  </div>
                                  <h4 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "8px 0 10px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
                                    {activeIntro ? "Intro Dispatched ✓" : brand.buttonText}
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
                      ) : null}
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
                  <strong style={{ color: "#ffffff" }}>Direct Delivery:</strong> A verified snapshot with your college bio, position, contact info, and metrics has been delivered straight to the {dispatchedBrand.name} team.
                </div>
              </div>
            </div>

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

      {/* 👤 ATHLETE PROFILE & SCOUTING MATRIX MODAL */}
      {showProfileModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.88)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "20px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", textTransform: "uppercase", color: "#ffffff" }}>
                  Athlete Locker & Scouting Matrix
                </h3>
                <p style={{ fontSize: "12px", color: "#888888", margin: "2px 0 0 0" }}>
                  Active college ballplayer bio and honor-code verified metrics.
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
              {/* SECTION: BASIC ROSTER INFO */}
              <div style={{ borderBottom: "1px solid #1f1f1f", paddingBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>
                  1. Roster Verification
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "10px" }}>
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
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "800", textTransform: "uppercase", color: "#aaaaaa", marginBottom: "4px" }}>Position *</label>
                    <input 
                      type="text" 
                      required
                      value={profile.position} 
                      onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                      placeholder="e.g. LHP / OF" 
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

              {/* SECTION: SCOUTING METRICS */}
              <div style={{ borderBottom: "1px solid #1f1f1f", paddingBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "10px" }}>
                  2. Honor-Code Scouting Metrics
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
                          placeholder="e.g. 103.2"
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
                          placeholder="e.g. 99.4"
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
                          placeholder="e.g. 76.8"
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
                          placeholder="e.g. 6.65"
                          value={profile.sixtyTime}
                          onChange={(e) => setProfile({ ...profile, sixtyTime: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PITCHER INPUTS */}
                {(profile.primaryRole === "PITCHER" || profile.primaryRole === "TWP") && (
                  <div style={{ backgroundColor: "#050505", border: "1px solid #1a1a1a", borderRadius: "10px", padding: "12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                      🎯 Pitching & Spin Benchmarks
                    </span>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "10px" }}>
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
                          placeholder="e.g. 83.4"
                          value={profile.offSpeedVelo}
                          onChange={(e) => setProfile({ ...profile, offSpeedVelo: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "2px" }}>FB SPIN RATE (RPM)</label>
                        <input
                          type="number"
                          placeholder="e.g. 2350"
                          value={profile.fbSpinRate || ""}
                          onChange={(e) => setProfile({ ...profile, fbSpinRate: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "2px" }}>SECONDARY SPIN (RPM)</label>
                        <input
                          type="number"
                          placeholder="e.g. 2500"
                          value={profile.offSpeedSpinRate || ""}
                          onChange={(e) => setProfile({ ...profile, offSpeedSpinRate: e.target.value })}
                          style={{ width: "100%", boxSizing: "border-box", backgroundColor: "#000000", border: "1px solid #333333", color: "#ffffff", padding: "6px 8px", borderRadius: "6px", fontSize: "11px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "9px", fontWeight: "800", color: NEON_GREEN, marginBottom: "2px" }}>FIRST PITCH STRIKE %</label>
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
                )}
              </div>

              {/* SECTION: SOCIAL GATEWAYS */}
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
                  {isSavingProfile ? "Saving to Registry..." : "Save Metrics & Profile"}
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
