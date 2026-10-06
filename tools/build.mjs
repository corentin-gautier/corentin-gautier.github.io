// Construit dist/ : copie du site, HTML et CSS minifiés.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';
import { minify } from 'html-minifier-terser';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const DIST = `${ROOT}dist/`;

const COPIED = ['assets', 'favicon.svg', 'robots.txt', 'sitemap.xml', '.nojekyll'];
const PAGES = ['index.html', '404.html'];
const STYLES = ['assets/css/style.css'];

const minifyJsonLd = (html) =>
  html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    (_, open, json, close) => open + JSON.stringify(JSON.parse(json)) + close,
  );

export async function build() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST);
  await Promise.all(COPIED.map((path) => cp(ROOT + path, DIST + path, { recursive: true })));

  for (const page of PAGES) {
    const html = await readFile(ROOT + page, 'utf8');
    const minified = await minify(minifyJsonLd(html), {
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: { module: true },
    });
    await writeFile(DIST + page, minified);
  }

  for (const style of STYLES) {
    const css = await readFile(ROOT + style, 'utf8');
    const { code } = await transform(css, { loader: 'css', minify: true });
    await writeFile(DIST + style, code);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await build();
  console.log('Site construit dans dist/');
}
