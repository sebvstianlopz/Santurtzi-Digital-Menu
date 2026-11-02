/**
 * Santurtzi menu: cover → printed-menu list (taste filters) → swipeable drink detail (deep-linked by
 * #slug), wine & beer, pasta, and a "tu pedido" list kept on the phone to show the bartender.
 */

type Item = { name: string; es: string; note: string; esNote: string; price: number; ok: boolean };
type Data = {
  lang: 'es' | 'en';
  locale: string;
  currency: string;
  colors: string[];
  ids: string[];
  items: Record<string, Item>;
  s: { items: [string, string]; esItems: [string, string]; remove: string; add: string; confirmClear: string; list: string; cards: string };
};

const data: Data = JSON.parse(document.getElementById('menu-data')!.textContent!);
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const plural = ([one, other]: [string, string], n: number) => (n === 1 ? one : other.replace('{n}', String(n)));
const money = (n: number) =>
  new Intl.NumberFormat(data.locale, { style: 'currency', currency: data.currency, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const store = {
  get(k: string, s: Storage = localStorage) { try { return s.getItem(k); } catch { return null; } },
  set(k: string, v: string | null, s: Storage = localStorage) { try { v === null ? s.removeItem(k) : s.setItem(k, v); } catch { /* private mode */ } },
};
const N = data.ids.length;
const app = $('#app');
const track = $('#track');

/* ---------------- Order ---------------- */

const ORDER_KEY = 'stz-pedido';
let order: Record<string, number> = {};
try {
  for (const [id, n] of Object.entries(JSON.parse(store.get(ORDER_KEY) ?? '{}'))) {
    if (data.items[id] && typeof n === 'number' && n > 0) order[id] = Math.min(99, Math.floor(n));
  }
} catch { order = {}; }
const save = () => store.set(ORDER_KEY, Object.keys(order).length ? JSON.stringify(order) : null);
const count = () => Object.values(order).reduce((a, b) => a + b, 0);
const total = () => Object.entries(order).reduce((a, [id, n]) => a + data.items[id].price * n, 0);
const ordered = () => Object.keys(data.items).filter((id) => order[id]);

function bump(el: Element | null) {
  if (!el) return;
  el.classList.remove('bump');
  void (el as HTMLElement).offsetWidth;
  el.classList.add('bump');
}

function change(id: string, delta: number, from?: Element) {
  const it = data.items[id];
  if (!it || (delta > 0 && !it.ok)) return;
  const n = Math.max(0, Math.min(99, (order[id] ?? 0) + delta));
  if (n) order[id] = n;
  else delete order[id];
  save();
  render();
  if (delta > 0) {
    bump(from ?? null);
    bump(detail.open ? $('.mini-order') : $('#orderbar'));
    navigator.vibrate?.(10);
  }
}

function render() {
  for (const btn of $$('[data-add]')) {
    const c = order[btn.dataset.add!] ?? 0;
    if (c) btn.dataset.count = String(c);
    else delete btn.dataset.count;
    const n = btn.querySelector('.n');
    if (n) n.textContent = c ? String(c) : '';
  }
  const n = count();
  $('#orderbar').hidden = n === 0;
  for (const el of $$('[data-ob-count]')) el.textContent = String(n);
  $('.mini-order').hidden = n === 0;
  $('[data-ob-total]').textContent = money(total());

  const ids = ordered();
  const sheet = $('#order');
  sheet.toggleAttribute('data-has-items', n > 0);
  $('[data-order-count]').textContent = n ? plural(data.s.items, n) : '';
  $('[data-order-list]').innerHTML = ids
    .map((id) => {
      const it = data.items[id];
      const q = order[id];
      return `<li>
        <span class="o-name">${esc(it.name)}</span>
        <span class="o-meta">${it.note ? `${esc(it.note)} · ` : ''}${q} × ${money(it.price)}</span>
        <span class="o-step">
          <button type="button" data-remove="${id}" aria-label="${esc(data.s.remove)}: ${esc(it.name)}">−</button>
          <span class="o-qty">${q}</span>
          <button type="button" data-add="${id}" aria-label="${esc(data.s.add)}: ${esc(it.name)}">+</button>
        </span>
      </li>`;
    })
    .join('');
  $('[data-order-total]').textContent = money(total());

  // The bartender always reads Spanish names.
  $('[data-bt-list]').innerHTML = ids
    .map((id) => {
      const it = data.items[id];
      return `<li><span class="bt-q">${order[id]}</span><span class="bt-name">${esc(it.es)}${it.esNote ? `<small>${esc(it.esNote)}</small>` : ''}</span><span class="price">${money(it.price * order[id])}</span></li>`;
    })
    .join('');
  $('[data-bt-count]').textContent = plural(data.s.esItems, n);
  $('[data-bt-total]').textContent = money(total());
}

/* ---------------- Dialogs (sheets, order, bartender) ---------------- */
// Each open dialog is a history entry, so the phone's back button closes it.

const stack: HTMLDialogElement[] = [];
let wakeLock: { release(): Promise<void> } | null = null;

function openDialog(dlg: HTMLDialogElement) {
  if (dlg.open) return;
  dlg.classList.remove('closing');
  dlg.showModal();
  stack.push(dlg);
  history.pushState({ stz: stack.length }, '', location.href);
  if (dlg.id === 'bartender') {
    (navigator as Navigator & { wakeLock?: { request(t: 'screen'): Promise<{ release(): Promise<void> }> } }).wakeLock
      ?.request('screen').then((l) => (wakeLock = l)).catch(() => {});
  }
}

function closeTop(animate = true) {
  const dlg = stack.pop();
  if (!dlg) return;
  if (dlg.id === 'bartender') { wakeLock?.release().catch(() => {}); wakeLock = null; }
  dlg.style.transform = '';
  if (!animate || reduce() || dlg.id === 'bartender') { dlg.close(); return; }
  dlg.classList.add('closing');
  const done = () => { dlg.classList.remove('closing'); dlg.close(); };
  const t = setTimeout(done, 240);
  dlg.addEventListener('animationend', () => { clearTimeout(t); done(); }, { once: true });
}

/** Close the top dialog through history, so back-button and close-button behave the same. */
function requestClose() {
  if (history.state?.stz) history.back();
  else closeTop();
}
addEventListener('popstate', () => {
  const depth = history.state?.stz ?? 0;
  while (stack.length > depth) closeTop(stack.length === depth + 1);
});

for (const dlg of $$<HTMLDialogElement>('dialog')) {
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); requestClose(); });
  dlg.addEventListener('click', (e) => {
    if (e.target !== dlg) return;
    const r = dlg.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) requestClose();
  });
  // Drag the grab handle down to dismiss.
  const grab = dlg.querySelector<HTMLElement>('.grab');
  if (!grab) continue;
  let y0: number | null = null;
  grab.addEventListener('pointerdown', (e) => { y0 = e.clientY; grab.setPointerCapture(e.pointerId); dlg.style.transition = 'none'; });
  grab.addEventListener('pointermove', (e) => { if (y0 !== null) dlg.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)`; });
  const end = (e: PointerEvent) => {
    if (y0 === null) return;
    const dy = e.clientY - y0;
    y0 = null;
    dlg.style.transition = '';
    if (dy > 80) requestClose();
    else dlg.style.transform = '';
  };
  grab.addEventListener('pointerup', end);
  grab.addEventListener('pointercancel', end);
}

/* ---------------- Sections (tabs) ---------------- */

type Section = 'cocktails' | 'bar' | 'pasta';
let section: Section = 'cocktails';
const themeColor = { cocktails: '#3d0b12', bar: '#16231b', pasta: '#120d0a' };
const panels: Record<Section, HTMLElement> = { cocktails: $('#cocktailsPanel'), bar: $('#barPanel'), pasta: $('#pastaPanel') };

function setSection(sec: Section, updateHash = true) {
  section = sec;
  app.dataset.section = sec;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor[sec]);
  for (const [k, el] of Object.entries(panels)) el.hidden = k !== sec;
  for (const tab of $$('[data-tab]')) {
    const on = tab.dataset.tab === sec;
    tab.setAttribute('aria-selected', String(on));
    tab.tabIndex = on ? 0 : -1;
  }
  panels[sec].scrollTop = 0;
  if (updateHash) history.replaceState(history.state, '', sec === 'bar' ? '#vinos' : sec === 'pasta' ? '#pasta' : location.pathname + location.search);
}

const tabs = $$('[data-tab]');
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => setSection(tab.dataset.tab as Section));
  tab.addEventListener('keydown', (e) => {
    const k = (e as KeyboardEvent).key;
    if (k !== 'ArrowRight' && k !== 'ArrowLeft') return;
    const next = tabs[(i + (k === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    next.click();
  });
});

/* ---------------- Drink detail (swipe cards) ---------------- */

const detail = $<HTMLDialogElement>('#detail');
let cur = -1;
const hex = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, k) => Math.round(v + (B[k] - v) * t).toString(16).padStart(2, '0')).join('');
};
const dots = $$('.dots i');
const [prevBtn, nextBtn] = $$<HTMLButtonElement>('[data-step]');
let hashTimer = 0;
let target: number | null = null;

function onScroll() {
  const w = track.clientWidth || 1;
  const f = Math.max(0, Math.min(N - 1, track.scrollLeft / w));
  const lo = Math.floor(f), hi = Math.min(N - 1, lo + 1);
  detail.style.setProperty('--c1', mix(data.colors[lo], data.colors[hi], f - lo));
  const c = Math.round(f);
  if (target !== null && Math.abs(f - target) < 0.01) target = null;
  if (c === cur) return;
  cur = c;
  dots.forEach((d, i) => d.classList.toggle('on', i === cur));
  $('#cur').textContent = String(cur + 1).padStart(2, '0');
  prevBtn.disabled = cur === 0;
  nextBtn.disabled = cur === N - 1;
  clearTimeout(hashTimer);
  hashTimer = window.setTimeout(() => { if (detail.open) history.replaceState(history.state, '', `#${data.ids[cur]}`); }, 250);
}
let ticking = false;
track.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { ticking = false; onScroll(); });
}, { passive: true });
track.addEventListener('scrollend', () => { target = null; });

