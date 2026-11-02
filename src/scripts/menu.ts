/**
 * Menu interactivity: drink detail sheets (deep-linked by #slug), taste filters,
 * category scroll-spy, open/closed status and the "my order" list kept on the phone.
 */

type DrinkInfo = { name: string; es: string; price: number; size: string; ok: boolean };
type Hours = ({ open: string; close: string } | null)[];
type Data = {
  lang: 'es' | 'en';
  locale: string;
  currency: string;
  timeZone: string;
  hours: Hours;
  drinks: Record<string, DrinkInfo>;
  esItems: [string, string];
  s: {
    status: { open: string; closed: string; until: string; opensAt: string; today: string; tomorrow: string };
    days: string[];
    results: [string, string];
    items: [string, string];
    inOrder: string;
    remove: string;
    add: string;
    confirmClear: string;
  };
};

const data: Data = JSON.parse(document.getElementById('menu-data')!.textContent!);
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const plural = ([one, other]: [string, string], n: number) => (n === 1 ? one : other.replace('{n}', String(n)));
const money = (n: number) =>
  new Intl.NumberFormat(data.locale, {
    style: 'currency',
    currency: data.currency,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const store = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string | null) {
    try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* private mode */ }
  },
};

/* ---------------- Order ---------------- */

const ORDER_KEY = 'stz-order';
let order: Record<string, number> = {};
try {
  const raw = JSON.parse(store.get(ORDER_KEY) ?? '{}');
  for (const [id, n] of Object.entries(raw)) {
    if (data.drinks[id] && typeof n === 'number' && n > 0) order[id] = Math.min(99, Math.floor(n));
  }
} catch { order = {}; }

const save = () => store.set(ORDER_KEY, Object.keys(order).length ? JSON.stringify(order) : null);
const count = () => Object.values(order).reduce((a, b) => a + b, 0);
const total = () => Object.entries(order).reduce((a, [id, n]) => a + data.drinks[id].price * n, 0);

function bump(el: Element | null) {
  if (!el) return;
  el.classList.remove('bump');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('bump');
}

function change(id: string, delta: number) {
  if (!data.drinks[id] || (delta > 0 && !data.drinks[id].ok)) return;
  const n = Math.max(0, Math.min(99, (order[id] ?? 0) + delta));
  if (n) order[id] = n;
  else delete order[id];
  save();
  render();
  if (delta > 0) {
    bump($(`.card [data-add="${id}"]`));
    bump($('.orderbar'));
    navigator.vibrate?.(12);
  }
}

const orderBar = $('.orderbar')!;
const orderSheet = $<HTMLDialogElement>('#order')!;
const orderList = $('[data-order-list]')!;
const btList = $('[data-bt-list]')!;

function render() {
  const n = count();
  for (const btn of $$('.card [data-add]')) {
    const c = order[btn.dataset.add!] ?? 0;
    if (c) btn.dataset.count = String(c);
    else delete btn.dataset.count;
    btn.querySelector('.add-count')!.textContent = c ? String(c) : '';
  }
  for (const sheet of $$('.drink-sheet')) {
    const c = order[sheet.dataset.sheet!] ?? 0;
    if (c) sheet.dataset.count = String(c);
    else delete sheet.dataset.count;
    sheet.querySelector('[data-qty-label]')!.textContent = c ? data.s.inOrder.replace('{n}', String(c)) : '';
  }

  orderBar.hidden = n === 0;
  $('[data-ob-count]')!.textContent = String(n);
  $('[data-ob-total]')!.textContent = money(total());

  const ids = Object.keys(order).sort((a, b) => Object.keys(data.drinks).indexOf(a) - Object.keys(data.drinks).indexOf(b));
  orderSheet.toggleAttribute('data-has-items', n > 0);
  orderList.innerHTML = ids
    .map((id) => {
      const d = data.drinks[id];
      const q = order[id];
      return `<li>
        <span class="o-name">${esc(d.name)}</span>
        <span class="o-meta">${q} × ${money(d.price)}${d.size ? ` · ${esc(d.size)}` : ''}</span>
        <span class="o-step">
          <button class="icon-btn" type="button" data-remove="${id}" aria-label="${esc(data.s.remove)}: ${esc(d.name)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>
          <span class="o-qty">${q}</span>
          <button class="icon-btn" type="button" data-add="${id}" aria-label="${esc(data.s.add)}: ${esc(d.name)}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
        </span>
      </li>`;
    })
    .join('');
  $('[data-order-total]')!.textContent = money(total());

  // The bartender view always shows the Spanish name, plus the guest's language when it differs.
  btList.innerHTML = ids
    .map((id) => {
      const d = data.drinks[id];
      const sub = d.name !== d.es ? `<span class="bt-sub">${esc(d.name)}</span>` : '';
      return `<li><span class="bt-qty">${order[id]}×</span><span class="bt-name">${esc(d.es)}${sub}</span><span class="bt-price">${money(d.price * order[id])}</span></li>`;
    })
    .join('');
  $('[data-bt-count]')!.textContent = plural(data.esItems, n);
  $('[data-bt-total]')!.textContent = money(total());
}

