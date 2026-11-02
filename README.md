# Santurtzi Digital Menu

The QR menu for **Santurtzi La Cerra**, a night bar in La Cerra, Santurce, San Juan, Puerto Rico. It's designed like a vintage speakeasy printed menu: dark jewel tones, gold and ivory linework, upright Bodoni capitals, sparkle stars, diamond rules and line-art glassware.

Guests scan the code on the table and see:
- **a cover:** a hallway of chandeliers leading to the logo
- **Cócteles** (burgundy): the printed-menu list with taste filters ("¿Qué te apetece hoy?"). Tapping a drink opens its card (photo or line-art glass plus the recipe), and you can swipe between drinks.
- **Vinos y cervezas** (forest green): boxed tables with a separate price column
- **Pasta** (espresso): coming soon

Every drink and price has a **+** button. The guest builds an order, taps **Mostrar al bartender**, and gets an ivory ticket with the drinks in Spanish.

- **Live menu:** https://sebvstianlopz.github.io/Santurtzi-Digital-Menu/ (English: `/en/`)
- **Printable table card with the QR code:** https://sebvstianlopz.github.io/Santurtzi-Digital-Menu/qr/

Phones set to English open the English menu automatically, and the ES/EN button switches languages. The cover shows once per visit. Links like `…/#antonio`, `#vinos` or `#pasta` open straight to that drink or section.

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
glass: flute             # coupe martini flute rocks highball wine: drawn as line art until there's a photo
photo: ./photo.webp      # optional cut-out photo (transparent background)
scale: 0.96              # glass height relative to the others (0.4–1)
available: true          # false = "Agotado hoy" for the night
```

- **No photo?** The card shows the drink's glass as line art above the recipe, in an art-deco frame.
- **Adding a photo:** put a cut-out image with a transparent background in the folder and add `photo:` and `scale:`. The build resizes and compresses it.
- **Add or remove a cocktail:** copy or delete a folder.

## Edit wine, sparkling and beer

Names and prices are in `src/data/bar.ts`. An item has one `price`, or a `glass` and a `bottle` price.

## Text, logo and images

- All interface text in both languages: `src/i18n/index.ts`
- Logo, mermaids, chandelier, corner ornament and hallway photo: `src/assets/`
- Ornaments (sparkle star, diamond rule, line-art glasses, monogram, filigree): `src/components/`
- Section colours (burgundy, forest, espresso) and gold/ivory ink: the top of `src/styles/global.css`

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
