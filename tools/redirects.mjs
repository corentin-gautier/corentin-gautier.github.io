// Pages that moved off this domain. GitHub Pages cannot send a 301, so each old
// address gets a page that redirects at once and names its new address as
// canonical, which search engines treat as a permanent move.

// Cassonade was published at /mc-vanilla-sugar/ before it got its own domain;
// its pages kept the same paths.
const CASSONADE_FEATURES = [
  'backpack', 'clock', 'combat', 'elytra-slot', 'graphics', 'hopper-filter', 'interface',
  'inventory', 'living-world', 'minimap', 'naturalist-spyglass', 'quests', 'right-click-harvest',
  'sculk-torch', 'stables', 'structures', 'the-sea', 'tweaks', 'villages', 'waystone',
  'weather-and-sky', 'woodcutter', 'world-map',
];
const CASSONADE_FEATURES_FR = [
  'carte-du-monde', 'combat', 'ecuries', 'entonnoir-filtrant', 'interface', 'inventaire', 'la-mer',
  'longue-vue-de-naturaliste', 'lumiere-ciel-et-mer', 'meteo-et-ciel', 'mini-map', 'monde-vivant',
  'montre', 'petits-details', 'pierre-de-voyage', 'quetes', 'recolte-clic-droit', 'sac-a-dos',
  'slot-elytre', 'structures', 'tailleur-de-bois', 'torche-sculk', 'villages-et-tresors',
];

const cassonade = ['', 'fr/', ...CASSONADE_FEATURES.map((p) => `features/${p}/`),
  ...CASSONADE_FEATURES_FR.map((p) => `fr/fonctionnalites/${p}/`)];

// Old path on this domain (a folder) → new absolute URL.
export const REDIRECTS = Object.fromEntries(
  cassonade.map((p) => [`mc-vanilla-sugar/${p}`, `https://cassonademod.com/${p}`]),
);

export const redirectPage = (to) => `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Moved</title>
<link rel="canonical" href="${to}">
<meta http-equiv="refresh" content="0; url=${to}">
</head>
<body><p>This page moved to <a href="${to}">${to}</a>.</p></body>
</html>
`;
