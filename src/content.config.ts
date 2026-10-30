import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localeSchema = z.enum(['pt', 'en']);

/** Um arquivo por serviço e idioma: services/<locale>/<slug>.md */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    order: z.number().int(),
    /** Âncora do serviço na página de serviços (já traduzida). */
    anchor: z.string(),
    summary: z.string(),
    forWhom: z.string(),
    durationMinutes: z.number().int().positive(),
    /** Valor fictício, em reais. */
    price: z.number().positive(),
    /** Chave do manifesto src/data/images.ts */
    image: z.string(),
  }),
});

const testimonials = defineCollection({
  loader: file('./src/content/testimonials.json'),
  schema: z.object({
    locale: localeSchema,
    order: z.number().int(),
    quote: z.string(),
    name: z.string(),
    detail: z.string(),
  }),
});

const cta = z.object({ label: z.string() });

/** Textos da Home, um JSON por idioma. `*palavra*` vira itálico. */
const home = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/home' }),
  schema: z.object({
    hero: z.object({
      eyebrow: z.string(),
      /** `|` separa as linhas do título; a segunda linha entra recuada. */
      title: z.string(),
      lead: z.string(),
      secondaryCta: cta,
      caption: z.string(),
      facts: z.array(z.string()).length(3),
    }),
    intro: z.object({
      label: z.string(),
      statement: z.string(),
      body: z.array(z.string()).min(1),
      /** Aviso visível de que a persona é fictícia. */
      demoNote: z.string(),
      link: cta,
    }),
    services: z.object({
      label: z.string(),
      title: z.string(),
      intro: z.string(),
      durationUnit: z.string(),
      /** Dica e rótulos dos controles das vidraças deslizantes (telas menores). */
      swipeHint: z.string(),
      previous: z.string(),
      next: z.string(),
      link: cta,
    }),
    experience: z.object({
      label: z.string(),
      title: z.string(),
      intro: z.string(),
      steps: z.array(z.object({ title: z.string(), text: z.string() })).length(4),
    }),
    testimonials: z.object({
      label: z.string(),
      title: z.string(),
      disclaimer: z.string(),
      /** Marca exibida na legenda de cada relato. */
      itemNote: z.string(),
    }),
    closing: z.object({
      title: z.string(),
      text: z.string(),
      whatsappCta: cta,
    }),
  }),
});

export const collections = { services, testimonials, home };
