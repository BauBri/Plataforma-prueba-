(() => {
  'use strict';
  const views = {
    general: { title: 'Biblioteca general', description: 'Todas las historias de prueba. Explora sus últimos capítulos y encuentra algo para ti.' },
    continuar: { title: 'Continuar lectura', description: 'Historias que dejaste a medias en esta actividad de ejemplo. Tu próxima página te espera.' },
    favoritos: { title: 'Favoritos', description: 'Una selección de favoritos ficticios. Esas historias a las que siempre quieres volver.' },
    historial: { title: 'Historial de lectura', description: 'Tus últimas lecturas, de la más reciente a la más antigua. Actividad de demostración.' },
    listas: { title: 'Mis listas', description: 'Pequeñas colecciones para cada momento. Elige una lista de ejemplo y descubre sus historias.' }
  };
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get('vista');
  const view = Object.hasOwn(views, requestedView) ? requestedView : 'general';
  const grid = document.querySelector('#library-grid');
  const search = document.querySelector('#library-search');
  const status = document.querySelector('#results-status');
  const dialog = document.querySelector('#story-dialog');
  let genre = params.get('genero') ?? '';
  let list = params.get('lista') ?? '';
  let data;
  search.value = params.get('q') ?? '';
  document.title = `${views[view].title} · NekoPapata`;
  document.querySelector('#library-title').textContent = views[view].title;
  document.querySelector('#library-description').textContent = views[view].description;
  document.querySelector('#search-label').textContent = `Buscar por título o autor en ${views[view].title.toLowerCase()}`;
  search.placeholder = `Buscar en ${views[view].title.toLowerCase()}…`;
  document.querySelectorAll('[data-view]').forEach(link => {
    if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
  });
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function showStory(story, chapter = null) {
    document.querySelector('#story-dialog-title').textContent = story.title;
    document.querySelector('#story-dialog-author').textContent = `${story.author} · Historia ficticia`;
    document.querySelector('#story-dialog-description').textContent = story.description;
    document.querySelector('#story-dialog-genres').textContent = story.genres.join(' · ');
    const readable = chapter === null ? story.readableChapters[0] : story.readableChapters.find(number => number === chapter);
    const link = document.querySelector('#story-reader-link');
    link.hidden = readable === undefined;
    link.removeAttribute('href');
    if (readable !== undefined) {
      const url = new URL('./lector.html', window.location.href);
      url.searchParams.set('historia', story.id);
      url.searchParams.set('capitulo', readable);
      link.href = url.href;
    }
    document.querySelector('#story-dialog-status').textContent = readable !== undefined
      ? `Puedes leer el capítulo ${readable} en el lector de prueba. Solo están disponibles los capítulos 11–13.`
      : `${chapter === null ? 'Esta historia' : `El capítulo ${chapter}`} es una ficha de ejemplo; todavía no tiene páginas disponibles.`;
    dialog.showModal();
  }
  function card(story) {
    const article = element('article', 'library-card');
    article.dataset.palette = story.palette;
    const heading = element('h2', 'library-card-heading');
    const cover = element('button', 'library-cover-button');
    cover.type = 'button';
    cover.setAttribute('aria-label', `Ver ficha de ${story.title}`);
    cover.addEventListener('click', () => showStory(story));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('library-art');
    svg.setAttribute('viewBox', '0 0 240 360');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `./assets/images/biblioteca-portadas.svg#${story.art}`);
    svg.append(use);
    const kicker = element('span', 'library-cover-kicker', 'NEKOPAPATA · DEMO');
    const lettering = element('span', 'library-cover-lettering', story.title);
    lettering.setAttribute('aria-hidden', 'true');
    const caption = element('span', 'library-card-caption');
    caption.append(element('span', 'library-card-title', story.title), element('span', 'library-card-genres', story.genres.join(' · ')));
    cover.append(svg, kicker, lettering, caption);
    heading.append(cover);
    const chapters = element('div', 'library-chapters');
    for (const [index, updated] of [story.updated, story.previousUpdated].entries()) {
      const number = story.latestChapter - index;
      const button = element('button', '', `Capítulo ${number}`);
      button.type = 'button';
      button.setAttribute('aria-label', `${story.title}, capítulo ${number}, ejemplo`);
      button.append(element('span', '', updated));
      button.addEventListener('click', () => showStory(story, number));
      chapters.append(button);
    }
    article.append(heading, chapters);
    if (view === 'historial' || view === 'continuar') {
      const entry = data.history.find(item => item.storyId === story.id);
      const history = element('div', 'library-card-history');
      history.append(element('strong', '', `Última lectura: capítulo ${entry.chapter}`), element('p', '', `${entry.visited} · Demo`));
      article.append(history);
    }
    return article;
  }
  function collection() {
    let ids;
    if (view === 'favoritos') ids = data.favorites;
    if (view === 'historial' || view === 'continuar') ids = data.history.filter(item => view === 'historial' || !item.completed).map(item => item.storyId);
    if (view === 'listas') ids = [...new Set(data.lists.filter(item => !list || item.id === list).flatMap(item => item.storyIds))];
    return ids ? ids.map(id => data.stories.find(story => story.id === id)).filter(Boolean) : data.stories;
  }
  function updateURL() {
    const url = new URL(window.location.href);
    const values = { vista: view === 'general' ? '' : view, q: search.value.trim(), genero: genre, lista: list };
    for (const [key, value] of Object.entries(values)) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(null, '', url);
  }
  function render() {
    if (!data) return;
    const query = normalize(search.value);
    const stories = collection();
    const filtered = stories.filter(story => (!genre || story.genres.includes(genre)) && normalize(`${story.title} ${story.author}`).includes(query));
    grid.replaceChildren(...filtered.map(card));
    document.querySelector('#library-empty').hidden = filtered.length !== 0;
    status.textContent = `${filtered.length} de ${stories.length} historias · ${views[view].title} · Demo`;
    document.querySelector('#clear-filters').hidden = !search.value && !genre && !list;
    document.querySelectorAll('[data-genre]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.genre === genre)));
    document.querySelectorAll('[data-list]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.list === list)));
    updateURL();
  }
  function filterButton(value, title, type) {
    const button = element('button', '', title);
    button.type = 'button';
    button.dataset[type] = value;
    button.addEventListener('click', () => {
      if (type === 'genre') genre = value;
      else list = value;
      render();
    });
    return button;
  }
  async function load() {
    data = null;
    grid.setAttribute('aria-busy', 'true');
    document.querySelector('#library-error').hidden = true;
    status.textContent = 'Cargando historias…';
    try {
      data = await window.NekoLibraryData.getLibrary();
      const genres = [...new Set(data.stories.flatMap(story => story.genres))].sort((a, b) => a.localeCompare(b, 'es'));
      if (view !== 'general' || !genres.includes(genre)) genre = '';
      if (view !== 'listas' || !data.lists.some(item => item.id === list)) list = '';
      document.querySelector('#genre-filters').hidden = view !== 'general';
      document.querySelector('#list-filters').hidden = view !== 'listas';
      document.querySelector('#genre-options').replaceChildren(filterButton('', 'Todos', 'genre'), ...genres.map(value => filterButton(value, value, 'genre')));
      document.querySelector('#list-options').replaceChildren(filterButton('', 'Todas las listas', 'list'), ...data.lists.map(item => filterButton(item.id, item.title, 'list')));
      render();
      search.disabled = false;
      document.querySelector('#search-submit').disabled = false;
    } catch {
      data = null;
      grid.replaceChildren();
      document.querySelector('#library-error').hidden = false;
      document.querySelector('#library-empty').hidden = true;
      status.textContent = 'No se pudieron cargar las historias de prueba.';
    } finally {
      grid.setAttribute('aria-busy', 'false');
    }
  }
  search.addEventListener('input', render);
  document.querySelector('#library-search-form').addEventListener('submit', event => {
    event.preventDefault();
    render();
    document.querySelector('#contenido').scrollIntoView({ block: 'start' });
  });
  document.querySelector('#clear-filters').addEventListener('click', () => {
    search.value = ''; genre = ''; list = '';
    render();
    search.focus();
  });
  document.querySelector('#retry-library').addEventListener('click', load);
  window.addEventListener('pageshow', event => { if (event.persisted) render(); });
  load();
})();
