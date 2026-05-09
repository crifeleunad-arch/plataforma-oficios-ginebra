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

## Git paso a paso para subirlo a GitHub

### Opción 1: Si todavía no tienes repositorio

1. Abre la carpeta del proyecto en la terminal.
2. Inicializa Git:

```bash
git init
```

3. Revisa los archivos:

```bash
git status
```

4. Agrega todo al control de versiones:

```bash
git add .
```

5. Crea el primer commit:

```bash
git commit -m "Estructura inicial del prototipo"
```

6. Crea el repositorio en GitHub.
7. Copia la URL del repositorio remoto.
8. Vincula el proyecto local con GitHub:

```bash
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
```

9. Sube la rama principal:

```bash
git branch -M main
git push -u origin main
```

### Opción 2: Si ya tienes repositorio en GitHub

1. Descarga o clona el repositorio.
2. Pega estos archivos dentro de la carpeta.
3. Ejecuta:

```bash
git add .
git commit -m "Agregar prototipo funcional"
git push
```

## Qué debe ver el tutor

El tutor debe tener acceso de lectura al repositorio. El enlace se puede pegar en el documento maestro como anexo.

## Observación

Este prototipo está pensado como una base funcional. Después se le pueden añadir inicio de sesión, perfiles más completos, mensajes internos y otras mejoras.
