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

const es = {
  htmlLang: 'es-PR',
  switchLabel: 'EN',
  switchAria: 'View the menu in English',
  metaTitle: 'Santurtzi La Cerra · Carta',
  metaDesc: 'La carta de Santurtzi La Cerra, Santurce: cócteles de la casa, vinos, cervezas y pasta. Ingredientes y precios de cada trago.',
  welcome: 'Bienvenido. Acomódate, que la noche apenas empieza.',
  offer: 'Cócteles de la casa · Vinos y cervezas · Pasta',
  open: 'Ver la carta',
  preparing: 'Preparando tu carta',
  carta: 'La carta',
  backToMenu: 'Volver a la carta',
  details: (n: string) => `Ver ${n}`,
  houseNote: 'Recetas de nuestra barra',
  barNote: 'Por copa, por botella y bien frías',
  tabs: { cocktails: 'Cócteles', bar: 'Vinos y cervezas', pasta: 'Pasta' },
  view: { list: 'Lista', cards: 'Tarjetas' },
  group: { casa: 'Cócteles de la casa', mas: 'Más cócteles' },
  infused1: 'infusionado con',
  infusedN: 'infusionados con',
  with: 'con',
  taste: {
    citrus: 'Cítrico', sweet: 'Dulce', fruity: 'Frutal', bubbly: 'Burbujeante', spicy: 'Picante', coffee: 'Café',
    fresh: 'Refrescante', floral: 'Floral', creamy: 'Cremoso', herbal: 'Herbal', smooth: 'Suave', spiced: 'Especiado',
    tropical: 'Tropical', ginger: 'Jengibre',
  },
  mood: '¿Qué te apetece hoy?',
  all: 'Todos',
  none: 'Nada con ese sabor todavía.',
  swipe: 'Desliza',
  prev: 'Trago anterior',
  next: 'Siguiente trago',
  ingredients: 'Ingredientes',
  add: 'Agregar',
  addAria: (name: string) => `Agregar ${name} al pedido`,
  addToOrder: 'Agregar al pedido',
  soldOut: 'Agotado hoy',
  glass: 'Copa',
  bottle: 'Botella',
  cheers: '¡Salud!',
  pasta: {
    text: 'Pasta hecha en casa para acompañar el segundo trago, y el tercero.',
    soon: 'Muy pronto',
  },
  order: {
    title: 'Tu pedido',
    bar: 'Ver pedido',
    empty: 'Todavía no has agregado nada. Toca Agregar en cualquier trago.',
    total: 'Total',
    note: 'Precios en dólares.',
    show: 'Mostrar al bartender',
    clear: 'Vaciar pedido',
    confirmClear: '¿Vaciar el pedido?',
    bartenderTitle: 'Pedido',
    bartenderHint: 'Muestra esta pantalla al bartender',
    back: 'Volver a la carta',
    remove: 'Quitar uno',
    items: (n: number) => (n === 1 ? '1 trago' : `${n} tragos`),
  },
  close: 'Cerrar',
  footer: 'Bebe con responsabilidad. ¿Alergias? Avísale al bartender.',
  qr: { scan: 'Escanea la carta', print: 'Imprimir' },
};

export type Dict = typeof es;

const en: Dict = {
  htmlLang: 'en-US',
  switchLabel: 'ES',
  switchAria: 'Ver la carta en español',
  metaTitle: 'Santurtzi La Cerra · Menu',
  metaDesc: 'The menu at Santurtzi La Cerra, Santurce: house cocktails, wine, beer and pasta. Ingredients and prices for every drink.',
  welcome: 'Welcome. Pull up a chair, the night is just starting.',
  offer: 'House cocktails · Wine & beer · Pasta',
  open: 'See the menu',
  preparing: 'Preparing your menu',
  carta: 'The menu',
  backToMenu: 'Back to the menu',
  details: (n: string) => `See ${n}`,
  houseNote: 'Recipes from our bar',
  barNote: 'By the glass, by the bottle, ice cold',
  tabs: { cocktails: 'Cocktails', bar: 'Wine & beer', pasta: 'Pasta' },
  view: { list: 'List', cards: 'Cards' },
  group: { casa: 'House cocktails', mas: 'More cocktails' },
  infused1: 'infused with',
  infusedN: 'infused with',
  with: 'with',
  taste: {
    citrus: 'Citrus', sweet: 'Sweet', fruity: 'Fruity', bubbly: 'Sparkling', spicy: 'Spicy', coffee: 'Coffee',
    fresh: 'Refreshing', floral: 'Floral', creamy: 'Creamy', herbal: 'Herbal', smooth: 'Smooth', spiced: 'Spiced',
    tropical: 'Tropical', ginger: 'Ginger',
  },
  mood: 'What are you in the mood for?',
  all: 'All',
  none: 'Nothing with that flavor yet.',
  swipe: 'Swipe',
  prev: 'Previous drink',
  next: 'Next drink',
  ingredients: 'Ingredients',
  add: 'Add',
  addAria: (name: string) => `Add ${name} to order`,
  addToOrder: 'Add to order',
  soldOut: 'Sold out tonight',
  glass: 'Glass',
  bottle: 'Bottle',
  cheers: 'Cheers!',
  pasta: {
    text: 'House-made pasta to go with the second drink, and the third.',
    soon: 'Coming soon',
  },
  order: {
    title: 'Your order',
    bar: 'View order',
    empty: "You haven't added anything yet. Tap Add on any drink.",
    total: 'Total',
    note: 'Prices in US dollars.',
    show: 'Show the bartender',
    clear: 'Clear order',
    confirmClear: 'Clear the order?',
    bartenderTitle: 'Pedido',
    bartenderHint: 'Show this screen to the bartender',
    back: 'Back to the menu',
    remove: 'Remove one',
    items: (n: number) => (n === 1 ? '1 drink' : `${n} drinks`),
  },
  close: 'Close',
  footer: 'Please drink responsibly. Allergies? Tell the bartender.',
  qr: { scan: 'Scan the menu', print: 'Print' },
};

const dicts = { es, en };
export const t = (lang: Lang): Dict => dicts[lang];
