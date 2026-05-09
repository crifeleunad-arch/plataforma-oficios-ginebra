import React, { useEffect, useMemo, useState } from 'react';
import { oficiosIniciales } from './data/oficiosIniciales';

const categorias = ['Todas', 'Plomería', 'Electricidad', 'Pintura', 'Carpintería', 'Mantenimiento'];

const estadoInicialFormulario = {
  nombre: '',
  oficio: 'Plomería',
  ubicacion: '',
  experiencia: '',
  descripcion: '',
  telefono: ''
};

export default function App() {
  const [oficios, setOficios] = useState([]);
  const [filtro, setFiltro] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
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

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    const nuevoOficio = {
      ...formulario,
      id: Date.now(),
      valoracion: 5
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
      setMensaje('Servicio publicado correctamente.');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      setError('No se pudo conectar con el backend. Se mantuvo la información local.');
      setOficios((anterior) => [nuevoOficio, ...anterior]);
      setFormulario(estadoInicialFormulario);
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
            <input name="nombre" placeholder="Nombre completo" value={formulario.nombre} onChange={manejarCambio} required />
            <select name="oficio" value={formulario.oficio} onChange={manejarCambio}>
              {categorias.filter((item) => item !== 'Todas').map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <input name="ubicacion" placeholder="Ubicación" value={formulario.ubicacion} onChange={manejarCambio} required />
            <input name="experiencia" placeholder="Experiencia" value={formulario.experiencia} onChange={manejarCambio} required />
            <input name="telefono" placeholder="Teléfono" value={formulario.telefono} onChange={manejarCambio} required />
            <textarea name="descripcion" placeholder="Descripción del servicio" value={formulario.descripcion} onChange={manejarCambio} required />
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
          ) : (
            <div className="tarjetas">
              {oficiosFiltrados.map((item) => (
                <article className="card" key={item.id}>
                  <div className="card-head">
                    <div>
                      <h3>{item.nombre}</h3>
                      <p>{item.oficio}</p>
                    </div>
                    <span className="rating">★ {item.valoracion}</span>
                  </div>
                  <p>{item.descripcion}</p>
                  <div className="meta">
                    <span>{item.ubicacion}</span>
                    <span>{item.experiencia}</span>
                  </div>
                  <a className="telefono" href={`tel:${item.telefono.replace(/\s/g, '')}`}>
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
