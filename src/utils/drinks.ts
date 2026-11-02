import { getCollection, type CollectionEntry } from 'astro:content';
import { categories } from '../content.config';

export type Drink = CollectionEntry<'drinks'>;
export type Category = (typeof categories)[number];

/** All drinks, grouped in menu order. Fails the build if a `pairsWith` slug doesn't exist. */
export async function getMenu() {
  const all = await getCollection('drinks');
  const ids = new Set(all.map((d) => d.id));
  for (const d of all) {
    for (const p of d.data.pairsWith) {
      if (!ids.has(p)) throw new Error(`Drink "${d.id}" pairsWith unknown drink "${p}"`);
    }
  }
  const byId = new Map(all.map((d) => [d.id, d]));
  const sections = categories
    .map((category) => ({
      category,
      drinks: all
        .filter((d) => d.data.category === category)
        .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id)),
    }))
    .filter((s) => s.drinks.length > 0);
  return { sections, byId, all: sections.flatMap((s) => s.drinks) };
}
