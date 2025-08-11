// Devuelve la URL absoluta para mostrar una imagen de producto
// Si la ruta comienza con /uploads, la arma con el backend; si es base64 o URL externa, la deja igual
const BACKEND_URL = 'http://localhost:3001'; // Cambia esto si usas otro puerto/backend

export function getProductImageUrl(img) {
  if (!img) return '';
  if (typeof img === 'string' && img.startsWith('/uploads')) {
    return BACKEND_URL + img;
  }
  // Si es base64, URL externa o string inválida, la retorna igual
  return img;
}
