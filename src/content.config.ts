import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const text = z.object({ es: z.string(), en: z.string() });
/** A word that is the same in both languages ("Campari") or a translated pair. */
const word = z.union([z.string(), text]);

export const categories = ['casa', 'clasicos', 'sin-alcohol', 'cervezas', 'vinos', 'shots'] as const;
export const flavors = ['refrescante', 'citrico', 'dulce', 'afrutado', 'amargo', 'herbal', 'cremoso', 'ahumado'] as const;
export const glasses = ['rocks', 'highball', 'coupe', 'martini', 'copa', 'wine', 'hurricane', 'pint', 'bottle', 'shot'] as const;
export const garnishes = ['lime', 'lemon', 'orange', 'cherry', 'mint', 'pineapple', 'coffee', 'cinnamon', 'passion', 'none'] as const;
export const allergens = ['lacteos', 'coco', 'huevo', 'gluten', 'frutos-secos'] as const;

// One folder per drink: src/content/drinks/<slug>/data.yaml (+ an optional photo).
const drinks = defineCollection({
  loader: glob({
    pattern: '*/data.yaml',
    base: './src/content/drinks',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: ({ image }) =>
    z.object({
      name: word,
      category: z.enum(categories),
      price: z.number().positive(),
      /** Serving size shown next to the price, e.g. "12 oz". */
      size: z.string().optional(),
      /** Main spirit or style, e.g. "Ron puertorriqueño". */
      base: word.optional(),
      /** One line: why someone should pick this drink. Shown on the card. */
      unique: text,
      description: text,
      ingredients: z.array(word).min(1),
      flavor: z.array(z.enum(flavors)).min(1).max(3),
      /** 0 = sin alcohol, 1 = suave, 2 = medio, 3 = fuerte. */
      strength: z.number().int().min(0).max(3),
      glass: z.enum(glasses),
      /** Drink colour for the illustrated placeholder (hex). */
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
      garnish: z.enum(garnishes).default('none'),
      contains: z.array(z.enum(allergens)).default([]),
      /** Slugs of other drinks to suggest ("Si te gusta este, prueba…"). */
      pairsWith: z.array(z.string()).max(3).default([]),
      /** Real photo next to data.yaml (e.g. ./foto.jpg). Without one, an illustration is shown. */
      photo: image().optional(),
      signature: z.boolean().default(false),
      seasonal: z.boolean().default(false),
      /** Set to false on nights it runs out; it stays visible as "Agotado hoy". */
      available: z.boolean().default(true),
      order: z.number().default(100),
    }),
});

export const collections = { drinks };
