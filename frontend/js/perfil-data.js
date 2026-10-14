(() => {
  'use strict';
  const key = 'nekopapata.profile.v1';
  const defaults = {
    profile: { name: 'Lector invitado', bio: 'Coleccionando historias, compartiendo pequeñas aventuras. Siempre hay espacio para un capítulo más.', location: 'Entre páginas y estaciones', favoriteGenre: 'Fantasía y aventura', color: '#376c96', avatar: '', cover: '' },
    posts: [
      { id: 'demo-capitulo', type: 'chapter', text: 'Hay historias que te hacen querer perder el último tren. Este capítulo de Entre estaciones es una de ellas. ¿Con qué escena se quedaron?', chapter: 12, createdAt: '2026-10-12T18:30:00.000Z', likes: 12, liked: false, demo: true },
      { id: 'demo-opinion', type: 'opinion', text: 'No todas las aventuras necesitan salvar el mundo. A veces basta con encontrar un lugar al que quieras volver. Eso es lo que más me gusta de las historias tranquilas.', chapter: null, createdAt: '2026-10-11T15:00:00.000Z', likes: 8, liked: false, demo: true },
      { id: 'demo-bienvenida', type: 'post', text: 'Este será mi pequeño rincón para hablar de lo que leo, recomendar capítulos y conocer otras historias. ¡Bienvenidos a mi muro!', chapter: null, createdAt: '2026-10-10T10:00:00.000Z', likes: 5, liked: false, demo: true }
    ]
  };
  const text = (value, max) => typeof value === 'string' && value.length <= max;
  const image = value => value === '' || (text(value, 1500000) && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value));
  function validProfile(profile) {
    return profile && text(profile.name, 60) && profile.name.trim() && text(profile.bio, 280) && text(profile.location, 80) && text(profile.favoriteGenre, 80) && /^#[0-9a-f]{6}$/i.test(profile.color) && image(profile.avatar) && image(profile.cover);
  }
  function validPost(post) {
    return post && text(post.id, 100) && ['post', 'opinion', 'chapter'].includes(post.type) && text(post.text, 2000) && (post.type === 'chapter' ? [11, 12, 13].includes(post.chapter) : post.chapter === null) && (post.text.trim() || post.type === 'chapter') && typeof post.createdAt === 'string' && Number.isFinite(Date.parse(post.createdAt)) && Number.isSafeInteger(post.likes) && post.likes >= 0 && typeof post.liked === 'boolean' && typeof post.demo === 'boolean';
  }
  function read() {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return structuredClone(defaults);
      const data = JSON.parse(saved);
      if (!validProfile(data?.profile) || !Array.isArray(data.posts) || data.posts.length > 100 || !data.posts.every(validPost) || new Set(data.posts.map(post => post.id)).size !== data.posts.length) throw new Error('Invalid profile');
      return data;
    } catch {
      return { ...structuredClone(defaults), warning: 'No se pudo recuperar el perfil guardado. Se muestra el perfil de ejemplo; el almacenamiento puede estar bloqueado o contener datos inválidos.' };
    }
  }
  function save(data) {
    const next = { profile: data.profile, posts: data.posts };
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { throw new Error('No se guardaron los cambios. El almacenamiento está bloqueado o no tiene espacio. Tu formulario se conserva para que puedas intentarlo de nuevo.'); }
    return structuredClone(next);
  }
  window.NekoProfileData = Object.freeze({
    storageKey: key,
    async getProfile() { return read(); },
    async updateProfile(changes) {
      const data = read();
      const profile = { ...data.profile, ...changes };
      if (!validProfile(profile)) throw new Error('Revisa el nombre, los textos, el color y las imágenes del perfil.');
      data.profile = profile;
      return save(data);
    },
    async createPost({ type, text, chapter }) {
      const data = read();
      if (data.posts.length >= 100) throw new Error('Esta prueba admite hasta 100 publicaciones por navegador. No se han eliminado publicaciones anteriores.');
      const post = { id: crypto.randomUUID(), type, text: text.trim(), chapter: type === 'chapter' ? chapter : null, createdAt: new Date().toISOString(), likes: 0, liked: false, demo: false };
      if (!validPost(post)) throw new Error('Escribe una publicación de hasta 2000 caracteres o elige un capítulo disponible.');
      data.posts.unshift(post);
      return save(data);
    },
    async toggleLike(id) {
      const data = read();
      const post = data.posts.find(item => item.id === id);
      if (!post) throw new Error('Esta publicación ya no está disponible. Recarga el perfil.');
      post.liked = !post.liked;
      return save(data);
    }
  });
})();
