// Proxy global de fetch para producción
// - Reescribe cualquier llamada a localhost:3001 hacia VITE_API_URL
// - Si se llama al backend de Railway sin "/api", lo agrega automáticamente
// - No afecta a llamadas externas de terceros

import { API_URL as API_BASE } from '../config';

// Derivar el origin del backend quitando el sufijo /api
const BACKEND_ORIGIN = (API_BASE || '').replace(/\/?api\/?$/, '');

const isLocalhostBackend = (u) => {
  try {
    const url = new URL(u);
    return (
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      (url.port === '3001' || url.port === '3000' || url.port === '')
    );
  } catch {
    return false;
  }
};

const needsApiPrefix = (u) => {
  try {
    const url = new URL(u);
    if (!BACKEND_ORIGIN) return false;
    const backend = new URL(BACKEND_ORIGIN);
    // mismo origin del backend y el path no empieza con /api
    return url.origin === backend.origin && !url.pathname.startsWith('/api');
  } catch {
    return false;
  }
};

const buildUrl = (input) => {
  // input puede ser string o Request
  if (typeof input === 'string') {
    let urlStr = input;

    // 1) Reescribir localhost -> API_URL (incluyendo /api)
    if (isLocalhostBackend(urlStr)) {
      const original = new URL(urlStr);
      // limpiar posible /api duplicado del path
      const cleanedPath = original.pathname.replace(/^\/api\/?/, '/');
      urlStr = `${API_BASE.replace(/\/$/, '')}/${cleanedPath.replace(/^\//, '')}${original.search || ''}`;
    }

    // 2) Si llama al origin del backend sin /api, agregarlo
    if (needsApiPrefix(urlStr)) {
      const u = new URL(urlStr);
      u.pathname = '/api' + (u.pathname.startsWith('/') ? u.pathname : '/' + u.pathname);
      urlStr = u.toString();
    }

    // Normalizar dobles barras accidentales (excepto después de https:)
    urlStr = urlStr.replace(/([^:])\/\/+/, '$1/');
    return urlStr;
  }

  // Request object
  if (input && typeof input === 'object' && typeof input.url === 'string') {
    const newUrl = buildUrl(input.url);
    if (newUrl !== input.url) {
      // Clonar init para preservar método/headers/body
      const init = { ...arguments[1] };
      return new Request(newUrl, init);
    }
  }

  return input;
};

if (typeof window !== 'undefined' && !window.__SWAPWEB_FETCH_PROXY__) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const rewritten = buildUrl(input);
    return originalFetch(rewritten, init);
  };
  window.__SWAPWEB_FETCH_PROXY__ = true;
}
