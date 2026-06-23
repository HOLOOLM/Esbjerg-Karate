// Delt konfiguration på tværs af index.html, elev.html og form.html.
// ÉN sandhed for Apps Script web-app URL'en — skal indlæses FØR app-koden i hver fil.
// (Tidligere var samme URL hardcodet 4 steder i de tre filer.)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLWqovr35WjKrjfKBDjVHDlYf7P4rTzcGBddXxeGkazQjF6Mt0GnJ_eKMou6B8OQwY/exec';

// ── Delt hemmelighed (bug #3) ──────────────────────────────────────────────
// ⚠️ VIGTIGT — DETTE ER IKKE "AUTH". Denne fil serveres til browseren, så APP_SECRET
// er reelt OFFENTLIG (kan ses i Kilde/DevTools af enhver bruger). Den er KUN en
// anti-spam-spærre, der gør det lidt sværere at hamre endpointet anonymt med scripts.
// Den RIGTIGE adgangskontrol er:
//   • Elever: email + password-hash (verificeres server-side i handleGetStudent,
//     med lockout efter 5 fejl — se apps-script.gs).
//   • Trænere: PIN → server-udstedt token (requireAuth i apps-script.gs).
// Stol ALDRIG på APP_SECRET som beskyttelse af følsomme data — det skal altid
// håndhæves i backenden. Roteres ved at ændre værdien begge steder samtidig.
//
// Sendes med ALLE kald til Apps Script som en simpel anti-misbrugs-spærring, så
// endpointet ikke kan hamres anonymt selvom SCRIPT_URL er offentligt synligt.
// VIGTIGT: Denne værdi SKAL matche Script Property 'APP_SECRET' i Apps Script
// (kør setupSecurity() i editoren, eller sæt den manuelt under Projektindstillinger
// → Script-egenskaber). Roteres ved at ændre begge steder samtidig.
// Bemærk: JSONP/script-tags og text/plain-POST (valgt for at undgå CORS-preflight
// mod Apps Script) kan IKKE sætte rigtige HTTP-headers — derfor sendes hemmeligheden
// og login-tokenet som query-parametre (GET) / felter i JSON-body (POST).
const APP_SECRET = 'kk2_a9F3xQ7pL2vR8mN4tB6yK1sD5wZ0cH';

// Byg auth-query til JSONP/GET-kald: altid appSecret, + trænerens session-token
// hvis vedkommende er logget ind. Returnerer en query-fragment UDEN ledende '&'.
function appAuthQS() {
  var qs = 'appSecret=' + encodeURIComponent(APP_SECRET);
  try {
    var tok = sessionStorage.getItem('kk2_token');
    if (tok) qs += '&token=' + encodeURIComponent(tok);
  } catch (e) {}
  return qs;
}

// ── XSS-beskyttelse (bug #3) ───────────────────────────────────────────────
// Fælles HTML-escape. SKAL bruges om ALLE bruger-kontrollerede værdier (navne,
// kontaktinfo, e-mail, noter, søgetekst, beskeder mm.) før de sættes ind via
// innerHTML / template-strings. Ligger her i config.js, så index.html, elev.html
// OG form.html alle har den (config.js loades først i alle tre filer).
// Dækker både tekst-indhold og attribut-værdier (begge citat-typer escapes).
function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
// Alias — samme escaping dur til attributter.
function escAttr(s) { return escHtml(s); }

// Tilføj auth-felter til et POST-body-objekt (text/plain JSON). Returnerer objektet.
function appAuthBody(obj) {
  obj = obj || {};
  obj.appSecret = APP_SECRET;
  try {
    var tok = sessionStorage.getItem('kk2_token');
    if (tok) obj.token = tok;
  } catch (e) {}
  return obj;
}