function goTo(i: number, smooth = false) {
  track.scrollTo({ left: i * track.clientWidth, behavior: smooth && !reduce() ? 'smooth' : 'auto' });
  onScroll();
}
// Remember where a smooth scroll is heading, so quick repeated taps keep advancing.
for (const b of [prevBtn, nextBtn]) {
  b.addEventListener('click', () => {
    target = Math.max(0, Math.min(N - 1, (target ?? cur) + Number(b.dataset.step)));
    goTo(target, true);
  });
}
addEventListener('resize', () => { if (detail.open) goTo(cur); });
addEventListener('keydown', (e) => {
  if (stack[stack.length - 1] !== detail) return;
  if (e.key === 'ArrowRight') nextBtn.click();
  if (e.key === 'ArrowLeft') prevBtn.click();
});

let listScroll = 0;
function openDetail(id: string) {
  const i = data.ids.indexOf(id);
  if (i < 0) return;
  listScroll = panels.cocktails.scrollTop;
  openDialog(detail);
  cur = -1;
  goTo(i);
  history.replaceState(history.state, '', `#${id}`);
}
// Closing returns focus to the tapped row, which can scroll the list; put it back where it was.
detail.addEventListener('close', () => {
  const restore = () => { panels.cocktails.scrollTop = listScroll; };
  restore();
  requestAnimationFrame(restore);
  setTimeout(restore, 50);
});

