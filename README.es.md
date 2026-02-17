# PortalJS Marmot Starter

Una plantilla de frontend moderna y lista para producción para catálogos de [Marmot](https://github.com/marmotdata/marmot), construida con Next.js, React y Tailwind CSS.

Este kit de inicio proporciona un portal atractivo y personalizable para tus activos de datos, impulsado por el catálogo de alto rendimiento de Marmot.

## Características

- **Stack Tecnológico Moderno**: Next.js, React, Tailwind CSS.
- **Búsqueda Unificada**: Encuentra tablas, temas, paneles de control y más.
- **Vistas por Proveedor**: Explora activos por fuente (Postgres, Kafka, S3, etc.).
- **Glosario**: Términos de negocio y definiciones.
- **Listo para Docker**: Despliegue de stack completo con Docker Compose.
- **Responsivo**: Diseño adaptado a dispositivos móviles.

## Inicio rápido

### 1. Requisitos

- Docker & Docker Compose
- Node.js 18+ (para desarrollo local)

### 2. Ejecutar con Docker (Recomendado)

La forma más sencilla de empezar es usando Docker Compose. Esto levanta Marmot, PostgreSQL y el frontend de PortalJS.

1. **Configurar el entorno**
   ```bash
   cp .env.example .env
   # No se requieren cambios para la configuración por defecto
   ```

2. **Iniciar servicios**
   ```bash
   docker compose up -d
   ```

3. **Inicializar la clave de API**
   Ejecuta el script de inicialización para crear una clave de API en Marmot y guardarla en tu archivo `.env`:
   ```bash
   ./scripts/00_init-api-key.sh
   # Reinicia el portal para que reconozca la clave
   docker compose restart portaljs
   ```

4. **Cargar datos de ejemplo** (Opcional)
   ```bash
   ./scripts/01_setup-sample-data.sh
   ```

5. **Visitar el Portal**
   Abre http://localhost:3000

> [!TIP]
> **Interfaz de Marmot**: http://localhost:8080 (`admin`/`admin`)

### 3. Desarrollo local

Si deseas modificar el código del frontend:

1. **Iniciar el backend de marmot**
   ```bash
   docker compose up -d marmot postgres
   ```


2. **Instalar Dependencias**
   ```bash
   npm install
   ```

3. **Configurar Entorno Local**
   Asegúrate de que tu `.env` tenga la clave `DMS_API_KEY` correcta (ejecuta el script de inicialización si no lo has hecho).

4. **Ejecutar Servidor de Desarrollo**
   ```bash
   npm run dev
   ```

>[!TIP]
> Abre http://localhost:3000

## Configuración

### Variables de Entorno

| Variable | Descripción | Por defecto |
| --- | --- | --- |
| `NEXT_PUBLIC_DMS` | URL de la API de Marmot | `http://localhost:8080` |
| `DMS_API_KEY` | Clave de API para Marmot | (Requerido) |
| `NEXT_PUBLIC_THEME_COLOR` | Color de acento del tema | `#4977AB` |

### Personalización del Tema

Edita `tailwind.config.js` para cambiar colores, fuentes y otros tokens de diseño. La variable de entorno `NEXT_PUBLIC_THEME_COLOR` controla el color de acento principal.

## Estructura del Proyecto

* `pages/` - Páginas de Next.js.
* `components/` - Componentes de React.
* `lib/` - Clientes de API y utilidades.
* `marmot.ts` - Wrapper principal para peticiones a la API.
* `queries/` - Lógica de obtención de datos (Activos, Proveedores, Glosario).
* `schemas/` - Interfaces de TypeScript.
* `scripts/` - Scripts de configuración y utilidad.

## Documentación

* [Documentación de Marmot](https://marmotdata.io/docs)
* [Documentación de PortalJS](https://portaljs.org)

## Licencia

MIT
