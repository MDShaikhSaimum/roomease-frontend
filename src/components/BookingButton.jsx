import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../api/client';
import '../styles/BookingButton.css';

export default function BookingButton({ listingId, landlordId, onBook }) {
  const [hasRequest, setHasRequest] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isOwnListing, setIsOwnListing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkIfOwnListing();
    checkBookingStatus();
  }, [listingId, landlordId]);

  const checkIfOwnListing = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id === landlordId) {
      setIsOwnListing(true);
    }
  };

  const checkBookingStatus = async () => {
    try {
      const response = await bookingAPI.checkBookingStatus(listingId);
      setHasRequest(response.data.hasRequest);
      setStatus(response.data.status);
    } catch (error) {
      console.error('Error checking booking status:', error);
    }
  };

  const handleBooking = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await bookingAPI.createBooking(listingId, message);
      setHasRequest(true);
      setStatus('pending');
      setMessage('');
      if (onBook) onBook(response.data);
      alert('Booking request sent! The landlord will review your request.');
    } catch (error) {
      console.error('Error booking listing:', error);
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Failed to book listing: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (isOwnListing) {
    return (
      <button
        className="booking-btn disabled"
        disabled
        title="You cannot book your own listing"
      >
        Your Listing
      </button>
    );
  }

  if (hasRequest) {
    const statusColor = status === 'approved' ? '#4CAF50' : '#FF9800';
    const statusText = status === 'approved' ? 'Approved' : 'Pending';
    
    return (
      <button
        className="booking-btn booked"
        disabled
        title={`Booking request ${statusText}`}
        style={{ backgroundColor: statusColor }}
      >
        {status === 'approved' ? '✓ Approved' : '⏳ Pending'}
      </button>
    );
  }

  return (
    <button
      className="booking-btn"
      onClick={handleBooking}
      disabled={loading}
      title="Send booking request to landlord"
    >
      {loading ? '⏳ Booking...' : '📅 Book Now'}
    </button>
  );
}
