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

## Publicação (Vercel)

O site é estático: `npm run build` gera a pasta `dist/`. O destino previsto é a Vercel,
sem nenhum domínio próprio por enquanto.

1. Importe o repositório na Vercel. O preset **Astro** é detectado sozinho:
   build `npm run build`, saída `dist`. Use Node.js 22 nas configurações do projeto.
2. Não é preciso cadastrar variáveis. Sem `SITE_URL`, o build usa o domínio de produção que
   a Vercel informa (`VERCEL_PROJECT_PRODUCTION_URL`, por exemplo
   `https://nome-do-projeto.vercel.app`). Deixe ligada a opção _Automatically expose System
   Environment Variables_ (padrão).
3. Deploys de preview usam esse mesmo endereço no canonical e no sitemap, e a Vercel já os
   marca como `noindex`.

O `vercel.json` só fixa a barra final nas URLs (`/servicos` → `/servicos/`), igual aos
canonicals gerados pelo Astro.

### `SITE_URL` (opcional)

Se um dia houver um domínio próprio, basta adicioná-lo ao projeto na Vercel (ele passa a ser
o domínio de produção) ou definir `SITE_URL`, sem barra final, nas variáveis de ambiente do
build. Fora da Vercel, `SITE_URL` é obrigatório:

```sh
SITE_URL=https://seu-dominio.com.br npm run build
```

No PowerShell: `$env:SITE_URL = 'https://seu-dominio.com.br'; npm run build`.

Regras (em `scripts/site-url.mjs`): `SITE_URL` tem prioridade; domínios reservados para
exemplos (`*.example`, incluindo `terapiazen.example`) e endereços sem `https` são recusados;
um build de produção fora da Vercel e sem `SITE_URL` falha.

O comando `npm run build:qa` gera um build com o domínio provisório
`https://terapiazen.example`, só para validação local e testes. Ele avisa no terminal e
**essa pasta `dist/` nunca deve ser publicada**.

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

O build gera um único `404.html`, bilíngue. A Vercel o serve automaticamente nas rotas
inexistentes, com status 404.

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
