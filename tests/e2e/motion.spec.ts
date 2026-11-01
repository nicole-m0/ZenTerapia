import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { locales, routes, type RouteKey } from '../../src/i18n/config';
import { getLocalizedPath } from '../../src/i18n/utils';

const paths = locales.flatMap((locale) =>
  (Object.keys(routes) as RouteKey[]).map((route) => getLocalizedPath(route, locale)),
);

/** Opacidade dos blocos com data-reveal que ainda não chegaram a 1. */
async function hiddenReveals(page: Page) {
  return page
    .locator('[data-reveal]')
    .evaluateAll((els) =>
      els
        .filter((el) => Number(getComputedStyle(el).opacity) < 1)
        .map((el) => el.className || el.tagName),
    );
}

const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('revelação na rolagem', () => {
  for (const path of paths) {
    test(`tudo aparece ao rolar, sem overflow: ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveClass(/\bmotion\b/);

      // rola em passos, conferindo o overflow durante as animações
      const height = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y <= height; y += 500) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(60);
        expect(await overflow(page)).toBeLessThanOrEqual(0);
      }

      await expect(page.locator('[data-reveal]:not(.is-revealed)')).toHaveCount(0);
      await expect.poll(() => hiddenReveals(page)).toEqual([]);

      // com tudo revelado, o conteúdo de baixo também passa pelo axe (uma vez, no desktop)
      if (page.viewportSize()?.width === 1440) {
        const axe = await new AxeBuilder({ page }).analyze();
        const serious = axe.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        );
        expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      }
    });
  }
});

test.describe('alternativas sem animação', () => {
  test.skip(({ viewport }) => viewport?.width !== 375, 'basta um viewport');

  test.describe('sem JavaScript', () => {
    test.use({ javaScriptEnabled: false });

    test('nenhum conteúdo fica escondido', async ({ page }) => {
      for (const path of ['/', '/sobre/', '/en/services/']) {
        await page.goto(path);
        await expect(page.locator('html')).not.toHaveClass(/\bmotion\b/);
        expect(await hiddenReveals(page)).toEqual([]);
      }
    });
  });

  test.describe('com movimento reduzido', () => {
    test.use({ reducedMotion: 'reduce' });

    test('nada é escondido nem animado', async ({ page }) => {
      await page.goto('/en/about/');
      await expect(page.locator('html')).not.toHaveClass(/\bmotion\b/);
      expect(await hiddenReveals(page)).toEqual([]);

      // as entradas dos cabeçalhos já começam no estado final
      const entering = await page
        .locator('.enter')
        .evaluateAll(
          (els) =>
            els.filter(
              (el) =>
                Number(getComputedStyle(el).opacity) < 1 ||
                getComputedStyle(el).translate !== 'none',
            ).length,
        );
      expect(entering).toBe(0);
    });
  });

  test('se o observador falhar, o conteúdo continua visível', async ({ page }) => {
    await page.addInitScript(() => {
      // simula um navegador em que o IntersectionObserver existe, mas quebra
      window.IntersectionObserver = function () {
        throw new Error('observador indisponível');
      } as unknown as typeof IntersectionObserver;
    });
    await page.goto('/servicos/');
    await expect(page.locator('html')).not.toHaveClass(/\bmotion\b/);
    expect(await hiddenReveals(page)).toEqual([]);
  });
});

test('o header fica parado na troca de página', async ({ page }) => {
  await page.goto('/');
  const name = await page
    .locator('.site-header')
    .evaluate((el) => getComputedStyle(el).viewTransitionName);
  expect(name).toBe('site-header');
});
