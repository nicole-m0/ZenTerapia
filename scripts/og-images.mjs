/**
 * Gera as imagens de compartilhamento (Open Graph, 1200×630) em public/og/.
 * Rodar só quando a identidade ou a foto mudar: `node scripts/og-images.mjs`.
 * Usa as fontes do Fontsource e a foto local; nada vem da rede.
 */
import { readFileSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const b64 = (path) => readFileSync(path).toString('base64');
const serif = b64(
  'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2',
);
const serifItalic = b64(
  'node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2',
);
const sans = b64('node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2');
const photo = b64('src/assets/images/pages/luz-parede.jpg');

const variants = {
  pt: {
    line1: 'O cuidado',
    line2: 'começa',
    line3: 'na <em>pausa</em>.',
    tag: 'Terapias integrativas · presencial e online',
    demo: 'Projeto demonstrativo',
  },
  en: {
    line1: 'Care',
    line2: 'begins with',
    line3: 'a <em>pause</em>.',
    tag: 'Integrative therapies · in person and online',
    demo: 'Demo project',
  },
};

const page = (v) => `<!doctype html><html><head><style>
@font-face{font-family:S;src:url(data:font/woff2;base64,${serif})}
@font-face{font-family:S;font-style:italic;src:url(data:font/woff2;base64,${serifItalic})}
@font-face{font-family:F;font-weight:300 900;src:url(data:font/woff2;base64,${sans})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#e8e6df;color:#151d18;font-family:F;position:relative;overflow:hidden}
.light{position:absolute;inset:-40px 0 auto 330px;height:520px;display:grid;grid-template-columns:27fr 73fr;grid-template-rows:40fr 60fr;gap:18px;transform:skewX(-22deg);opacity:.75}
.light i{background:#f4f1e8}
.win{position:absolute;left:72px;top:64px;width:380px;height:470px;background:#22302a;padding:14px;display:grid;grid-template-columns:40fr 60fr;grid-template-rows:27fr 73fr;gap:14px}
.win i{background:url(data:image/jpeg;base64,${photo}) center/1000% no-repeat}
.sill{position:absolute;left:50px;top:534px;width:424px;height:16px;background:#1b2621}
.text{position:absolute;left:540px;top:86px;right:64px}
.brand{display:flex;align-items:center;gap:14px;font-family:S;font-size:40px}
.brand em{font-style:italic}
.mark{width:26px;height:33px;border:4px solid #151d18;position:relative}
.mark:before{content:'';position:absolute;left:8px;top:0;bottom:0;border-left:4px solid #151d18}
.mark:after{content:'';position:absolute;left:0;right:0;top:7px;border-top:4px solid #151d18}
.mark i{position:absolute;left:12px;right:0;top:0;height:7px;background:#8f4a2f}
h1{margin-top:56px;font-family:S;font-weight:400;font-size:92px;line-height:.92;text-transform:uppercase}
h1 span{display:block}h1 span:nth-child(2){padding-left:.6em}
h1 em{font-style:italic}
.tag{margin-top:34px;font-size:22px;color:#3c463f}
.demo{position:absolute;right:64px;bottom:44px;font-size:16px;letter-spacing:.12em;text-transform:uppercase;color:#8f4a2f}
</style></head><body>
<div class="light"><i></i><i></i><i></i><i></i></div>
<div class="win">${[0, 1, 2, 3].map((n) => `<i style="background-size:400px 470px;background-position:${n % 2 ? '-170px' : '0'} ${n > 1 ? '-140px' : '0'}"></i>`).join('')}</div>
<div class="sill"></div>
<div class="text"><div class="brand"><span class="mark"><i></i></span>Terapia <em>Zen</em></div>
<h1><span>${v.line1}</span><span>${v.line2}</span><span>${v.line3}</span></h1>
<p class="tag">${v.tag}</p></div>
<p class="demo">${v.demo}</p>
</body></html>`;

mkdirSync('public/og', { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const [locale, v] of Object.entries(variants)) {
  await tab.setContent(page(v));
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: `public/og/og-${locale}.jpg`, type: 'jpeg', quality: 86 });
}
await browser.close();
console.log('ok');