/* ---------------- Sheets & routing ---------------- */

let current: HTMLDialogElement | null = null;

function lock() {
  document.body.classList.toggle('locked', !!$('dialog[open]'));
}

function closeDialog(dlg: HTMLDialogElement, animate = true) {
  if (!dlg.open) return;
  if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dlg.close();
    lock();
    return;
  }
  dlg.classList.add('closing');
  const done = () => {
    dlg.classList.remove('closing');
    if (current === dlg) return; // reopened while it was closing
    dlg.close();
    lock();
  };
  const t = setTimeout(done, 260);
  dlg.addEventListener('animationend', () => { clearTimeout(t); done(); }, { once: true });
}

function sheetFor(hash: string): HTMLDialogElement | null {
  if (hash === 'pedido') return orderSheet;
  return data.drinks[hash] ? $<HTMLDialogElement>(`#d-${CSS.escape(hash)}`) : null;
}

function route() {
  const next = sheetFor(decodeURIComponent(location.hash.slice(1)));
  if (next === current) return;
  if (current) closeDialog(current, !next);
  current = next;
  if (next) {
    if (next.classList.contains('closing')) next.classList.remove('closing');
    if (!next.open) next.showModal();
    next.querySelector('.sheet-scroll')?.scrollTo(0, 0);
    lock();
  }
}

/** Opens a sheet as a history entry, so the phone's back button closes it. */
function go(hash: string) {
  history.pushState({ stz: true }, '', `#${hash}`);
  route();
}

function dismiss() {
  if (history.state?.stz) history.back();
  else {
    history.replaceState(null, '', location.pathname + location.search);
    route();
  }
}

window.addEventListener('popstate', route);
window.addEventListener('hashchange', route);

for (const dlg of [...$$<HTMLDialogElement>('dialog.sheet')]) {
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    dismiss();
  });
  // Tap on the dimmed backdrop closes the sheet.
  dlg.addEventListener('click', (e) => {
    if (e.target !== dlg) return;
    const r = dlg.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dismiss();
  });
}

/* ---------------- Bartender view ---------------- */

const bartender = $<HTMLDialogElement>('#bartender')!;
let wakeLock: { release(): Promise<void> } | null = null;

async function showBartender() {
  bartender.showModal();
  lock();
  try {
    wakeLock = await (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<{ release(): Promise<void> }> } }).wakeLock?.request('screen') ?? null;
  } catch { wakeLock = null; }
}
function hideBartender() {
  bartender.close();
  wakeLock?.release().catch(() => {});
  wakeLock = null;
  lock();
}
bartender.addEventListener('cancel', (e) => {
  e.preventDefault();
  hideBartender();
});

/* ---------------- Clicks ---------------- */

document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>(
    '[data-open],[data-add],[data-remove],[data-close],[data-open-order],[data-show-bartender],[data-clear-order],[data-filter],[data-clear-filters],[data-lang]',
  );
  if (!el) return;
  const ds = el.dataset;

  if (ds.open) {
    e.preventDefault();
    if (location.hash.slice(1) !== ds.open) go(ds.open);
  } else if (ds.add) {
    change(ds.add, 1);
  } else if (ds.remove) {
    change(ds.remove, -1);
  } else if ('close' in ds) {
    if (el.closest('#bartender')) hideBartender();
    else dismiss();
  } else if ('openOrder' in ds) {
    go('pedido');
  } else if ('showBartender' in ds) {
    showBartender();
  } else if ('clearOrder' in ds) {
    if (confirm(data.s.confirmClear)) {
      order = {};
      save();
      render();
      dismiss();
    }
  } else if (ds.filter) {
    const on = el.getAttribute('aria-pressed') !== 'true';
    el.setAttribute('aria-pressed', String(on));
    applyFilters();
  } else if ('clearFilters' in ds) {
    for (const c of $$('[data-filter]')) c.setAttribute('aria-pressed', 'false');
    applyFilters();
  } else if (ds.lang) {
    store.set('stz-lang', ds.lang);
    const a = el as HTMLAnchorElement;
    if (location.hash) a.href = a.href.split('#')[0] + location.hash;
  }
});

