import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/WishlistPage.css';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, available
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchWishlist();
  }, [token]);

  useEffect(() => {
    // Auto-refresh wishlist every 3 seconds to catch new additions
    const interval = setInterval(() => {
      if (token) {
        fetchWishlist();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      const data = await response.json();
      setWishlist(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setWishlist([]);
      setLoading(false);
    }
  };

  const removeFromWishlist = async (listingId) => {
    try {
      await fetch(`/api/wishlist/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setWishlist(wishlist.filter(item => item.listingId._id !== listingId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const viewListing = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const filteredWishlist = wishlist.filter(item => {
    if (filter === 'available') {
      return item.listingId.status === 'approved';
    }
    return true;
  });

  if (loading) return <div className="loading">Loading wishlist...</div>;

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h2>❤️ My Wishlist</h2>
        <p className="wishlist-count">{wishlist.length} saved listings</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({wishlist.length})
        </button>
        <button
          className={`filter-btn ${filter === 'available' ? 'active' : ''}`}
          onClick={() => setFilter('available')}
        >
          Available ({wishlist.filter(item => item.listingId.status === 'approved').length})
        </button>
      </div>

      {filteredWishlist.length === 0 ? (
        <div className="no-wishlist">
          <p>
            {wishlist.length === 0
              ? 'Your wishlist is empty. Start saving listings! 🏠'
              : 'No listings match your filter'}
          </p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {filteredWishlist.map((item) => (
            <div key={item._id} className="wishlist-card">
              <div className="card-image">
                {item.listingId.images && item.listingId.images.length > 0 ? (
                  <img src={item.listingId.images[0].url} alt={item.listingId.title} />
                ) : (
                  <div className="no-image">🏠</div>
                )}
                <span
                  className={`status-badge ${item.listingId.status}`}
                >
                  {item.listingId.status}
                </span>
              </div>

              <div className="card-content">
                <h3>{item.listingId.title}</h3>
                <p className="address">📍 {item.listingId.address}, {item.listingId.city}</p>

                <div className="listing-details">
                  <span>🛏️ {item.listingId.bedrooms} beds</span>
                  <span>🚿 {item.listingId.bathrooms} baths</span>
                </div>

                <p className="description">{item.listingId.description.substring(0, 100)}...</p>

                <div className="card-footer">
                  <div className="price">
                    <span className="rent">৳{item.listingId.rent}</span>
                    <span className="period">/month</span>
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => viewListing(item.listingId._id)}
                      className="view-btn"
                    >
                      View
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.listingId._id)}
                      className="remove-btn"
                      title="Remove from wishlist"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="saved-date">
                  Saved {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
