// =========================================================================
// PROMO PERMISSION REQUESTS
// Lets the site owner email a player a link to approve promotional use.
// promoConsent only turns on when the player answers from that link.
//
// Needs one Script Property: ADMIN_WALLETS, the wallet address (or comma-separated
// addresses) allowed to use the admin page. Tokens are stored as hashes only.
// =========================================================================
var PROMO_SITE_URL = "https://sluggercoin.com";
var PROMO_LINK_DAYS = 14;
var PROMO_RESEND_DAYS = 7;
var PROMO_DAY_MS = 24 * 60 * 60 * 1000;
var PROMO_HEADERS = ["Sent At", "Player ID", "Athlete Name", "Token Hash", "Expires At", "Answer", "Answered At"];

function isPromoTokenAction_(action) {
  return action === "getPromoRequest" || action === "answerPromoRequest";
}

function isPromoAdminAction_(action) {
  return action === "listPromoPlayers" || action === "sendPromoRequest";
}

// Token requests have no wallet, so they only check the site's shared secret and the token.
function handlePromoTokenAction_(postData) {
  var secret = PropertiesService.getScriptProperties().getProperty("API_SECRET");
  if (!secret || postData.secret !== secret) return jsonOut_({ status: "error", message: "Not authorized." });

  var token = String(postData.promoToken || "");
  if (!/^[a-f0-9]{64}$/.test(token)) return jsonOut_({ status: "success", request: { state: "INVALID" } });

  if (postData.action === "getPromoRequest") {
    var found = findPromoRequest_(token);
    if (!found) return jsonOut_({ status: "success", request: { state: "INVALID" } });
    return jsonOut_({ status: "success", request: { state: promoRequestState_(found.row), firstName: firstName_(found.row[2]) } });
  }

  if (postData.answer !== "yes" && postData.answer !== "no") return jsonOut_({ status: "error", message: "Invalid request." });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var request = findPromoRequest_(token);
    if (!request) return jsonOut_({ status: "success", request: { state: "INVALID" } });
    var state = promoRequestState_(request.row);
    if (state !== "PENDING") return jsonOut_({ status: "success", request: { state: state, firstName: firstName_(request.row[2]) } });

    var player = findPromoPlayer_(request.row[1]);
    if (!player) return jsonOut_({ status: "success", request: { state: "INVALID" } });

    if (postData.answer === "yes") {
      player.sheet.getRange(player.rowNumber, player.headers.indexOf("promoConsent") + 1).setValue(true);
      player.sheet.getRange(player.rowNumber, player.headers.indexOf("promoConsentAt") + 1).setValue(new Date());
    }
    request.sheet.getRange(request.rowNumber, 6, 1, 2).setValues([[postData.answer === "yes" ? "Yes" : "No", new Date()]]);

    try {
      GmailApp.sendEmail(ADMIN_ALERT_EMAIL, "Diamond Collective", request.row[2] + (postData.answer === "yes" ? " approved" : " declined") + " promo use.");
    } catch (alertError) {}

    return jsonOut_({ status: "success", request: { state: postData.answer === "yes" ? "APPROVED" : "DECLINED", firstName: firstName_(request.row[2]) } });
  } finally {
    lock.releaseLock();
  }
}

