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

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 text-center text-xs text-slate-400">
        <span className="font-semibold text-slate-300">NCAA NIL Compliance Note:</span> All SLUGGER COINS distributed during the Founders phase have no current market value and are non-compensatory. Tokens are issued solely for community participation and access purposes — not as investments or NIL payments.
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="flex flex-col sm:flex-row justify-between items-center pb-8 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚾</span>
              <h1 className="text-2xl font-black tracking-tight text-white uppercase">The Diamond Collective</h1>
            </div>
            <p className="text-xs text-amber-500 font-semibold tracking-wider uppercase mt-0.5">Powered by Slugger Coin ($SLUG)</p>
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

        <section className="text-center my-12 max-w-2xl mx-auto">
          <span className="inline-block bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Only Available to College Baseball Players
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            The Baseball Blockchain Utility Token
          </h2>
          <p className="text-slate-400 mt-4 text-base leading-relaxed">
            A digital society connecting players, coaches, and brands through access, education, and opportunity. Claim your 100 free coins to unlock the partner dugout.
          </p>
        </section>

        {!account ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 text-center max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">Step 1: Open Your Athlete Locker</h3>
            <p className="text-slate-400 text-sm mb-6">
              Sign in with your Google or Apple ID in the top right to verify your profile and claim your 100 Slugger Coins.
            </p>
            <div className="bg-slate-950 px-6 py-3 rounded-xl text-sm text-slate-400 border border-slate-800 inline-block">
              🔒 Sign in above to unlock rewards
            </div>
          </div>
        ) : !isUnlocked ? (
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-10 text-center max-w-xl mx-auto shadow-2xl">
            <span className="text-4xl mb-3 block">🎟️</span>
            <h3 className="text-2xl font-bold text-white mb-2">Claim Your 100 Slugger Coins</h3>
            <p className="text-slate-400 text-sm mb-4">
              Locker: <span className="font-mono text-amber-400 text-xs">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
            </p>
            <div className="bg-slate-950 p-4 rounded-xl mb-6 text-xs text-slate-400 flex justify-between border border-slate-800">
              <span>Current Balance:</span>
              <span className="font-bold text-white">{isLoading ? "Checking..." : `${balance} SLUG`}</span>
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
              className="!w-full !bg-amber-500 hover:!bg-amber-400 !text-slate-950 !font-bold !py-3.5 !rounded-xl !transition"
            >
              Claim 100 Free Slugger Coins
            </TransactionButton>
            <p className="text-[11px] text-slate-500 mt-3">Claims remaining: 91% • Instant & Gasless</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h3 className="text-lg font-bold text-white">The Brand Dugout (Unlocked)</h3>
                </div>
                <p className="text-slate-400 text-xs mt-1">Verified Member • Holding {balance >= 100 ? balance : "100"} $SLUG</p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-full uppercase">
                Access Granted
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Equipment Allocation</span>
                  <h4 className="text-lg font-bold text-white mt-1">Custom Batting Gloves & Cleats</h4>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Submit your player bio, position, and sizing preferences for priority equipment consideration.
                  </p>
                </div>
                <a
                  href="https://typeform.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition border border-slate-700"
                >
                  Fill Intake Form ↗
                </a>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">NIL & Rep Calls</span>
                  <h4 className="text-lg font-bold text-white mt-1">1-on-1 Brand Strategy Intro</h4>
                  <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                    Schedule a 15-minute introductory call with brand partners looking for college baseball ambassadors.
                  </p>
                </div>
                <a
                  href="https://calendly.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 text-center bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition"
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
