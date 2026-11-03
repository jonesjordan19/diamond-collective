import { NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";
import { base } from "thirdweb/chains";
import { verifySignature } from "thirdweb/auth";

const SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbwe5YJxF93X4fJXpODhAGbJQ-1Xs3FiRHuLC2umjkGLGtsJTqj4VjO-0Ai0_hBqZMojdw/exec";

const ALLOWED_ACTIONS = ["getAccount", "getContacts", "saveProfile", "saveScout", "requestIntro"];
const MAX_AGE_MS = 15 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 2 * 60 * 1000;

const client = createThirdwebClient({
  clientId: process.env.THIRDWEB_CLIENT_ID || "770a552ed494b40543a6696298d41606",
});

function fail(message: string, status: number) {
  return NextResponse.json({ status: "error", message }, { status });
}

// Confirms the request was signed by the wallet it claims to come from.
async function getVerifiedWallet(message: unknown, signature: unknown): Promise<string | null> {
  if (typeof message !== "string" || typeof signature !== "string" || !signature.startsWith("0x")) return null;

  const match = message.match(/^The Diamond Collective secure request\nWallet: (0x[0-9a-f]{40})\nIssued: (.+)$/);
  if (!match) return null;

  const [, wallet, issuedAt] = match;
  const age = Date.now() - new Date(issuedAt).getTime();
  if (Number.isNaN(age) || age > MAX_AGE_MS || age < -MAX_CLOCK_SKEW_MS) return null;

  const isValid = await verifySignature({
    message,
    signature: signature as `0x${string}`,
    address: wallet,
    client,
    chain: base,
  });

  return isValid ? wallet : null;
}

export async function POST(request: Request) {
  const secret = process.env.APPS_SCRIPT_SECRET;
  if (!secret) return fail("Secure access isn't configured yet.", 503);

  let body: { action?: unknown; auth?: { message?: unknown; signature?: unknown }; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!ALLOWED_ACTIONS.includes(action)) return fail("Invalid request.", 400);

  let verifiedWallet: string | null = null;
  try {
    verifiedWallet = await getVerifiedWallet(body.auth?.message, body.auth?.signature);
  } catch (error) {
    console.error("Signature check failed", error);
  }
  if (!verifiedWallet) return fail("Sign in again to continue.", 401);

  const data = body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : {};

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      // Spread first so nothing in `data` can replace these trusted values.
      body: JSON.stringify({ ...data, action, secret, verifiedWallet }),
      redirect: "follow",
      cache: "no-store",
    });
    const result = await response.json();
    return NextResponse.json(result, { status: result?.status === "error" ? 400 : 200 });
  } catch (error) {
    console.error("Apps Script request failed", error);
    return fail("The request didn't go through. Try again in a moment.", 502);
  }
}
