/**
 * Configuração central de idiomas e rotas.
 *
 * Para adicionar um idioma (ex.: `es`):
 * 1. inclua o código em `locales` (aqui e em astro.config.mjs);
 * 2. preencha `localeMeta` e os slugs em `routes`;
 * 3. crie `src/i18n/ui/es.ts` e registre em `src/i18n/ui/index.ts`;
 * 4. crie as páginas em `src/pages/es/`.
 */

export const locales = ['pt', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

interface LocaleMeta {
  /** Valor de `<html lang>` e `hreflang` (BCP 47). */
  htmlLang: string;
  /** Valor de `og:locale`. */
  ogLocale: string;
  /** Nome do idioma escrito no próprio idioma. */
  nativeName: string;
  /** Rótulo curto exibido no seletor. */
  shortLabel: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  pt: { htmlLang: 'pt-BR', ogLocale: 'pt_BR', nativeName: 'Português', shortLabel: 'PT' },
  en: { htmlLang: 'en', ogLocale: 'en_US', nativeName: 'English', shortLabel: 'EN' },
};

/**
 * Slugs traduzidos de cada página. A chave é o identificador interno da rota;
 * o seletor de idioma usa este mapa para levar à página equivalente.
 */
export const routes = {
  home: { pt: '', en: '' },
  services: { pt: 'servicos', en: 'services' },
  about: { pt: 'sobre', en: 'about' },
  contact: { pt: 'contato', en: 'contact' },
  legal: { pt: 'aviso-legal', en: 'legal-notice' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;
