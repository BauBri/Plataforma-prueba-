(() => {
  'use strict';
  const own = new URLSearchParams(window.location.search).get('vista') !== 'publico';
  const feed = document.querySelector('#profile-feed');
  const status = document.querySelector('#profile-status');
  const editor = document.querySelector('#edit-profile-dialog');
  const editStatus = document.querySelector('#edit-status');
  const editForm = document.querySelector('#edit-profile-form');
  const postForm = document.querySelector('#post-form');
  const postText = document.querySelector('#post-text');
  const postStatus = document.querySelector('#post-status');
  const saveButton = document.querySelector('#save-profile');
  const publishButton = document.querySelector('#publish-post');
  const filter = document.querySelector('#post-filter');
  const defaultAvatar = './assets/images/logo.jpg';
  const defaultCover = './assets/images/perfil-portada.svg';
  let data;
  let draft;
  let saving = false;
  let session = 0;
  const imageJobs = { avatar: 0, cover: 0 };
  const imagePending = { avatar: false, cover: false };
  const types = { post: 'Publicación', opinion: 'Opinión', chapter: 'Capítulo compartido' };
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function foreground(color) {
    const channels = color.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722 > .179 ? '#000000' : '#ffffff';
  }
  function setSection(name) {
    if (!['biografia', 'informacion', 'fotos'].includes(name)) return;
    document.querySelectorAll('[data-section]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.section === name)));
    for (const id of ['biografia', 'informacion', 'fotos']) document.getElementById(id).hidden = id !== name;
  }
  function renderProfile() {
    const profile = data.profile;
    document.body.style.setProperty('--profile-accent', profile.color);
    document.body.style.setProperty('--profile-on-accent', foreground(profile.color));
    document.title = `${profile.name} · ${own ? 'Tu perfil' : 'Vista pública'} · NekoPapata`;
    document.querySelector('#profile-name').textContent = profile.name;
    document.querySelector('#profile-bio').textContent = profile.bio;
    for (const [selector, value] of [['name', profile.name], ['bio', profile.bio || 'Todavía no hay una presentación.'], ['location', profile.location || 'Sin especificar'], ['genre', profile.favoriteGenre || 'Todo está por descubrir']]) {
      document.querySelectorAll(`[data-profile-${selector}]`).forEach(element => { element.textContent = value; });
    }
    const avatar = profile.avatar || defaultAvatar;
    const cover = profile.cover || defaultCover;
    document.querySelector('#profile-avatar').src = avatar;
    document.querySelector('#profile-avatar').alt = `Foto de perfil de ${profile.name}`;
    document.querySelector('#profile-cover').src = cover;
    document.querySelector('#profile-cover').alt = `Portada del perfil de ${profile.name}`;
    document.querySelector('#album-avatar').src = avatar;
    document.querySelector('#album-cover').src = cover;
    document.querySelectorAll('[data-avatar]').forEach(image => { image.src = avatar; });
    document.querySelectorAll('[data-owner]').forEach(element => { element.hidden = !own; });
    document.querySelector('#profile-post-count').textContent = `${data.posts.length} publicaciones`;
    document.querySelector('#profile-view-label').textContent = own ? 'TU ESPACIO' : 'VISTA COMO VISITANTE';
    const switchView = document.querySelector('#profile-view-switch');
    switchView.textContent = own ? 'Ver como visitante' : 'Volver a mi perfil';
    switchView.href = own ? './perfil.html?vista=publico' : './perfil.html';
    if (!own) {
      document.querySelector('#profile-demo-message').textContent = 'Así se verá tu perfil para otras personas. Esta es una vista previa local, no un perfil público en Internet. No hay una sesión autenticada.';
      document.querySelector('.social-header [aria-current]')?.removeAttribute('aria-current');
    }
    renderFeed();
  }
  function renderFeed() {
    const focused = document.activeElement?.dataset.like;
    const posts = [...data.posts].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).filter(post => filter.value === 'all' || post.type === filter.value);
    feed.replaceChildren(...posts.map(post => {
      const article = node('article', 'panel social-post');
      const header = node('div', 'social-post-header');
      const avatar = node('img');
      avatar.src = data.profile.avatar || defaultAvatar;
      avatar.alt = '';
      avatar.width = 44; avatar.height = 44;
      const author = node('div');
      const name = node('h3', '', data.profile.name);
      const meta = node('p');
      const time = node('time', '', new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(post.createdAt)));
      time.dateTime = post.createdAt;
      meta.append(time, document.createTextNode(post.demo ? ' · Ejemplo ficticio' : ' · Guardado localmente'));
      author.append(name, meta);
      header.append(avatar, author, node('span', 'tag', types[post.type]));
      article.append(header);
      if (post.text) article.append(node('p', 'social-post-text', post.text));
      if (post.type === 'chapter') {
        const link = node('a', 'social-post-link');
        link.href = `./lector.html?historia=entre-estaciones&capitulo=${post.chapter}`;
        const copy = node('span');
        const chapterTitle = document.querySelector(`#post-chapter option[value="${post.chapter}"]`).textContent;
        copy.append(node('strong', '', 'Entre estaciones'), node('small', '', `Capítulo ${chapterTitle}`), node('small', '', 'Abrir en el lector de prueba →'));
        link.append(node('span', '', String(post.chapter)), copy);
        article.append(link);
      }
      const actions = node('div', 'social-post-actions');
      const like = node('button', '', `${post.liked ? 'Te gusta' : 'Me gusta'} · ${post.likes + Number(post.liked)}`);
      like.type = 'button';
      like.dataset.like = post.id;
      like.setAttribute('aria-pressed', String(post.liked));
      like.addEventListener('click', async () => {
        like.disabled = true;
        try {
          data = await window.NekoProfileData.toggleLike(post.id);
          renderFeed();
          status.textContent = 'Reacción guardada solo en este navegador.';
        } catch (error) { status.textContent = error.message; }
        finally { like.disabled = false; }
      });
      const comments = node('button', '', 'Comentarios · pronto');
      comments.type = 'button'; comments.disabled = true;
      actions.append(like, comments, node('span', 'small muted', 'Interacciones de prueba'));
      article.append(actions);
      return article;
    }));
    document.querySelector('#feed-empty').hidden = posts.length !== 0;
    if (focused) [...feed.querySelectorAll('[data-like]')].find(button => button.dataset.like === focused)?.focus();
  }
  async function load() {
    feed.setAttribute('aria-busy', 'true');
    document.querySelector('#profile-error').hidden = true;
    try {
      data = await window.NekoProfileData.getProfile();
      renderProfile();
      status.textContent = data.warning || (own ? 'Tu muro, tus fotos y tus colores. Solo tú en este navegador, por ahora.' : 'Vista previa de visitante: sin controles de edición ni publicación. Las reacciones también son locales.');
    } catch {
      document.querySelector('#profile-error').hidden = false;
      status.textContent = 'No se pudo cargar el perfil de prueba.';
    } finally { feed.setAttribute('aria-busy', 'false'); }
  }
  function updateComposer() {
    const type = postForm.elements['post-type'].value;
    document.querySelector('#chapter-picker').hidden = type !== 'chapter';
    document.querySelector('#post-counter').textContent = `${postText.value.length} / 2000`;
  }
  function refreshColorOptions() {
    const color = document.querySelector('#profile-color').value;
    document.querySelectorAll('[data-profile-color]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.profileColor === color)));
  }
  function openEditor(target) {
    if (!own || !data) return;
    session++;
    draft = { avatar: data.profile.avatar, cover: data.profile.cover };
    for (const [field, value] of [['name', data.profile.name], ['bio', data.profile.bio], ['location', data.profile.location], ['genre', data.profile.favoriteGenre]]) document.querySelector(`#edit-${field}`).value = value;
    document.querySelector('#profile-color').value = data.profile.color;
    document.querySelector('#avatar-preview').src = draft.avatar || defaultAvatar;
    document.querySelector('#cover-preview').src = draft.cover || defaultCover;
    for (const kind of ['avatar', 'cover']) {
      document.querySelector(`#${kind}-upload`).value = '';
      imagePending[kind] = false;
    }
    editStatus.textContent = '';
    saveButton.disabled = false;
    refreshColorOptions();
    editor.showModal();
    document.querySelector(target === 'details' ? '#edit-name' : `#${target}-upload`).focus();
  }
  async function prepareImage(file, kind) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Elige una imagen JPG, PNG o WebP.');
    if (file.size > 5 * 1024 * 1024) throw new Error('La imagen supera los 5 MB. Elige una más pequeña.');
    let bitmap;
    try { bitmap = await createImageBitmap(file); }
    catch { throw new Error('No se pudo abrir la imagen. Prueba con otro archivo válido.'); }
    try {
      if (bitmap.width * bitmap.height > 40000000) throw new Error('La imagen es demasiado grande. Utiliza una de hasta 40 megapíxeles.');
      const canvas = document.createElement('canvas');
      canvas.width = kind === 'avatar' ? 320 : 1440;
      canvas.height = kind === 'avatar' ? 320 : 480;
      const ratio = Math.max(canvas.width / bitmap.width, canvas.height / bitmap.height);
      const width = canvas.width / ratio;
      const height = canvas.height / ratio;
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, (bitmap.width - width) / 2, (bitmap.height - height) / 2, width, height, 0, 0, canvas.width, canvas.height);
      const encoded = canvas.toDataURL('image/jpeg', .85);
      if (encoded.length > 1500000) throw new Error('La imagen no pudo reducirse lo suficiente. Prueba con otra más pequeña.');
      return encoded;
    } finally { bitmap.close(); }
  }
  for (const kind of ['avatar', 'cover']) {
    document.querySelector(`#${kind}-upload`).addEventListener('change', async event => {
      if (!own || !editor.open) return;
      const file = event.target.files[0];
      if (!file) return;
      const currentSession = session;
      const job = ++imageJobs[kind];
      imagePending[kind] = true;
      saveButton.disabled = true;
      editStatus.textContent = 'Preparando imagen local…';
      try {
        const encoded = await prepareImage(file, kind);
        if (currentSession !== session || job !== imageJobs[kind]) return;
        draft[kind] = encoded;
        document.querySelector(`#${kind}-preview`).src = encoded;
        editStatus.textContent = 'Imagen preparada. Pulsa Guardar cambios para aplicarla.';
      } catch (error) {
        if (currentSession === session && job === imageJobs[kind]) editStatus.textContent = error.message;
      } finally {
        if (currentSession === session && job === imageJobs[kind]) {
          imagePending[kind] = false;
          saveButton.disabled = saving || imagePending.avatar || imagePending.cover;
        }
      }
    });
  }
  document.querySelectorAll('[data-section]').forEach(button => button.addEventListener('click', () => setSection(button.dataset.section)));
  document.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => openEditor(button.dataset.edit)));
  document.querySelectorAll('[data-profile-color]').forEach(button => button.addEventListener('click', () => {
    document.querySelector('#profile-color').value = button.dataset.profileColor;
    refreshColorOptions();
  }));
  document.querySelector('#profile-color').addEventListener('input', refreshColorOptions);
  document.querySelector('#cancel-profile-edit').addEventListener('click', () => { if (!saving) editor.close(); });
  editor.addEventListener('cancel', event => { if (saving) event.preventDefault(); });
  editor.addEventListener('close', () => { session++; });
  editForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!own || saving || imagePending.avatar || imagePending.cover) return;
    const changes = {
      name: document.querySelector('#edit-name').value.trim(),
      bio: document.querySelector('#edit-bio').value.trim(),
      location: document.querySelector('#edit-location').value.trim(),
      favoriteGenre: document.querySelector('#edit-genre').value.trim(),
      color: document.querySelector('#profile-color').value,
      ...draft
    };
    if (!changes.name) { editStatus.textContent = 'Escribe un nombre para el perfil.'; return; }
    saving = true; saveButton.disabled = true;
    try {
      data = await window.NekoProfileData.updateProfile(changes);
      renderProfile();
      editor.close();
      status.textContent = 'Perfil guardado. Puedes comprobar tus fotos y tu color con «Ver como visitante».';
    } catch (error) { editStatus.textContent = error.message; }
    finally { saving = false; saveButton.disabled = false; }
  });
  postForm.addEventListener('input', updateComposer);
  postForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!own || publishButton.disabled) return;
    const type = postForm.elements['post-type'].value;
    const text = postText.value.trim();
    const chapter = Number(document.querySelector('#post-chapter').value);
    if (!text && type !== 'chapter') { postStatus.textContent = 'Escribe algo antes de publicar.'; postText.focus(); return; }
    publishButton.disabled = true;
    try {
      if (type === 'chapter' && !await window.NekoReaderData.getChapter('entre-estaciones', chapter)) throw new Error('Este capítulo no está disponible para enlazar.');
      data = await window.NekoProfileData.createPost({ type, text, chapter });
      postForm.reset();
      updateComposer();
      filter.value = 'all';
      renderProfile();
      postStatus.textContent = 'Publicación guardada en este navegador. También aparece en la vista de visitante.';
    } catch (error) { postStatus.textContent = error.message; }
    finally { publishButton.disabled = false; }
  });
  filter.addEventListener('change', () => { if (data) renderFeed(); });
  document.querySelector('#retry-profile').addEventListener('click', load);
  window.addEventListener('storage', event => { if (event.key === window.NekoProfileData?.storageKey || event.key === null) load(); });
  window.addEventListener('pageshow', event => {
    updateComposer();
    if (event.persisted) load();
    else if (data) renderFeed();
  });
  load();
})();
