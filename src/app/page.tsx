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

const client = createThirdwebClient({
  clientId: "770a552ed494b40543a6696298d41606",
});

const sluggerContract = getContract({
  client,
  chain: base,
  address: "0xF3f6D32ABCf2fDeAB3c6D0b440230714166Cc4A1",
});

// Neon Volt Branding Color
const NEON_GREEN = "#a6ff00";

function AppContent() {
  const account = useActiveAccount();
  const [justClaimed, setJustClaimed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: balanceData, isLoading, refetch } = useReadContract(getBalance, {
    contract: sluggerContract,
    address: account?.address || "",
  });

  const balance = balanceData ? Number(balanceData.displayValue) : 0;
  const isUnlocked = balance >= 100 || justClaimed;

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000000", color: "#ffffff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top Compliance Bar */}
      <div style={{ backgroundColor: "#0a0a0a", borderBottom: "1px solid #1a1a1a", padding: "10px 16px", textAlign: "center", fontSize: "11px", color: "#888888", letterSpacing: "0.5px", lineHeight: "1.4" }}>
        <strong style={{ color: "#ffffff" }}>NCAA NIL Compliance Note:</strong> All SLUGGER COINS distributed during the Founders phase have no current market value and are non-compensatory. Tokens are issued solely for community participation and access purposes.
      </div>

      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "36px 20px" }}>
        {/* Navigation / Header */}
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
        <section style={{ textAlign: "center", margin: "52px 0 40px 0" }}>
          <div style={{ display: "inline-block", backgroundColor: "rgba(166, 255, 0, 0.08)", border: `1px solid ${NEON_GREEN}`, borderRadius: "999px", padding: "6px 16px", fontSize: "11px", fontWeight: "800", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>
            Only Available to College Baseball Players
          </div>
          <h2 style={{ fontSize: "40px", fontWeight: "900", color: "#ffffff", margin: "0 0 16px 0", letterSpacing: "-0.5px", textTransform: "uppercase", lineHeight: "1.1" }}>
            The Baseball Blockchain Utility Token
          </h2>
          <p style={{ fontSize: "16px", color: "#a1a1aa", maxWidth: "620px", margin: "0 auto", lineHeight: "1.6" }}>
            A digital society connecting players, coaches, and brands through access, education, and opportunity. Claim your 100 free coins to unlock the partner dugout.
          </p>
        </section>

        {/* Step 1: Sign in prompt */}
        {!account ? (
          <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "24px", padding: "48px 24px", textAlign: "center", maxWidth: "540px", margin: "0 auto", boxShadow: "0 0 40px rgba(0,0,0,0.8)" }}>
            <h3 style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 8px 0", color: "#ffffff", textTransform: "uppercase" }}>
              Step 1: Open Your Athlete Locker
            </h3>
            <p style={{ fontSize: "14px", color: "#888888", margin: "0 0 28px 0", lineHeight: "1.5" }}>
              Sign in with your Google or Apple ID in the top right corner to verify your athlete profile and claim your 100 Slugger Coins.
            </p>
            <div style={{ display: "inline-block", backgroundColor: "#000000", border: "1px solid #2a2a2a", borderRadius: "12px", padding: "14px 28px", fontSize: "13px", color: "#ffffff", fontWeight: "700", letterSpacing: "0.5px" }}>
              🔒 Sign in above to unlock rewards
            </div>
          </div>
        ) : !isUnlocked ? (
          /* Step 2: Claim 100 Coins */
          <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "24px", padding: "40px 24px", textAlign: "center", maxWidth: "540px", margin: "0 auto", boxShadow: `0 0 30px rgba(166, 255, 0, 0.12)` }}>
            <div style={{ fontSize: "44px", marginBottom: "12px" }}>⚾</div>
            <h3 style={{ fontSize: "24px", fontWeight: "900", margin: "0 0 6px 0", color: "#ffffff", textTransform: "uppercase" }}>
              Claim Your 100 Slugger Coins
            </h3>
            <p style={{ fontSize: "13px", color: "#888888", margin: "0 0 24px 0" }}>
              Locker: <span style={{ fontFamily: "monospace", color: NEON_GREEN }}>{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
            </p>
            
            <div style={{ backgroundColor: "#000000", border: "1px solid #1f1f1f", borderRadius: "12px", padding: "14px 18px", display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "24px" }}>
              <span style={{ color: "#888888" }}>Current Balance:</span>
              <span style={{ fontWeight: "800", color: "#ffffff" }}>{isLoading ? "Checking..." : `${balance} SLUG`}</span>
            </div>

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
          /* Step 3: Unlocked Dugout */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "18px", padding: "22px 28px", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ height: "10px", width: "10px", borderRadius: "50%", backgroundColor: NEON_GREEN, display: "inline-block", boxShadow: `0 0 10px ${NEON_GREEN}` }}></span>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase" }}>
                    The Brand Dugout (Unlocked)
                  </h3>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#888888" }}>
                  Verified Member • Holding {balance >= 100 ? balance : "100"} $SLUG
                </p>
              </div>
              <div style={{ backgroundColor: "rgba(166, 255, 0, 0.1)", border: `1px solid ${NEON_GREEN}`, borderRadius: "999px", padding: "6px 16px", fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px" }}>
                Access Granted
              </div>
            </div>

            {/* Brand Partners Showcase */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {/* Partner Card 1: Just Ingredients */}
              <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px" }}>
                    Nutrition & Recovery
                  </span>
                  <h4 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "10px 0 6px 0", textTransform: "uppercase" }}>
                    Just Ingredients
                  </h4>
                  <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.5", margin: 0 }}>
                    Access exclusive athlete clean-supplement allocations, electrolyte bundles, and recovery discount packages.
                  </p>
                </div>
                <a
                  href="https://typeform.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", backgroundColor: "#141414", border: "1px solid #2a2a2a", color: "#ffffff", fontWeight: "800", padding: "14px", borderRadius: "10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", textDecoration: "none", marginTop: "24px" }}
                >
                  Claim Allocation ↗
                </a>
              </div>

              {/* Partner Card 2: Pocket Radar */}
              <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: "18px", padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: NEON_GREEN, textTransform: "uppercase", letterSpacing: "1px" }}>
                    Performance Tech
                  </span>
                  <h4 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "10px 0 6px 0", textTransform: "uppercase" }}>
                    Pocket Radar
                  </h4>
                  <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.5", margin: 0 }}>
                    Velocity and data tracking partner perks. Request collegiate ambassador units and Smart Coach access.
                  </p>
                </div>
                <a
                  href="https://typeform.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", backgroundColor: "#141414", border: "1px solid #2a2a2a", color: "#ffffff", fontWeight: "800", padding: "14px", borderRadius: "10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", textDecoration: "none", marginTop: "24px" }}
                >
                  Ambassador Program ↗
                </a>
              </div>

              {/* Partner Card 3: 1-on-1 Brand Rep Calls */}
              <div style={{ backgroundColor: "#0a0a0a", border: `1px solid ${NEON_GREEN}`, borderRadius: "18px", padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "900", color: "#ffffff", textTransform: "uppercase", letterSpacing: "1px" }}>
                    NIL Opportunities
                  </span>
                  <h4 style={{ fontSize: "20px", fontWeight: "900", color: "#ffffff", margin: "10px 0 6px 0", textTransform: "uppercase" }}>
                    1-on-1 Brand Intro Call
                  </h4>
                  <p style={{ fontSize: "13px", color: "#888888", lineHeight: "1.5", margin: 0 }}>
                    Schedule a 15-minute pitch and strategy call directly with partner representatives looking for college baseball creators.
                  </p>
                </div>
                <a
                  href="https://calendly.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", backgroundColor: NEON_GREEN, color: "#000000", fontWeight: "900", padding: "14px", borderRadius: "10px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", textDecoration: "none", marginTop: "24px" }}
                >
                  Book on Calendly ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
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
