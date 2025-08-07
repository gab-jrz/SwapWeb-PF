# Implementación de Paginación en SwapWeb

## Descripción

Se ha implementado un sistema completo de paginación para la lista de productos en la aplicación SwapWeb. La paginación incluye:

- **Paginación del lado del servidor**: Los productos se cargan por páginas desde el backend
- **Filtros integrados**: Búsqueda y filtrado por categoría funcionan con la paginación
- **Selector de productos por página**: Los usuarios pueden elegir cuántos productos ver (8, 12, 16, 20)
- **Navegación intuitiva**: Botones de anterior/siguiente y números de página
- **Información contextual**: Muestra cuántos productos se están viendo del total

## Componentes Creados

### 1. Pagination.jsx
Componente reutilizable para la navegación de páginas que incluye:
- Botones de "Anterior" y "Siguiente"
- Números de página con navegación directa
- Lógica para mostrar máximo 5 páginas visibles
- Estados deshabilitados para botones cuando no hay más páginas

### 2. ProductsPerPage.jsx
Componente para seleccionar la cantidad de productos por página:
- Selector dropdown con opciones predefinidas
- Integración con el estado de la aplicación
- Reset automático a la primera página al cambiar

## Cambios en el Backend

### Ruta GET /products
Se modificó para soportar:
- **Paginación**: Parámetros `page` y `limit`
- **Filtros**: Parámetros `search` y `categoria`
- **Respuesta estructurada**: Incluye productos y metadatos de paginación

```javascript
// Ejemplo de respuesta
{
  "products": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

## Cambios en el Frontend

### Servicio API (api.js)
- Función `getProducts` actualizada para soportar parámetros de paginación y filtros
- Construcción dinámica de URLs con parámetros

### Página Home (Home.jsx)
- Estados para manejar paginación
- Lógica para resetear a la primera página cuando cambian los filtros
- Integración de componentes de paginación
- Scroll automático al cambiar de página

## Características Técnicas

### Rendimiento
- **Paginación del servidor**: Solo se cargan los productos necesarios
- **Filtros optimizados**: Los filtros se aplican en la base de datos
- **Carga eficiente**: Evita cargar todos los productos de una vez

### UX/UI
- **Navegación fluida**: Transiciones suaves entre páginas
- **Información clara**: Muestra el progreso de navegación
- **Responsive**: Funciona bien en dispositivos móviles
- **Accesibilidad**: Navegación por teclado y lectores de pantalla

### Funcionalidades
- **Búsqueda en tiempo real**: Los filtros se aplican automáticamente
- **Persistencia de filtros**: Los filtros se mantienen al cambiar de página
- **Reset inteligente**: Vuelve a la primera página al cambiar filtros

## Uso

### Para el Usuario
1. **Navegar páginas**: Usar botones "Anterior"/"Siguiente" o números de página
2. **Cambiar productos por página**: Usar el selector en la parte superior
3. **Filtrar**: Usar la búsqueda y filtros de categoría
4. **Ver información**: El contador muestra el progreso actual

### Para el Desarrollador
Los componentes son reutilizables y pueden ser implementados en otras partes de la aplicación que requieran paginación.

## Archivos Modificados/Creados

### Backend
- `backend/src/routes/products.js` - Ruta principal con paginación

### Frontend
- `Frontend/src/Component/Pagination.jsx` - Componente de paginación
- `Frontend/src/Component/ProductsPerPage.jsx` - Selector de productos por página
- `Frontend/src/Pages/Home.jsx` - Página principal con paginación integrada
- `Frontend/src/services/api.js` - Servicio API actualizado
- `Frontend/src/styles/Pagination.css` - Estilos para paginación
- `Frontend/src/styles/ProductsPerPage.css` - Estilos para selector
- `Frontend/src/styles/Home.css` - Estilos adicionales para información de paginación

## Próximas Mejoras Posibles

1. **Persistencia de estado**: Guardar preferencias de paginación en localStorage
2. **URL params**: Mantener estado de paginación en la URL
3. **Infinite scroll**: Alternativa a la paginación tradicional
4. **Ordenamiento**: Agregar opciones de ordenamiento
5. **Caché**: Implementar caché para mejorar rendimiento 