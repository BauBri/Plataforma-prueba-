(() => {
  'use strict';
  const stories = [
    { id: 'entre-estaciones', title: 'Entre estaciones', author: 'A. Sol', genres: ['Fantasía', 'Aventura'], art: 'city', palette: 'forest', latestChapter: 13, updated: 'Hace 2 horas', previousUpdated: 'Ayer', readableChapters: [11, 12, 13], description: 'Una carta olvidada, un tren sin destino y una ciudad que solo aparece al caer la noche.' },
    { id: 'jardin-luna', title: 'El jardín de la luna', author: 'L. Mar', genres: ['Fantasía'], art: 'flowers', palette: 'lavender', latestChapter: 24, updated: 'Hace 3 horas', previousUpdated: 'Hace 1 semana', readableChapters: [], description: 'Cada luna llena, un jardín secreto florece con los recuerdos de quienes lo visitan.' },
    { id: 'despues-lluvia', title: 'Después de la lluvia', author: 'N. Río', genres: ['Romance', 'Vida cotidiana'], art: 'window', palette: 'rain', latestChapter: 18, updated: 'Hace 4 horas', previousUpdated: 'Hace 2 días', readableChapters: [], description: 'Dos desconocidos coinciden bajo el mismo techo cuando la ciudad se queda sin paraguas.' },
    { id: 'tienda-martes', title: 'La tienda de los martes', author: 'M. Nube', genres: ['Vida cotidiana'], art: 'city', palette: 'clay', latestChapter: 32, updated: 'Hace 5 horas', previousUpdated: 'Hace 1 semana', readableChapters: [], description: 'Una pequeña tienda abre cada martes y siempre tiene aquello que sus visitantes no sabían que buscaban.' },
    { id: 'ecos-bosque', title: 'Ecos del bosque', author: 'D. Roble', genres: ['Misterio', 'Fantasía'], art: 'forest', palette: 'night', latestChapter: 16, updated: 'Hace 6 horas', previousUpdated: 'Hace 3 días', readableChapters: [], description: 'En un pueblo rodeado de árboles, las voces del bosque guardan una historia que nadie se atreve a contar.' },
    { id: 'cielo-distancia', title: 'A un cielo de distancia', author: 'I. Viento', genres: ['Aventura'], art: 'sky', palette: 'ocean', latestChapter: 28, updated: 'Ayer', previousUpdated: 'Hace 1 semana', readableChapters: [], description: 'Una aprendiz de cartógrafa sigue una ruta de islas flotantes para encontrar el camino a casa.' },
    { id: 'dias-abril', title: 'Los días de abril', author: 'C. Alba', genres: ['Romance', 'Vida cotidiana'], art: 'flowers', palette: 'rose', latestChapter: 21, updated: 'Ayer', previousUpdated: 'Hace 4 días', readableChapters: [], description: 'Un cuaderno compartido reúne las pequeñas alegrías de dos vecinos durante una primavera inesperada.' },
    { id: 'mapa-cosas', title: 'El mapa de las pequeñas cosas', author: 'V. Norte', genres: ['Aventura', 'Vida cotidiana'], art: 'sky', palette: 'sand', latestChapter: 12, updated: 'Hace 2 días', previousUpdated: 'Hace 1 semana', readableChapters: [], description: 'Un viaje tranquilo por lugares que no aparecen en ningún mapa, pero que vale la pena recordar.' },
    { id: 'archivo-estrellas', title: 'El archivo de las estrellas', author: 'S. Vega', genres: ['Ciencia ficción', 'Misterio'], art: 'window', palette: 'cosmos', latestChapter: 35, updated: 'Hace 2 días', previousUpdated: 'Hace 1 semana', readableChapters: [], description: 'En el último observatorio del planeta, una señal antigua vuelve a encender las pantallas.' },
    { id: 'guardian-faro', title: 'El guardián del faro', author: 'T. Bruma', genres: ['Misterio', 'Aventura'], art: 'forest', palette: 'sea', latestChapter: 9, updated: 'Hace 3 días', previousUpdated: 'Hace 1 semana', readableChapters: [], description: 'Cada noche el faro ilumina una isla distinta. Su nuevo guardián quiere descubrir por qué.' }
  ];
  const favorites = ['entre-estaciones', 'jardin-luna', 'ecos-bosque', 'dias-abril', 'archivo-estrellas', 'guardian-faro'];
  const history = [
    { storyId: 'entre-estaciones', chapter: 12, visited: 'Hoy · 10:30', completed: false },
    { storyId: 'ecos-bosque', chapter: 8, visited: 'Ayer · 21:15', completed: false },
    { storyId: 'despues-lluvia', chapter: 18, visited: 'Ayer · 18:40', completed: true },
    { storyId: 'cielo-distancia', chapter: 14, visited: 'Hace 2 días', completed: false },
    { storyId: 'tienda-martes', chapter: 32, visited: 'Hace 3 días', completed: true }
  ];
  const lists = [
    { id: 'viajes', title: 'Para perderse un rato', storyIds: ['entre-estaciones', 'jardin-luna', 'cielo-distancia', 'mapa-cosas'] },
    { id: 'pausas', title: 'Pequeñas pausas', storyIds: ['despues-lluvia', 'tienda-martes', 'dias-abril'] }
  ];
  window.NekoLibraryData = Object.freeze({
    async getLibrary() {
      return structuredClone({ stories, favorites, history, lists });
    }
  });
})();
