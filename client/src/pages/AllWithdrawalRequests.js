import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const AllWithdrawalRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/wallet/withdrawal-requests?status=${statusFilter}`);
      setWithdrawalRequests(response.data || []);
      setFilteredRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (request) => {
    console.log('Approve clicked for request:', request);
    if (!request || !request._id) {
      console.error('Invalid request object:', request);
      return;
    }
    setSelectedRequest(request);
    setUtrNumber('');
    setShowApproveModal(true);
  };

  const handleRejectClick = (request) => {
    console.log('Reject clicked for request:', request);
    if (!request || !request._id) {
      console.error('Invalid request object:', request);
      return;
    }
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!utrNumber.trim()) {
      alert('Please enter UTR number');
      return;
    }

    try {
      await api.put(`/wallet/withdrawal/${selectedRequest._id}`, { 
        action: 'approve', 
        utrNumber: utrNumber.trim(),
        notes: '' 
      });
      alert('Withdrawal approved successfully!');
      setShowApproveModal(false);
      setSelectedRequest(null);
      setUtrNumber('');
      fetchRequests();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert(error.response?.data?.message || 'Error approving withdrawal');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter rejection reason');
      return;
    }

    try {
      await api.put(`/wallet/withdrawal/${selectedRequest._id}`, { 
        action: 'reject', 
        rejectionReason: rejectionReason.trim(),
        notes: '' 
      });
      alert('Withdrawal rejected successfully!');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert(error.response?.data?.message || 'Error rejecting withdrawal');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-500/20 text-green-400 border-green-500/50',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/50'
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-7xl mx-auto text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold neon-text-cyan">
            All Withdrawal Requests
          </h1>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              statusFilter === 'pending'
                ? 'bg-lava-orange text-lava-black'
                : 'bg-charcoal border border-lava-orange/30 text-off-white hover:bg-lava-orange hover:text-lava-black'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              statusFilter === 'completed'
                ? 'bg-lava-orange text-lava-black'
                : 'bg-charcoal border border-lava-orange/30 text-off-white hover:bg-lava-orange hover:text-lava-black'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-bold transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-lava-orange text-lava-black'
                : 'bg-charcoal border border-lava-orange/30 text-off-white hover:bg-lava-orange hover:text-lava-black'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No {statusFilter} withdrawal requests
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                if (!request || !request._id) {
                  console.warn('Invalid request object:', request);
                  return null;
                }
                return (
                  <div key={request._id} className="bg-lava-black/50 border border-lava-orange/20 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-off-white mb-1">
                        {request.userId?.name || 'Unknown User'} ({request.userId?.email || 'N/A'})
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        Amount: <span className="text-fiery-yellow font-bold">₹{request.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Method: {request.withdrawalType === 'upi' ? 'UPI' : 'Bank Account'}
                        {request.withdrawalType === 'upi' && request.withdrawalDetails?.upiId && (
                          <span> - {request.withdrawalDetails.upiId}</span>
                        )}
                        {request.withdrawalType === 'bank_account' && request.withdrawalDetails?.bankAccountNumber && (
                          <span> - {request.withdrawalDetails.bankAccountNumber.slice(-4)}</span>
                        )}
                      </div>
                      {request.withdrawalType === 'upi' && request.withdrawalDetails?.upiName && (
                        <div className="text-xs text-gray-400 mt-1">
                          Name: <span className="text-off-white font-semibold">{request.withdrawalDetails.upiName}</span>
                        </div>
                      )}
                      {request.withdrawalType === 'bank_account' && request.withdrawalDetails && (
                        <div className="text-xs text-gray-500 mt-1">
                          Bank: {request.withdrawalDetails.bankName} | IFSC: {request.withdrawalDetails.ifscCode} | Account: {request.withdrawalDetails.accountHolderName}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Requested: {new Date(request.createdAt).toLocaleString()}
                      </div>
                      {request.processedBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          Processed by: {request.processedBy?.name || 'N/A'}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleApproveClick(request);
                            }}
                            className="px-4 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors text-sm"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRejectClick(request);
                            }}
                            className="px-4 py-2 bg-transparent text-off-white border-2 border-lava-orange font-bold rounded-lg hover:bg-lava-orange hover:text-lava-black transition-colors text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {request.status === 'completed' && request.utrNumber && (
                        <div className="text-xs text-gray-400 mt-2">
                          UTR: {request.utrNumber}
                        </div>
                      )}
                      {request.status === 'rejected' && request.rejectionReason && (
                        <div className="text-xs text-red-400 mt-2">
                          Reason: {request.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Approve Withdrawal</h2>
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                User: <span className="font-bold">{selectedRequest.userId?.name}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Amount: <span className="font-bold text-fiery-yellow">₹{selectedRequest.amount.toLocaleString()}</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                UTR Number *
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="Enter UTR number"
                className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleApprove}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                  setUtrNumber('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-lava-orange mb-4">Reject Withdrawal</h2>
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
                User: <span className="font-bold">{selectedRequest.userId?.name}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Amount: <span className="font-bold text-fiery-yellow">₹{selectedRequest.amount.toLocaleString()}</span>
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                rows="4"
                className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleReject}
                className="flex-1"
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllWithdrawalRequests;

