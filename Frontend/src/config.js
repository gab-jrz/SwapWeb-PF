// Archivo de configuración global para el frontend
// Cálculo en TIEMPO DE EJECUCIÓN (navegador) para evitar que Vite "hornee" localhost en el build.
export function getAPI_URL() {
  // Si hay env de Vite, usarlo siempre
  const envUrl = import.meta.env && import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  // En hosts de Vercel (preview o prod), apuntar a Railway por defecto
  if (typeof window !== 'undefined' && /vercel\.app$/i.test(window.location.hostname)) {
    return 'https://swapweb-pf-production.up.railway.app/api';
  }

  // Fallback para desarrollo local
  return 'http://localhost:3001/api';
}

// También exportamos un valor evaluado en runtime (cuando carga el bundle en el navegador)
export const API_URL = getAPI_URL();
