import { useState, useEffect, useCallback } from 'react';
import { PRODUCT_EVENTS, useProductEvents } from '../utils/productEvents';

const API_URL = 'http://localhost:3001/api';

// Hook personalizado para manejar productos con sincronización automática
export const useProducts = (initialProducts = []) => {
  const [productos, setProductos] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { subscribe } = useProductEvents();

  // Función para actualizar un producto específico en la lista
  const updateProductInList = useCallback((updatedProduct) => {
    setProductos(prevProductos => 
      prevProductos.map(producto => 
        (producto.id === updatedProduct.id || producto._id === updatedProduct.id)
          ? { ...producto, ...updatedProduct }
          : producto
      )
    );
  }, []);

  // Función para eliminar un producto de la lista
  const removeProductFromList = useCallback((productId) => {
    setProductos(prevProductos => 
      prevProductos.filter(producto => 
        producto.id !== productId && producto._id !== productId
      )
    );
  }, []);

  // Función para agregar un nuevo producto a la lista
  const addProductToList = useCallback((newProduct) => {
    setProductos(prevProductos => [newProduct, ...prevProductos]);
  }, []);

  // Suscribirse a eventos de productos
  useEffect(() => {
    const unsubscribeUpdated = subscribe(PRODUCT_EVENTS.UPDATED, (productData) => {
      console.log('🔄 Producto actualizado:', productData);
      updateProductInList(productData);
    });

    const unsubscribeDeleted = subscribe(PRODUCT_EVENTS.DELETED, ({ id }) => {
      console.log('🗑️ Producto eliminado:', id);
      removeProductFromList(id);
    });

    const unsubscribeCreated = subscribe(PRODUCT_EVENTS.CREATED, (productData) => {
      console.log('✨ Producto creado:', productData);
      addProductToList(productData);
    });

    const unsubscribeImageUpdated = subscribe(PRODUCT_EVENTS.IMAGE_UPDATED, ({ id, images }) => {
      console.log('🖼️ Imágenes actualizadas:', id, images);
      updateProductInList({ id, images });
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      unsubscribeUpdated();
      unsubscribeDeleted();
      unsubscribeCreated();
      unsubscribeImageUpdated();
    };
  }, [subscribe, updateProductInList, removeProductFromList, addProductToList]);

  // Función para cargar productos desde la API
  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${API_URL}/products`;
      const queryParams = new URLSearchParams();
      
      if (filters.ownerId) {
        queryParams.append('ownerId', filters.ownerId);
      }
      if (filters.categoria) {
        queryParams.append('categoria', filters.categoria);
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      
      const data = await response.json();
      setProductos(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar productos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar productos
  const refreshProducts = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  return {
    productos,
    loading,
    error,
    setProductos,
    updateProductInList,
    removeProductFromList,
    addProductToList,
    fetchProducts,
    refreshProducts
  };
};

export default useProducts;
