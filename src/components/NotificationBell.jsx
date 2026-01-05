import { useState, useEffect } from 'react';
import '../styles/NotificationBell.css';

export default function NotificationBell({ unreadCount = 0, onClick }) {
  return (
    <button className="notification-bell" onClick={onClick}>
      <span className="bell-icon">🔔</span>
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
    </button>
  );
}
