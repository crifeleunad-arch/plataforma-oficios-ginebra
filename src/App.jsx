import React, { useEffect, useMemo, useState } from 'react';
import { oficiosIniciales } from './data/oficiosIniciales';
import Avatar from './Avatar';
import Estrellas from './Estrellas';

const categorias = ['Todas', 'Plomería', 'Electricidad', 'Pintura', 'Carpintería', 'Mantenimiento'];

const estadoInicialFormulario = {
  nombre: '',
  oficio: 'Plomería',
  ubicacion: '',
  experiencia: '',
  descripcion: '',
  telefono: ''
};

const LIMITE_FOTO_BYTES = 400 * 1024; // 400 KB

export default function App() {
  const [oficios, setOficios] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [foto, setFoto] = useState('');
  const [errorFoto, setErrorFoto] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await fetch('/api/oficios');
        if (!respuesta.ok) throw new Error('No fue posible cargar los oficios');
        const datos = await respuesta.json();
        setOficios(datos);
      } catch (err) {
        setError('Se cargaron datos de ejemplo porque el backend no respondió.');
        setOficios(oficiosIniciales);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, []);

  const oficiosFiltrados = useMemo(() => {
    return oficios.filter((item) => {
      const coincideCategoria = filtro === 'Todas' || item.oficio === filtro;
      const texto = `${item.nombre} ${item.oficio} ${item.ubicacion} ${item.descripcion}`.toLowerCase();
      const coincideBusqueda = texto.includes(busqueda.toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [oficios, filtro, busqueda]);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
  };

  const manejarFoto = (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    setErrorFoto('');

    if (!archivo.type.startsWith('image/')) {
      setErrorFoto('Solo se permiten imágenes.');
      return;
    }
    if (archivo.size > LIMITE_FOTO_BYTES) {
      setErrorFoto('La imagen no puede superar 400 KB.');
      return;
    }

    const lector = new FileReader();
    lector.onload = (e) => setFoto(e.target.result);
    lector.readAsDataURL(archivo);
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    const nuevoOficio = {
      ...formulario,
      id: Date.now(),
      foto,
      valoracion: 0,
      votos: 0
    };

    try {
      const respuesta = await fetch('/api/oficios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoOficio)
      });

      if (!respuesta.ok) throw new Error('No se pudo guardar el servicio');

      const guardado = await respuesta.json();
      setOficios((anterior) => [guardado, ...anterior]);
      setFormulario(estadoInicialFormulario);
      setFoto('');
      setMensaje('Servicio publicado correctamente.');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError('No se pudo conectar con el backend. Se mantuvo la información local.');
      setOficios((anterior) => [nuevoOficio, ...anterior]);
      setFormulario(estadoInicialFormulario);
      setFoto('');
    }
  };

  const manejarValoracion = async (id, puntuacion) => {
    try {
      const respuesta = await fetch(`/api/oficios/${id}/valorar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puntuacion })
      });
      if (!respuesta.ok) return;
      const { valoracion, votos } = await respuesta.json();
      setOficios((anterior) =>
        anterior.map((o) => (o.id === id ? { ...o, valoracion, votos } : o))
      );
    } catch {
      // sin backend: actualiza solo en local
      setOficios((anterior) =>
        anterior.map((o) => {
          if (o.id !== id) return o;
          const votosPrev = o.votos || 1;
          const nueva = Math.round(((o.valoracion * votosPrev + puntuacion) / (votosPrev + 1)) * 10) / 10;
          return { ...o, valoracion: nueva, votos: votosPrev + 1 };
        })
      );
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <span className="badge">TRL 5 · MVP funcional</span>
          <h1>Oficios Ginebra</h1>
          <p>
            Plataforma digital para conectar trabajadores de oficios locales con clientes del municipio de Ginebra, Valle del Cauca.
          </p>
        </div>
        <div className="hero-card">
          <h2>Objetivo</h2>
          <p>
            Dar visibilidad a plomeros, electricistas, pintores y otros oficios, con una experiencia simple, clara y usable.
          </p>
        </div>
      </header>

      <main className="grid">
        <section className="panel panel-form">
          <h2>Publicar un servicio</h2>
          <form onSubmit={manejarEnvio} className="formulario">
            <input name="nombre" placeholder="Nombre completo" value={formulario.nombre} onChange={manejarCambio} required maxLength={100} />
            <select name="oficio" value={formulario.oficio} onChange={manejarCambio}>
              {categorias.filter((item) => item !== 'Todas').map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <input name="ubicacion" placeholder="Ubicación" value={formulario.ubicacion} onChange={manejarCambio} required maxLength={100} />
            <input name="experiencia" placeholder="Experiencia (ej: 3 años)" value={formulario.experiencia} onChange={manejarCambio} required maxLength={100} />
            <input name="telefono" placeholder="Teléfono (solo dígitos)" value={formulario.telefono} onChange={manejarCambio} required maxLength={20} pattern="[\d\s\-()+]{7,20}" title="Solo dígitos, espacios y guiones" />
            <textarea name="descripcion" placeholder="Descripción del servicio" value={formulario.descripcion} onChange={manejarCambio} required maxLength={500} />

            <div className="campo-foto">
              <label className="label-foto" htmlFor="foto-input">
                {foto ? 'Cambiar foto' : 'Subir foto de perfil (opcional)'}
              </label>
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={manejarFoto}
                className="input-foto-oculto"
              />
              {errorFoto && <p className="aviso" style={{ margin: '4px 0 0' }}>{errorFoto}</p>}
              {foto && <img src={foto} alt="Preview" className="foto-preview" />}
            </div>

            <button type="submit">Publicar</button>
          </form>
          {mensaje ? <p className="ok">{mensaje}</p> : null}
          {error ? <p className="aviso">{error}</p> : null}
        </section>

        <section className="panel">
          <div className="fila-superior">
            <h2>Servicios disponibles</h2>
            <input
              className="buscador"
              type="search"
              placeholder="Buscar por nombre, oficio o barrio"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="chips">
            {categorias.map((item) => (
              <button
                key={item}
                className={filtro === item ? 'chip active' : 'chip'}
                onClick={() => setFiltro(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          {cargando ? (
            <p>Cargando servicios...</p>
          ) : oficiosFiltrados.length === 0 ? (
            <p className="vacio">No se encontraron servicios con ese criterio.</p>
          ) : (
            <div className="tarjetas">
              {oficiosFiltrados.map((item) => (
                <article className="card" key={item.id}>
                  <div className="card-head">
                    <Avatar nombre={item.nombre} foto={item.foto} />
                    <div className="card-info">
                      <h3>{item.nombre}</h3>
                      <p>{item.oficio}</p>
                    </div>
                  </div>
                  <p>{item.descripcion}</p>
                  <div className="meta">
                    <span>{item.ubicacion}</span>
                    <span>{item.experiencia}</span>
                  </div>
                  <Estrellas
                    valoracion={item.valoracion}
                    votos={item.votos || 0}
                    onValorar={(puntuacion) => manejarValoracion(item.id, puntuacion)}
                  />
                  <a
                    className="telefono"
                    href={/^[\d\s\-+()]{7,20}$/.test(item.telefono) ? `tel:${item.telefono.replace(/\s/g, '')}` : '#'}
                  >
                    Contactar: {item.telefono}
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
