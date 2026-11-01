// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { routes } from './src/i18n/config.ts';
import { getAlternateLinks } from './src/i18n/utils.ts';
import { resolveSiteUrl } from './scripts/site-url.mjs';

/** URL pública do site: regras em scripts/site-url.mjs (SITE_URL, Vercel ou provisória). */
const SITE_URL = resolveSiteUrl();

/**
 * Fonte servida pelo próprio site a partir dos arquivos do Fontsource (sem CDN).
 * Só o subset latin: cobre português, inglês e espanhol (á, ã, ç, õ, ñ…).
 *
 * @param {string} pkg pacote, ex.: '@fontsource/instrument-serif'
 * @param {string} file nome do arquivo sem extensão
 * @param {string} weight
 * @param {'normal' | 'italic'} style
 */
function latinFont(pkg, file, weight, style) {
  return {
    src: /** @type {[string]} */ ([`./node_modules/${pkg}/files/${file}.woff2`]),
    weight,
    style,
    unicodeRange: /** @type {[string, ...string[]]} */ ([
      'U+0000-00FF',
      'U+0131',
      'U+0152-0153',
      'U+02BB-02BC',
      'U+02C6',
      'U+02DA',
      'U+02DC',
      'U+0304',
      'U+0308',
      'U+0329',
      'U+2000-206F',
      'U+20AC',
      'U+2122',
      'U+2191',
      'U+2193',
      'U+2212',
      'U+2215',
      'U+FEFF',
      'U+FFFD',
    ]),
  };
}

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      // JPG de reserva (navegadores sem AVIF/WebP): mozjpeg gera arquivos
      // progressivos e menores com a mesma qualidade padrão.
      config: { jpeg: { mozjpeg: true } },
    },
  },
  i18n: {
    // Manter em sincronia com src/i18n/config.ts
    locales: ['pt', 'en'],
    defaultLocale: 'pt',
    routing: {
      prefixDefaultLocale: false,
    },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Instrument Serif',
      cssVariable: '--font-display-family',
      fallbacks: ['Times New Roman', 'serif'],
      options: {
        variants: [
          latinFont(
            '@fontsource/instrument-serif',
            'instrument-serif-latin-400-normal',
            '400',
            'normal',
          ),
          latinFont(
            '@fontsource/instrument-serif',
            'instrument-serif-latin-400-italic',
            '400',
            'italic',
          ),
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Figtree',
      cssVariable: '--font-body-family',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          latinFont(
            '@fontsource-variable/figtree',
            'figtree-latin-wght-normal',
            '300 900',
            'normal',
          ),
        ],
      },
    },
  ],
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/sistema-visual/'),
      // Cada URL lista as versões nos dois idiomas (hreflang). Os slugs são
      // traduzidos, então os pares vêm do mapa de rotas, não do prefixo da URL.
      serialize(item) {
        const site = new URL(SITE_URL);
        for (const route of /** @type {(keyof typeof routes)[]} */ (Object.keys(routes))) {
          const links = getAlternateLinks(route, site);
          if (links.some((link) => link.href === item.url)) {
            item.links = links.map((link) => ({ url: link.href, lang: link.hreflang }));
            break;
          }
        }
        return item;
      },
    }),
  ],
});
