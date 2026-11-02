# Santurtzi Digital Menu

The QR menu for **Santurtzi La Cerra**, a night bar in La Cerra, Santurce, San Juan, Puerto Rico. Guests scan the code on the table and see:

- **a cover:** a hallway of chandeliers leading to the logo
- **the cocktails:** one per card, swiped like turning the pages of the printed menu
- **a list view** filtered by taste ("¿Qué te apetece hoy?")
- **wine & beer**
- **pasta**, coming soon

Every drink has an **Agregar** button. The guest builds an order, taps **Mostrar al bartender**, and gets a large-print, cream-on-black summary in Spanish for the bartender to read.

- **Live menu:** https://sebvstianlopz.github.io/Santurtzi-Digital-Menu/ (English: `/en/`)
- **Printable table card with the QR code:** https://sebvstianlopz.github.io/Santurtzi-Digital-Menu/qr/

Phones set to English open the English menu automatically, and the ES/EN button switches languages. The cover shows once per visit. Links like `…/#antonio`, `#vinos` or `#pasta` open straight to that drink or tab.

## Edit the cocktails

Each cocktail is a folder in `src/content/cocktails/<slug>/` with a `data.yaml` file:

```yaml
name: Perla Rosada
group: casa              # casa = Cócteles de la casa · mas = Más cócteles
order: 3                 # position in the swipe order
price: 11
color: '#6e1f3a'         # mood colour: tints the light behind the card
taste: [bubbly, fruity]  # 1–3 of: citrus sweet fruity bubbly spicy coffee fresh floral creamy herbal smooth spiced tropical ginger
line:                    # the short note on the card (keep the quotes)
  es: "Rosado, frío y con burbujas."
  en: "Pink, cold and sparkling."
base:                    # spirits, shown big on the recipe card
  - { es: Champán, en: Champagne }
  - Bombay Gin           # same word in both languages
mix: infused             # infused → "infusionado con …" · with → "con …"
adds:
  - { es: Jengibre, en: Ginger }
photo: ./photo.webp      # optional cut-out photo (transparent background)
scale: 0.96              # glass height relative to the others (0.4–1)
available: true          # false = "Agotado hoy" for the night
```

- **No photo?** The card shows the recipe in an art-deco frame instead, as the printed menu does.
- **Adding a photo:** put a cut-out image with a transparent background in the folder and add `photo:` and `scale:`. The build resizes and compresses it.
- **Add or remove a cocktail:** copy or delete a folder.

## Edit wine, sparkling and beer

Names and prices are in `src/data/bar.ts`. An item has one `price`, or a `glass` and a `bottle` price.

## Text, logo and images

- All interface text in both languages: `src/i18n/index.ts`
- Logo, mermaids, chandelier, corner ornament and hallway photo: `src/assets/`

## Run it locally

```sh
npm install
npm run dev        # http://localhost:4321/
npm run check      # type + content validation
npm run build      # static site in dist/
```

## Deploy

Pushing to `main` runs `.github/workflows/pages.yml`, which builds and publishes the site on GitHub Pages. The site address comes from GitHub, so a custom domain only needs to be set under **Settings → Pages → Custom domain**. The QR code on `/qr/` always points at the deployed address, so **reprint the cards after changing the domain**.

## Print the QR cards

Open `/qr/` and press **Imprimir**. The card is 4×6 in. Test-scan a printed card before laminating.
