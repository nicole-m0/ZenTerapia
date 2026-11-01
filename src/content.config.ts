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
    /** Presencial, online ou ambos (texto exibido). */
    format: z.string(),
    /** Os três momentos da sessão, na ordem. */
    steps: z.array(z.string()).length(3),
    /** Observação prática (o que levar, cuidados). */
    note: z.string(),
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
const closing = z.object({ title: z.string(), text: z.string(), whatsappCta: cta });
const pageHead = z.object({
  eyebrow: z.string(),
  /** `|` separa as linhas do título. */
  title: z.string(),
  lead: z.string(),
});

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
    closing,
  }),
});

/** Textos da página de serviços (os serviços em si vêm da coleção `services`). */
const servicesPage = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages/services' }),
  schema: z.object({
    head: pageHead.extend({ indexLabel: z.string() }),
    /** Aviso de que os valores são fictícios. */
    priceNote: z.string(),
    labels: z.object({
      forWhom: z.string(),
      session: z.string(),
      note: z.string(),
      duration: z.string(),
      format: z.string(),
      price: z.string(),
      minutes: z.string(),
      book: z.string(),
    }),
    faq: z.object({
      label: z.string(),
      title: z.string(),
      items: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
    }),
    closing,
  }),
});

const aboutPage = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages/about' }),
  schema: z.object({
    head: z.object({
      eyebrow: z.string(),
      name: z.string(),
      role: z.string(),
      statement: z.string(),
      body: z.array(z.string()).min(1),
      demoNote: z.string(),
      caption: z.string(),
    }),
    principles: z.object({
      label: z.string(),
      title: z.string(),
      items: z.array(z.object({ title: z.string(), text: z.string() })).length(3),
    }),
    path: z.object({
      label: z.string(),
      title: z.string(),
      demoNote: z.string(),
      items: z.array(z.object({ year: z.string(), title: z.string(), text: z.string() })).min(1),
    }),
    space: z.object({
      label: z.string(),
      title: z.string(),
      text: z.string(),
      details: z.array(z.string()).min(1),
      demoNote: z.string(),
      caption: z.string(),
    }),
    closing,
  }),
});

const field = z.object({
  label: z.string(),
  hint: z.string().optional(),
  error: z.string().optional(),
});

const contactPage = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages/contact' }),
  schema: z.object({
    head: pageHead,
    channels: z.object({
      title: z.string(),
      whatsapp: z.object({ label: z.string(), detail: z.string() }),
      email: z.object({ label: z.string(), detail: z.string() }),
      instagram: z.object({ label: z.string(), detail: z.string() }),
    }),
    hours: z.object({ title: z.string(), lines: z.array(z.string()).min(1) }),
    place: z.object({ title: z.string(), lines: z.array(z.string()).min(1), note: z.string() }),
    form: z.object({
      title: z.string(),
      intro: z.string(),
      required: z.string(),
      name: field,
      email: field,
      phone: field,
      practice: field.extend({ undecided: z.string() }),
      modality: z.object({ legend: z.string(), options: z.array(z.string()).length(3) }),
      message: field,
      consent: z.object({ before: z.string(), link: z.string(), error: z.string() }),
      submit: z.string(),
      demoNote: z.string(),
      noscript: z.string(),
      errorSummary: z.string(),
      success: z.object({ title: z.string(), text: z.string(), again: z.string() }),
    }),
  }),
});

/** Aviso legal e privacidade: seções com âncora própria (o formulário aponta para a de privacidade). */
const legalPage = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pages/legal' }),
  schema: z.object({
    head: pageHead.extend({ updated: z.string() }),
    notice: z.object({ title: z.string(), text: z.string() }),
    indexLabel: z.string(),
    sections: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          paragraphs: z.array(z.string()).min(1),
        }),
      )
      .min(1),
    creditsPhotoBy: z.string(),
  }),
});

export const collections = {
  services,
  testimonials,
  home,
  servicesPage,
  aboutPage,
  contactPage,
  legalPage,
};
