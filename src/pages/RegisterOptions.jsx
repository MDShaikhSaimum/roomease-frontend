import { useNavigate } from 'react-router-dom';
import './LoginOptions.css';

export default function RegisterOptions() {
  const navigate = useNavigate();

  return (
    <div className="login-options-container">
      <div className="login-options-card">
        <h1 className="login-options-title">🏠 RoomEase</h1>
        <p className="login-options-subtitle">Create your account</p>

        <div className="login-types">
          <button 
            className="login-type-btn landlord-btn"
            onClick={() => navigate('/register-landlord')}
          >
            <div className="btn-icon">🏠</div>
            <div className="btn-label">Register as Landlord</div>
            <div className="btn-description">Post and manage properties</div>
          </button>

          <button 
            className="login-type-btn user-btn"
            onClick={() => navigate('/register-user')}
          >
            <div className="btn-icon">👤</div>
            <div className="btn-label">Register as Tenant</div>
            <div className="btn-description">Browse and book properties</div>
          </button>
        </div>

        <div className="signup-section">
          <p>Already have an account?</p>
          <button 
            className="signup-link-btn"
            onClick={() => navigate('/login-options')}
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}
