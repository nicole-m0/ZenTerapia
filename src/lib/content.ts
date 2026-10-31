import { getCollection, getEntry } from 'astro:content';
import type { Locale } from '@/i18n/config';

/** Textos da Home no idioma pedido; falha no build se o arquivo não existir. */
export async function getHomeContent(locale: Locale) {
  const entry = await getEntry('home', locale);
  if (!entry) throw new Error(`Conteúdo da Home ausente para "${locale}"`);
  return entry.data;
}

export async function getServicesPageContent(locale: Locale) {
  const entry = await getEntry('servicesPage', locale);
  if (!entry) throw new Error(`Conteúdo de Serviços ausente para "${locale}"`);
  return entry.data;
}

export async function getAboutPageContent(locale: Locale) {
  const entry = await getEntry('aboutPage', locale);
  if (!entry) throw new Error(`Conteúdo de Sobre ausente para "${locale}"`);
  return entry.data;
}

export async function getContactPageContent(locale: Locale) {
  const entry = await getEntry('contactPage', locale);
  if (!entry) throw new Error(`Conteúdo de Contato ausente para "${locale}"`);
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
