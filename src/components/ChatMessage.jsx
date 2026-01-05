import { useState, useEffect } from 'react';
import '../styles/ChatMessage.css';

export default function ChatMessage({ senderId, senderName, content, timestamp, isOwn }) {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`chat-message ${isOwn ? 'own' : 'other'}`}>
      <div className="message-bubble">
        {!isOwn && <div className="sender-name">{senderName}</div>}
        <p className="message-content">{content}</p>
        <span className="message-time">{formatTime(timestamp)}</span>
      </div>
    </div>
  );
}
