import { useState } from 'react';

export default function Estrellas({ valoracion, votos, onValorar }) {
  const [hover, setHover] = useState(0);
  const [votado, setVotado] = useState(false);

  const manejarVoto = async (puntuacion) => {
    if (votado) return;
    setVotado(true);
    onValorar(puntuacion);
  };

  return (
    <div className="estrellas">
      <div className="estrellas-iconos">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`estrella ${n <= (hover || Math.round(valoracion)) ? 'activa' : ''} ${votado ? 'bloqueada' : ''}`}
            onMouseEnter={() => !votado && setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => manejarVoto(n)}
          >
            ★
          </span>
        ))}
      </div>
      <span className="estrellas-meta">
        {votos === 0 ? 'Sin votos aún' : `${valoracion.toFixed(1)} · ${votos} ${votos === 1 ? 'voto' : 'votos'}`}
      </span>
    </div>
  );
}
