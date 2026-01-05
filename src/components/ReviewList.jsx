import { useState, useEffect } from 'react';
import '../styles/ReviewList.css';

export default function ReviewList({ listingId, reviews = [], averageRating = 0, totalReviews = 0 }) {
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <div className="review-list-container">
      <div className="review-stats">
        <div className="avg-rating">
          <div className="rating-number">{averageRating}</div>
          <div className="rating-stars">{renderStars(Math.round(averageRating))}</div>
          <div className="total-reviews">({totalReviews} reviews)</div>
        </div>
      </div>

      <div className="reviews-section">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          <ul className="reviews-list">
            {reviews.map((review) => (
              <li key={review._id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <strong>{review.userId?.name || 'Anonymous'}</strong>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <h4 className="review-title">{review.title}</h4>
                <p className="review-content">{review.description}</p>
                {review.helpful > 0 && (
                  <div className="review-helpful">👍 {review.helpful} found this helpful</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
