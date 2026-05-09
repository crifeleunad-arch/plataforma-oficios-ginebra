# Oficios Ginebra

Plataforma digital tipo MVP para conectar trabajadores de oficios locales con clientes del municipio de Ginebra, Valle del Cauca.

## ¿Qué resuelve?

El proyecto busca mejorar la visibilidad de plomeros, electricistas, pintores, carpinteros y otros oficios locales mediante una aplicación sencilla que permite publicar servicios, buscarlos y contactar a los prestadores.

## Estructura del proyecto

- `src/`: código del frontend en React.
- `assets/`: recursos gráficos como logo, íconos o imágenes.
- `backend/`: servidor Express y almacenamiento local de datos.
- `index.html`: punto de entrada de la aplicación.
- `package.json`: dependencias y scripts del frontend.

## Funciones del prototipo

- Registro básico de servicios.
- Búsqueda por nombre, oficio o ubicación.
- Filtros por categoría.
- Tarjetas con datos del prestador.
- Enlace rápido para contacto telefónico.
- Backend simple con API REST.

## Tecnologías usadas

- React
- Vite
- JavaScript
- Node.js
- Express
- CORS

## Requisitos previos

- Node.js 18 o superior
- Git instalado
- Un editor de código como Visual Studio Code

## Cómo ejecutar el proyecto

### 1. Instalar dependencias del frontend

```bash
npm install
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
cd ..
```

### 3. Iniciar el backend

```bash
cd backend
npm run dev
```

El backend quedará disponible en:

```bash
http://localhost:3001
```

### 4. Iniciar el frontend

En otra terminal, desde la raíz del proyecto:

```bash
npm run dev
```

La aplicación quedará disponible en:

```bash
http://localhost:5173
```

## Cómo funciona el prototipo

1. La pantalla principal muestra servicios de ejemplo.
2. El usuario puede buscar por texto o filtrar por categoría.
3. El formulario permite publicar un nuevo servicio.
4. El frontend envía la información al backend.
5. El backend guarda los datos en un archivo JSON local.