/* ---------------- Filters ---------------- */

const strengthTest: Record<string, (s: number) => boolean> = {
  zero: (s) => s === 0,
  light: (s) => s === 1,
  strong: (s) => s === 3,
};

function applyFilters() {
  const active = $$('[data-filter][aria-pressed="true"]').map((c) => c.dataset.filter!.split(':') as [string, string]);
  const flavors = active.filter(([k]) => k === 'flavor').map(([, v]) => v);
  const strengths = active.filter(([k]) => k === 'strength').map(([, v]) => strengthTest[v]);
  let shown = 0;
  for (const card of $$('.card')) {
    const f = card.dataset.flavor!.split(' ');
    const s = Number(card.dataset.strength);
    const ok = (!flavors.length || flavors.some((x) => f.includes(x))) && (!strengths.length || strengths.some((fn) => fn(s)));
    card.hidden = !ok;
    if (ok) shown++;
  }
  for (const sec of $$('.cat')) {
    const any = $$('.card', sec).some((c) => !c.hidden);
    sec.hidden = !any;
    const link = $(`[data-nav="${sec.dataset.cat}"]`);
    if (link) link.parentElement!.hidden = !any;
  }
  const status = $('[data-filter-status]')!;
  status.hidden = active.length === 0;
  $('[data-results]')!.textContent = plural(data.s.results, shown);
  $('[data-empty]')!.hidden = shown > 0;
  spy();
}

/* ---------------- Scroll-spy ---------------- */

const nav = $('.catnav ul')!;
let activeCat = '';
function spy() {
  const offset = nav.getBoundingClientRect().bottom + 24;
  let id = '';
  for (const sec of $$('.cat')) {
    if (sec.hidden) continue;
    if (sec.getBoundingClientRect().top <= offset) id = sec.dataset.cat!;
    else if (!id) id = sec.dataset.cat!;
  }
  if (id === activeCat) return;
  activeCat = id;
  for (const a of $$('[data-nav]')) a.classList.toggle('active', a.dataset.nav === id);
  const link = $(`[data-nav="${id}"]`);
  if (link) {
    const left = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
    nav.scrollTo({ left, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
}
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { ticking = false; spy(); });
}, { passive: true });

/* ---------------- Open / closed status ---------------- */

function renderStatus() {
  const el = $('[data-status]');
  if (!el) return;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: data.timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const now = Number(get('hour')) * 60 + Number(get('minute'));
  const mins = (hm: string) => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
  const span = (h: { open: string; close: string }) => {
    const o = mins(h.open);
    let c = mins(h.close);
    if (c <= o) c += 1440;
    return [o, c] as const;
  };
  const time = (hm: string) => {
    const [h, m] = hm.split(':').map(Number);
    return new Intl.DateTimeFormat(data.locale, { hour: 'numeric', minute: m ? '2-digit' : undefined, timeZone: 'UTC' })
      .format(Date.UTC(2000, 0, 1, h, m));
  };
  const s = data.s.status;
  let open: string | null = null;
  const today = data.hours[day];
  const yday = data.hours[(day + 6) % 7];
  if (today) { const [o, c] = span(today); if (now >= o && now < c) open = today.close; }
  if (!open && yday) { const [, c] = span(yday); if (now + 1440 < c) open = yday.close; }

  let text: string;
  if (open) text = `${s.open} · ${s.until} ${time(open)}`;
  else {
    let label = '';
    for (let i = 0; i < 7; i++) {
      const h = data.hours[(day + i) % 7];
      if (!h) continue;
      if (i === 0 && now >= mins(h.open)) continue;
      const when = i === 0 ? s.today : i === 1 ? s.tomorrow : data.s.days[(day + i) % 7];
      label = ` · ${s.opensAt} ${when}, ${time(h.open)}`;
      break;
    }
    text = s.closed + label;
  }
  el.classList.toggle('open', !!open);
  el.querySelector('span')!.textContent = text;
  el.hidden = false;
  // Highlight the bar's current "business day" in the footer hours.
  const bizDay = !open || (today && now >= span(today)[0]) ? day : (day + 6) % 7;
  for (const li of $$('[data-day]')) li.classList.toggle('today', Number(li.dataset.day) === bizDay);
}

/* ---------------- Boot ---------------- */

render();
applyFilters();
renderStatus();
setInterval(renderStatus, 60_000);
if (location.hash) {
  // Opened from a shared link: make the sheet a history entry above the plain menu.
  const h = location.hash.slice(1);
  if (sheetFor(decodeURIComponent(h))) {
    history.replaceState(null, '', location.pathname + location.search);
    go(h);
  }
}
