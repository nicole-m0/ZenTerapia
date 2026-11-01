# Terapia Zen

Site demonstrativo e bilíngue (português e inglês) de um espaço de terapias integrativas,
feito como peça de portfólio. **A marca, a terapeuta, os relatos, os valores, o endereço e os
contatos são fictícios**, e isso é sinalizado no próprio site.

- Astro 7 (site estático), CSS próprio, sem framework de UI
- Português em `/`, inglês em `/en/`, com URLs traduzidas (`/servicos/` ↔ `/en/services/`)
- Testes de ponta a ponta com Playwright e axe (375, 768 e 1440 px)

## Requisitos

- Node.js **22.12 ou mais recente** (o projeto foi validado com 22.19)
- npm

## Instalação

```sh
npm install
npm run test:install   # baixa o Chromium usado pelos testes (uma vez)
```

## Desenvolvimento local

```sh
npm run dev            # http://localhost:4321
```

O servidor de desenvolvimento usa o domínio provisório `https://terapiazen.example` nas URLs
absolutas (canonical, sitemap etc.). Isso é esperado no ambiente local.

## Validação

```sh
npm run validate
```

Roda, em sequência: verificação de tipos (`astro check`), lint, formatação, o build de
validação (`build:qa`) e todos os testes de ponta a ponta. Os testes sobem sozinhos um
`astro preview` na porta 4321. Antes de rodar, pare qualquer `astro dev` ou `astro preview`
aberto: o Astro só permite um preview por vez, e o Playwright reaproveitaria o servidor de
desenvolvimento.

Comandos avulsos: `npm run check`, `npm run lint`, `npm run format:check`, `npm run test`.

## Publicação

O site é estático: o build gera a pasta `dist/`, que pode ir para qualquer hospedagem de
arquivos (Netlify, Vercel, Cloudflare Pages, GitHub Pages, um servidor próprio etc.).

### `SITE_URL` (obrigatório em produção)

O domínio definitivo ainda não foi definido. Ele é informado pela variável de ambiente
`SITE_URL`, sem barra final:

```sh
SITE_URL=https://seu-dominio.com.br npm run build
```

No PowerShell: `$env:SITE_URL = 'https://seu-dominio.com.br'; npm run build`.
Nas plataformas de hospedagem, cadastre `SITE_URL` nas variáveis de ambiente do build.

O build de produção **se recusa a rodar** sem um domínio real. Ele falha se:

- `SITE_URL` não estiver definido;
- o domínio for reservado para exemplos (`*.example`, incluindo `terapiazen.example`);
- o endereço não usar `https`.

O comando `npm run build:qa` gera um build com o domínio provisório, só para validação local
e testes. Ele avisa no terminal e **essa pasta `dist/` nunca deve ser publicada**.

### O que depende do domínio

Tudo isto é gerado a partir de `SITE_URL`, sem nenhuma outra edição:

- `<link rel="canonical">` e os `hreflang` (PT, EN e `x-default`) de cada página;
- `og:url`, `og:image` e `twitter:image` (imagens em `public/og/`);
- dados estruturados (JSON-LD `WebSite`);
- `sitemap-index.xml` e `sitemap-0.xml`, com os pares PT/EN de cada página;
- a linha `Sitemap:` do `robots.txt`.

O e-mail de contato `ola@terapiazen.example` **não** depende do domínio: é um contato
fictício, explicado no aviso legal, e continua igual em produção.

### Página 404

O build gera um único `404.html`, bilíngue. Configure a hospedagem para servi-lo nas rotas
inexistentes (a maioria das plataformas faz isso automaticamente).

## Estrutura

```text
src/
  components/   cabeçalho, rodapé, botões, janelas (Window), luz projetada (LightCast)…
  content/      textos de cada página, por idioma (JSON e Markdown)
  data/         dados da marca e manifesto das fotos (com créditos)
  i18n/         idiomas, rotas traduzidas e textos de interface
  views/        páginas compartilhadas pelos dois idiomas
  pages/        rotas (PT na raiz, EN em /en/)
  styles/       tokens de design e estilos globais
public/og/      imagens de compartilhamento (geradas por scripts/og-images.mjs)
tests/e2e/      testes Playwright
```

A página `/sistema-visual/` documenta a identidade (símbolo, paleta, tipografia e tokens).
Ela fica fora do sitemap e dos buscadores (`noindex`).

## Imagens

As fotografias são do Unsplash (Unsplash License) e ficam em `src/assets/images/`. Os créditos
estão em `src/data/images.ts` e aparecem no aviso legal. O Astro gera AVIF e WebP em várias
larguras, com JPG como reserva.

Para regerar as imagens de compartilhamento depois de mudar a identidade:

```sh
node scripts/og-images.mjs
```
