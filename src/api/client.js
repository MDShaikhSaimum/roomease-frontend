import axios from 'axios';

// Use only environment variable - must be set for each environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error('❌ Error: VITE_API_BASE_URL environment variable is not set');
  console.warn('Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
}

console.log('🔗 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('📤 Request:', config.method.toUpperCase(), config.url);
  return config;
});

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  registerLandlord: (name, email, password) =>
    api.post('/auth/register-landlord', { name, email, password }),
  registerAdmin: (email, password, adminSecret) =>
    api.post('/auth/register-admin', { email, password, adminSecret }),
};

// User endpoints
export const userAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  updateProfile: (profileData) =>
    api.put('/users/profile', profileData),
  resetPassword: (oldPassword, newPassword) =>
    api.put('/users/reset-password', { oldPassword, newPassword }),
};

// Listing endpoints
export const listingAPI = {
  createListing: (listingData) =>
    api.post('/listings', listingData),
  getApprovedListings: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.location) params.append('location', filters.location);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
    if (filters.bathrooms) params.append('bathrooms', filters.bathrooms);
    if (filters.search) params.append('search', filters.search);
    return api.get(`/listings?${params.toString()}`);
  },
  getListing: (id) =>
    api.get(`/listings/${id}`),
  getMyListings: () =>
    api.get('/listings/landlord/my-listings'),
  updateListing: (id, listingData) =>
    api.put(`/listings/${id}`, listingData),
  deleteListing: (id) =>
    api.delete(`/listings/${id}`),
  // Chat endpoints
  startChat: (otherUserId, listingId) =>
    api.post('/chat', { otherUserId, listingId }),
  getChats: () =>
    api.get('/chat'),
  getChat: (chatId) =>
    api.get(`/chat/${chatId}`),
  sendChatMessage: (chatId, messageData) =>
    api.post(`/chat/${chatId}/messages`, messageData),
  deleteChat: (chatId) =>
    api.delete(`/chat/${chatId}`),
  // Review endpoints
  createReview: (reviewData) =>
    api.post('/reviews', reviewData),
  getListingReviews: (listingId) =>
    api.get(`/reviews/listing/${listingId}`),
  getMyReviews: () =>
    api.get('/reviews'),
  updateReview: (reviewId, reviewData) =>
    api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) =>
    api.delete(`/reviews/${reviewId}`),
  markReviewHelpful: (reviewId) =>
    api.post(`/reviews/${reviewId}/helpful`),
  // Wishlist endpoints
  addToWishlist: (listingId) =>
    api.post('/wishlist', { listingId }),
  getWishlist: () =>
    api.get('/wishlist'),
  removeFromWishlist: (listingId) =>
    api.delete(`/wishlist/${listingId}`),
  checkWishlist: (listingId) =>
    api.get(`/wishlist/check/${listingId}`),
  // Notification endpoints
  getNotifications: () =>
    api.get('/notifications'),
  getUnreadCount: () =>
    api.get('/notifications/unread/count'),
  markNotificationAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () =>
    api.put('/notifications/mark/all-read'),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`)
};

// Booking endpoints
export const bookingAPI = {
  createBooking: (listingId, message) =>
    api.post('/bookings', { listingId, message }),
  getMyRequests: () =>
    api.get('/bookings/my-requests'),
  getListingRequests: () =>
    api.get('/bookings/my-listings-requests'),
  approveBooking: (requestId) =>
    api.put(`/bookings/${requestId}/approve`),
  rejectBooking: (requestId) =>
    api.put(`/bookings/${requestId}/reject`),
  checkBookingStatus: (listingId) =>
    api.get(`/bookings/check/${listingId}`)
};

// Admin endpoints
export const adminAPI = {
  getPendingListings: (status = 'pending') =>
    api.get(`/admin/listings?status=${status}`),
  getListingForReview: (id) =>
    api.get(`/admin/listings/${id}`),
  approveListing: (id) =>
    api.put(`/admin/listings/${id}/approve`),
  rejectListing: (id, reason) =>
    api.put(`/admin/listings/${id}/reject`, { reason }),
  getStats: () =>
    api.get('/admin/stats'),
  getReports: (status = 'pending') =>
    api.get(`/admin/reports?status=${status}`),
  getReportDetail: (id) =>
    api.get(`/admin/reports/${id}`),
  updateReportStatus: (id, status, resolution) =>
    api.put(`/admin/reports/${id}/update`, { status, resolution })
};

// Report endpoints
export const reportAPI = {
  submitReport: (reportData) =>
    api.post('/reports', reportData),
  getMyReports: () =>
    api.get('/reports/my-reports'),
  getReportDetail: (id) =>
    api.get(`/reports/${id}`)
};

export { API_BASE_URL };
export default api;