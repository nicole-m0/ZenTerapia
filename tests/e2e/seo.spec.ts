import { expect, test } from '@playwright/test';
import { locales, routes, type RouteKey } from '../../src/i18n/config';
import { getLocalizedPath } from '../../src/i18n/utils';

// Metadados não mudam com o viewport.
test.describe('SEO', () => {
  test.skip(({ viewport }) => viewport?.width !== 1440, 'verificado só no desktop');

  for (const locale of locales) {
    for (const route of Object.keys(routes) as RouteKey[]) {
      const path = getLocalizedPath(route, locale);

      test(`metadados ${path}`, async ({ page, request }) => {
        await page.goto(path);
        const head = page.locator('head');

        await expect(head.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
        await expect(head.locator('meta[property="og:url"]')).toHaveAttribute(
          'content',
          new RegExp(`${path}$`),
        );

        const image = await head.locator('meta[property="og:image"]').getAttribute('content');
        expect(image).toContain(`/og/og-${locale}.jpg`);
        expect((await request.get(new URL(image ?? '').pathname)).status()).toBe(200);
        await expect(head.locator('meta[name="twitter:card"]')).toHaveAttribute(
          'content',
          'summary_large_image',
        );

        const jsonLd = await head.locator('script[type="application/ld+json"]').textContent();
        expect(JSON.parse(jsonLd ?? '')).toMatchObject({ '@type': 'WebSite', name: 'Terapia Zen' });
      });
    }
  }

  test('títulos são únicos', async ({ page }) => {
    const titles = new Set<string>();
    const paths = locales.flatMap((locale) =>
      (Object.keys(routes) as RouteKey[]).map((route) => getLocalizedPath(route, locale)),
    );
    for (const path of paths) {
      await page.goto(path);
      titles.add(await page.title());
    }
    expect(titles.size).toBe(paths.length);
  });

  test('robots.txt e sitemap bilíngue', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/^Sitemap: https?:\/\/.+\/sitemap-index\.xml$/m);

    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('hreflang="en"');
    expect(sitemap).toContain('/en/legal-notice/');
    expect(sitemap).not.toContain('/sistema-visual/');
    expect(sitemap).not.toContain('404');
  });
});

test.describe('aviso legal', () => {
  test('o link do formulário leva à seção de privacidade', async ({ page }) => {
    await page.goto('/contato/');
    await page.getByRole('link', { name: 'aviso de privacidade' }).click();
    await expect(page).toHaveURL(/\/aviso-legal\/#privacidade$/);
    await expect(
      page.getByRole('heading', { level: 2, name: 'Privacidade e dados' }),
    ).toBeInViewport();
  });

  test('lista os créditos das fotos com link externo', async ({ page }) => {
    await page.goto('/en/legal-notice/');
    const credits = page.locator('#credits').getByRole('link');
    await expect(credits).toHaveCount(9);
    await expect(credits.first()).toHaveAttribute('target', '_blank');
    await expect(credits.first()).toHaveAttribute('href', /^https:\/\/unsplash\.com\/photos\//);
  });
});
