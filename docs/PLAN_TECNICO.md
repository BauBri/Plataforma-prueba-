# Plan técnico — Plataforma de Cómics

**Versión:** 0.1  
**Fecha de revisión:** 11 de octubre de 2026  
**Estado:** Fase 0 — preparación  
**Objetivo:** beta web para 0–5 usuarios simultáneos, con costos mínimos y aprendizaje intensivo de Go.

## 1. Alcance

Plataforma comunitaria de cómics y mangas, accesible desde navegador y optimizada para lectura vertical.

| Módulo | Funciones del MVP |
|---|---|
| **Menú** | Portadas, catálogo, búsqueda por título, géneros y acceso a capítulos |
| **Lector** | Capítulos con imágenes verticales, carga progresiva y navegación |
| **Creador** | Registro/inicio de sesión, creación y edición de historias, subida y orden de páginas, borradores y publicación |

No se incluirán inicialmente pagos ni aplicación móvil nativa. La beta podrá limitarse a autores autorizados.

## 2. Arquitectura y conexiones

**Frontend:** HTML, CSS y JavaScript, alojados en **Azure Static Web Apps Free**.  
**API:** un servidor **Go** en **Azure Container Apps Consumption**.  
**Datos:** **Azure SQL Database Free**; consultas SQL desde Go.  
**Imágenes:** **Azure Blob Storage** con redundancia LRS y acceso frecuente (Hot).

Flujo de lectura:

1. JavaScript solicita el catálogo o capítulo a la API Go por HTTPS.
2. Go consulta SQL y devuelve metadatos y referencias mediante JSON.
3. El navegador obtiene las imágenes de Blob Storage por URLs autorizadas y las muestra verticalmente.

Flujo de publicación:

1. El autor inicia sesión; Go valida identidad y permisos.
2. Go valida metadatos y autoriza temporalmente una subida a Blob Storage.
3. El navegador sube directamente las imágenes al almacenamiento.
4. Go comprueba la operación, guarda referencias y orden en SQL, y publica cuando corresponde.

**Principios:** una sola API Go (monolito modular), sin Kubernetes, sin microservicios y sin reenviar todas las imágenes a través del backend. Mantener contenedores privados y conceder accesos temporales de alcance mínimo.

## 3. Servicios Azure y cuotas

| Servicio | Oferta útil | Vigencia | Uso en el proyecto |
|---|---|---|---|
| Static Web Apps Free | 100 GB/mes de ancho de banda; 500 MB totales para la app | Permanente, sujeto a condiciones | Publicar la interfaz |
| Container Apps Consumption | 180,000 vCPU-segundos, 360,000 GiB-segundos y 2 millones de peticiones/mes por suscripción | Permanente | Ejecutar Go con mínimo 0 réplicas |
| Azure SQL Database Free | 100,000 vCore-segundos, 32 GB de datos y 32 GB de respaldos/mes por base de datos elegible | Permanente | Guardar usuarios y catálogo |
| Blob Storage, Hot LRS | 5 GB, 20,000 lecturas y 10,000 escrituras/mes | Solo 12 meses para cuentas nuevas elegibles | Portadas y páginas |
| Cost Management | Gestión de presupuestos y alertas | Disponible sin cargo por la herramienta | Vigilar gastos |

**Configuración crítica:** en Azure SQL seleccionar **“Auto-pause the database until next month”** al alcanzar el límite gratuito, no la opción de continuar facturando. Esa pausa puede dejar la web temporalmente sin base de datos.

**No utilizaremos por ahora:** máquinas virtuales, AKS, API Management, Service Bus, Azure Container Registry ni Azure Functions. No aportan una ventaja suficiente para el MVP.

**Autenticación:** definirla antes de abrir el creador al público. Para evitar implementar seguridad apresuradamente, evaluar **Microsoft Entra External ID** o una autenticación propia con sesiones seguras y contraseñas correctamente cifradas mediante hash. No basaremos el diseño en Azure AD B2C, que dejó de venderse a clientes nuevos en mayo de 2025.

## 4. Presupuesto y restricciones

**Meta operativa:** 0–5 USD al mes durante la beta, sin dominio de pago.

Este importe es un **objetivo condicionado**, no una tarifa fija. Supone:

- 0–5 usuarios simultáneos y pocas sesiones de lectura al mes.
- Entre 1 y 5 GB de portadas y páginas almacenadas.
- Recursos gratuitos correctamente configurados.
- API con escalado a cero, sin réplicas permanentemente activas.
- Logs y transferencia reducidos; sin servicios adicionales de costo fijo.

| Concepto | Primeros 12 meses* | Después |
|---|---|---|
| Web estática | $0 si respeta el nivel Free | Igual |
| API Go | $0 si respeta cuotas Consumption | Igual |
| SQL | $0 si respeta la oferta Free | Igual |
| Blob Storage | $0 dentro de promoción y límites | Pago por GB, operaciones y tráfico aplicable |
| Otros cargos | Variables según configuración | Variables según configuración |

\* La promoción de 12 meses comienza con el alta de la cuenta elegible, no con el lanzamiento del proyecto.