function handlePromoAdminAction_(postData, verifiedWallet) {
  if (!isPromoAdmin_(verifiedWallet)) return jsonOut_({ status: "error", code: "NOT_ADMIN", message: "This account isn't an admin." });

  if (postData.action === "listPromoPlayers") return jsonOut_({ status: "success", players: listPromoPlayers_() });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var player = findPromoPlayer_(String(postData.playerId || ""));
    if (!player) return jsonOut_({ status: "error", message: "Player not found." });

    var summary = promoStatus_(player.row, player.headers, player.id, getPromoRows_());
    if (!summary.canSend) return jsonOut_({ status: "error", message: summary.blockedReason });

    var email = String(player.row[player.headers.indexOf("athleteEmail")] || "").trim();
    if (!email) return jsonOut_({ status: "error", message: "This player doesn't have an email saved." });

    var name = String(player.row[player.headers.indexOf("fullName")] || "Ballplayer");
    var token = promoHash_(Utilities.getUuid() + Utilities.getUuid());
    var linkUrl = PROMO_SITE_URL + "/api/promo-permission/open?token=" + token;

    // Send first. Nothing is recorded if the email fails.
    sendPromoRequestEmail_(email, name, linkUrl);

    var requestSheet = getPromoSheet_();
    replacePendingPromoRequests_(requestSheet, player.id);
    requestSheet.appendRow([new Date(), player.id, name, promoHash_(token), new Date(Date.now() + PROMO_LINK_DAYS * PROMO_DAY_MS), "", ""]);

    return jsonOut_({ status: "success", players: listPromoPlayers_() });
  } finally {
    lock.releaseLock();
  }
}

function isPromoAdmin_(wallet) {
  var allowed = PropertiesService.getScriptProperties().getProperty("ADMIN_WALLETS") || "";
  return allowed.toLowerCase().split(",").map(function(item) { return item.trim(); }).indexOf(wallet) !== -1;
}

function getPromoSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName("PromoRequests");
  if (!sheet) {
    sheet = ss.insertSheet("PromoRequests");
    sheet.appendRow(PROMO_HEADERS);
  }
  return sheet;
}

function getPromoRows_() {
  return getPromoSheet_().getDataRange().getValues();
}

function findPromoRequest_(token) {
  var sheet = getPromoSheet_();
  var rows = sheet.getDataRange().getValues();
  var tokenHash = promoHash_(token);
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][3] === tokenHash) return { sheet: sheet, rowNumber: i + 1, row: rows[i] };
  }
  return null;
}

function promoRequestState_(row) {
  if (row[5] === "Yes") return "APPROVED";
  if (row[5] === "No") return "DECLINED";
  if (row[5]) return "REPLACED";
  return new Date(row[4]).getTime() < Date.now() ? "EXPIRED" : "PENDING";
}

function replacePendingPromoRequests_(sheet, playerId) {
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === playerId && !rows[i][5]) sheet.getRange(i + 1, 6).setValue("Replaced");
  }
}

// Player IDs are hashes, so the admin page never receives an email or wallet.
function promoPlayerId_(row, headers) {
  var key = row[headers.indexOf("walletAddress")] || row[headers.indexOf("athleteEmail")];
  key = String(key || "").toLowerCase().trim();
  return key ? promoHash_(key).slice(0, 24) : "";
}

function findPromoPlayer_(playerId) {
  if (!playerId) return null;
  var sheet = getTargetSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (promoPlayerId_(rows[i], rows[0]) === playerId) {
      return { sheet: sheet, rowNumber: i + 1, row: rows[i], headers: rows[0], id: playerId };
    }
  }
  return null;
}

function listPromoPlayers_() {
  var rows = getTargetSheet().getDataRange().getValues();
  var headers = rows[0];
  var requests = getPromoRows_();
  var players = [];
  for (var i = 1; i < rows.length; i++) {
    var id = promoPlayerId_(rows[i], headers);
    if (!id) continue;
    var summary = promoStatus_(rows[i], headers, id, requests);
    players.push({
      id: id,
      fullName: String(rows[i][headers.indexOf("fullName")] || "Unnamed player"),
      college: String(rows[i][headers.indexOf("currentCollege")] || ""),
      status: summary.status,
      statusAt: summary.statusAt,
      canSend: summary.canSend
    });
  }
  return players;
}

