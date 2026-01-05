import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/client';
import './Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    gender: '',
    profession: '',
    budget: '',
    habits: '',
    preferredLocation: '',
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.data.success) {
        setProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
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

    if (profile.name && profile.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (profile.budget && (isNaN(profile.budget) || profile.budget < 0)) {
      newErrors.budget = 'Budget must be a valid positive number';
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

    try {
      const response = await userAPI.updateProfile(profile);
      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      setErrors({ submit: errorMsg });
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>My Profile</h1>
          <button
            className={`edit-btn ${editing ? 'cancel-btn' : ''}`}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className={`profile-form ${editing ? 'editing' : ''}`}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!editing}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your full name"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                disabled={!editing}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profession">Profession</label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={profile.profession}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your profession"
              />
            </div>

            <div className="form-group">
              <label htmlFor="budget">Monthly Budget (₹)</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={profile.budget}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter your budget"
                className={errors.budget ? 'input-error' : ''}
              />
              {errors.budget && <span className="field-error">{errors.budget}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="preferredLocation">Preferred Location</label>
              <input
                type="text"
                id="preferredLocation"
                name="preferredLocation"
                value={profile.preferredLocation}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Enter preferred location"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="habits">Habits & Preferences</label>
              <textarea
                id="habits"
                name="habits"
                value={profile.habits}
                onChange={handleChange}
                disabled={!editing}
                placeholder="Tell us about your living habits and preferences..."
                rows="4"
              />
            </div>
          </div>

          {editing && (
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
