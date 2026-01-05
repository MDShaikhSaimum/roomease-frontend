import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegisterOptions from './pages/RegisterOptions';
import RegisterLandlord from './pages/RegisterLandlord';
import RegisterUser from './pages/RegisterUser';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import MyBookings from './pages/MyBookings';
import MyReports from './pages/MyReports';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import WishlistPage from './pages/WishlistPage';
import ReviewsPage from './pages/Reviews';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import './styles/global.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        
        {/* Unified Login */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/home" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        
        {/* Registration Options */}
        <Route 
          path="/register-options" 
          element={isAuthenticated ? <Navigate to="/home" /> : <RegisterOptions />} 
        />
        <Route 
          path="/register-landlord" 
          element={isAuthenticated ? <Navigate to="/home" /> : <RegisterLandlord />} 
        />
        <Route 
          path="/register-user" 
          element={isAuthenticated ? <Navigate to="/home" /> : <RegisterUser />} 
        />
        
        {/* Legacy Routes (Redirect to new flows) */}
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/register-options" />} 
        />
        <Route 
          path="/login-options" 
          element={<Navigate to="/login" />} 
        />
        <Route 
          path="/login-landlord" 
          element={<Navigate to="/login" />} 
        />
        <Route 
          path="/login-user" 
          element={<Navigate to="/login" />} 
        />
        
        {/* Admin Login */}
        <Route 
          path="/admin-login" 
          element={<AdminAuth />} 
        />
        
        {/* Public Routes */}
        <Route 
          path="/home" 
          element={<Home />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/reset-password" 
          element={isAuthenticated ? <ResetPassword /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/create-listing" 
          element={isAuthenticated ? <CreateListing /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/my-listings" 
          element={isAuthenticated ? <MyListings /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/my-bookings" 
          element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/my-reports" 
          element={isAuthenticated ? <MyReports /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/chat" 
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/notifications" 
          element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/wishlist" 
          element={isAuthenticated ? <WishlistPage /> : <Navigate to="/login" />} 
        />
        
        {/* Public Routes */}
        <Route 
          path="/reviews" 
          element={<ReviewsPage />} 
        />
        <Route 
          path="/admin" 
          element={<AdminDashboard />} 
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
