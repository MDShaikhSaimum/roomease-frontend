import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI, API_BASE_URL } from '../api/client';
import './MyListings.css';

function MyListings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Check if user is a landlord
    if (userData.role !== 'landlord') {
      setError('Only landlords can view their listings. Please login as a landlord.');
      setLoading(false);
      return;
    }
    
    fetchMyListings();
    fetchBookingRequests();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await listingAPI.getMyListings();
      setListings(response.data.listings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/my-listings-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setBookingRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching booking requests:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await listingAPI.deleteListing(id);
      setSuccessMessage('Listing deleted successfully');
      setDeleteConfirm(null);
      setListings(listings.filter(l => l._id !== id));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting listing');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'badge-pending';
      case 'approved':
        return 'badge-approved';
      case 'rejected':
        return 'badge-rejected';
      default:
        return '';
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-listing/${id}`);
  };

  const handleApproveBooking = async (requestId) => {
    try {
      const response = await fetch(`/api/bookings/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setSuccessMessage('Booking request approved!');
        fetchBookingRequests();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error approving booking');
      }
    } catch (err) {
      setError('Error approving booking request');
    }
  };

  const handleRejectBooking = async (requestId) => {
    try {
      const response = await fetch(`/api/bookings/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        setSuccessMessage('Booking request rejected!');
        fetchBookingRequests();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error rejecting booking');
      }
    } catch (err) {
      setError('Error rejecting booking request');
    }
  };

  const handleStartChat = async (tenantId, listingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otherUserId: tenantId,
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
    }
  };

  return (
    <div className="my-listings-container">
      <div className="my-listings-header">
        <h1>Landlord Dashboard</h1>
        <button onClick={() => navigate('/create-listing')} className="create-btn">
          + Create New Listing
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => setActiveTab('listings')}
        >
          📋 My Listings ({listings.length})
        </button>
        <button 
          className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          🔔 Booking Requests ({bookingRequests.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : activeTab === 'listings' ? (
        <>
          {listings.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any listings yet.</p>
              <button onClick={() => navigate('/create-listing')} className="create-btn-large">
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="listings-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="listing-card">
              <div className="listing-status">
                <span className={`status-badge ${getStatusBadgeClass(listing.status)}`}>
                  {listing.status.toUpperCase()}
                </span>
              </div>

              <div className="listing-content">
                <h3>{listing.title}</h3>
                
                <div className="listing-details">
                  <div className="detail-item">
                    <span className="label">Rent:</span>
                    <span className="value">৳{listing.rent}/month</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Location:</span>
                    <span className="value">{listing.city}, {listing.state}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Bedrooms:</span>
                    <span className="value">{listing.bedrooms}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Bathrooms:</span>
                    <span className="value">{listing.bathrooms}</span>
                  </div>
                </div>

                <p className="description">{listing.description.substring(0, 100)}...</p>

                {listing.status === 'rejected' && listing.rejectionReason && (
                  <div className="rejection-reason">
                    <strong>Reason:</strong> {listing.rejectionReason}
                  </div>
                )}

                <div className="listing-actions">
                  {listing.status !== 'approved' && (
                    <button
                      onClick={() => handleEdit(listing._id)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteConfirm(listing._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>

                {deleteConfirm === listing._id && (
                  <div className="delete-confirm">
                    <p>Are you sure you want to delete this listing?</p>
                    <div className="confirm-buttons">
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="confirm-yes"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="confirm-no"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
            </div>
          )}
        </>
      ) : (
        <>
          {bookingRequests.length === 0 ? (
            <div className="empty-state">
              <p>No booking requests yet. 📭</p>
            </div>
          ) : (
            <div className="booking-requests-container">
              {bookingRequests.map((request) => (
                <div key={request._id} className="booking-card">
                  <div className="booking-header">
                    <div className="tenant-info">
                      <h3>👤 {request.userId?.name || request.userId?.email}</h3>
                      <p className="listing-title">🏠 {request.listingId?.title}</p>
                    </div>
                    <span className={`status-badge status-${request.status}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="booking-details">
                    <p><strong>Email:</strong> {request.userId?.email}</p>
                    <p><strong>Message:</strong> {request.message || 'No message provided'}</p>
                    <p><strong>Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>

                  {request.status === 'pending' && (
                    <div className="booking-actions">
                      <button
                        onClick={() => handleApproveBooking(request._id)}
                        className="approve-btn"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectBooking(request._id)}
                        className="reject-btn"
                      >
                        ❌ Reject
                      </button>
                      <button
                        onClick={() => handleStartChat(request.userId._id, request.listingId._id)}
                        className="chat-btn"
                      >
                        💬 Chat
                      </button>
                    </div>
                  )}

                  {request.status === 'approved' && (
                    <div className="booking-actions-approved">
                      <button
                        onClick={() => handleStartChat(request.userId._id, request.listingId._id)}
                        className="chat-btn"
                      >
                        💬 Chat
                      </button>
                      <div className="booking-status-approved">
                        ✅ Booking Approved
                      </div>
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="booking-status-rejected">
                      ❌ Booking Rejected
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyListings;
