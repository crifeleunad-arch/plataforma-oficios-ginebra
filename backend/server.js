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

app.use(cors());
app.use(express.json());

async function leerOficios() {
  const contenido = await fs.readFile(archivoDatos, 'utf8');
  return JSON.parse(contenido);
}

async function guardarOficios(oficios) {
  await fs.writeFile(archivoDatos, JSON.stringify(oficios, null, 2), 'utf8');
}

app.get('/api/oficios', async (_req, res) => {
  try {
    const oficios = await leerOficios();
    res.json(oficios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al leer los oficios' });
  }
});

app.post('/api/oficios', async (req, res) => {
  try {
    const nuevo = req.body;
    const oficios = await leerOficios();
    const registro = {
      id: nuevo.id ?? Date.now(),
      nombre: nuevo.nombre ?? 'Sin nombre',
      oficio: nuevo.oficio ?? 'Mantenimiento',
      ubicacion: nuevo.ubicacion ?? 'Ginebra',
      experiencia: nuevo.experiencia ?? 'Sin dato',
      descripcion: nuevo.descripcion ?? '',
      telefono: nuevo.telefono ?? '',
      valoracion: nuevo.valoracion ?? 5
    };
    oficios.unshift(registro);
    await guardarOficios(oficios);
    res.status(201).json(registro);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar el oficio' });
  }
});

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok', mensaje: 'Backend funcionando' });
});

app.listen(puerto, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${puerto}`);
});
