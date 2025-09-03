// Utilidad para normalizar URLs de imágenes a una URL absoluta accesible por el navegador
// Reglas:
// - data: URL -> se devuelve igual
// - http(s) -> se devuelve igual
// - rutas relativas (con o sin / inicial) -> se antepone el API_URL del backend

export const BASE_URL = 'http://localhost:3001';
export const API_URL = `${BASE_URL}/api`;

export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  // Para imágenes estáticas servidas por el backend (ej. /uploads/..), usar BASE_URL
  return trimmed.startsWith('/') ? `${BASE_URL}${trimmed}` : `${BASE_URL}/${trimmed}`;
}
