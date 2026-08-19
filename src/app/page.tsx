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
    <div style={{ minHeight: "100vh", backgroundColor: "#090d16", color: "#f1f5f9", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Top Compliance Bar */}
      <div style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", padding: "10px 16px", textAlign: "center", fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
        <strong style={{ color: "#cbd5e1" }}>NCAA NIL Compliance Note:</strong> All SLUGGER COINS distributed during the Founders phase have no current market value and are non-compensatory. Tokens are issued solely for community participation and access purposes.
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Navigation / Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "24px" }}>⚾</span>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", letterSpacing: "1px", color: "#ffffff", textTransform: "uppercase" }}>The Diamond Collective</h1>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#f59e0b", fontWeight: "700", letterSpacing: "0.5px", textTransform: "uppercase" }}>Powered by Slugger Coin ($SLUG)</p>
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
            chain={base}
            theme="dark"
            connectButton={{ label: "Athlete Sign In" }}
          />
        </header>

        {/* Hero Section */}
        <section style={{ textAlign: "center", margin: "48px 0 36px 0" }}>
          <div style={{ display: "inline-block", backgroundColor: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "999px", padding: "4px 14px", fontSize: "11px", fontWeight: "700", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>
            Only Available to College Baseball Players
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: "900", color: "#ffffff", margin: "0 0 16px 0", lineHeight: "1.15" }}>
            The Baseball Blockchain Utility Token
          </h2>
          <p style={{ fontSize: "15px", color: "#94a3b8", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
            A digital society connecting players, coaches, and brands through access, education, and opportunity. Claim your 100 free coins to unlock the partner dugout.
          </p>
        </section>

        {/* Step 1: Sign in prompt */}
        {!account ? (
          <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "20px", padding: "40px 24px", textAlign: "center", maxWidth: "520px", margin: "0 auto" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 8px 0", color: "#ffffff" }}>Step 1: Open Your Athlete Locker</h3>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px 0", lineHeight: "1.5" }}>
              Sign in with your Google or Apple ID in the top right corner to claim your 100 Slugger Coins.
            </p>
            <div style={{ display: "inline-block", backgroundColor: "#020617", border: "1px solid #334155", borderRadius: "12px", padding: "12px 24px", fontSize: "13px", color: "#cbd5e1", fontWeight: "600" }}>
              🔒 Sign in above to unlock rewards
            </div>
          </div>
        ) : !isUnlocked ? (
          /* Step 2: Claim 100 Coins */
          <div style={{ backgroundColor: "#0f172a", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "20px", padding: "36px 24px", textAlign: "center", maxWidth: "520px", margin: "0 auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎟️</div>
            <h3 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 6px 0", color: "#ffffff" }}>Claim Your 100 Slugger Coins</h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 20px 0" }}>
              Locker: <span style={{ fontFamily: "monospace", color: "#fbbf24" }}>{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
            </p>
            <div style={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "24px" }}>
              <span style={{ color: "#94a3b8" }}>Current Balance:</span>
              <span style={{ fontWeight: "700", color: "#ffffff" }}>{isLoading ? "Checking..." : `${balance} SLUG`}</span>
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
              style={{ width: "100%", backgroundColor: "#f59e0b", color: "#090d16", fontWeight: "800", padding: "14px", borderRadius: "12px", border: "none", cursor: "pointer", fontSize: "15px" }}
            >
              Claim 100 Free Slugger Coins
            </TransactionButton>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "14px 0 0 0" }}>Claims remaining: 91% • Instant & Gasless on Base</p>
          </div>
        ) : (
          /* Step 3: Unlocked Dugout */
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", border: "1px solid rgba(16, 185, 129, 0.4)", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ height: "10px", width: "10px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }}></span>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#ffffff" }}>The Brand Dugout (Unlocked)</h3>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>Verified Member • Holding {balance >= 100 ? balance : "100"} $SLUG</p>
              </div>
              <div style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "999px", padding: "4px 14px", fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase" }}>
                Access Granted
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {/* Partner Card 1 */}
              <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.5px" }}>Equipment Allocation</span>
                  <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: "8px 0" }}>Custom Batting Gloves & Cleats</h4>
                  <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
                    Submit your player bio, position, and sizing preferences for priority equipment consideration.
                  </p>
                </div>
                <a
                  href="https://typeform.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", backgroundColor: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontWeight: "700", padding: "12px", borderRadius: "10px", fontSize: "13px", textDecoration: "none", marginTop: "24px" }}
                >
                  Fill Intake Form ↗
                </a>
              </div>

              {/* Partner Card 2 */}
              <div style={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.5px" }}>NIL & Rep Calls</span>
                  <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#ffffff", margin: "8px 0" }}>1-on-1 Brand Strategy Intro</h4>
                  <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
                    Schedule a 15-minute introductory call with brand partners looking for college baseball ambassadors.
                  </p>
                </div>
                <a
                  href="https://calendly.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", backgroundColor: "#f59e0b", color: "#090d16", fontWeight: "800", padding: "12px", borderRadius: "10px", fontSize: "13px", textDecoration: "none", marginTop: "24px" }}
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
