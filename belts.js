// ═══════════════════════════════════════════════════════════════════════
//  ÉN KILDE TIL SANDHED FOR BÆLTER  (Esbjerg Shuri-Ryu)
//  ---------------------------------------------------------------------
//  Skal du tilføje, omdøbe, omrokere eller omfarve et bælte? Ret KUN i
//  BELTS-listen herunder. Alt det andet (rækkefølge, farver, sortering,
//  næste-bælte, dropdowns i indmeldelsesform og elev-app) udledes
//  automatisk herfra, så ændringen slår igennem alle steder.
//
//  Filen indlæses FØR app-koden i index.html, elev.html og form.html.
//  Pensum (selve kravene pr. bælte) styres separat i Google-arket "Pensum".
// ═══════════════════════════════════════════════════════════════════════

// Rækkefølge = graduerings-rækkefølge (laveste → højeste). name skal matche
// præcis det der gemmes på medlemmet.
//   color = bæltets fulde visningsfarve (bælte-ikoner, lister)
//   soft  = lys/pastel tone til kort- og diagram-baggrunde (dashboard m.fl.)
const BELTS = [
  { name: '10. Kyu (Hvidt)',          color: '#e8e8e8', soft: '#f3f4f6', label: 'Hvidt / White belt' },
  { name: '9. Kyu - Hvid + 1 snip',   color: '#e0e0e0', soft: '#f0f0f0', label: 'Hvid + 1 snip' },
  { name: '9. Kyu - Hvid + 2 snip',   color: '#d0d0d0', soft: '#e4e4e4', label: 'Hvid + 2 snip' },
  { name: '8. Kyu - Hvid + 3 snip',   color: '#c4c4c4', soft: '#c4c4c4', label: 'Hvid + 3 snip' },
  { name: '8. Kyu - Hvid + 4 snip',   color: '#b8b8b8', soft: '#b8b8b8', label: 'Hvid + 4 snip' },
  { name: '7. Kyu (Gult)',            color: '#f7e040', soft: '#fef3c7', label: 'Gult / Yellow belt' },
  { name: '6. Kyu (Blåt)',            color: '#2980b9', soft: '#dbeafe', label: 'Blåt / Blue belt' },
  { name: '5. Kyu (Grønt)',           color: '#27ae60', soft: '#dcfce7', label: 'Grønt / Green belt' },
  { name: '4. Kyu (Violet)',          color: '#8e44ad', soft: '#ede9fe', label: 'Violet / Purple belt' },
  { name: '3. Kyu (Brunt)',           color: '#8d5524', soft: '#fef3c7', label: 'Brunt / Brown belt' },
  { name: '2. Kyu (Brunt + 1 Snip)',  color: '#7a4820', soft: '#fed7aa', label: 'Brunt + 1 snip' },
  { name: '1. Kyu (Brunt + 2 Snip)',  color: '#6b3d18', soft: '#fdba74', label: 'Brunt + 2 snip' },
  { name: '1. Dan (Sort)',            color: '#212121', soft: '#1f2937', label: 'Sort / Black belt' },
  { name: '2. Dan (Sort)',            color: '#161616', soft: '#1f2937', label: '2. Dan' },
  { name: '3. Dan (Sort)',            color: '#0a0a0a', soft: '#1f2937', label: '3. Dan' }
];

// ── Udledte opslag (rør IKKE — de bygges fra BELTS) ──────────────────────
const BELT_ORDER = BELTS.map(function (b) { return b.name; });            // [navn, …] i rækkefølge
const BC = {};                                                            // navn → fuld farve
const BC_SOFT = {};                                                       // navn → lys/pastel kort-farve
const _BELT_SORT = {};                                                    // navn → rang (0..n) til sortering
const _NEXT_BELT_NAME = {};                                               // navn → næste bælte i rækken
BELTS.forEach(function (b, i) {
  BC[b.name] = b.color;
  BC_SOFT[b.name] = b.soft || b.color;
  _BELT_SORT[b.name] = i;
  if (i < BELTS.length - 1) _NEXT_BELT_NAME[b.name] = BELTS[i + 1].name;
});
// Alias — nogle funktioner kalder rangen BELT_RANK; samme data som _BELT_SORT.
const BELT_RANK = _BELT_SORT;

// Promoverings-gradientens "næste farve". Bevidst håndlavet (hvid/snip peger
// på gult, derefter næste rigtige farve), så den holdes eksplicit her.
const _NEXT_BELT_COLOR = {
  '10. Kyu (Hvidt)':'#f7e040','9. Kyu - Hvid + 1 snip':'#f7e040','9. Kyu - Hvid + 2 snip':'#f7e040','8. Kyu - Hvid + 3 snip':'#f7e040','8. Kyu - Hvid + 4 snip':'#f7e040',
  '7. Kyu (Gult)':'#2980b9',
  '6. Kyu (Blåt)':'#27ae60',
  '5. Kyu (Grønt)':'#8e44ad',
  '4. Kyu (Violet)':'#8d5524',
  '3. Kyu (Brunt)':'#7a4820','2. Kyu (Brunt + 1 Snip)':'#6b3d18',
  '1. Kyu (Brunt + 2 Snip)':'#212121',
  '1. Dan (Sort)':'#212121','2. Dan (Sort)':'#212121'
};

// Hjælper: byg <option>-liste til et <select> (bruges af indmeldelsesformularen).
// valgfrit medtag tosproget label.
function beltOptionsHtml(selectedName) {
  return BELTS.map(function (b) {
    var sel = (b.name === selectedName) ? ' selected' : '';
    var txt = b.label ? (b.name.replace(/\s*\(.*$/, '').trim() + ' — ' + b.label) : b.name;
    return '<option value="' + b.name + '"' + sel + '>' + txt + '</option>';
  }).join('');
}
