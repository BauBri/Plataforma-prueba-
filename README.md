# NekoPapata

Una plataforma web donde los usuarios podrán descubrir, leer y publicar cómics y mangas creados por la comunidad.

El proyecto busca construir una aplicación funcional desde cero, utilizando principalmente **Go, SQL y Azure**, mientras ponemos en práctica conceptos de desarrollo backend, bases de datos y servicios en la nube.

## Funcionalidades principales

La plataforma estará dividida en tres módulos:

- **Menú:** catálogo de historias con portadas, descripciones, búsqueda y categorías.
- **Lector:** lectura vertical de capítulos, con carga progresiva de imágenes y navegación entre capítulos.
- **Creador:** espacio donde los usuarios podrán crear historias, subir capítulos, organizar páginas y publicar su contenido.

La primera versión estará enfocada exclusivamente en navegadores web, con un diseño adaptable a computadoras y dispositivos móviles.

## Tecnologías

| Tecnología             | Uso                                    |
| ---------------------- | -------------------------------------- |
| HTML, CSS y JavaScript | Interfaz web e interactividad          |
| Go                     | Servidor, API REST y lógica de negocio |
| SQL / Azure SQL        | Usuarios, historias y capítulos        |
| Azure Blob Storage     | Almacenamiento de imágenes             |
| Azure Static Web Apps  | Alojamiento del frontend               |
| Azure Container Apps   | Ejecución del backend                  |
| Git y GitHub           | Control de versiones                   |

## Organización del proyecto

El repositorio separa los componentes según su responsabilidad:

```text
Plataforma-prueba/
├── frontend/         # Interfaz web
├── backend/          # Servidor y API en Go
├── database/         # Estructura y scripts SQL
├── infrastructure/   # Configuración de Azure
├── docs/             # Documentación técnica
├── .gitignore
└── README.md
```

**Frontend:** contiene las páginas, estilos y scripts con los que interactúa el usuario.

**Backend:** procesa las solicitudes HTTP, aplica las reglas de negocio y comunica la aplicación con SQL y Azure.

**Database:** contiene los scripts necesarios para crear y actualizar la estructura de la base de datos.

**Infrastructure:** reúne las configuraciones para desplegar y administrar los servicios en Azure.

**Docs:** conserva las decisiones técnicas, la arquitectura y el plan de desarrollo.

Las carpetas y componentes se incorporarán progresivamente conforme avance el proyecto.

## Cómo funcionará

El navegador se comunicará con una API desarrollada en Go mediante HTTP y JSON.

Go se encargará de consultar la base de datos, gestionar las historias y validar las operaciones de los usuarios. Las imágenes se almacenarán en Azure Blob Storage y podrán cargarse directamente en el lector mediante acceso controlado.

Inicialmente trabajaremos en un entorno local. La integración con Azure se realizará cuando los módulos básicos funcionen correctamente.

## Ruta de desarrollo

- [x] Crear y clonar el repositorio.
- [x] Preparar el entorno de desarrollo.
- [x] Definir la arquitectura y el plan técnico.
- [x] Crear `.gitignore`.
- [x] Organizar las carpetas del proyecto.
- [ ] Desarrollar el menú, lector y creador.
- [ ] Construir la API REST con Go.
- [ ] Integrar SQL y persistencia de datos.
- [ ] Implementar usuarios y publicación de historias.
- [ ] Conectar los servicios de Azure.
- [ ] Desplegar y probar la primera versión funcional.

## Alcance inicial

Comenzaremos con una versión pequeña, diseñada para pruebas con **0 a 5 usuarios simultáneos**.

Buscaremos aprovechar los servicios gratuitos de Azure y mantener los costos operativos al mínimo, con un presupuesto objetivo de **0 a 5 USD mensuales**, sujeto al consumo real y a los límites de cada servicio.


## Documentación

El diseño técnico, los servicios de Azure, el presupuesto y las etapas del proyecto se detallan en [Plan técnico](docs/PLAN_TECNICO.md).

---

**Estado actual:** Fase 0 — Preparación del repositorio.

El desarrollo será incremental, con cambios pequeños y commits que permitan seguir la evolución del proyecto.
