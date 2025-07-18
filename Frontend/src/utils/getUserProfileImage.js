// Utilidad para obtener la imagen de perfil de un usuario por su ID
// Si no la encuentra, retorna un avatar por defecto

export async function getUserProfileImage(userId) {
  try {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) throw new Error('No se pudo obtener el usuario');
    const user = await res.json();
    if (user.imagen && user.imagen.startsWith('data:image')) return user.imagen;
    if (user.imagen) return `/images/${user.imagen}`;
    return '/images/fotoperfil.jpg';
  } catch {
    return '/images/fotoperfil.jpg';
  }
}
