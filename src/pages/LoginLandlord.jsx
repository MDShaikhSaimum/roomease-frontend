import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import './Login.css';

export default function LoginLandlord({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Check if user is landlord
        if (user.role !== 'landlord') {
          setErrors({ submit: 'This account is not registered as a landlord. Please use the tenant login.' });
          setLoading(false);
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        onLoginSuccess();
        navigate('/home');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">🏠 Landlord Login</h1>
        <p className="login-subtitle">Post and manage your properties on RoomEase</p>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'input-error' : ''}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'input-error' : ''}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login as Landlord'}
          </button>
        </form>

        <div className="register-link">
          Don't have an account?{' '}
          <button
            className="link-btn"
            onClick={() => navigate('/register-landlord')}
          >
            Register as landlord
          </button>
        </div>

        <div className="back-link">
          <button
            className="link-btn"
            onClick={() => navigate('/login-options')}
          >
            ← Back to login options
          </button>
        </div>
      </div>
    </div>
  );
}
