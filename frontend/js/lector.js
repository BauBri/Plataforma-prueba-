(() => {
  'use strict';
  const pages = document.querySelector('#chapter-pages');
  const status = document.querySelector('#reader-status');
  const select = document.querySelector('#chapter-select');
  const params = new URLSearchParams(window.location.search);
  const storyId = params.get('historia') ?? 'entre-estaciones';
  const chapterParam = params.get('capitulo') ?? '12';
  const chapterNumber = /^[1-9]\d*$/.test(chapterParam) ? Number(chapterParam) : NaN;
  function navigate(number) {
    const url = new URL('./lector.html', window.location.href);
    url.searchParams.set('historia', storyId);
    url.searchParams.set('capitulo', number);
    select.value = String(chapterNumber);
    window.location.assign(url.href);
  }
  function renderPage(page, index, total) {
    const figure = document.createElement('figure');
    figure.className = 'reader-page';
    const image = document.createElement('img');
    image.alt = page.alt;
    image.width = page.width;
    image.height = page.height;
    image.loading = index === 0 ? 'eager' : 'lazy';
    image.decoding = 'async';
    const caption = document.createElement('figcaption');
    const number = document.createElement('span');
    number.textContent = `Página ${index + 1} de ${total}`;
    const label = document.createElement('span');
    label.textContent = 'Ilustración demo';
    caption.append(number, label);
    const error = document.createElement('div');
    error.className = 'page-error';
    error.hidden = true;
    error.setAttribute('role', 'status');
    const message = document.createElement('p');
    message.textContent = `No se pudo cargar la página ${index + 1}.`;
    const retry = document.createElement('button');
    retry.className = 'secondary';
    retry.textContent = 'Reintentar imagen';
    retry.addEventListener('click', () => {
      error.hidden = true;
      image.hidden = false;
      image.src = page.url;
    });
    image.addEventListener('error', () => { image.hidden = true; error.hidden = false; });
    image.src = page.url;
    error.append(message, retry);
    figure.append(image, error, caption);
    return figure;
  }
  async function load() {
    try {
      const chapter = Number.isSafeInteger(chapterNumber) ? await window.NekoReaderData.getChapter(storyId, chapterNumber) : null;
      if (!chapter) {
        showError('La historia o el capítulo solicitado no está disponible. Puedes probar los capítulos 11, 12 y 13 de Entre estaciones.');
        return;
      }
      document.title = `${chapter.story.title} · Capítulo ${chapter.number} · NekoPapata`;
      document.querySelector('#story-title').textContent = chapter.story.title;
      document.querySelector('#story-author').textContent = `${chapter.story.author} · Historia ficticia`;
      document.querySelector('#chapter-number').textContent = `CAPÍTULO ${chapter.number} DE ${chapter.story.totalChapters}`;
      document.querySelector('#chapter-title').textContent = chapter.title;
      document.querySelector('#chapter-description').textContent = chapter.description;
      select.replaceChildren(...chapter.chapters.map(item => {
        const option = document.createElement('option');
        option.value = item.number;
        option.textContent = `${item.number} · ${item.title}`;
        return option;
      }));
      select.value = String(chapter.number);
      select.disabled = false;
      document.querySelectorAll('[data-direction]').forEach(button => {
        const target = chapter[button.dataset.direction];
        button.disabled = target === null;
        button.addEventListener('click', () => { if (target !== null) navigate(target); });
      });
      const orderedPages = [...chapter.pages].sort((a, b) => a.position - b.position);
      pages.replaceChildren(...orderedPages.map((page, index) => renderPage(page, index, orderedPages.length)));
      status.textContent = orderedPages.length ? `${orderedPages.length} páginas · Lectura vertical · Contenido de prueba` : 'Este capítulo todavía no tiene páginas.';
      document.querySelector('#chapter-end').hidden = !orderedPages.length;
      document.querySelector('#end-message').textContent = chapter.next === null ? 'Este es el último capítulo disponible en la demo. Puedes volver al menú para seguir explorando.' : 'La historia continúa. El próximo capítulo te espera.';
    } catch {
      showError('No se pudo cargar el contenido. Intenta abrir de nuevo el capítulo de prueba.');
    } finally {
      pages.setAttribute('aria-busy', 'false');
    }
  }
  function showError(message) {
    document.querySelector('#chapter-title').textContent = 'Capítulo no disponible';
    document.querySelector('#chapter-description').textContent = 'Vuelve a una historia de prueba para continuar.';
    document.querySelector('#reader-error').hidden = false;
    document.querySelector('#error-message').textContent = message;
    status.textContent = message;
  }
  const preferencesToggle = document.querySelector('#preferences-toggle');
  const preferences = document.querySelector('#personalizar');
  function togglePreferences(open) {
    preferences.hidden = !open;
    preferencesToggle.setAttribute('aria-expanded', String(open));
  }
  preferencesToggle.addEventListener('click', () => togglePreferences(preferences.hidden));
  preferences.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      togglePreferences(false);
      preferencesToggle.focus();
    }
  });
  select.addEventListener('change', () => navigate(select.value));
  document.querySelector('#page-width').addEventListener('change', event => { pages.dataset.width = event.target.value; });
  load();
})();
