/**
 * Wine, sparkling and beer. Edit names and prices here.
 * An item has one price, or a glass and a bottle price.
 */
type T = { es: string; en: string };
export type BarItem = { id: string; name: string; origin?: T; price?: number; glass?: number; bottle?: number };
export type BarGroup = { title?: T; cols?: boolean; items: BarItem[] };
export type BarSection = { id: string; title: T; note?: T; groups: BarGroup[] };

export const bar: BarSection[] = [
  {
    id: 'vinos',
    title: { es: 'Vinos', en: 'Wine' },
    note: { es: 'Por copa', en: 'By the glass' },
    groups: [
      {
        title: { es: 'Blancos', en: 'White' },
        items: [
          { id: 'albarino', name: 'Albariño', price: 9 },
          { id: 'chardonnay', name: 'Chardonnay', price: 9 },
          { id: 'pinot-grigio', name: 'Pinot Grigio', price: 9 },
        ],
      },
      {
        title: { es: 'Tintos', en: 'Red' },
        items: [
          { id: 'red-blend', name: 'Red Blend', price: 9 },
          { id: 'cabernet', name: 'Cabernet', price: 9 },
          { id: 'ribera-del-duero', name: 'Ribera del Duero', price: 9 },
        ],
      },
    ],
  },
  {
    id: 'espumosos',
    title: { es: 'Espumosos', en: 'Sparkling' },
    groups: [
      {
        title: { es: 'Por copa y botella', en: 'By the glass & bottle' },
        cols: true,
        items: [
          { id: 'prosecco', name: 'Prosecco', origin: { es: 'Italia', en: 'Italy' }, glass: 9, bottle: 36 },
          { id: 'cava', name: 'Cava', origin: { es: 'España', en: 'Spain' }, glass: 10, bottle: 45 },
        ],
      },
      {
        title: { es: 'Champagne · por botella', en: 'Champagne · by the bottle' },
        items: [
          { id: 'moet', name: 'Moët Impérial Brut', origin: { es: 'Francia', en: 'France' }, bottle: 95 },
          { id: 'veuve-clicquot', name: 'Veuve Clicquot', origin: { es: 'Francia', en: 'France' }, bottle: 125 },
          { id: 'laurent-perrier-rose', name: 'Laurent-Perrier Rosé', origin: { es: 'Francia', en: 'France' }, bottle: 150 },
        ],
      },
    ],
  },
  {
    id: 'cervezas',
    title: { es: 'Cervezas', en: 'Beer' },
    groups: [
      {
        items: [
          { id: 'michelob', name: 'Michelob', price: 5 },
          { id: 'heineken', name: 'Heineken', price: 5 },
          { id: 'corona', name: 'Corona', price: 5 },
          { id: 'santurce-double-ipa', name: 'Santurce Double IPA', price: 9 },
          { id: 'santurce-pilsner', name: 'Santurce Pilsner', price: 6 },
          { id: 'medalla', name: 'Medalla', price: 2.5 },
        ],
      },
    ],
  },
];
