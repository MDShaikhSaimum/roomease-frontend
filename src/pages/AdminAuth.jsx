import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import './AdminAuth.css';

function AdminAuth() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await authAPI.registerAdmin(
          formData.email,
          formData.password,
          formData.adminSecret
        );
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setSuccess('Admin registered successfully! Redirecting...');
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        const response = await authAPI.login(formData.email, formData.password);
        const user = response.data.user;
        
        if (user.role !== 'admin') {
          setError('Only admins can access this panel');
          return;
        }
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(user));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Error ${isRegister ? 'registering' : 'logging in'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-wrapper">
        <h1>{isRegister ? 'Admin Registration' : 'Admin Login'}</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="admin-auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="adminSecret">Admin Secret Key</label>
              <input
                type="password"
                id="adminSecret"
                name="adminSecret"
                value={formData.adminSecret}
                onChange={handleChange}
                placeholder="Enter admin secret"
                required
              />
              <small className="hint">Contact system administrator for the secret key</small>
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Please wait...' : (isRegister ? 'Register as Admin' : 'Login as Admin')}
          </button>
        </form>

        <div className="auth-toggle">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setFormData({ email: '', password: '', adminSecret: '' });
                  setError('');
                }}
              >
                Login here
              </button>
            </>
          ) : (
            <>
              Don't have an admin account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setFormData({ email: '', password: '', adminSecret: '' });
                  setError('');
                }}
              >
                Register here
              </button>
            </>
          )}
        </div>

        <div className="back-link">
          <button onClick={() => navigate('/home')} className="back-btn">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAuth;
