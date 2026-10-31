import { expect, test } from '@playwright/test';
import { locales, routes, type RouteKey } from '../../src/i18n/config';
import { getLocalizedPath } from '../../src/i18n/utils';

const pages = locales.flatMap((locale) =>
  (Object.keys(routes) as RouteKey[]).map((route) => getLocalizedPath(route, locale)),
);

// Um viewport basta: os links são os mesmos em todos os tamanhos.
test.describe('links internos', () => {
  test.skip(({ viewport }) => viewport?.width !== 1440, 'verificado só no desktop');

  test('nenhum link interno quebrado', async ({ page, request }) => {
    const hrefs = new Set<string>();
    for (const path of pages) {
      await page.goto(path);
      const found = await page
        .locator('a[href^="/"]')
        .evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
      found.forEach((href) => hrefs.add(href));
    }

    const broken: string[] = [];
    for (const href of hrefs) {
      const [path = '/', hash] = href.split('#');
      const response = await request.get(path);
      if (response.status() !== 200) {
        broken.push(`${href} → ${response.status()}`);
        continue;
      }
      if (hash) {
        const html = await response.text();
        if (!html.includes(`id="${hash}"`)) broken.push(`${href} → âncora ausente`);
      }
    }
    expect(broken).toEqual([]);
  });
});
