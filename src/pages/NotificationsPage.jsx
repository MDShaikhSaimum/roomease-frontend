import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';
import '../pages/NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setNotifications(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/mark/all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'listing_approved': return '✅';
      case 'listing_rejected': return '❌';
      case 'new_review': return '⭐';
      case 'report_update': return '🚨';
      default: return '🔔';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Notifications</h2>
        {notifications.some(n => !n.read) && (
          <button onClick={markAllAsRead} className="mark-all-btn">
            Mark all as read
          </button>
        )}
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
        <button
          className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Read ({notifications.filter(n => n.read).length})
        </button>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="no-notifications">
          <p>No {filter === 'all' ? '' : filter} notifications</p>
        </div>
      ) : (
        <ul className="notifications-list">
          {filteredNotifications.map((notification) => (
            <li
              key={notification._id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                <div className="notification-icon">{getIcon(notification.type)}</div>
                <div className="notification-text">
                  <h4>{notification.title}</h4>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="action-btn read-btn"
                    title="Mark as read"
                  >
                    📖
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  className="action-btn delete-btn"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
