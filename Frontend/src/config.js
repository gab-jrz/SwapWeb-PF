// Archivo de configuración global para el frontend
// Usa variable de entorno (Vite). Si no existe (por ejemplo, en previews sin env),
// elegir un valor por defecto inteligente en runtime: Railway para vercel.app; localhost para desarrollo local.
const RUNTIME_DEFAULT = (typeof window !== 'undefined' && /vercel\.app$/i.test(window.location.hostname))
  ? 'https://swapweb-pf-production.up.railway.app/api'
  : 'http://localhost:3001/api';

export const API_URL = import.meta.env.VITE_API_URL || RUNTIME_DEFAULT;
