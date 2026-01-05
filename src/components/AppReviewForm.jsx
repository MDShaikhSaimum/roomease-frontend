import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/client';
import '../styles/AppReviewForm.css';

export default function AppReviewForm() {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReviews();
    checkUserReview();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appreviews`);
      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const checkUserReview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appreviews/my-review`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserReview(data.review);
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim()) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/appreviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, title, comment })
      });

      if (response.ok) {
        setMessage('Review submitted successfully!');
        setTitle('');
        setComment('');
        setRating(5);
        setShowForm(false);
        fetchReviews();
        checkUserReview();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setMessage('Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/appreviews/my-review`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUserReview(null);
        fetchReviews();
        setMessage('Review deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      setMessage('Error deleting review');
    }
  };

  const handleMarkHelpful = async (reviewId, type) => {
    try {
      await fetch(`/api/appreviews/${reviewId}/${type === 'helpful' ? 'helpful' : 'not-helpful'}`, {
        method: 'POST'
      });
      fetchReviews();
    } catch (error) {
      console.error('Error marking review:', error);
    }
  };

  const renderStars = (count, interactive = false, onRate = null) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= count ? 'filled' : ''}`}
            onClick={() => interactive && onRate && onRate(star)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="app-review-container">
      <div className="review-header">
        <div className="rating-summary">
          <div className="average-rating">
            {renderStars(Math.round(averageRating))}
            <span className="rating-number">{averageRating}</span>
            <span className="total-reviews">({totalReviews} reviews)</span>
          </div>
        </div>

        {!userReview && (
          <button
            className="btn-write-review"
            onClick={() => setShowForm(!showForm)}
          >
            ✍️ Write a Review
          </button>
        )}
      </div>

      {message && (
        <div className="message">
          {message}
          <button onClick={() => setMessage('')}>×</button>
        </div>
      )}

      {showForm && !userReview && (
        <div className="review-form">
          <h3>Rate the RoomEase App</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Rating:</label>
              {renderStars(rating, true, setRating)}
            </div>

            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Great app, very helpful!"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label>Comment:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with RoomEase..."
                maxLength={500}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? '⏳ Submitting...' : '✓ Submit Review'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {userReview && (
        <div className="user-review-card">
          <h3>Your Review</h3>
          <div className="review-content">
            {renderStars(userReview.rating)}
            <h4>{userReview.title}</h4>
            <p>{userReview.comment}</p>
            <small>Reviewed on {new Date(userReview.createdAt).toLocaleDateString()}</small>
            <div className="user-review-actions">
              <button className="btn-edit" onClick={() => setShowForm(true)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={handleDeleteReview}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="reviews-list">
        <h3>All Reviews ({totalReviews})</h3>
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header-item">
                <div className="reviewer-info">
                  <strong>{review.userId?.name || 'Anonymous'}</strong>
                  {renderStars(review.rating)}
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <h4>{review.title}</h4>
              <p>{review.comment}</p>
              <div className="review-feedback">
                <button
                  className="feedback-btn helpful"
                  onClick={() => handleMarkHelpful(review._id, 'helpful')}
                >
                  👍 Helpful ({review.helpful})
                </button>
                <button
                  className="feedback-btn"
                  onClick={() => handleMarkHelpful(review._id, 'not-helpful')}
                >
                  👎 Not Helpful ({review.notHelpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
