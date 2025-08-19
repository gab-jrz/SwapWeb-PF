// Devuelve la URL absoluta para mostrar una imagen de producto
// Si la ruta comienza con /uploads, la arma con el backend; si es base64 o URL externa, la deja igual
const BACKEND_URL = 'http://localhost:3001'; // Cambia esto si usas otro puerto/backend

// Normaliza distintas formas de imagen que pueden venir del backend/frontend
// Acepta: string (relativa/absoluta/base64), array de strings/objetos, objeto con {url|path}
export function getProductImageUrl(img) {
  const PLACEHOLDER = '/images/OIP3.jpg';

  // Nada provisto
  if (!img) return PLACEHOLDER;

  // Si es array, usar el primer elemento no vacío
  if (Array.isArray(img)) {
    const first = img.find(Boolean);
    return getProductImageUrl(first);
  }

  // Si es objeto, intentar url o path
  if (typeof img === 'object') {
    const candidate = img.url || img.path || img.src || null;
    return candidate ? getProductImageUrl(candidate) : PLACEHOLDER;
  }

  // A partir de acá asumimos string
  if (typeof img !== 'string') return PLACEHOLDER;

  const trimmed = img.trim().replace(/\\/g, '/');
  if (!trimmed) return PLACEHOLDER;

  // Ya es absoluta (http/https) o base64
  if (/^https?:\/\//i.test(trimmed) || /^data:image\//i.test(trimmed)) {
    return trimmed;
  }

  // Normalizar rutas de uploads que a veces vienen sin barra inicial
  if (trimmed.startsWith('uploads')) {
    return `${BACKEND_URL}/${trimmed}`;
  }

  if (trimmed.startsWith('/uploads')) {
    return `${BACKEND_URL}${trimmed}`;
  }

  // Si es una ruta relativa cualquiera, devolver tal cual y dejar que el host actual la resuelva
  // o usar placeholder si parece inválida
  return trimmed || PLACEHOLDER;
}
