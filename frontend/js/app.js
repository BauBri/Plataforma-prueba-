/* Browser-local demonstration. No accounts, API calls or backend actions. */
(() => {
  'use strict';
  const key = 'nekopapata.appearance.v1';
  const defaults = { mode: 'light', accent: '#55664e' };
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const status = document.querySelector('#theme-status');
  let settings = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && ['light', 'dark', 'system'].includes(saved.mode)) settings.mode = saved.mode;
    if (saved && /^#[0-9a-f]{6}$/i.test(saved.accent)) settings.accent = saved.accent;
  } catch { /* Unavailable storage or invalid data: retain safe defaults. */ }
  function foreground(hex) {
    const rgb = hex.match(/[0-9a-f]{2}/gi).map(x => parseInt(x, 16) / 255);
    const linear = rgb.map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
    const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    return luminance > 0.179 ? '#000000' : '#ffffff';
  }
  function apply() {
    root.dataset.mode = settings.mode === 'system' ? (media.matches ? 'dark' : 'light') : settings.mode;
    root.style.setProperty('--accent', settings.accent);
    root.style.setProperty('--on-accent', foreground(settings.accent));
    document.querySelector('#accent').value = settings.accent;
    document.querySelectorAll('[name="mode"]').forEach(input => { input.checked = input.value === settings.mode; });
    document.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === settings.accent)));
  }
  function save() {
    apply();
    try { localStorage.setItem(key, JSON.stringify(settings)); status.textContent = 'Apariencia guardada.'; }
    catch { status.textContent = 'Apariencia aplicada. Este navegador no permite guardarla.'; }
  }
  document.querySelectorAll('[name="mode"]').forEach(input => input.addEventListener('change', () => { settings.mode = input.value; save(); }));
  document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => { settings.accent = button.dataset.color; save(); }));
  document.querySelector('#accent').addEventListener('input', event => { settings.accent = event.target.value; save(); });
  document.querySelector('#reset').addEventListener('click', () => { settings = { ...defaults }; save(); });
  media.addEventListener('change', apply);
  apply();
  const dialog = document.querySelector('#demo-dialog');
  document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
    document.querySelector('#dialog-message').textContent = button.dataset.demo;
    dialog.showModal();
  }));
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function search() {
    const query = normalize(document.querySelector('#search').value);
    let visible = 0;
    document.querySelectorAll('[data-title]').forEach(card => {
      card.hidden = !normalize(card.dataset.title).includes(query);
      if (!card.hidden) visible++;
    });
    document.querySelector('#empty').hidden = visible !== 0;
    document.querySelector('#search-status').textContent = `${visible} historias demo encontradas.`;
  }
  const searchStatus = document.createElement('p');
  searchStatus.id = 'search-status'; searchStatus.className = 'sr-only'; searchStatus.setAttribute('role', 'status');
  document.querySelector('#para-ti').append(searchStatus);
  document.querySelector('#search').addEventListener('input', search);
  document.querySelector('#search-form').addEventListener('submit', event => { event.preventDefault(); search(); document.querySelector('#para-ti').scrollIntoView({ block: 'start' }); });
})();