Antes del despliegue: revisar precios y disponibilidad de la región escogida, configurar un presupuesto mensual de **5 USD** con alertas al 50%, 80% y 100%, y comprobar el costo estimado de todos los recursos.

**Importante:** las alertas de presupuesto no suspenden automáticamente los servicios. La transferencia de imágenes desde Blob puede tener facturación distinta del ancho de banda gratuito de Static Web Apps. Una sesión simultánea no equivale a una cantidad fija de GB mensuales.

## 5. Modelo de datos mínimo

- `users`: identidad del usuario, nombre, correo y datos necesarios para autenticación.
- `stories`: autor, título, descripción, género, portada, estado.
- `chapters`: historia, número, título, estado.
- `pages`: capítulo, posición, referencia al archivo en Blob Storage.

Relaciones: **usuario 1:N historias; historia 1:N capítulos; capítulo 1:N páginas**.

Las imágenes van a Blob Storage; SQL almacena referencias y metadatos. El acceso a publicaciones y ediciones debe comprobar la propiedad de la historia.

## 6. Repositorio

```text
Plataforma-prueba/
├── frontend/             # HTML, CSS y JavaScript
├── backend/              # API Go y pruebas
├── database/             # Migraciones SQL
├── infrastructure/       # Configuración Azure (cuando se necesite)
├── docs/
│   └── PLAN_TECNICO.md
├── .gitignore
└── README.md
```

Dentro de Go se empezará con lo mínimo y se separarán paquetes conforme crezca el código. Los archivos `go.mod` y `go.sum`, las migraciones y las pruebas sí se versionan. Credenciales y `.env` no.

## 7. Hoja de ruta

### Fase 1 — Interfaz local
- [ ] Menú HTML/CSS con historias ficticias.
- [ ] Lector vertical con imágenes locales y lazy loading.
- [ ] Formulario visual del creador.
- [ ] Navegación básica y diseño responsivo.

### Fase 2 — API Go
- [ ] Crear `go.mod` y servidor con `net/http`.
- [ ] Implementar endpoints GET de historias y capítulos.
- [ ] Responder con JSON y conectar el frontend.
- [ ] Agregar validaciones, errores y pruebas.

### Fase 3 — SQL
- [ ] Diseñar tablas y migraciones.
- [ ] Conectar Go mediante `database/sql`.
- [ ] Implementar consultas parametrizadas y transacciones.
- [ ] Sustituir los datos simulados por persistencia real.

### Fase 4 — Creador funcional
- [ ] Autenticación y permisos por propietario.
- [ ] Crear historias, capítulos y borradores.
- [ ] Subir y ordenar imágenes con validaciones y límites.
- [ ] Publicar y leer contenido persistente.

### Fase 5 — Despliegue Azure
- [ ] Confirmar elegibilidad y cuotas gratuitas.
- [ ] Configurar costos y alertas.
- [ ] Desplegar Static Web Apps y Container Apps.
- [ ] Conectar Azure SQL y Blob Storage.
- [ ] Gestionar secretos, HTTPS, CORS y despliegues.

### Fase 6 — Beta usable
- [ ] Probar lectura y publicación completas.
- [ ] Probar móviles, errores, seguridad y permisos.
- [ ] Aplicar límites de tamaño y retirar contenido reportado.
- [ ] Probar entre 1 y 5 sesiones simultáneas.
- [ ] Revisar costos reales y documentar operación.

**Criterio de terminación:** un autor puede publicar una historia y otro usuario puede encontrarla y leerla verticalmente, con datos e imágenes persistentes.

## 8. Criterios de ingeniería

- Priorizar el aprendizaje profundo de Go y la legibilidad del código.
- Mantener commits pequeños y pruebas desde las primeras etapas.
- Desarrollar localmente antes de consumir recursos cloud.
- No introducir servicios adicionales sin una necesidad concreta.
- Revisar límites gratuitos y gasto real cada vez que se despliegue una nueva pieza.
- No subir secretos, tokens, contraseñas ni claves de Azure al repositorio.

## 9. Fuentes y revisión

Base: tabla de servicios gratuitos de Azure proporcionada para el proyecto. Validaciones adicionales en documentación oficial (octubre de 2026):

- [Servicios gratuitos de Azure](https://azure.microsoft.com/es-mx/pricing/free-services)
- [Azure SQL Database Free](https://learn.microsoft.com/en-us/azure/azure-sql/database/free-offer)
- [Azure Container Apps — facturación](https://learn.microsoft.com/en-us/azure/container-apps/billing)
- [Azure Static Web Apps — cuotas](https://learn.microsoft.com/en-us/azure/static-web-apps/quotas)
- [Azure Blob Storage — precios](https://azure.microsoft.com/en-us/pricing/details/storage/blobs/)
- [Cost Management — presupuestos](https://learn.microsoft.com/en-us/azure/cost-management-billing/costs/tutorial-acm-create-budgets)
- [Azure AD B2C — disponibilidad](https://learn.microsoft.com/en-us/azure/active-directory-b2c/faq)

Revisar de nuevo los precios, las cuotas y las condiciones al crear cada recurso.