/* ---------------- List filters + reveal ---------------- */

function applyFilter(k: string) {
  for (const c of $$('[data-filter]')) c.setAttribute('aria-pressed', String(c.dataset.filter === k));
  let shown = 0;
  for (const row of $$('.menu-list .item')) {
    const ok = !k || row.dataset.taste!.split(' ').includes(k);
    row.hidden = !ok;
    if (ok) { shown++; row.classList.add('seen'); }
  }
  for (const h of $$('.menu-list .grp')) h.hidden = !$$(`.menu-list .item[data-group="${h.dataset.group}"]`).some((r) => !r.hidden);
  $('[data-empty]').hidden = shown > 0;
}

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.menu-list .item').forEach((el) => io.observe(el));
} else {
  $$('.menu-list .item').forEach((el) => el.classList.add('seen'));
}

/* ---------------- Clicks ---------------- */

document.addEventListener('click', (e) => {
  const el = (e.target as Element).closest<HTMLElement>('[data-add],[data-remove],[data-sheet],[data-close],[data-open-order],[data-show-bartender],[data-clear-order],[data-open],[data-filter],[data-lang]');
  if (!el) return;
  const ds = el.dataset;
  if (ds.add) change(ds.add, 1, el);
  else if (ds.remove) change(ds.remove, -1);
  else if (ds.sheet) openDialog($<HTMLDialogElement>(`#s-${CSS.escape(ds.sheet)}`));
  else if ('close' in ds) requestClose();
  else if ('openOrder' in ds) openDialog($<HTMLDialogElement>('#order'));
  else if ('showBartender' in ds) openDialog($<HTMLDialogElement>('#bartender'));
  else if ('clearOrder' in ds) {
    if (confirm(data.s.confirmClear)) { order = {}; save(); render(); requestClose(); }
  } else if (ds.open) openDetail(ds.open);
  else if (ds.filter !== undefined) applyFilter(ds.filter);
  else if (ds.lang) {
    store.set('stz-lang', ds.lang);
    store.set('stz-in', '1', sessionStorage);
    const a = el as HTMLAnchorElement;
    a.href = a.href.split('#')[0] + location.hash;
  }
});

