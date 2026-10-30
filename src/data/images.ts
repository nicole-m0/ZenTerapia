/**
 * Manifesto central de fotografias. Para trocar uma imagem, substitua o arquivo
 * em src/assets/images/ (ou o import) e ajuste alt, foco e crédito aqui.
 *
 * Todas as fotos são do Unsplash, sob a Unsplash License (uso comercial livre,
 * sem atribuição obrigatória). Os créditos ficam registrados mesmo assim.
 */
import type { ImageMetadata } from 'astro';
import type { Locale } from '@/i18n/config';
import heroJanela from '@/assets/images/home/hero-janela.jpg';
import cortina from '@/assets/images/home/cortina.jpg';
import somatica from '@/assets/images/home/somatica.jpg';
import meditacao from '@/assets/images/home/meditacao.jpg';
import reiki from '@/assets/images/home/reiki.jpg';
import aromaterapia from '@/assets/images/home/aromaterapia.jpg';
import experiencia from '@/assets/images/home/experiencia.jpg';

export interface Photo {
  src: ImageMetadata;
  alt: Record<Locale, string>;
  /** Ponto de foco para recortes com object-fit: cover. */
  position?: string;
  credit: { author: string; url: string };
}

export const images = {
  heroJanela: {
    src: heroJanela,
    alt: {
      pt: 'Mulher de olhos fechados, sentada junto a uma janela ampla com plantas e luz da manhã.',
      en: 'A woman with her eyes closed, sitting by a large window with plants in the morning light.',
    },
    position: '72% 30%',
    credit: { author: 'Kira Severinova', url: 'https://unsplash.com/photos/tx1F4M9Y16w' },
  },
  cortina: {
    src: cortina,
    alt: {
      pt: 'Dobras de uma cortina clara e translúcida sob luz suave.',
      en: 'Folds of a pale, sheer curtain in soft light.',
    },
    credit: { author: 'Sebastian Schuster', url: 'https://unsplash.com/photos/9jdW6x0OMOw' },
  },
  somatica: {
    src: somatica,
    alt: {
      pt: 'Mão apoiada com delicadeza nas costas de uma pessoa deitada.',
      en: 'A hand resting gently on the back of a person lying down.',
    },
    position: '60% 40%',
    credit: { author: 'Paige Madison', url: 'https://unsplash.com/photos/0d6R1iCh1SE' },
  },
  meditacao: {
    src: meditacao,
    alt: {
      pt: 'Mar calmo desaparecendo em uma névoa azulada.',
      en: 'A calm sea fading into a bluish mist.',
    },
    credit: { author: 'Ricardo Resende', url: 'https://unsplash.com/photos/ElYBGRbRKCc' },
  },
  reiki: {
    src: reiki,
    alt: {
      pt: 'Duas mãos abertas, com as palmas voltadas para cima.',
      en: 'Two open hands with palms facing up.',
    },
    credit: { author: 'Andrew Moca', url: 'https://unsplash.com/photos/olmY3NkTY_M' },
  },
  aromaterapia: {
    src: aromaterapia,
    alt: {
      pt: 'Frascos de vidro âmbar sobre uma mesa clara, com sombras longas da luz da tarde.',
      en: 'Amber glass bottles on a pale table, casting long afternoon shadows.',
    },
    position: '45% 55%',
    credit: { author: 'Kelly Sikkema', url: 'https://unsplash.com/photos/odbXUB3BwdU' },
  },
  experiencia: {
    src: experiencia,
    alt: {
      pt: 'Bule de porcelana branca e uma xícara de chá sobre toalha de linho e azulejos azuis.',
      en: 'A white porcelain teapot and a cup of tea on a linen cloth over blue tiles.',
    },
    credit: { author: 'Gaelle Marcel', url: 'https://unsplash.com/photos/lKlm7XfB0PY' },
  },
} satisfies Record<string, Photo>;

export type ImageKey = keyof typeof images;

export function isImageKey(value: string): value is ImageKey {
  return value in images;
}

/** Resolve a chave usada no conteúdo; erro no build se a imagem não existir. */
export function getPhoto(key: string): Photo {
  if (!isImageKey(key)) throw new Error(`Imagem desconhecida no conteúdo: "${key}"`);
  return images[key];
}
