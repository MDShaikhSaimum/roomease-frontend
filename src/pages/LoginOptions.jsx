import { useNavigate } from 'react-router-dom';
import './LoginOptions.css';

export default function LoginOptions() {
  const navigate = useNavigate();

  return (
    <div className="login-options-container">
      <div className="login-options-card">
        <h1 className="login-options-title">🏠 RoomEase</h1>
        <p className="login-options-subtitle">Welcome! Choose your login type</p>

        <div className="login-types">
          <button 
            className="login-type-btn landlord-btn"
            onClick={() => navigate('/login-landlord')}
          >
            <div className="btn-icon">🏠</div>
            <div className="btn-label">Landlord</div>
            <div className="btn-description">Post and manage properties</div>
          </button>

          <button 
            className="login-type-btn user-btn"
            onClick={() => navigate('/login-user')}
          >
            <div className="btn-icon">👤</div>
            <div className="btn-label">Tenant</div>
            <div className="btn-description">Browse and book properties</div>
          </button>

          <button 
            className="login-type-btn admin-btn"
            onClick={() => navigate('/login-admin')}
          >
            <div className="btn-icon">🔐</div>
            <div className="btn-label">Admin</div>
            <div className="btn-description">Manage platform</div>
          </button>
        </div>

        <div className="signup-section">
          <p>Don't have an account?</p>
          <button 
            className="signup-link-btn"
            onClick={() => navigate('/register')}
          >
            Create new account
          </button>
        </div>
      </div>
    </div>
  );
}
