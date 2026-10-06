# corentin-gautier.github.io

Site personnel de Corentin Gautier, web designer et développeur front-end à Bordeaux : parcours et réalisations.

Site statique. Les sources se lisent telles quelles ; la version en ligne est la même, minifiée.

## En local

```sh
npm install
npm run dev      # sources, gzip, rechargement automatique
npm run preview  # conditions de prod : dist/ minifié, gzip, reconstruit à chaque modification
npm run build    # construit dist/ sans le servir
```

Le serveur écoute sur `http://localhost:4173` (`PORT=4174 npm run dev` pour changer de port).

## Mise en ligne

Dans un dépôt GitHub nommé `corentin-gautier.github.io`, chaque push sur `main` lance `.github/workflows/deploy.yml`, qui construit `dist/` et le publie sur GitHub Pages à l'adresse `https://corentin-gautier.github.io/`. Dans les réglages du dépôt, la source de Pages doit être « GitHub Actions ».

Avec un nom de domaine personnalisé, remplacer cette adresse dans `index.html` (balise canonical, Open Graph, JSON-LD), `robots.txt` et `sitemap.xml`.

## Contenu

- `index.html` : la page, ses métadonnées SEO et ses données structurées
- `assets/css/style.css` : les styles (thèmes clair et sombre)
- `assets/js/snap-carousel/` : copie de `dist/` de [snap-carousel.js](https://github.com/corentin-gautier/snap-carousel) 2.1.3
- `assets/img/` : visuels issus de Dribbble, en AVIF avec repli JPEG
- `tools/build.mjs` : construit `dist/` (HTML et CSS minifiés)
- `tools/serve.mjs` : serveur local avec gzip et rechargement automatique