// A player who said no or withdrew can still opt in from their Locker, but isn't asked again.
function promoStatus_(row, headers, playerId, requests) {
  var consentAt = row[headers.indexOf("promoConsentAt")];
  if (String(row[headers.indexOf("promoConsent")]).toUpperCase() === "TRUE") {
    return { status: "ON", statusAt: promoIsoDate_(consentAt), canSend: false, blockedReason: "This player already approved." };
  }
  if (/^Withdrawn/.test(String(consentAt))) {
    return { status: "WITHDRAWN", statusAt: "", canSend: false, blockedReason: "This player turned this off, so we can't ask again." };
  }

  var latest = null;
  for (var i = 1; i < requests.length; i++) {
    if (requests[i][1] === playerId && requests[i][5] !== "Replaced") latest = requests[i];
  }
  if (!latest) return { status: "NOT_ASKED", statusAt: "", canSend: true };

  var state = promoRequestState_(latest);
  var sentAt = promoIsoDate_(latest[0]);
  if (state === "DECLINED") return { status: "DECLINED", statusAt: promoIsoDate_(latest[6]), canSend: false, blockedReason: "This player said no, so we can't ask again." };
  if (state === "EXPIRED") return { status: "EXPIRED", statusAt: sentAt, canSend: true };

  var canResend = Date.now() - new Date(latest[0]).getTime() >= PROMO_RESEND_DAYS * PROMO_DAY_MS;
  return { status: "REQUESTED", statusAt: sentAt, canSend: canResend, blockedReason: "You can send a reminder " + PROMO_RESEND_DAYS + " days after the last request." };
}

function sendPromoRequestEmail_(email, name, linkUrl) {
  var first = promoEscape_(firstName_(name));
  var line = "color:#d4d4d8;font-size:16px;line-height:1.5;margin:16px 0;";
  var subject = "Can we feature you on The Diamond Collective?";
  var htmlBody =
    "<div style='font-family:Arial,sans-serif;padding:24px;background-color:#111111;border:1px solid #333333;border-radius:14px;max-width:560px;margin:0 auto;'>" +
    "<h2 style='color:#a6ff00;margin-top:0;'>Can we feature you?</h2>" +
    "<p style='" + line + "'>Hey " + first + ", as we talked about, we'd like to feature you in The Diamond Collective's promotions and ads.</p>" +
    "<p style='" + line + "'>That would include your name, school, position, public stats, and player card. You won't be paid, and we won't use your phone or email. You can change this anytime in your Locker.</p>" +
    "<div style='text-align:center;margin:32px 0 16px 0;'>" +
    "<a href='" + linkUrl + "' style='display:inline-block;background-color:#a6ff00;color:#000000;font-weight:bold;padding:16px 28px;border-radius:10px;text-decoration:none;font-size:16px;'>Review and Approve</a>" +
    "</div>" +
    "<p style='color:#a1a1aa;font-size:13px;line-height:1.5;margin:16px 0 0 0;'>This is optional. If you'd rather not, ignore this email and nothing changes. The link works for " + PROMO_LINK_DAYS + " days.</p>" +
    "<p style='color:#a1a1aa;font-size:12px;line-height:1.5;margin:12px 0 0 0;'>Manifest Destiny Corp, 14231 S Green Drake Drive, Bluffdale, UT 84065</p>" +
    "</div>";
  var textBody = "Hey " + firstName_(name) + ", we'd like to feature your name, school, position, public stats, and player card in The Diamond Collective's promotions and ads. " +
    "You won't be paid, and you can change this anytime in your Locker.\n\nReview and approve: " + linkUrl +
    "\n\nThis is optional. If you'd rather not, ignore this email and nothing changes.";
  GmailApp.sendEmail(email, subject, textBody, { from: PUBLIC_ALIAS_EMAIL, htmlBody: htmlBody });
}

function firstName_(name) {
  return String(name || "").trim().split(/\s+/)[0] || "there";
}

function promoEscape_(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function promoIsoDate_(value) {
  var date = value instanceof Date ? value : new Date(value);
  return value && !isNaN(date.getTime()) ? date.toISOString() : "";
}

function promoHash_(value) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    var hex = (b < 0 ? b + 256 : b).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}
