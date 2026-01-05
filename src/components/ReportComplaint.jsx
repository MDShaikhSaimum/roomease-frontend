import { useState } from 'react';
import { reportAPI } from '../api/client';

const ReportComplaint = ({ listingId, userId, onReportSubmitted }) => {
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!reportType) {
      setError('Please select a report type');
      setLoading(false);
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description');
      setLoading(false);
      return;
    }

    try {
      const reportData = {
        reportType,
        description,
        listingId: listingId || undefined,
        reportedUserId: userId || undefined
      };

      const response = await reportAPI.submitReport(reportData);
      setMessage(response.data.message);
      setDescription('');
      setReportType('');

      setTimeout(() => {
        setShowModal(false);
        if (onReportSubmitted) {
          onReportSubmitted();
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="report-btn" onClick={() => setShowModal(true)}>
        🚩 Report
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="report-modal">
            <div className="modal-header">
              <h2>Report an Issue</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmitReport} className="report-form">
              <div className="form-group">
                <label>Report Type *</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  required
                  className="form-control"
                >
                  <option value="">Select a report type</option>
                  <option value="scam">Scam/Fraud</option>
                  <option value="fake_listing">Fake Listing</option>
                  <option value="inappropriate_behavior">Inappropriate Behavior</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide detailed information about your report..."
                  rows="5"
                  className="form-control"
                  required
                ></textarea>
              </div>

              {error && <div className="alert alert-error">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportComplaint;
