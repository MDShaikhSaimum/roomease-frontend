import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/client';
import NotificationBell from './NotificationBell';
import './Navbar.css';

export default function Navbar({ isAuthenticated, onLogout }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const isLandlord = user.role === 'landlord';
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread/count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          🏠 RoomEase
        </div>
        
        <ul className="nav-menu">
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <>
                  <li className="nav-item">
                    <button
                      className="nav-link chat-link"
                      onClick={() => navigate('/chat')}
                      title="Chat with landlords"
                    >
                      💬 Chat
                    </button>
                  </li>
                </>
              )}
              
              <li className="nav-item">
                <NotificationBell 
                  unreadCount={unreadCount}
                  onClick={() => navigate('/notifications')}
                />
              </li>

              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  ☰ Menu
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    {isLandlord ? (
                      <>
                        <button onClick={() => handleNavigation('/my-listings')}>
                          📋 My Listings
                        </button>
                        <button onClick={() => handleNavigation('/create-listing')}>
                          ➕ Create Listing
                        </button>
                        <button onClick={() => handleNavigation('/my-reports')}>
                          🚩 Reports
                        </button>
                        <button onClick={() => handleNavigation('/reviews')}>
                          ⭐ Reviews
                        </button>
                        <hr className="dropdown-divider" />
                        <button onClick={() => handleNavigation('/profile')}>
                          👤 Profile
                        </button>
                        <button onClick={() => handleNavigation('/reset-password')}>
                          🔐 Reset Password
                        </button>
                        <hr className="dropdown-divider" />
                        <button onClick={handleLogout} className="logout-item">
                          🚪 Logout
                        </button>
                      </>
                    ) : !isAdmin ? (
                      <>
                        <button onClick={() => handleNavigation('/my-bookings')}>
                          📋 My Bookings
                        </button>
                        <button onClick={() => handleNavigation('/wishlist')}>
                          ❤️ Wishlist
                        </button>
                        <button onClick={() => handleNavigation('/my-reports')}>
                          🚩 Reports
                        </button>
                        <button onClick={() => handleNavigation('/reviews')}>
                          ⭐ Reviews
                        </button>
                        <hr className="dropdown-divider" />
                        <button onClick={() => handleNavigation('/profile')}>
                          👤 Profile
                        </button>
                        <button onClick={() => handleNavigation('/reset-password')}>
                          🔐 Reset Password
                        </button>
                        <hr className="dropdown-divider" />
                        <button onClick={handleLogout} className="logout-item">
                          🚪 Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleNavigation('/admin')}>
                          🔐 Admin Panel
                        </button>
                        <hr className="dropdown-divider" />
                        <button onClick={handleLogout} className="logout-item">
                          🚪 Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <button
                  className="nav-link"
                  onClick={() => navigate('/reviews')}
                  title="Review the RoomEase app"
                >
                  ⭐ Reviews
                </button>
              </li>
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  ☰ Menu
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button onClick={() => handleNavigation('/login')}>
                      🔐 Sign In
                    </button>
                    <button onClick={() => handleNavigation('/register-options')}>
                      ✍️ Register
                    </button>
                    <button onClick={() => handleNavigation('/admin-login')}>
                      👨‍💼 Admin Login
                    </button>
                  </div>
                )}
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
