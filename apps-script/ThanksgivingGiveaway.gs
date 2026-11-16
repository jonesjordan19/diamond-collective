// =========================================================================
// THANKSGIVING 2026 GIVEAWAY
// Signed-in players with a saved profile can enter once per wallet.
// Entries are saved to the ThanksgivingGiveaway tab. It stores the hashed player ID,
// not the wallet or email. Look up the winner's email in the Athletes data by that ID.
//
// Setup (site owner):
// 1. Add this file to the Leaderboard API project as ThanksgivingGiveaway.gs.
// 2. In doPost, right after the isPromoAdminAction_ line (which runs after isTrustedRequest_
//    and the verifiedWallet setup), add:
//      if (isGiveawayAction_(postData.action)) return handleGiveawayAction_(postData, verifiedWallet);
// 3. Deploy a new version of the active deployment (AKfycbwe5YJx...).
// Uses promoPlayerId_ from PromoRequests.gs and getTargetSheet / jsonOut_ / SPREADSHEET_ID.
// =========================================================================
var GIVEAWAY_ID = "thanksgiving-2026";
var GIVEAWAY_SHEET = "ThanksgivingGiveaway";
// Thanksgiving Day, Nov 26, 2026 at 4:00 PM Mountain. Keep in step with src/components/GiveawayCard.tsx.
var GIVEAWAY_CLOSES_AT = new Date("2026-11-26T23:00:00Z");
var GIVEAWAY_HEADERS = ["Entered At", "Giveaway", "Player ID", "Athlete Name", "College", "Winner"];

function isGiveawayAction_(action) {
  return action === "getGiveawayStatus" || action === "enterGiveaway";
}

function handleGiveawayAction_(postData, verifiedWallet) {
  var wallet = String(verifiedWallet || "").toLowerCase().trim();
  if (!/^0x[0-9a-f]{40}$/.test(wallet)) return jsonOut_({ status: "error", message: "Sign in again to continue." });

  var closed = Date.now() > GIVEAWAY_CLOSES_AT.getTime();
  var player = findGiveawayPlayer_(wallet);
  var playerId = player ? player.id : "";

  if (postData.action === "getGiveawayStatus") {
    return jsonOut_({ status: "success", giveaway: { entered: Boolean(playerId && hasGiveawayEntry_(playerId)), closed: closed, hasProfile: Boolean(player) } });
  }

  if (closed) return jsonOut_({ status: "error", code: "CLOSED", message: "Entries are closed." });
  if (!player) return jsonOut_({ status: "error", code: "NO_PROFILE", message: "Save your player card in the Locker first, then come back to enter." });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    if (hasGiveawayEntry_(playerId)) return jsonOut_({ status: "success", giveaway: { entered: true, closed: false, alreadyEntered: true } });
    getGiveawaySheet_().appendRow([new Date(), GIVEAWAY_ID, playerId, player.name, player.college, ""]);
    return jsonOut_({ status: "success", giveaway: { entered: true, closed: false } });
  } finally {
    lock.releaseLock();
  }
}

// A player can enter only after saving a profile with a name and email.
function findGiveawayPlayer_(wallet) {
  var rows = getTargetSheet().getDataRange().getValues();
  var headers = rows[0];
  var walletCol = headers.indexOf("walletAddress");
  if (walletCol === -1) return null;
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][walletCol] || "").toLowerCase().trim() !== wallet) continue;
    var name = String(rows[i][headers.indexOf("fullName")] || "").trim();
    var email = String(rows[i][headers.indexOf("athleteEmail")] || "").trim();
    if (!name || !email) return null;
    return { id: promoPlayerId_(rows[i], headers), name: name, college: String(rows[i][headers.indexOf("currentCollege")] || "") };
  }
  return null;
}

function getGiveawaySheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(GIVEAWAY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(GIVEAWAY_SHEET);
    sheet.appendRow(GIVEAWAY_HEADERS);
  }
  return sheet;
}

function hasGiveawayEntry_(playerId) {
  var rows = getGiveawaySheet_().getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === GIVEAWAY_ID && rows[i][2] === playerId) return true;
  }
  return false;
}

// Run by hand from the Apps Script editor after entries close.
// Marks one random entry as the winner and logs the player ID to look up.
function pickGiveawayWinner() {
  if (Date.now() <= GIVEAWAY_CLOSES_AT.getTime()) throw new Error("Entries are still open.");
  var sheet = getGiveawaySheet_();
  var rows = sheet.getDataRange().getValues();
  var entries = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] !== GIVEAWAY_ID) continue;
    if (rows[i][5]) throw new Error("A winner is already marked on row " + (i + 1) + ".");
    entries.push(i + 1);
  }
  if (!entries.length) throw new Error("No entries.");
  var rowNumber = entries[Math.floor(Math.random() * entries.length)];
  sheet.getRange(rowNumber, 6).setValue("Winner " + new Date().toISOString());
  Logger.log("Winner: row " + rowNumber + " of " + entries.length + " entries. Player ID " + sheet.getRange(rowNumber, 3).getValue());
}
