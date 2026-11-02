import type { Lang } from '../config/site';
import { site } from '../config/site';

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** URL of the menu page for a language, with the deploy base path. */
export const menuPath = (lang: Lang) => base + (lang === 'en' ? 'en/' : '');
export const asset = (p: string) => base + p.replace(/^\//, '');

export type Text = string | { es: string; en: string };
export const tx = (v: Text, lang: Lang) => (typeof v === 'string' ? v : v[lang]);

export function formatPrice(n: number, lang: Lang) {
  return new Intl.NumberFormat(lang === 'es' ? 'es-PR' : 'en-US', {
    style: 'currency',
    currency: site.currency,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

/** "18:00" → "6 p. m." / "6 PM" */
export function formatTime(hm: string, lang: Lang) {
  const [h, m] = hm.split(':').map(Number);
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-PR' : 'en-US', { hour: 'numeric', minute: m ? '2-digit' : undefined, timeZone: 'UTC' })
    .format(Date.UTC(2000, 0, 1, h, m));
}

const es = {
  htmlLang: 'es-PR',
  switchLabel: 'EN',
  switchAria: 'View the menu in English',
  tagline: 'Bar de copas',
  metaTitle: 'Santurtzi · Menú de bebidas',
  metaDesc: 'Menú digital de Santurtzi, bar en la Calle Cerra, San Juan. Fotos, ingredientes y precios de cada trago.',
  hint: 'Toca un trago para ver detalles. Agrégalo con +, y muéstrale tu pedido al bartender.',
  status: { open: 'Abierto', closed: 'Cerrado', until: 'hasta las', opensAt: 'Abre', today: 'hoy', tomorrow: 'mañana' },
  menuNav: 'Categorías',
  filtersLabel: 'Filtrar por gusto',
  results: (n: number) => (n === 1 ? '1 trago' : `${n} tragos`),
  clear: 'Quitar filtros',
  noResults: 'Ningún trago combina esos filtros.',
  category: {
    casa: { name: 'De la casa', sub: 'Creaciones de nuestra barra. Si no sabes qué pedir, empieza aquí.' },
    clasicos: { name: 'Clásicos', sub: 'Las recetas de siempre, bien hechas.' },
    'sin-alcohol': { name: 'Sin alcohol', sub: 'Todo el sabor, cero alcohol.' },
    cervezas: { name: 'Cervezas', sub: 'Bien frías.' },
    vinos: { name: 'Vinos', sub: 'Por copa.' },
    shots: { name: 'Shots', sub: 'Para brindar.' },
  },
  flavor: {
    refrescante: 'Refrescante', citrico: 'Cítrico', dulce: 'Dulce', afrutado: 'Afrutado',
    amargo: 'Amargo', herbal: 'Herbal', cremoso: 'Cremoso', ahumado: 'Ahumado',
  },
  filter: { light: 'Suave', strong: 'Fuerte', zero: 'Sin alcohol' },
  strength: ['Sin alcohol', 'Suave', 'Medio', 'Fuerte'],
  strengthLabel: 'Intensidad',
  glass: {
    rocks: 'Vaso corto', highball: 'Vaso alto', coupe: 'Copa coupé', martini: 'Copa martini', copa: 'Copa balón',
    wine: 'Copa de vino', hurricane: 'Copa hurricane', pint: 'Vaso pinta', bottle: 'Botella', shot: 'Vaso de shot',
  },
  allergen: { lacteos: 'Lácteos', coco: 'Coco', huevo: 'Huevo', gluten: 'Gluten', 'frutos-secos': 'Frutos secos' },
  badge: { signature: 'De la casa', seasonal: 'Temporada', soldOut: 'Agotado hoy', illustration: 'Ilustración' },
  sheet: {
    ingredients: 'Ingredientes',
    base: 'Base',
    glass: 'Se sirve en',
    profile: 'Perfil',
    contains: 'Contiene',
    pairs: 'Si te gusta este, prueba',
    close: 'Cerrar',
  },
  add: 'Agregar',
  addAria: (name: string) => `Agregar ${name} al pedido`,
  addToOrder: 'Agregar al pedido',
  inOrder: (n: number) => `${n} en tu pedido`,
  remove: 'Quitar uno',
  order: {
    title: 'Mi pedido',
    bar: 'Ver pedido',
    empty: 'Tu pedido está vacío. Toca + en cualquier trago para agregarlo.',
    total: 'Total',
    note: 'Precios en USD. Propina no incluida.',
    show: 'Mostrar al bartender',
    clear: 'Vaciar pedido',
    confirmClear: '¿Vaciar el pedido?',
    bartenderTitle: 'Pedido',
    bartenderHint: 'Muestra esta pantalla al bartender',
    back: 'Volver',
    items: (n: number) => (n === 1 ? '1 trago' : `${n} tragos`),
  },
  footer: {
    responsibly: 'Bebe con responsabilidad. Se requiere identificación (18+).',
    allergies: '¿Alergias? Avísale al bartender antes de pedir.',
    map: 'Cómo llegar',
    hours: 'Horario',
    closed: 'Cerrado',
    days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  },
  qr: { scan: 'Escanea el menú', print: 'Imprimir' },
};

export type Dict = typeof es;

const en: Dict = {
  htmlLang: 'en-US',
  switchLabel: 'ES',
  switchAria: 'Ver el menú en español',
  tagline: 'Cocktail bar',
  metaTitle: 'Santurtzi · Drinks menu',
  metaDesc: 'Digital menu for Santurtzi, a bar on Calle Cerra, San Juan. Photos, ingredients and prices for every drink.',
  hint: 'Tap a drink for details. Add it with +, then show your order to the bartender.',
  status: { open: 'Open', closed: 'Closed', until: 'until', opensAt: 'Opens', today: 'today', tomorrow: 'tomorrow' },
  menuNav: 'Categories',
  filtersLabel: 'Filter by taste',
  results: (n: number) => (n === 1 ? '1 drink' : `${n} drinks`),
  clear: 'Clear filters',
  noResults: 'No drink matches those filters.',
  category: {
    casa: { name: 'House drinks', sub: 'Created at our bar. Not sure what to order? Start here.' },
    clasicos: { name: 'Classics', sub: 'The timeless recipes, done right.' },
    'sin-alcohol': { name: 'Alcohol-free', sub: 'All the flavor, zero alcohol.' },
    cervezas: { name: 'Beer', sub: 'Ice cold.' },
    vinos: { name: 'Wine', sub: 'By the glass.' },
    shots: { name: 'Shots', sub: 'For the toast.' },
  },
  flavor: {
    refrescante: 'Refreshing', citrico: 'Citrus', dulce: 'Sweet', afrutado: 'Fruity',
    amargo: 'Bitter', herbal: 'Herbal', cremoso: 'Creamy', ahumado: 'Smoky',
  },
  filter: { light: 'Light', strong: 'Strong', zero: 'Alcohol-free' },
  strength: ['Alcohol-free', 'Light', 'Medium', 'Strong'],
  strengthLabel: 'Strength',
  glass: {
    rocks: 'Rocks glass', highball: 'Highball', coupe: 'Coupe', martini: 'Martini glass', copa: 'Balloon glass',
    wine: 'Wine glass', hurricane: 'Hurricane glass', pint: 'Pint', bottle: 'Bottle', shot: 'Shot glass',
  },
  allergen: { lacteos: 'Dairy', coco: 'Coconut', huevo: 'Egg', gluten: 'Gluten', 'frutos-secos': 'Nuts' },
  badge: { signature: 'House', seasonal: 'Seasonal', soldOut: 'Sold out tonight', illustration: 'Illustration' },
  sheet: {
    ingredients: 'Ingredients',
    base: 'Base',
    glass: 'Served in',
    profile: 'Profile',
    contains: 'Contains',
    pairs: 'If you like this, try',
    close: 'Close',
  },
  add: 'Add',
  addAria: (name: string) => `Add ${name} to order`,
  addToOrder: 'Add to order',
  inOrder: (n: number) => `${n} in your order`,
  remove: 'Remove one',
  order: {
    title: 'My order',
    bar: 'View order',
    empty: 'Your order is empty. Tap + on any drink to add it.',
    total: 'Total',
    note: 'Prices in USD. Tip not included.',
    show: 'Show the bartender',
    clear: 'Clear order',
    confirmClear: 'Clear the order?',
    bartenderTitle: 'Pedido · Order',
    bartenderHint: 'Show this screen to the bartender',
    back: 'Back',
    items: (n: number) => (n === 1 ? '1 drink' : `${n} drinks`),
  },
  footer: {
    responsibly: 'Please drink responsibly. ID required (18+).',
    allergies: 'Allergies? Tell the bartender before ordering.',
    map: 'Directions',
    hours: 'Hours',
    closed: 'Closed',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  qr: { scan: 'Scan the menu', print: 'Print' },
};

const dicts = { es, en };
export const t = (lang: Lang): Dict => dicts[lang];
