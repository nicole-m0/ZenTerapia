import type { Locale } from '../config';
import { pt } from './pt';
import { en } from './en';

export type Dictionary = typeof pt;

export const dictionaries: Record<Locale, Dictionary> = { pt, en };
