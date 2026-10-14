/* Browser-local demonstration. No accounts, API calls or backend actions. */
(() => {
  'use strict';
  async function refreshProfile() {
    if (!window.NekoProfileData) return;
    const { profile } = await window.NekoProfileData.getProfile();
    document.querySelectorAll('[data-current-name]').forEach(element => { element.textContent = profile.name; });
    document.querySelectorAll('[data-current-avatar]').forEach(image => { image.src = profile.avatar || './assets/images/logo.jpg'; });
  }
  window.addEventListener('pageshow', refreshProfile);
  window.addEventListener('storage', event => {
    if (event.key === window.NekoProfileData?.storageKey || event.key === null) refreshProfile();
  });
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
