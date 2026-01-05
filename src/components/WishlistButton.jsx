import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/client';
import '../styles/WishlistButton.css';

export default function WishlistButton({ listingId, onToggle }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkWishlist();
  }, [listingId]);

  const checkWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist/check/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to check wishlist');
      }
      const data = await response.json();
      setIsWishlisted(data.inWishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleToggle = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      let response;
      if (isWishlisted) {
        response = await fetch(`/api/wishlist/${listingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await fetch(`${API_BASE_URL}/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ listingId })
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Wishlist API error:', errorData);
        throw new Error(errorData.message || 'Failed to update wishlist');
      }
      
      setIsWishlisted(!isWishlisted);
      if (onToggle) onToggle(!isWishlisted);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert(`Failed to update wishlist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <span className="heart-icon">{isWishlisted ? '❤️' : '🤍'}</span>
      {isWishlisted ? 'Saved' : 'Save'}
    </button>
  );
}
