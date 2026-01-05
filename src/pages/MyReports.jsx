import { useState, useEffect } from 'react';
import { reportAPI } from '../api/client';
import './MyReports.css';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getMyReports();
      setReports(response.data.reports || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
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
    <div className="my-reports-container">
      <div className="reports-header">
        <h1>My Reports</h1>
        <p>Track the status of your submitted reports and complaints</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading your reports...</div>
      ) : reports.length === 0 ? (
        <div className="no-reports">
          <h3>No reports yet</h3>
          <p>You haven't submitted any reports. If you encounter any issues, please report them.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map((report) => (
            <div key={report._id} className="report-card">
              <div className="report-header">
                <h3>{getReportTypeLabel(report.reportType)}</h3>
                <span className={getStatusBadgeClass(report.status)}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>

              <div className="report-content">
                <p className="report-description">{report.description}</p>

                {report.listingId && (
                  <div className="report-target">
                    <strong>Listing:</strong> {report.listingId.title}
                  </div>
                )}

                {report.reportedUserId && (
                  <div className="report-target">
                    <strong>User:</strong> {report.reportedUserId.email}
                  </div>
                )}

                {report.resolution && (
                  <div className="report-resolution">
                    <strong>Resolution:</strong> {report.resolution}
                  </div>
                )}
              </div>

              <div className="report-footer">
                <small>
                  Submitted: {new Date(report.createdAt).toLocaleDateString()}
                </small>
                <button
                  className="view-details-btn"
                  onClick={() => setSelectedReport(report)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedReport(null)}
              >
                ×
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-row">
                <strong>Report Type:</strong>
                <span>{getReportTypeLabel(selectedReport.reportType)}</span>
              </div>

              <div className="detail-row">
                <strong>Status:</strong>
                <span className={getStatusBadgeClass(selectedReport.status)}>
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
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
                  <strong>Resolution:</strong>
                  <p>{selectedReport.resolution}</p>
                </div>
              )}

              <div className="detail-row">
                <strong>Submitted:</strong>
                <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>

              {selectedReport.updatedAt !== selectedReport.createdAt && (
                <div className="detail-row">
                  <strong>Updated:</strong>
                  <span>{new Date(selectedReport.updatedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-close"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
