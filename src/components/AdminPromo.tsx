"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createThirdwebClient } from "thirdweb";
import { base } from "thirdweb/chains";
import { ConnectButton, ThirdwebProvider, useActiveAccount } from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";

const client = createThirdwebClient({ clientId: "770a552ed494b40543a6696298d41606" });
const supportedWallets = [inAppWallet({ auth: { options: ["google", "apple", "phone"] }, smartAccount: { chain: base, sponsorGas: true } })];

interface PromoPlayer {
  id: string;
  fullName: string;
  college: string;
  status: "ON" | "REQUESTED" | "NOT_ASKED" | "EXPIRED" | "DECLINED" | "WITHDRAWN";
  statusAt: string;
  canSend: boolean;
}

const STATUS_LABELS: Record<PromoPlayer["status"], string> = {
  ON: "Approved",
  REQUESTED: "Request sent",
  NOT_ASKED: "Not asked",
  EXPIRED: "Link expired",
  DECLINED: "Said no",
  WITHDRAWN: "Turned off",
};

const formatDate = (value: string) => (value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "");

function AdminContent() {
  const account = useActiveAccount();
  const [players, setPlayers] = useState<PromoPlayer[] | null>(null);
  const [notAdmin, setNotAdmin] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [sendingId, setSendingId] = useState("");
  const authRef = useRef<{ wallet: string; message: string; signature: string; issuedAt: number } | null>(null);

  const secureCall = useCallback(async (action: string, data: Record<string, unknown> = {}) => {
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
    if (!response.ok || result?.status !== "success") {
      const error = new Error(result?.message || "The request didn't go through. Try again in a moment.") as Error & { code?: string };
      error.code = result?.code;
      throw error;
    }
    return result;
  }, [account]);

  useEffect(() => {
    if (!account) { setPlayers(null); setNotAdmin(false); return; }
    let active = true;
    secureCall("listPromoPlayers")
      .then((result) => { if (active) setPlayers(result.players); })
      .catch((error) => {
        if (!active) return;
        if (error.code === "NOT_ADMIN") setNotAdmin(true);
        else setNotice({ ok: false, text: error.message });
      });
    return () => { active = false; };
  }, [account, secureCall]);

  const sendRequest = async (player: PromoPlayer) => {
    setSendingId(player.id);
    setNotice(null);
    try {
      const result = await secureCall("sendPromoRequest", { playerId: player.id });
      setPlayers(result.players);
      setNotice({ ok: true, text: `Request sent to ${player.fullName}.` });
    } catch (error) {
      setNotice({ ok: false, text: (error as Error).message });
    }
    setSendingId("");
  };

  const approvedCount = players?.filter((player) => player.status === "ON").length ?? 0;

  return (
    <main className="promo-page admin-page">
      <p className="promo-brand">The Diamond Collective</p>
      <h1>Promo Permission</h1>
      <div className="admin-connect">
        <ConnectButton client={client} wallets={supportedWallets} accountAbstraction={{ chain: base, sponsorGas: true }} chain={base} theme="dark" connectButton={{ label: "Sign In" }} />
      </div>

      {!account && <p className="promo-text">Sign in with your admin account.</p>}
      {notAdmin && account && (
        <div className="promo-terms">
          <p>This account isn&apos;t an admin.</p>
          <p className="admin-wallet">{account.address}</p>
        </div>
      )}
      {account && !notAdmin && !players && !notice && <p className="promo-text" role="status">Loading players...</p>}
      {notice && <p className={notice.ok ? "admin-notice" : "admin-notice admin-notice-error"} role="status">{notice.text}</p>}

      {players && (
        <>
          <p className="promo-text">{approvedCount} of {players.length} players approved</p>
          <ul className="admin-list">
            {players.map((player) => (
              <li key={player.id} className="admin-row">
                <div className="admin-player">
                  <strong>{player.fullName}</strong>
                  {player.college && <span>{player.college}</span>}
                  <span className={`admin-status admin-status-${player.status.toLowerCase()}`}>
                    {STATUS_LABELS[player.status]}{player.statusAt ? ` · ${formatDate(player.statusAt)}` : ""}
                  </span>
                </div>
                {player.canSend && (
                  <button type="button" className="promo-button promo-button-yes admin-send" disabled={Boolean(sendingId)} onClick={() => sendRequest(player)}>
                    {sendingId === player.id ? "Sending..." : player.status === "NOT_ASKED" ? "Send Request" : "Send Again"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default function AdminPromo() {
  return (
    <ThirdwebProvider>
      <AdminContent />
    </ThirdwebProvider>
  );
}
