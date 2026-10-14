(() => {
  'use strict';
  const key = 'nekopapata.appearance.v1';
  const defaults = { mode: 'light', accent: '#55664e' };
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let settings;
  function restore() {
    settings = { ...defaults };
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved && ['light', 'dark', 'system'].includes(saved.mode)) settings.mode = saved.mode;
      if (saved && /^#[0-9a-f]{6}$/i.test(saved.accent)) settings.accent = saved.accent;
    } catch { /* Unavailable storage or invalid data: retain safe defaults. */ }
  }
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
    const accent = document.querySelector('#accent');
    if (accent) accent.value = settings.accent;
    document.querySelectorAll('[name="mode"]').forEach(input => { input.checked = input.value === settings.mode; });
    document.querySelectorAll('[data-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.color === settings.accent)));
  }
  function save() {
    apply();
    const status = document.querySelector('#theme-status');
    try {
      localStorage.setItem(key, JSON.stringify(settings));
      if (status) status.textContent = 'Apariencia guardada.';
    } catch {
      if (status) status.textContent = 'Apariencia aplicada. Este navegador no permite guardarla.';
    }
  }
  restore();
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('pageshow', () => { restore(); apply(); });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { restore(); apply(); }
  });
  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.querySelectorAll('[name="mode"]').forEach(input => input.addEventListener('change', () => { settings.mode = input.value; save(); }));
    document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => { settings.accent = button.dataset.color; save(); }));
    document.querySelector('#accent')?.addEventListener('input', event => { settings.accent = event.target.value; save(); });
    document.querySelector('#reset')?.addEventListener('click', () => { settings = { ...defaults }; save(); });
  });
})();
