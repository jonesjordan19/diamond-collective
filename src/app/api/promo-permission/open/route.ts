import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const LINK_SESSION_SECONDS = 60 * 60;

// Moves the email link's token into a private cookie before the page loads,
// so the token never appears in a page address that analytics can read.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const response = NextResponse.redirect(new URL("/promo-permission", request.url), 303);
  response.headers.set("Referrer-Policy", "no-referrer");
  if (/^[a-f0-9]{64}$/.test(token)) {
    response.cookies.set("dc_promo_token", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/api", maxAge: LINK_SESSION_SECONDS });
  }
  return response;
}
