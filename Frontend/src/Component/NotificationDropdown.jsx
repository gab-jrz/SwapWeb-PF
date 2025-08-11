import React, { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import '../styles/NotificationDropdown.css';

const NotificationDropdown = ({ userId, isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    refresh 
  } = useNotifications(userId);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Refrescar notificaciones cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && userId) {
      refresh();
    }
  }, [isOpen, userId, refresh]);

  const handleNotificationClick = async (notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Aquí puedes agregar lógica para navegar a la página relacionada
    // Por ejemplo, si es un mensaje, ir al chat
    if (notification.data?.messageId) {
      // navigate(`/chat/${notification.data.messageId}`);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'mensaje_directo': '💬',
      'mensaje_intercambio': '🔄',
      'propuesta_intercambio': '🤝',
      'cambio_estado': '📋',
      'intercambio_completado': '✅',
      'nueva_calificacion': '⭐',
      'recordatorio': '⏰'
    };
    return icons[type] || '📢';
  };

  const getPriorityClass = (priority) => {
    return `notification-priority-${priority}`;
  };

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <h4>Notificaciones</h4>
        {unreadCount > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllRead}
            title="Marcar todas como leídas"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="notification-loading">
            <div className="loading-spinner"></div>
            <span>Cargando notificaciones...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <span className="no-notifications-icon">🔔</span>
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {notification.timeAgo}
                </div>
              </div>

              <div className="notification-actions">
                {!notification.read && (
                  <div className="unread-indicator" title="No leída"></div>
                )}
                <button
                  className="delete-notification-btn"
                  onClick={(e) => handleDeleteNotification(e, notification._id)}
                  title="Eliminar notificación"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 10 && (
        <div className="notification-footer">
          <button className="view-all-btn">
            Ver todas las notificaciones
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
