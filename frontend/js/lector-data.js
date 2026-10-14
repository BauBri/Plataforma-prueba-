(() => {
  'use strict';
  const story = { id: 'entre-estaciones', title: 'Entre estaciones', author: 'A. Sol', totalChapters: 20 };
  const chapters = [
    { number: 11, title: 'La carta olvidada', description: 'A veces, un viaje empieza con una carta que nadie recuerda haber escrito.', order: ['letter', 'station', 'city'] },
    { number: 12, title: 'El tren de medianoche', description: 'Hay trenes que no aparecen en los horarios. Este solo espera por ti.', order: ['station', 'letter', 'city'] },
    { number: 13, title: 'La ciudad del otro lado', description: 'Al otro lado de la noche, una ciudad enciende sus luces.', order: ['city', 'station', 'letter'] }
  ];
  const illustrations = {
    station: { url: './assets/images/lector-estacion.svg', alt: 'Una estación bajo la luna. Un tren iluminado espera junto al andén. Texto: El último tren no figuraba en ningún horario. Pero esa noche, alguien la estaba esperando.' },
    letter: { url: './assets/images/lector-carta.svg', alt: 'Una carta abierta y un billete sobre una mesa. Texto: Si encuentras esta carta, aún estás a tiempo. Andén 03. Solo ida. Hay lugares que solo existen cuando decides buscarlos.' },
    city: { url: './assets/images/lector-ciudad.svg', alt: 'Una ciudad de tejados y ventanas doradas al otro lado de las montañas. Una viajera la observa. Texto: Y al otro lado de la noche… la ciudad comenzó a despertar. El viaje apenas empezaba.' }
  };
  window.NekoReaderData = Object.freeze({
    async getChapter(storyId, number) {
      const index = chapters.findIndex(chapter => chapter.number === number);
      if (storyId !== story.id || index === -1) return null;
      const chapter = chapters[index];
      return {
        story: { ...story },
        number: chapter.number,
        title: chapter.title,
        description: chapter.description,
        chapters: chapters.map(({ number, title }) => ({ number, title })),
        previous: chapters[index - 1]?.number ?? null,
        next: chapters[index + 1]?.number ?? null,
        pages: chapter.order.map((id, index) => ({ id: `${number}-${id}`, position: index + 1, width: 800, height: 1100, ...illustrations[id] }))
      };
    }
  });
})();
