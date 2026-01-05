import './NotFound.css';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <button className="back-btn" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    </div>
  );
}
