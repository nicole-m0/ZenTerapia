import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { localeMeta, locales, routes, type RouteKey } from '../../src/i18n/config';
import { getLocalizedPath } from '../../src/i18n/utils';

const routeKeys = Object.keys(routes) as RouteKey[];

/** Coleta erros de console e exceções não tratadas durante o teste. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

for (const locale of locales) {
  for (const route of routeKeys) {
    const path = getLocalizedPath(route, locale);

    test(`${locale} ${path}`, async ({ page }) => {
      const errors = trackErrors(page);
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', localeMeta[locale].htmlLang);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();

      // canonical aponta para a própria página
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(new URL(canonical ?? '').pathname).toBe(path);

      // hreflang lista a página equivalente em todos os idiomas
      for (const other of locales) {
        const href = await page
          .locator(`link[rel="alternate"][hreflang="${localeMeta[other].htmlLang}"]`)
          .getAttribute('href');
        expect(new URL(href ?? '').pathname).toBe(getLocalizedPath(route, other));
      }

      // sem overflow horizontal
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);

      // acessibilidade: nenhuma violação séria ou crítica, no estado final da página
      // (espera as entradas e revelações por tempo; as ligadas à rolagem não terminam)
      await page.evaluate(() =>
        Promise.all(
          document
            .getAnimations()
            .filter((a) => a.timeline === document.timeline)
            .map((a) => a.finished.catch(() => undefined)),
        ),
      );
      const axe = await new AxeBuilder({ page }).analyze();
      const serious = axe.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);

      expect(errors).toEqual([]);
    });
  }
}

test('404 bilíngue', async ({ page }) => {
  const response = await page.goto('/pagina-que-nao-existe/');

  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('section[lang="en"] h2')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
