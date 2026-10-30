import { expect, test } from '@playwright/test';
import { locales, routes, type RouteKey } from '../../src/i18n/config';
import { getLocalizedPath } from '../../src/i18n/utils';

const routeKeys = Object.keys(routes) as RouteKey[];
const isDesktop = (width: number | undefined) => (width ?? 0) >= 960;

test.describe('seletor de idioma', () => {
  for (const locale of locales) {
    for (const route of routeKeys) {
      test(`${locale} ${route} aponta para a página equivalente`, async ({ page }) => {
        await page.goto(getLocalizedPath(route, locale));
        const switcher = page.locator('footer nav.lang');

        for (const other of locales) {
          await expect(switcher.locator(`a[hreflang]`).nth(locales.indexOf(other))).toHaveAttribute(
            'href',
            getLocalizedPath(route, other),
          );
        }
        await expect(switcher.locator('a[aria-current="true"]')).toHaveAttribute(
          'href',
          getLocalizedPath(route, locale),
        );
      });
    }
  }

  test('trocar de idioma leva à página traduzida', async ({ page }) => {
    await page.goto('/servicos/');
    await page.locator('footer nav.lang a[hreflang="en"]').click();
    await expect(page).toHaveURL(/\/en\/services\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('header', () => {
  test('marca a página atual e oferece o agendamento', async ({ page, viewport }) => {
    await page.goto('/sobre/');
    const cta = page.locator('.site-header__actions > a.button');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/contato/');

    if (isDesktop(viewport?.width)) {
      const current = page.locator('.site-header__nav a[aria-current="page"]');
      await expect(current).toHaveText('Sobre');
      await expect(page.locator('.menu-toggle')).toBeHidden();
    } else {
      await expect(page.locator('.site-header__nav')).toBeHidden();
      await expect(page.locator('.menu-toggle')).toBeVisible();
    }
  });
});

test.describe('menu mobile', () => {
  test.skip(({ viewport }) => isDesktop(viewport?.width), 'menu só existe abaixo de 960px');

  test('abre, prende o foco, fecha com Esc e devolve o foco', async ({ page }) => {
    await page.goto('/en/about/');
    const toggle = page.getByRole('button', { name: 'Menu' });
    const dialog = page.getByRole('dialog', { name: 'Navigation menu' });

    await toggle.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('a[aria-current="page"]')).toContainText('About');

    // o foco fica dentro do diálogo, mesmo após vários Tabs
    for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('o botão Fechar fecha o menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('links do menu navegam', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page
      .getByRole('dialog')
      .getByRole('link', { name: /Contato/ })
      .click();
    await expect(page).toHaveURL(/\/contato\/$/);
  });
});

test('sistema visual fica fora dos buscadores', async ({ page, request }) => {
  await page.goto('/sistema-visual/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  const sitemap = await (await request.get('/sitemap-0.xml')).text();
  expect(sitemap).not.toContain('sistema-visual');
});
