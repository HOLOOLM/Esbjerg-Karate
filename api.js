// ═══════════════════════════════════════════════════════════════════════
//  DELT NETVÆRKSLAG — JSONP (GET) og text/plain POST mod Apps Script.
//  ---------------------------------------------------------------------
//  Forudsætning: config.js er indlæst FØR denne fil (SCRIPT_URL, appAuthQS,
//  appAuthBody). Bruges til at undgå at hver side/fil hånd-implementerer sin
//  egen <script>-injection/timeout/cleanup for JSONP-kald.
//
//  Status: ny fil, kun forbrugt af traeningsplan.html indtil videre.
//  elev.html og app.js har hver deres egne (velfungerende, allerede
//  hærdede) JSONP-implementationer og er BEVIDST ikke migreret endnu —
//  se OPTIMERINGSANALYSE.md / sundhedstjek-noter for begrundelse
//  (høj-trafik admin-værktøj, migreres ét kald ad gangen med test imellem).
// ═══════════════════════════════════════════════════════════════════════

// GET/JSONP-kald. Returnerer et Promise der resolver med backend-svaret
// (samme objekt som callback ville have modtaget), eller rejecter med en
// Error ved timeout/netværksfejl.
//   jsonp('getTrainingPlan', { email: '...', passwordHash: '...' })
//     .then(d => ...).catch(err => ...)
function jsonp(action, params, opts) {
  opts = opts || {};
  var timeoutMs = opts.timeout || 15000; // læse-kald: kort timeout (skriv-kald bruger apiPost)
  return new Promise(function (resolve, reject) {
    var cbName = '_jsonp_' + String(action).replace(/[^a-zA-Z0-9_]/g, '') +
      '_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
    var s = document.createElement('script');
    var timer;
    function cleanup() {
      clearTimeout(timer);
      delete window[cbName];
      if (s.parentNode) s.parentNode.removeChild(s);
    }
    timer = setTimeout(function () {
      cleanup();
      reject(new Error('timeout'));
    }, timeoutMs);
    window[cbName] = function (data) {
      cleanup();
      resolve(data);
    };
    s.onerror = function () {
      cleanup();
      reject(new Error('network'));
    };
    var qs = 'action=' + encodeURIComponent(action);
    Object.keys(params || {}).forEach(function (k) {
      var v = params[k];
      if (v !== undefined && v !== null) qs += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(v);
    });
    qs += '&callback=' + cbName + '&' + appAuthQS() + '&t=' + Date.now();
    s.src = SCRIPT_URL + '?' + qs;
    document.head.appendChild(s);
  });
}

// POST-kald (text/plain, undgår CORS-preflight — se config.js). Tilføjer
// automatisk appSecret/token via appAuthBody. Returnerer et Promise med det
// parsede JSON-svar. opts.timeout (ms, default 30s — uploads kan tage tid).
function apiPost(body, opts) {
  opts = opts || {};
  var timeoutMs = opts.timeout || 30000;
  var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  var timer = controller ? setTimeout(function () { controller.abort(); }, timeoutMs) : null;
  return fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(appAuthBody(body)),
    signal: controller ? controller.signal : undefined
  }).then(function (r) { return r.json(); })
    .finally(function () { if (timer) clearTimeout(timer); });
}
