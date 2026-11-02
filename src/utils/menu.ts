import { getCollection, type CollectionEntry } from 'astro:content';
import { groups } from '../content.config';
import { bar } from '../data/bar';
import type { Lang } from '../config/site';
import { t, tx } from '../i18n';

export type Cocktail = CollectionEntry<'cocktails'>;

export async function getCocktails() {
  const all = await getCollection('cocktails');
  return all.sort(
    (a, b) => groups.indexOf(a.data.group) - groups.indexOf(b.data.group) || a.data.order - b.data.order || a.id.localeCompare(b.id),
  );
}

/** "Bacardí 8 infusionado con piña, naranja…" or "Mezcal · Albahaca · Lima" */
export function recipeLine(c: Cocktail, lang: Lang) {
  const d = t(lang);
  const base = c.data.base.map((w) => tx(w, lang));
  const adds = c.data.adds.map((w) => tx(w, lang));
  if (c.data.mix === 'infused') {
    const lower = adds.map((a) => a[0].toLowerCase() + a.slice(1));
    return `${base.join(' + ')} ${base.length > 1 ? d.infusedN : d.infused1} ${lower.join(', ')}`;
  }
  return [base.join(' + '), ...adds].join(' · ');
}

/** Every orderable thing on the menu, keyed by id, for the client-side order list. */
export function orderables(cocktails: Cocktail[], lang: Lang) {
  const items: Record<string, { name: string; es: string; note: string; esNote: string; price: number; ok: boolean }> = {};
  for (const c of cocktails) {
    items[c.id] = { name: c.data.name, es: c.data.name, note: '', esNote: '', price: c.data.price, ok: c.data.available };
  }
  const d = t(lang);
  const es = t('es');
  for (const sec of bar) {
    for (const g of sec.groups) {
      for (const it of g.items) {
        if (it.price != null) items[`${sec.id}:${it.id}`] = { name: it.name, es: it.name, note: '', esNote: '', price: it.price, ok: true };
        if (it.glass != null) items[`${sec.id}:${it.id}:copa`] = { name: it.name, es: it.name, note: d.glass, esNote: es.glass, price: it.glass, ok: true };
        if (it.bottle != null) items[`${sec.id}:${it.id}:botella`] = { name: it.name, es: it.name, note: d.bottle, esNote: es.bottle, price: it.bottle, ok: true };
      }
    }
  }
  return items;
}
