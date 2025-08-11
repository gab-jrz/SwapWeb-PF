import React, { useState, useRef } from 'react';
import { FiImage, FiSend, FiX } from 'react-icons/fi';
import '../styles/ChatInput.css';

const ChatInput = ({ onSendMessage, currentUserId, recipientId, socket }) => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !image) || !socket) return;

    try {
      let imageUrl = null;
      
      if (image) {
        const formData = new FormData();
        formData.append('image', image);
        
        const response = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Error al subir la imagen');
        const data = await response.json();
        imageUrl = data.imageUrl;
      }

      const newMessage = {
        text: message.trim(),
        sender: currentUserId,
        recipient: recipientId,
        timestamp: new Date(),
        imageUrl,
      };

      // Enviar mensaje a través del socket
      socket.emit('sendMessage', newMessage);
      
      // Limpiar el formulario
      setMessage('');
      setImage(null);
      setImagePreview(null);
      
      // Llamar al callback si existe
      if (onSendMessage) onSendMessage(newMessage);
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      alert('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    setImage(file);
    
    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="chat-input-container">
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="Vista previa" />
          <button type="button" onClick={removeImage} className="remove-image-btn">
            <FiX />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="input-group">
          <label htmlFor="image-upload" className="image-upload-label">
            <FiImage className="icon" />
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </label>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="message-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          />
          
          <button type="submit" className="send-button" disabled={!message.trim() && !image}>
            <FiSend className="icon" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
