import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WishlistButton from '../components/WishlistButton';
import BookingButton from '../components/BookingButton';
import { listingAPI } from '../api/client';
import './Home.css';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    search: ''
  });
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await listingAPI.getApprovedListings();
      setListings(response.data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = listings.filter(listing => listing.status === 'approved');

    if (filters.location) {
      filtered = filtered.filter(listing =>
        listing.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.state.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.minPrice) {
      filtered = filtered.filter(listing => listing.rent >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(listing => listing.rent <= parseFloat(filters.maxPrice));
    }

    if (filters.bedrooms) {
      filtered = filtered.filter(listing => listing.bedrooms >= parseInt(filters.bedrooms));
    }

    if (filters.bathrooms) {
      filtered = filtered.filter(listing => listing.bathrooms >= parseInt(filters.bathrooms));
    }

    if (filters.search) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      search: ''
    });
  };

  const startChat = async (listingId, landlordId, listingTitle) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await listingAPI.startChat(landlordId, listingId);
      navigate('/chat');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Welcome to RoomEase</h1>
          <p>Find Your Perfect Room, Build Your Future</p>
        </div>
      </div>

      <div className="listings-section">
        <div className="search-filters">
          <h3>Search & Filter Listings</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title or description..."
              />
            </div>

            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="City, State, or Address..."
              />
            </div>

            <div className="filter-group">
              <label>Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min rent..."
              />
            </div>

            <div className="filter-group">
              <label>Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max rent..."
              />
            </div>

            <div className="filter-group">
              <label>Min Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleFilterChange}
                placeholder="Bedrooms..."
              />
            </div>

            <div className="filter-group">
              <label>Min Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleFilterChange}
                placeholder="Bathrooms..."
              />
            </div>
          </div>

          <button onClick={handleResetFilters} className="reset-filters-btn">
            Reset Filters
          </button>
        </div>

        <div className="listings-container">
          <h2>Available Listings ({filteredListings.length})</h2>

          {loading ? (
            <div className="loading">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="no-listings">
              <p>No listings found matching your criteria.</p>
              <button onClick={handleResetFilters} className="reset-btn">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="listings-grid">
              {filteredListings.map((listing) => (
                <div key={listing._id} className="listing-card">
                  <div className="card-image">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0].url} alt={listing.title} />
                    ) : (
                      <div className="no-image">🏠</div>
                    )}
                    <div className="card-overlay">
                      <WishlistButton 
                        listingId={listing._id}
                      />
                    </div>
                  </div>

                  <div className="card-content">
                    <h3>{listing.title}</h3>
                    <p className="address">📍 {listing.address}, {listing.city}, {listing.state}</p>

                    <div className="listing-details">
                      <span>🛏️ {listing.bedrooms} beds</span>
                      <span>🚿 {listing.bathrooms} baths</span>
                    </div>

                    <p className="description">{listing.description.substring(0, 80)}...</p>

                    <div className="amenities">
                      {listing.amenities && listing.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">{amenity}</span>
                      ))}
                      {listing.amenities && listing.amenities.length > 3 && (
                        <span className="amenity-tag">+{listing.amenities.length - 3}</span>
                      )}
                    </div>

                    <div className="card-footer">
                      <div className="price">
                        <span className="rent">৳{listing.rent}</span>
                        <span className="period">/month</span>
                      </div>

                      <div className="card-actions">
                        <button
                          onClick={() => startChat(listing._id, listing.landlordId._id, listing.title)}
                          className="chat-btn"
                        >
                          💬 Chat
                        </button>
                        <BookingButton listingId={listing._id} landlordId={listing.landlordId._id} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Why Choose RoomEase?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏠</div>
            <h3>Verified Listings</h3>
            <p>All listings are verified by our admin team for quality assurance</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>In-App Chat</h3>
            <p>Chat directly with landlords without leaving the platform</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Reviews & Ratings</h3>
            <p>See reviews from other users to make informed decisions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">❤️</div>
            <h3>Save Favorites</h3>
            <p>Save listings to your wishlist and revisit them later</p>
          </div>
        </div>
      </div>
    </div>
  );
}
