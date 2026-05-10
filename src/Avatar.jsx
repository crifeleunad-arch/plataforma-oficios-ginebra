const COLORES = ['#4338ca', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];

function colorPorNombre(nombre) {
  const suma = nombre.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORES[suma % COLORES.length];
}

function iniciales(nombre) {
  const partes = nombre.trim().split(' ');
  return partes.length >= 2
    ? (partes[0][0] + partes[1][0]).toUpperCase()
    : partes[0][0].toUpperCase();
}

export default function Avatar({ nombre, foto }) {
  if (foto) {
    return <img className="avatar" src={foto} alt={nombre} style={{ objectFit: 'cover' }} />;
  }
  return (
    <div className="avatar" style={{ background: colorPorNombre(nombre) }}>
      {iniciales(nombre)}
    </div>
  );
}
