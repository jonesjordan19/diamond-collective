// =========================================================================
// THANKSGIVING 2026 GIVEAWAY
// Membership is the entry: every approved member is entered automatically.
// A member is a player in the athlete data with verificationStatus "Approved".
// The site owner can't win: admin wallets (ADMIN_WALLETS) and the owner's
// emails (ADMIN_EMAIL, PUBLIC_ALIAS_EMAIL) are left out of the drawing.
//
// Setup (site owner):
// 1. Add this file to the Leaderboard API project as ThanksgivingGiveaway.gs.
// 2. In doPost, right after the isPromoAdminAction_ line (which runs after isTrustedRequest_
//    and the verifiedWallet setup), add:
//      if (isGiveawayAction_(action)) return handleGiveawayAction_(postData, verifiedWallet);
// 3. Deploy a new version of the active deployment (AKfycbwe5YJx...).
// The winner is picked from the /admin page after entries close.
// Uses isPromoAdmin_ / promoPlayerId_ from PromoRequests.gs and getTargetSheet / jsonOut_ / SPREADSHEET_ID.
// =========================================================================
var GIVEAWAY_ID = "thanksgiving-2026";
var GIVEAWAY_SHEET = "ThanksgivingGiveaway";
// Thanksgiving Day, Nov 26, 2026 at 4:00 PM Mountain. Keep in step with src/components/GiveawayCard.tsx.
var GIVEAWAY_CLOSES_AT = new Date("2026-11-26T23:00:00Z");
var GIVEAWAY_HEADERS = ["Picked At", "Giveaway", "Player ID", "Athlete Name", "College", "Eligible Members"];

function isGiveawayAction_(action) {
  return action === "getGiveawayStatus" || action === "getGiveawayAdmin" || action === "pickGiveawayWinner";
}

function handleGiveawayAction_(postData, verifiedWallet) {
  var wallet = String(verifiedWallet || "").toLowerCase().trim();
  if (!/^0x[0-9a-f]{40}$/.test(wallet)) return jsonOut_({ status: "error", message: "Sign in again to continue." });
  var closed = Date.now() > GIVEAWAY_CLOSES_AT.getTime();

  // Player view: is the signed-in player entered?
  if (postData.action === "getGiveawayStatus") {
    var player = findGiveawayPlayer_(wallet);
    return jsonOut_({ status: "success", giveaway: {
      hasProfile: Boolean(player),
      approved: Boolean(player && player.approved),
      excluded: Boolean(player && player.excluded),
      entered: Boolean(player && player.eligible),
      closed: closed
    } });
  }

  // Admin view and drawing.
  if (!isPromoAdmin_(wallet)) return jsonOut_({ status: "error", code: "NOT_ADMIN", message: "This account isn't an admin." });

  if (postData.action === "getGiveawayAdmin") {
    return jsonOut_({ status: "success", giveaway: giveawayAdminSummary_(closed) });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (!closed) return jsonOut_({ status: "error", message: "Entries are still open. You can pick a winner after Thanksgiving Day at 4:00 PM MT." });
    var summary = giveawayAdminSummary_(closed);
    if (summary.winner) return jsonOut_({ status: "success", giveaway: summary });
    var members = listGiveawayMembers_();
    if (!members.length) return jsonOut_({ status: "error", message: "No eligible members." });
    var winner = members[Math.floor(Math.random() * members.length)];
    getGiveawayLog_().appendRow([new Date(), GIVEAWAY_ID, winner.id, winner.name, winner.college, members.length]);
    return jsonOut_({ status: "success", giveaway: giveawayAdminSummary_(closed) });
  } finally {
    lock.releaseLock();
  }
}

function giveawayExcluded_(row, headers) {
  var wallet = String(row[headers.indexOf("walletAddress")] || "").toLowerCase().trim();
  var email = String(row[headers.indexOf("athleteEmail")] || "").toLowerCase().trim();
  var ownerEmails = [];
  if (typeof ADMIN_EMAIL !== "undefined") ownerEmails.push(String(ADMIN_EMAIL).toLowerCase().trim());
  if (typeof PUBLIC_ALIAS_EMAIL !== "undefined") ownerEmails.push(String(PUBLIC_ALIAS_EMAIL).toLowerCase().trim());
  return Boolean((wallet && isPromoAdmin_(wallet)) || (email && ownerEmails.indexOf(email) !== -1));
}

function giveawayMember_(row, headers) {
  var name = String(row[headers.indexOf("fullName")] || "").trim();
  var email = String(row[headers.indexOf("athleteEmail")] || "").trim();
  if (!name || !email) return null;
  var approved = String(row[headers.indexOf("verificationStatus")] || "").trim().toLowerCase() === "approved";
  var excluded = giveawayExcluded_(row, headers);
  return {
    id: promoPlayerId_(row, headers),
    name: name,
    college: String(row[headers.indexOf("currentCollege")] || ""),
    approved: approved,
    excluded: excluded,
    eligible: approved && !excluded
  };
}

function findGiveawayPlayer_(wallet) {
  var rows = getTargetSheet().getDataRange().getValues();
  var headers = rows[0];
  var walletCol = headers.indexOf("walletAddress");
  if (walletCol === -1) return null;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][walletCol] || "").toLowerCase().trim() === wallet) return giveawayMember_(rows[i], headers);
  }
  return null;
}

// Approved members who can win, one per player.
function listGiveawayMembers_() {
  var rows = getTargetSheet().getDataRange().getValues();
  var headers = rows[0];
  var seen = {};
  var members = [];
  for (var i = 1; i < rows.length; i++) {
    var member = giveawayMember_(rows[i], headers);
    if (!member || !member.eligible || !member.id || seen[member.id]) continue;
    seen[member.id] = true;
    members.push(member);
  }
  return members;
}

function getGiveawayLog_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(GIVEAWAY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(GIVEAWAY_SHEET);
    sheet.appendRow(GIVEAWAY_HEADERS);
  }
  return sheet;
}

function giveawayAdminSummary_(closed) {
  var winner = null;
  var log = getGiveawayLog_().getDataRange().getValues();
  for (var i = 1; i < log.length; i++) {
    if (log[i][1] === GIVEAWAY_ID) {
      winner = { name: String(log[i][3]), college: String(log[i][4]), pickedAt: new Date(log[i][0]).toISOString(), eligibleCount: Number(log[i][5]) };
      break;
    }
  }
  return { closesAt: GIVEAWAY_CLOSES_AT.toISOString(), closed: closed, eligibleCount: listGiveawayMembers_().length, winner: winner };
}
