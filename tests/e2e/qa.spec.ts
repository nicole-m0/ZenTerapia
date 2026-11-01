import { expect, test } from '@playwright/test';
import { locales, routes, type RouteKey } from '../../src/i18n/config';
import { getLocalizedPath } from '../../src/i18n/utils';

const paths = locales.flatMap((locale) =>
  (Object.keys(routes) as RouteKey[]).map((route) => getLocalizedPath(route, locale)),
);

test.describe('teclado', () => {
  test('o primeiro Tab mostra o link para pular ao conteúdo', async ({ page }) => {
    await page.goto('/en/services/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('todo elemento focado pelo teclado tem foco visível', async ({ page }) => {
    for (const path of ['/', '/contato/']) {
      await page.goto(path);
      const seen = new Set<string>();
      for (let i = 0; i < 30; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const style = getComputedStyle(el);
          const visible =
            (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) ||
            style.boxShadow !== 'none';
          return { id: `${el.tagName} ${el.textContent?.trim().slice(0, 30)}`, visible };
        });
        if (!info || seen.has(info.id)) continue;
        seen.add(info.id);
        expect(info.visible, `${path}: ${info.id}`).toBe(true);
      }
      expect(seen.size).toBeGreaterThan(5);
    }
  });
});

test.describe('404', () => {
  test('os links de retorno levam à Home de cada idioma', async ({ page }) => {
    await page.goto('/nao-existe/');
    await page.locator('.not-found__pane').first().getByRole('link', { name: 'Início' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

    await page.goto('/en/missing-page/');
    await page.locator('section[lang="en"]').getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('janelas', () => {
  // A foto fica atrás do vidro e se move com a rolagem (profundidade): em nenhuma
  // posição pode sobrar vão entre a foto e o caixilho.
  for (const path of ['/', '/servicos/', '/sobre/', '/en/about/']) {
    test(`a foto cobre o vidro em qualquer rolagem: ${path}`, async ({ page }) => {
      await page.goto(path);
      const windows = page.locator('.window');
      const count = await windows.count();
      expect(count).toBeGreaterThan(0);
      const viewport = page.viewportSize()?.height ?? 800;
      let travel = 0;

      for (let i = 0; i < count; i++) {
        const win = windows.nth(i);
        const top = await win.evaluate((el) => el.getBoundingClientRect().top + scrollY);
        const offsets: number[] = [];
        for (const f of [-0.9, -0.4, 0, 0.4, 0.9]) {
          await page.evaluate((y) => scrollTo(0, y), top - viewport / 2 + f * viewport * 0.6);
          await page.waitForTimeout(50);
          const m = await win.evaluate((el) => {
            const glass = el.querySelector('.window__glass')?.getBoundingClientRect();
            const img = el.querySelector('img')?.getBoundingClientRect();
            if (!glass || !img) return { gap: Infinity, offset: 0 };
            return {
              gap: Math.max(img.top - glass.top, glass.bottom - img.bottom, 0),
              offset: img.top - glass.top,
            };
          });
          expect(m.gap, `janela ${i + 1}`).toBeLessThanOrEqual(0.5);
          offsets.push(m.offset);
        }
        travel = Math.max(travel, Math.max(...offsets) - Math.min(...offsets));
      }
      // a profundidade continua ativa: a foto muda de posição dentro do vidro
      // (janelas no topo da página quase não rolam, por isso a medida é da página)
      expect(travel).toBeGreaterThan(2);
    });
  }
});

test.describe('domínio', () => {
  test.skip(({ viewport }) => viewport?.width !== 1440, 'verificado só no desktop');

  test('todas as URLs absolutas usam o mesmo SITE_URL', async ({ page, request }) => {
    const origins = new Set<string>();
    for (const path of paths) {
      await page.goto(path);
      const urls = await page
        .locator(
          'link[rel="canonical"], link[rel="alternate"][hreflang], meta[property="og:url"], meta[property="og:image"], meta[name="twitter:image"]',
        )
        .evaluateAll((els) =>
          els.map((el) => el.getAttribute('href') ?? el.getAttribute('content')),
        );
      const jsonLd = JSON.parse(
        (await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}',
      ) as { url: string };
      for (const url of [...urls, jsonLd.url]) origins.add(new URL(url ?? '').origin);
    }

    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    for (const [, url] of sitemap.matchAll(/(?:<loc>|href=")([^<"]+)/g)) {
      origins.add(new URL(url ?? '').origin);
    }
    const robots = await (await request.get('/robots.txt')).text();
    origins.add(new URL(robots.match(/^Sitemap: (.+)$/m)?.[1] ?? '').origin);

    expect([...origins]).toHaveLength(1);
  });
});
