import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingAPI } from '../api/client';
import './CreateListing.css';

function CreateListing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
    images: []
  });
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    // Check if user is a landlord
    if (userData.role !== 'landlord') {
      setError('Only landlords can create listings. Please login as a landlord.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAmenity = () => {
    if (amenitiesInput.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenitiesInput.trim()]
      }));
      setAmenitiesInput('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      caption: '',
      file: file
    }));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Convert images to base64
      const imagesWithBase64 = await Promise.all(
        formData.images.map(img => 
          new Promise((resolve) => {
            if (img.file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  url: reader.result,
                  caption: img.caption || ''
                });
              };
              reader.readAsDataURL(img.file);
            } else {
              resolve(img);
            }
          })
        )
      );

      const listingData = {
        ...formData,
        images: imagesWithBase64
      };

      const response = await listingAPI.createListing(listingData);
      setSuccess('Listing created successfully! It will be visible once approved by admin.');
      
      setTimeout(() => {
        navigate('/my-listings');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing-container">
      <div className="create-listing-wrapper">
        <h1>Create New Listing</h1>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Beautiful 2BHK Apartment"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property in detail..."
              rows="4"
              required
            />
          </div>

            <div className="form-row">
            <div className="form-group">
              <label htmlFor="rent">Monthly Rent *</label>
              <input
                type="number"
                id="rent"
                name="rent"
                value={formData.rent}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms *</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bathrooms">Bathrooms *</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State *</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="zipCode">Zip Code *</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="Zip Code"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amenities">Amenities</label>
            <div className="amenities-input">
              <input
                type="text"
                id="amenities"
                value={amenitiesInput}
                onChange={(e) => setAmenitiesInput(e.target.value)}
                placeholder="e.g., WiFi, AC, Parking"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
              />
              <button type="button" onClick={handleAddAmenity} className="add-btn">
                Add
              </button>
            </div>
            <div className="amenities-list">
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="amenity-tag">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="images">Property Images</label>
            <div className="image-upload">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
              />
              <label htmlFor="images" className="upload-label">
                📷 Click to upload images or drag & drop
              </label>
            </div>
            <div className="images-preview">
              {formData.images.map((image, index) => (
                <div key={index} className="image-card">
                  <img src={image.url} alt={`Property ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </form>

        <p className="info-text">
          Note: Your listing will be submitted for admin approval before it becomes visible to users.
        </p>
      </div>
    </div>
  );
}

export default CreateListing;
