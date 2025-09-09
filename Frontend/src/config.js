// Archivo de configuración global para el frontend
// Cálculo en TIEMPO DE EJECUCIÓN (navegador) para evitar que Vite "hornee" localhost en el build.
export function getAPI_URL() {
  // 1) Si hay env de Vite en build, usarlo siempre
  const envUrl = import.meta.env && import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  // 2) Si hay un override en runtime (inyectado desde index.html), respetarlo
  const runtimeOverride = (typeof window !== 'undefined' && window.API_URL_OVERRIDE) || null;
  if (runtimeOverride) return runtimeOverride;

  // 3) En cualquier host que no sea local, usar Railway por defecto
  if (typeof window !== 'undefined') {
    const host = window.location && window.location.hostname;
    const isLocalHost = /^(localhost|127\.0\.0\.1)$/i.test(host || '');
    if (!isLocalHost) {
      return 'https://swapweb-pf-production.up.railway.app/api';
    }
  }

  // 4) Fallback para desarrollo local
  return 'http://localhost:3001/api';
}

// También exportamos un valor evaluado en runtime (cuando carga el bundle en el navegador)
export const API_URL = getAPI_URL();
