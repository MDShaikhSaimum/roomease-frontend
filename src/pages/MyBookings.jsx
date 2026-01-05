import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { listingAPI, API_BASE_URL } from '../api/client';
import '../pages/MyBookings.css';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      setError('Error fetching bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (landlordId, listingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otherUserId: landlordId,
          listingId: listingId
        })
      });

      if (response.ok) {
        const chat = await response.json();
        // Pass the chat ID to ChatPage via navigation state
        navigate('/chat', { state: { chatId: chat._id } });
      } else {
        setError('Error starting chat');
      }
    } catch (err) {
      setError('Error starting chat');
      console.error(err);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading-container">
          <p>Loading your bookings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="my-bookings-container">
        <div className="bookings-header">
          <h1>📋 My Bookings</h1>
          <p>Track your property booking requests</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <div className="empty-state">
              <h3>No bookings yet</h3>
              <p>You haven't made any booking requests. Browse properties and book one today!</p>
              <button 
                className="browse-btn"
                onClick={() => navigate('/home')}
              >
                Browse Properties
              </button>
            </div>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="card-header">
                  <h3 className="property-title">{booking.listingId?.title || 'Property'}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>

                <div className="card-body">
                  <div className="booking-info">
                    <div className="info-item">
                      <span className="label">Requested on:</span>
                      <span className="value">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {booking.approvedAt && (
                      <div className="info-item">
                        <span className="label">Approved on:</span>
                        <span className="value">
                          {new Date(booking.approvedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {booking.message && (
                      <div className="info-item">
                        <span className="label">Your message:</span>
                        <span className="value message">{booking.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  {booking.status === 'approved' && (
                    <button
                      className="action-btn chat-btn"
                      onClick={() => handleStartChat(booking.landlordId, booking.listingId._id)}
                      title="Chat with landlord"
                    >
                      💬 Chat with Landlord
                    </button>
                  )}

                  {booking.status === 'pending' && (
                    <button
                      className="action-btn chat-btn"
                      onClick={() => handleStartChat(booking.landlordId, booking.listingId._id)}
                      title="Follow up with landlord"
                    >
                      💬 Contact Landlord
                    </button>
                  )}

                  {booking.status === 'rejected' && (
                    <div className="rejected-info">
                      Your request was not approved. You can browse other properties.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
