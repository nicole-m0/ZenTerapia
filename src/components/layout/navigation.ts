import type { Locale, RouteKey } from '@/i18n/config';
import { getLocalizedPath, useTranslations } from '@/i18n/utils';

/** Páginas exibidas na navegação principal, na ordem do menu. */
const primaryRoutes = ['home', 'services', 'about', 'contact'] as const satisfies RouteKey[];

export interface NavItem {
  route: RouteKey;
  href: string;
  label: string;
}

export function getPrimaryNav(locale: Locale): NavItem[] {
  const t = useTranslations(locale);
  return primaryRoutes.map((route) => ({
    route,
    href: getLocalizedPath(route, locale),
    label: t.nav[route],
  }));
}
