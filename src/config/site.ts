export type Lang = 'es' | 'en';
export const langs: Lang[] = ['es', 'en'];

/**
 * Bar details. Everything marked PLACEHOLDER should be confirmed by the bar.
 * Hours use 24h "HH:MM"; a close time past midnight (e.g. "02:00") rolls into the next day.
 */
export const site = {
  name: 'Santurtzi',
  street: 'Calle Cerra',
  area: 'Santurce, San Juan',
  region: 'Puerto Rico',
  timeZone: 'America/Puerto_Rico',
  currency: 'USD',
  // PLACEHOLDER: replace with the bar's real Instagram handle (or set to '').
  instagram: 'santurtzi.pr',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Calle+Cerra+San+Juan+Puerto+Rico',
  // PLACEHOLDER hours. Index 0 = Sunday … 6 = Saturday. null = closed.
  hours: [
    { open: '17:00', close: '00:00' }, // Sun
    null, // Mon
    { open: '18:00', close: '01:00' }, // Tue
    { open: '18:00', close: '01:00' }, // Wed
    { open: '18:00', close: '01:00' }, // Thu
    { open: '18:00', close: '02:00' }, // Fri
    { open: '18:00', close: '02:00' }, // Sat
  ] as ({ open: string; close: string } | null)[],
} as const;
