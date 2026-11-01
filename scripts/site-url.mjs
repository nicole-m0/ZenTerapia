// @ts-check
/**
 * Resolve a URL pública do site (canonical, hreflang, og:url/og:image, JSON-LD,
 * sitemap e robots). Ordem:
 *
 * 1. `SITE_URL`, quando definido (domínio próprio, se um dia houver).
 * 2. Na Vercel, o domínio de produção do projeto, que a própria Vercel informa no
 *    build (`VERCEL_PROJECT_PRODUCTION_URL`: o `*.vercel.app` ou, se for
 *    configurado, o domínio próprio). Previews usam o mesmo endereço, então o
 *    canonical sempre aponta para a produção.
 * 3. Fora da Vercel, o build de produção falha sem `SITE_URL`. `astro dev` e
 *    `astro build --mode qa` usam o domínio reservado abaixo, com aviso.
 */
export const PLACEHOLDER_URL = 'https://terapiazen.example';

/**
 * @param {string[]} argv
 * @param {string} flag
 */
function argValue(argv, flag) {
  const inline = argv.find((arg) => arg.startsWith(`${flag}=`));
  if (inline) return inline.slice(flag.length + 1);
  const index = argv.indexOf(flag);
  return index > -1 ? argv[index + 1] : undefined;
}

/**
 * @param {{ env?: Record<string, string | undefined>, argv?: string[], warn?: (message: string) => void }} [options]
 * @returns {string} origem, sem barra final
 */
export function resolveSiteUrl({
  env = process.env,
  argv = process.argv,
  warn = console.warn,
} = {}) {
  const isBuild = argv.includes('build');
  const mode = argValue(argv, '--mode') ?? 'production';
  const isProductionBuild = isBuild && mode === 'production';

  const explicit = env.SITE_URL?.trim();
  if (explicit) {
    const url = new URL(explicit);
    if (url.hostname.endsWith('.example')) {
      throw new Error(`SITE_URL usa um domínio reservado (${url.hostname}). Use o domínio real.`);
    }
    if (isProductionBuild && url.protocol !== 'https:') {
      throw new Error(`SITE_URL precisa usar https em produção (recebido: ${explicit}).`);
    }
    return url.origin;
  }

  const vercelHost = env.VERCEL === '1' ? env.VERCEL_PROJECT_PRODUCTION_URL?.trim() : undefined;
  if (vercelHost) {
    return new URL(`https://${vercelHost}`).origin;
  }

  if (isProductionBuild) {
    throw new Error(
      'Defina SITE_URL para o build de produção fora da Vercel ' +
        '(ex.: SITE_URL=https://seu-dominio.com.br npm run build). ' +
        'Para validar localmente, use npm run build:qa.',
    );
  }
  if (isBuild) {
    warn(
      `[terapia-zen] Build "${mode}" com o domínio provisório ${PLACEHOLDER_URL}: ` +
        'serve só para validação local, não publique esta pasta dist/.',
    );
  }
  return PLACEHOLDER_URL;
}