/* ---------------- Cover ---------------- */

const cover = $('#cover');
const coverShown = () => !document.documentElement.classList.contains('in') && !cover.hidden;

$('#open').addEventListener('click', () => {
  store.set('stz-in', '1', sessionStorage);
  if (reduce()) { cover.hidden = true; return; }
  const pour = $('#pour');
  pour.classList.add('on');
  setTimeout(() => { cover.hidden = true; }, 320);
  setTimeout(() => pour.classList.remove('on'), 1250);
});

/** Lay out the hallway so its vanishing point sits behind the logo. */
function layoutHall() {
  if (!coverShown()) return;
  const R = cover.getBoundingClientRect();
  const L = $('.logo', cover).getBoundingClientRect();
  const W = R.width, H = R.height, vx = W / 2, vy = L.top - R.top + L.height * 0.42;
  const w0 = Math.min(170, W * 0.44), h0 = (w0 * 210) / 190, y0 = Math.max(12, H * 0.025) + h0 / 2 + 10, D0 = vy - y0;
  $$('.hall .ch', cover).forEach((el, k) => {
    const sc = 1 / (1 + k * 0.85);
    el.style.width = `${(w0 * sc).toFixed(1)}px`;
    el.style.top = `${(vy - D0 * sc).toFixed(1)}px`;
    el.style.opacity = (1 - k * 0.13).toFixed(2);
    el.style.filter = k ? `blur(${(k * 0.1).toFixed(2)}px) brightness(${(1 - k * 0.08).toFixed(2)})` : 'none';
    el.style.zIndex = String(10 - k);
  });
  const vp = $('#vp');
  vp.style.left = `${vx}px`;
  vp.style.top = `${vy}px`;
  const P = (x: number, y: number, t: number) => [vx + (x - vx) * t, vy + (y - vy) * t];
  const g = 'rgba(212,176,112,';
  const ln = (a: number[], b: number[], o: string | number) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${g}${o})" stroke-width="1"/>`;
  const corners = [[0, 0], [W, 0], [W, H], [0, H]];
  let out = '';
  corners.forEach((c) => { out += ln(P(c[0], c[1], 0.1), c, 0.22); });
  out += `<polygon points="${corners.map((c) => P(c[0], c[1], 0.1).join(',')).join(' ')}" fill="rgba(255,196,130,.05)" stroke="${g}.25)" stroke-width="1"/>`;
  [0.18, 0.28, 0.42, 0.64].forEach((t, i) => {
    for (const [x1, y1, x2, y2] of [[0, 0, 0, H], [W, 0, W, H]]) {
      const a = P(x1, y1, t), b = P(x2, y2, t);
      out += ln(a, b, (0.08 + 0.05 * i).toFixed(2));
      const sy = a[1] + (b[1] - a[1]) * 0.38, sx = a[0], r = 3 + 9 * t;
      out += `<circle cx="${sx}" cy="${sy}" r="${(r * 1.7).toFixed(1)}" fill="rgba(255,190,120,${(0.04 + 0.04 * t).toFixed(3)})"/><circle cx="${sx}" cy="${sy}" r="${(r * 0.45).toFixed(1)}" fill="rgba(255,220,170,${(0.25 + 0.3 * t).toFixed(2)})"/>`;
    }
  });
  [0.1, 0.2, 0.32, 0.48, 0.7].forEach((t) => { out += ln(P(0, H, t), P(W, H, t), (0.04 + 0.06 * t).toFixed(3)); });
  const svg = $('#hallLines');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = out;
}
addEventListener('resize', layoutHall);
document.fonts?.ready.then(layoutHall);

/* ---------------- Boot ---------------- */

render();
layoutHall();
const h = decodeURIComponent(location.hash.slice(1));
if (h === 'vinos') setSection('bar', false);
else if (h === 'pasta') setSection('pasta', false);
else if (data.ids.includes(h)) {
  // Opened from a shared drink link: keep the plain menu underneath as the "back" target.
  history.replaceState(null, '', location.pathname + location.search);
  openDetail(h);
}
