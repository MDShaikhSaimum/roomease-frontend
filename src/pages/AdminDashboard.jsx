import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, API_BASE_URL } from '../api/client';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('listings');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [reportFilter, setReportFilter] = useState('pending');
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reportResolution, setReportResolution] = useState('');
  const [reportAction, setReportAction] = useState('');
  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    rejectedListings: 0,
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (userData.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    
    setUser(userData);
    fetchStats();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchListings();
    } else if (activeTab === 'reports') {
      fetchReports();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [filterStatus, reportFilter, bookingFilter, activeTab]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPendingListings(filterStatus);
      setListings(response.data.listings || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getReports(reportFilter);
      setReports(response.data.reports || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/my-listings-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      const filtered = data.filter(b => b.status === bookingFilter);
      setBookings(filtered || []);
    } catch (err) {
      setError('Error fetching booking requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBooking = async (requestId) => {
    try {
      const response = await fetch(`/api/bookings/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setSuccessMessage('Booking request approved successfully');
        fetchBookings();
        setSelectedBooking(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Error approving booking request');
    }
  };

  const handleRejectBooking = async (requestId) => {
    try {
      const response = await fetch(`/api/bookings/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setSuccessMessage('Booking request rejected');
        fetchBookings();
        setSelectedBooking(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Error rejecting booking request');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApproveListing = async (id) => {
    try {
      await adminAPI.approveListing(id);
      setSuccessMessage('Listing approved successfully');
      setListings(listings.filter(l => l._id !== id));
      setSelectedListing(null);
      fetchStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving listing');
    }
  };

  const handleRejectListing = async (id) => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await adminAPI.rejectListing(id, rejectReason);
      setSuccessMessage('Listing rejected successfully');
      setListings(listings.filter(l => l._id !== id));
      setSelectedListing(null);
      setRejectReason('');
      fetchStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error rejecting listing');
    }
  };

  const handleUpdateReport = async (id) => {
    if (!reportAction) {
      setError('Please select an action');
      return;
    }

    if ((reportAction === 'resolved' || reportAction === 'dismissed') && !reportResolution.trim()) {
      setError('Please provide resolution details');
      return;
    }

    try {
      await adminAPI.updateReportStatus(id, reportAction, reportResolution);
      setSuccessMessage('Report updated successfully');
      setReports(reports.filter(r => r._id !== id));
      setSelectedReport(null);
      setReportAction('');
      setReportResolution('');
      fetchStats();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating report');
    }
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      scam: '🚨 Scam/Fraud',
      fake_listing: '⚠️ Fake Listing',
      inappropriate_behavior: '🚫 Inappropriate Behavior',
      other: '❓ Other'
    };
    return labels[type] || type;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🔐 Admin Dashboard</h1>
        <p>Welcome, {user?.email}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalListings}</div>
            <div className="stat-label">Total Listings</div>
          </div>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pendingListings}</div>
            <div className="stat-label">Pending Approval</div>
          </div>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.approvedListings}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-value">{stats.rejectedListings}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <div className="stat-card reports">
          <div className="stat-icon">🚩</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalReports}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            📋 Listings ({stats.pendingListings})
          </button>
          <button
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            🚩 Reports ({stats.pendingReports})
          </button>
          <button
            className={`tab ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📅 Booking Requests
          </button>
        </div>
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="tab-content">
          <div className="filter-section">
            <label>Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading listings...</div>
          ) : listings.length === 0 ? (
            <div className="no-data">
              <p>No {filterStatus} listings to display</p>
            </div>
          ) : (
            <div className="listings-table-container">
              <table className="listings-table">
                <thead>
                  <tr>
                    <th>Landlord</th>
                    <th>Title</th>
                    <th>Rent</th>
                    <th>Location</th>
                    <th>Bedrooms</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing._id}>
                      <td>{listing.landlordId?.name || listing.landlordId?.email}</td>
                      <td>{listing.title}</td>
                      <td>৳{listing.rent}</td>
                      <td>{listing.city}, {listing.state}</td>
                      <td>{listing.bedrooms}</td>
                      <td>
                        <span className={`status-badge status-${listing.status}`}>
                          {listing.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => setSelectedListing(listing)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="tab-content">
          <div className="filter-section">
            <label>Filter by Status:</label>
            <select value={reportFilter} onChange={(e) => setReportFilter(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="no-data">
              <p>No {reportFilter} reports to display</p>
            </div>
          ) : (
            <div className="reports-grid">
              {reports.map((report) => (
                <div key={report._id} className="report-card">
                  <div className="report-type">{getReportTypeLabel(report.reportType)}</div>
                  <div className="report-description">{report.description.substring(0, 100)}...</div>
                  <div className="report-meta">
                    <small>Reported by: {report.reportedBy?.email}</small>
                  </div>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedReport(report)}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedListing.title}</h2>
              <button className="close-btn" onClick={() => setSelectedListing(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <strong>Landlord:</strong>
                <span>{selectedListing.landlordId?.name || selectedListing.landlordId?.email}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{selectedListing.landlordId?.email}</span>
              </div>
              <div className="detail-row">
                <strong>Rent:</strong>
                <span>৳{selectedListing.rent}/month</span>
              </div>
              <div className="detail-row">
                <strong>Address:</strong>
                <span>{selectedListing.address}, {selectedListing.city}, {selectedListing.state} {selectedListing.zipCode}</span>
              </div>
              <div className="detail-row">
                <strong>Bedrooms:</strong>
                <span>{selectedListing.bedrooms}</span>
              </div>
              <div className="detail-row">
                <strong>Bathrooms:</strong>
                <span>{selectedListing.bathrooms}</span>
              </div>
              <div className="detail-row full-width">
                <strong>Description:</strong>
                <p>{selectedListing.description}</p>
              </div>

              {selectedListing.amenities && selectedListing.amenities.length > 0 && (
                <div className="detail-row full-width">
                  <strong>Amenities:</strong>
                  <div className="amenities-list">
                    {selectedListing.amenities.map((amenity, idx) => (
                      <span key={idx} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedListing.status === 'rejected' && selectedListing.rejectionReason && (
                <div className="detail-row full-width">
                  <strong>Rejection Reason:</strong>
                  <p>{selectedListing.rejectionReason}</p>
                </div>
              )}

              {selectedListing.status === 'pending' && (
                <div className="action-section">
                  <div className="form-group">
                    <label>Rejection Reason (if rejecting):</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="modal-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleApproveListing(selectedListing._id)}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectListing(selectedListing._id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{getReportTypeLabel(selectedReport.reportType)}</h2>
              <button className="close-btn" onClick={() => setSelectedReport(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <strong>Reported By:</strong>
                <span>{selectedReport.reportedBy?.email}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge status-${selectedReport.status}`}>
                  {selectedReport.status}
                </span>
              </div>
              <div className="detail-row full-width">
                <strong>Description:</strong>
                <p>{selectedReport.description}</p>
              </div>

              {selectedReport.listingId && (
                <div className="detail-row">
                  <strong>Reported Listing:</strong>
                  <span>{selectedReport.listingId.title}</span>
                </div>
              )}

              {selectedReport.reportedUserId && (
                <div className="detail-row">
                  <strong>Reported User:</strong>
                  <span>{selectedReport.reportedUserId.email}</span>
                </div>
              )}

              {selectedReport.resolution && (
                <div className="detail-row full-width">
                  <strong>Current Resolution:</strong>
                  <p>{selectedReport.resolution}</p>
                </div>
              )}

              {selectedReport.status !== 'resolved' && selectedReport.status !== 'dismissed' && (
                <div className="action-section">
                  <div className="form-group">
                    <label>Action:</label>
                    <select
                      value={reportAction}
                      onChange={(e) => setReportAction(e.target.value)}
                    >
                      <option value="">Select action</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismiss</option>
                    </select>
                  </div>

                  {(reportAction === 'resolved' || reportAction === 'dismissed') && (
                    <div className="form-group">
                      <label>Resolution Details:</label>
                      <textarea
                        value={reportResolution}
                        onChange={(e) => setReportResolution(e.target.value)}
                        placeholder="Enter resolution details..."
                        rows="3"
                      ></textarea>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button
                      className="btn-update"
                      onClick={() => handleUpdateReport(selectedReport._id)}
                    >
                      Update Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="tab-content">
          <div className="filter-section">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${bookingFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setBookingFilter('pending')}
              >
                ⏳ Pending
              </button>
              <button
                className={`filter-btn ${bookingFilter === 'approved' ? 'active' : ''}`}
                onClick={() => setBookingFilter('approved')}
              >
                ✅ Approved
              </button>
              <button
                className={`filter-btn ${bookingFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => setBookingFilter('rejected')}
              >
                ❌ Rejected
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading booking requests...</div>
          ) : bookings.length === 0 ? (
            <div className="no-data">No {bookingFilter} booking requests</div>
          ) : (
            <div className="requests-list">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className={`request-card ${booking.status}`}
                  onClick={() => setSelectedBooking(selectedBooking?._id === booking._id ? null : booking)}
                >
                  <div className="request-header">
                    <div className="request-info">
                      <h4>{booking.listingId?.title || 'Unknown Listing'}</h4>
                      <p className="user-info">👤 {booking.userId?.name} ({booking.userId?.email})</p>
                    </div>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  {selectedBooking?._id === booking._id && (
                    <div className="request-details">
                      <div className="detail-row">
                        <strong>Listing:</strong>
                        <span>{booking.listingId?.title}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Tenant:</strong>
                        <span>{booking.userId?.name}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Email:</strong>
                        <span>{booking.userId?.email}</span>
                      </div>
                      <div className="detail-row">
                        <strong>Requested Date:</strong>
                        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="action-buttons">
                          <button
                            className="btn-approve"
                            onClick={() => handleApproveBooking(booking._id)}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() => handleRejectBooking(booking._id)}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
