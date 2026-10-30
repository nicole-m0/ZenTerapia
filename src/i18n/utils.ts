import { defaultLocale, localeMeta, locales, routes, type Locale, type RouteKey } from './config';
import { dictionaries, type Dictionary } from './ui';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Dicionário de textos de interface do idioma. */
export function useTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Caminho relativo de uma rota em um idioma, sempre com barra final
 * (coerente com `trailingSlash: 'always'`).
 *
 * @example getLocalizedPath('services', 'pt') // '/servicos/'
 * @example getLocalizedPath('services', 'en') // '/en/services/'
 */
export function getLocalizedPath(route: RouteKey, locale: Locale): string {
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  const slug = routes[route][locale];
  return `${prefix}/${slug ? `${slug}/` : ''}`;
}

export interface AlternateLink {
  locale: Locale;
  hreflang: string;
  href: string;
}

/** Versões da mesma página em todos os idiomas (para hreflang e seletor). */
export function getAlternateLinks(route: RouteKey, site: URL | undefined): AlternateLink[] {
  return locales.map((locale) => {
    const path = getLocalizedPath(route, locale);
    return {
      locale,
      hreflang: localeMeta[locale].htmlLang,
      href: site ? new URL(path, site).href : path,
    };
  });
}
