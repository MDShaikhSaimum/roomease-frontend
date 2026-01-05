import AppReviewForm from '../components/AppReviewForm';
import './Reviews.css';

export default function ReviewsPage() {
  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <h1>⭐ RoomEase Reviews</h1>
        <p>Share your experience and help others discover RoomEase</p>
      </div>

      <AppReviewForm />
    </div>
  );
}
