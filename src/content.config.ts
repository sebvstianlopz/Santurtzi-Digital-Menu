import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const text = z.object({ es: z.string(), en: z.string() });
/** A word that is the same in both languages ("Kahlúa") or a translated pair. */
const word = z.union([z.string(), text]);

export const groups = ['casa', 'mas'] as const;
export const glasses = ['coupe', 'martini', 'flute', 'rocks', 'highball', 'wine'] as const;
export const tastes = [
  'citrus', 'sweet', 'fruity', 'bubbly', 'spicy', 'coffee', 'fresh', 'floral',
  'creamy', 'herbal', 'smooth', 'spiced', 'tropical', 'ginger',
] as const;

// One folder per cocktail: src/content/cocktails/<slug>/data.yaml (+ an optional photo).
const cocktails = defineCollection({
  loader: glob({
    pattern: '*/data.yaml',
    base: './src/content/cocktails',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      /** casa = Cócteles de la casa, mas = Más cócteles */
      group: z.enum(groups),
      order: z.number().default(100),
      price: z.number().positive(),
      /** Mood colour: tints the room light behind the card. */
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      taste: z.array(z.enum(tastes)).min(1).max(3),
      /** The short human note on the card. */
      line: text,
      /** Spirits, shown big on the recipe card. */
      base: z.array(word).min(1),
      /** "infused" → "infusionado con …", "with" → "con …" */
      mix: z.enum(['infused', 'with']),
      adds: z.array(word).min(1),
      /** Glass it's served in: drawn as line art until a photo is added. */
      glass: z.enum(glasses).default('coupe'),
      /** Cut-out photo of the drink (transparent background works best). */
      photo: image().optional(),
      /** Height of the glass relative to the others (0.4–1), so a rocks glass looks shorter than a flute. */
      scale: z.number().min(0.4).max(1).default(0.9),
      /** false = greyed out as "Agotado hoy" on nights it runs out. */
      available: z.boolean().default(true),
    }),
});

export const collections = { cocktails };
