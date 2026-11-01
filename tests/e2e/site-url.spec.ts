import { expect, test } from '@playwright/test';
import { PLACEHOLDER_URL, resolveSiteUrl } from '../../scripts/site-url.mjs';

// Regras de domínio do build (sem navegador): verificadas uma vez só.
test.describe('SITE_URL', () => {
  test.skip(({ viewport }) => viewport?.width !== 1440, 'lógica de build, sem viewport');

  const build = ['node', 'astro', 'build'];
  const quiet = () => {};

  test('SITE_URL explícito vence e perde a barra final', () => {
    const env = {
      SITE_URL: 'https://terapia.com.br/',
      VERCEL: '1',
      VERCEL_PROJECT_PRODUCTION_URL: 'terapia-zen.vercel.app',
    };
    expect(resolveSiteUrl({ env, argv: build })).toBe('https://terapia.com.br');
  });

  test('na Vercel, sem SITE_URL, usa o domínio de produção do projeto', () => {
    const env = { VERCEL: '1', VERCEL_PROJECT_PRODUCTION_URL: 'terapia-zen.vercel.app' };
    expect(resolveSiteUrl({ env, argv: build })).toBe('https://terapia-zen.vercel.app');
  });

  test('build de produção fora da Vercel exige SITE_URL', () => {
    expect(() => resolveSiteUrl({ env: {}, argv: build })).toThrow(/SITE_URL/);
  });

  test('recusa domínio reservado e http em produção', () => {
    expect(() =>
      resolveSiteUrl({ env: { SITE_URL: 'https://terapiazen.example' }, argv: build }),
    ).toThrow(/reservado/);
    expect(() =>
      resolveSiteUrl({ env: { SITE_URL: 'http://terapia.com.br' }, argv: build }),
    ).toThrow(/https/);
  });

  test('build qa e dev usam o domínio provisório', () => {
    const qa = [...build, '--mode', 'qa'];
    expect(resolveSiteUrl({ env: {}, argv: qa, warn: quiet })).toBe(PLACEHOLDER_URL);
    expect(resolveSiteUrl({ env: {}, argv: ['node', 'astro', 'dev'] })).toBe(PLACEHOLDER_URL);
  });
});
