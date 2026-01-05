import { useState } from 'react';
import '../styles/ReviewForm.css';

export default function ReviewForm({ listingId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({
        listingId,
        ...formData
      });
      setFormData({ rating: 5, title: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Write a Review</h3>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating</label>
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map(num => (
              <label key={num} className="rating-label">
                <input
                  type="radio"
                  name="rating"
                  value={num}
                  checked={formData.rating === num}
                  onChange={handleChange}
                />
                <span className="star">{'⭐'.repeat(num)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="title">Review Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Great apartment, highly recommended"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Your Review</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Share your experience with this property..."
            rows="4"
            required
          />
        </div>

        <div className="form-buttons">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  );
}
