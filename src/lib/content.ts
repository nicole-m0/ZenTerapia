import { getCollection, getEntry } from 'astro:content';
import type { Locale } from '@/i18n/config';

/** Textos da Home no idioma pedido; falha no build se o arquivo não existir. */
export async function getHomeContent(locale: Locale) {
  const entry = await getEntry('home', locale);
  if (!entry) throw new Error(`Conteúdo da Home ausente para "${locale}"`);
  return entry.data;
}

export async function getServices(locale: Locale) {
  const entries = await getCollection('services', (entry) => entry.id.startsWith(`${locale}/`));
  return entries.map((entry) => entry.data).sort((a, b) => a.order - b.order);
}

export async function getTestimonials(locale: Locale) {
  const entries = await getCollection('testimonials', (entry) => entry.data.locale === locale);
  return entries.map((entry) => entry.data).sort((a, b) => a.order - b.order);
}
