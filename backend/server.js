import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const puerto = 3001;
const archivoDatos = path.join(__dirname, 'data', 'oficios.json');

// Solo acepta peticiones del frontend local (Vite dev o build)
const origenesPermitidos = [
  'http://localhost:5173',
  'http://localhost:4173'
];
app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (Postman, curl local) solo en dev
    if (!origin || origenesPermitidos.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origen no permitido por CORS'));
    }
  }
}));

// Límite ampliado a 600kb para permitir fotos en base64 (máx ~400kb original)
app.use(express.json({ limit: '600kb' }));

// Validación de campos de entrada
function validarOficio(datos) {
  const errores = [];

  if (!datos.nombre || typeof datos.nombre !== 'string') errores.push('nombre requerido');
  if (datos.nombre && datos.nombre.length > 100) errores.push('nombre demasiado largo (máx 100 caracteres)');

  const oficiosValidos = ['Plomería', 'Electricidad', 'Pintura', 'Carpintería', 'Mantenimiento'];
  if (!datos.oficio || !oficiosValidos.includes(datos.oficio)) errores.push('oficio inválido');

  if (!datos.ubicacion || typeof datos.ubicacion !== 'string') errores.push('ubicacion requerida');
  if (datos.ubicacion && datos.ubicacion.length > 100) errores.push('ubicacion demasiado larga (máx 100 caracteres)');

  if (!datos.experiencia || typeof datos.experiencia !== 'string') errores.push('experiencia requerida');
  if (datos.experiencia && datos.experiencia.length > 100) errores.push('experiencia demasiado larga (máx 100 caracteres)');

  if (!datos.telefono || typeof datos.telefono !== 'string') errores.push('telefono requerido');
  // Solo dígitos, espacios y guiones — bloquea javascript: y otros protocolos
  if (datos.telefono && !/^[\d\s\-+()]{7,20}$/.test(datos.telefono)) {
    errores.push('telefono con formato inválido (solo dígitos, espacios, guiones)');
  }

  if (datos.descripcion && typeof datos.descripcion !== 'string') errores.push('descripcion inválida');
  if (datos.descripcion && datos.descripcion.length > 500) errores.push('descripcion demasiado larga (máx 500 caracteres)');

  if (datos.foto && typeof datos.foto !== 'string') errores.push('foto inválida');
  if (datos.foto && !datos.foto.startsWith('data:image/')) errores.push('formato de foto no permitido');
  if (datos.foto && datos.foto.length > 560000) errores.push('foto demasiado grande (máx 400 KB)');

  return errores;
}

// Contador simple de requests por IP para rate limiting sin dependencia externa
const contadorPorIp = new Map();
const LIMITE_POR_MINUTO = 10;

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const ahora = Date.now();
  const entrada = contadorPorIp.get(ip) || { count: 0, inicio: ahora };

  if (ahora - entrada.inicio > 60_000) {
    // Reinicia la ventana cada minuto
    contadorPorIp.set(ip, { count: 1, inicio: ahora });
    return next();
  }

  if (entrada.count >= LIMITE_POR_MINUTO) {
    return res.status(429).json({ mensaje: 'Demasiadas solicitudes. Espera un momento.' });
  }

  entrada.count += 1;
  contadorPorIp.set(ip, entrada);
  next();
}

// Limpia el mapa cada 5 minutos para no crecer indefinidamente
setInterval(() => contadorPorIp.clear(), 5 * 60_000);

async function leerOficios() {
  try {
    const contenido = await fs.readFile(archivoDatos, 'utf8');
    return JSON.parse(contenido);
  } catch (err) {
    if (err.code === 'ENOENT') {
      const archivoEjemplo = path.join(__dirname, 'data', 'oficios.ejemplo.json');
      try {
        const ejemplo = await fs.readFile(archivoEjemplo, 'utf8');
        await fs.writeFile(archivoDatos, ejemplo, 'utf8');
        return JSON.parse(ejemplo);
      } catch {
        await fs.writeFile(archivoDatos, '[]', 'utf8');
        return [];
      }
    }
    throw err;
  }
}

// Escritura atómica: escribe en un archivo temporal y luego lo mueve,
// evitando corrupción si dos requests llegan al mismo tiempo
async function guardarOficios(oficios) {
  const tmp = archivoDatos + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(oficios, null, 2), 'utf8');
  await fs.rename(tmp, archivoDatos);
}

app.get('/api/oficios', async (_req, res) => {
  try {
    const oficios = await leerOficios();
    res.json(oficios);
  } catch {
    res.status(500).json({ mensaje: 'Error al leer los oficios' });
  }
});

app.post('/api/oficios', rateLimiter, async (req, res) => {
  const errores = validarOficio(req.body);
  if (errores.length > 0) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores });
  }

  try {
    const datos = req.body;
    const oficios = await leerOficios();
    const registro = {
      id: Date.now(),
      nombre: datos.nombre.trim(),
      oficio: datos.oficio,
      ubicacion: datos.ubicacion.trim(),
      experiencia: datos.experiencia.trim(),
      descripcion: (datos.descripcion || '').trim(),
      telefono: datos.telefono.trim(),
      foto: datos.foto || '',
      valoracion: 0,
      votos: 0
    };
    oficios.unshift(registro);
    await guardarOficios(oficios);
    res.status(201).json(registro);
  } catch {
    res.status(500).json({ mensaje: 'Error al guardar el oficio' });
  }
});

app.patch('/api/oficios/:id/valorar', rateLimiter, async (req, res) => {
  const { puntuacion } = req.body;
  const id = parseInt(req.params.id, 10);

  if (!Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return res.status(400).json({ mensaje: 'Puntuación inválida — debe ser un entero entre 1 y 5' });
  }
  if (isNaN(id)) {
    return res.status(400).json({ mensaje: 'ID inválido' });
  }

  try {
    const oficios = await leerOficios();
    const index = oficios.findIndex((o) => o.id === id);
    if (index === -1) return res.status(404).json({ mensaje: 'Oficio no encontrado' });

    const oficio = oficios[index];
    const votosPrev = oficio.votos || 0;
    const sumaActual = oficio.valoracion * votosPrev;
    oficio.votos = votosPrev + 1;
    oficio.valoracion = Math.round(((sumaActual + puntuacion) / oficio.votos) * 10) / 10;

    await guardarOficios(oficios);
    res.json({ valoracion: oficio.valoracion, votos: oficio.votos });
  } catch {
    res.status(500).json({ mensaje: 'Error al guardar la valoración' });
  }
});

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok', mensaje: 'Backend funcionando' });
});

app.listen(puerto, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${puerto}`);
});
