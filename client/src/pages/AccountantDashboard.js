import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';

const AccountantDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('payments');
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalPaid: 0,
    thisMonthProcessed: 0,
    totalUsers: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('paid');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isPaymentProofModalOpen, setIsPaymentProofModalOpen] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState('');
  
  // Tournament Registrations state
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [selectedTournamentForReg, setSelectedTournamentForReg] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [regStatusFilter, setRegStatusFilter] = useState('all');
  const [regSearchQuery, setRegSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'payments') {
      fetchPayments();
      fetchStats();
    } else if (activeTab === 'registrations') {
      fetchTournaments();
      fetchRegistrations();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'registrations') {
      filterRegistrations();
    }
  }, [registrations, regStatusFilter, regSearchQuery, selectedTournamentForReg]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await api.get(`/payments?${params.toString()}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/payments/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(payment => 
        payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentStatus === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const handleOpenModal = (payment) => {
    setSelectedPayment(payment);
    const pendingAmount = payment.stats?.pendingEarnings || 
      (payment.stats?.totalEarnings - (payment.stats?.paidEarnings || 0));
    setAmount(pendingAmount > 0 ? pendingAmount.toString() : '');
    setProcessingStatus(payment.paymentStatus === 'paid' ? 'paid' : 'processing');
    setNotes('');
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPayment(null);
    setAmount('');
    setNotes('');
    setProcessingStatus('paid');
    setError('');
  };

  const handleProcessPayment = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    setError('');

    try {
      const response = await api.put(`/payments/${selectedPayment._id}/status`, {
        status: processingStatus,
        amount: amount ? parseFloat(amount) : undefined,
        notes: notes
      });

      // Refresh payments and stats
      await fetchPayments();
      await fetchStats();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await api.get('/tournaments');
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setRegistrationsLoading(true);
      const params = new URLSearchParams();
      if (selectedTournamentForReg) {
        params.append('tournamentId', selectedTournamentForReg);
      }
      
      const response = await api.get(`/tournament-registrations/all?${params.toString()}`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError('Failed to load registrations. Please refresh the page.');
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];

    // Filter by tournament
    if (selectedTournamentForReg) {
      filtered = filtered.filter(reg => 
        reg.tournamentId?._id === selectedTournamentForReg || 
        reg.tournamentId === selectedTournamentForReg
      );
    }

    // Filter by status
    if (regStatusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status === regStatusFilter);
    }

    // Search filter
    if (regSearchQuery) {
      filtered = filtered.filter(reg =>
        reg.teamName.toLowerCase().includes(regSearchQuery.toLowerCase()) ||
        (reg.teamId?.name && reg.teamId.name.toLowerCase().includes(regSearchQuery.toLowerCase()))
      );
    }

    setFilteredRegistrations(filtered);
  };

  const handleApproveRegistration = async (regId, tournamentId) => {
    try {
      await api.put(`/tournament-registrations/${regId}/approve`);
      fetchRegistrations();
    } catch (error) {
      alert('Error approving registration');
    }
  };

  const handleRejectRegistration = async (regId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      try {
        await api.put(`/tournament-registrations/${regId}/reject`, { rejectionReason: reason });
        fetchRegistrations();
      } catch (error) {
        alert('Error rejecting registration');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
      processing: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Processing' },
      paid: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Paid' },
      rejected: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-sm font-bold`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 page-transition">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 neon-text-cyan">Accountant Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome, {user?.name} (Accountant)</p>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-lava-orange/30">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'payments'
                ? 'text-lava-orange border-b-2 border-lava-orange'
                : 'text-gray-400 hover:text-lava-orange'
            }`}
          >
            Payment Management
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-6 py-3 font-bold transition-colors ${
              activeTab === 'registrations'
                ? 'text-lava-orange border-b-2 border-lava-orange'
                : 'text-gray-400 hover:text-lava-orange'
            }`}
          >
            Tournament Registrations
          </button>
        </div>

        {/* Payment Management Tab */}
        {activeTab === 'payments' && (
          <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-lava-orange mb-2">
              {stats.totalUsers || payments.length}
            </div>
            <div className="text-gray-400">Total Users with Earnings</div>
          </div>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-fiery-yellow mb-2">
              ₹{stats.totalPending?.toLocaleString() || '0'}
            </div>
            <div className="text-gray-400">Total Pending Payments</div>
          </div>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-green-400 mb-2">
              ₹{stats.totalPaid?.toLocaleString() || '0'}
            </div>
            <div className="text-gray-400">Total Paid</div>
          </div>
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <div className="text-3xl font-bold text-lava-orange mb-2">
              ₹{stats.thisMonthProcessed?.toLocaleString() || '0'}
            </div>
            <div className="text-gray-400">This Month Processed</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Search Users</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  fetchPayments();
                }}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-lava-orange">Payment Requests</h2>
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-lava-orange/20">
                  <tr>
                    <th className="px-6 py-4 text-left">User</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Total Earnings</th>
                    <th className="px-6 py-4 text-left">Paid</th>
                    <th className="px-6 py-4 text-left">Pending</th>
                    <th className="px-6 py-4 text-left">Tournaments</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const pendingAmount = payment.stats?.pendingEarnings || 
                      (payment.stats?.totalEarnings - (payment.stats?.paidEarnings || 0));
                    const hasPending = pendingAmount > 0;
                    
                    return (
                      <tr key={payment._id} className="border-t border-lava-orange/10 hover:bg-lava-orange/5">
                        <td className="px-6 py-4 font-bold">{payment.name}</td>
                        <td className="px-6 py-4 text-gray-400">{payment.email}</td>
                        <td className="px-6 py-4 text-fiery-yellow font-bold">
                          ₹{payment.stats?.totalEarnings?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 text-green-400 font-bold">
                          ₹{payment.stats?.paidEarnings?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 text-yellow-400 font-bold">
                          ₹{pendingAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{payment.tournaments?.length || 0}</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payment.paymentStatus || 'pending')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleOpenModal(payment)}
                            disabled={!hasPending && payment.paymentStatus === 'paid'}
                            className={`px-4 py-2 font-bold rounded-lg transition-colors ${
                              hasPending || payment.paymentStatus !== 'paid'
                                ? 'bg-lava-orange text-lava-black hover:bg-fiery-yellow'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {payment.paymentStatus === 'paid' && !hasPending ? 'Paid' : 'Process Payment'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              {searchQuery || statusFilter !== 'all' 
                ? 'No payments found matching your filters.' 
                : 'No payment requests at the moment.'}
            </p>
          )}
        </div>
          </>
        )}

        {/* Tournament Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Select Tournament</label>
                  <select
                    value={selectedTournamentForReg || ''}
                    onChange={(e) => {
                      setSelectedTournamentForReg(e.target.value || null);
                      fetchRegistrations();
                    }}
                    className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                  >
                    <option value="">All Tournaments</option>
                    {tournaments.map(tournament => (
                      <option key={tournament._id} value={tournament._id}>
                        {tournament.name} ({tournament.game})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Filter by Status</label>
                  <select
                    value={regStatusFilter}
                    onChange={(e) => setRegStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-300">Search Teams</label>
                  <input
                    type="text"
                    value={regSearchQuery}
                    onChange={(e) => setRegSearchQuery(e.target.value)}
                    placeholder="Search by team name..."
                    className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                  />
                </div>
              </div>
            </div>

            {/* Registrations List */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-lava-orange">Tournament Registrations</h2>
              {registrationsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : filteredRegistrations.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredRegistrations.map(reg => {
                    const tournament = reg.tournamentId;
                    const totalAmount = tournament?.entryFee && reg.numberOfPlayers 
                      ? tournament.entryFee * reg.numberOfPlayers 
                      : 0;
                    
                    return (
                      <div key={reg._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 hover:border-lava-orange transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{reg.teamName}</h3>
                            <p className="text-sm text-gray-400 mt-1">
                              Tournament: {tournament?.name || 'N/A'} ({tournament?.game || 'N/A'})
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Players: {reg.numberOfPlayers} • Payment: {reg.paymentType} - {reg.paymentOption}
                            </p>
                            {totalAmount > 0 && (
                              <p className="text-sm text-fiery-yellow font-bold mt-1">
                                Amount: ₹{totalAmount.toLocaleString()} ({tournament?.entryFee} × {reg.numberOfPlayers} players)
                              </p>
                            )}
                            {reg.phoneNumber && (
                              <p className="text-sm text-gray-400 mt-1">
                                📱 Phone: {reg.phoneNumber}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Registered: {new Date(reg.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              reg.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              reg.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {reg.status}
                            </span>
                            {reg.paymentProof && (
                              <button
                                onClick={() => {
                                  setSelectedPaymentProof(reg.paymentProof);
                                  setIsPaymentProofModalOpen(true);
                                }}
                                className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded hover:bg-blue-600 transition-colors"
                              >
                                View Payment
                              </button>
                            )}
                          </div>
                        </div>
                        {reg.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleApproveRegistration(reg._id, reg.tournamentId?._id || reg.tournamentId)}
                              className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRegistration(reg._id)}
                              className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {reg.status === 'rejected' && reg.rejectionReason && (
                          <p className="text-xs text-red-400 mt-2">Reason: {reg.rejectionReason}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  {regSearchQuery || regStatusFilter !== 'all' || selectedTournamentForReg
                    ? 'No registrations found matching your filters.' 
                    : 'No tournament registrations at the moment.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment Processing Modal */}
      {isModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Process Payment</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-off-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">User</p>
                <p className="text-off-white font-bold">{selectedPayment.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-off-white">{selectedPayment.email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Earnings</p>
                <p className="text-fiery-yellow font-bold text-lg">
                  ₹{selectedPayment.stats?.totalEarnings?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Already Paid</p>
                <p className="text-green-400 font-bold">
                  ₹{selectedPayment.stats?.paidEarnings?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pending Amount</p>
                <p className="text-yellow-400 font-bold text-lg">
                  ₹{((selectedPayment.stats?.totalEarnings || 0) - (selectedPayment.stats?.paidEarnings || 0)).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-300">
                  Payment Status *
                </label>
                <select
                  value={processingStatus}
                  onChange={(e) => setProcessingStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                >
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-300">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-gray-300">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this payment..."
                  rows="3"
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange resize-none"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={handleProcessPayment}
                disabled={processing || !amount || parseFloat(amount) <= 0}
                className="flex-1"
              >
                {processing ? 'Processing...' : 'Process Payment'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Image Modal */}
      {isPaymentProofModalOpen && selectedPaymentProof && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-lava-orange">Payment Proof</h2>
              <button
                onClick={() => {
                  setIsPaymentProofModalOpen(false);
                  setSelectedPaymentProof('');
                }}
                className="text-gray-400 hover:text-off-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex justify-center">
              <img 
                src={selectedPaymentProof} 
                alt="Payment Proof" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="hidden text-center py-8 text-gray-400">
                Failed to load image. <a href={selectedPaymentProof} target="_blank" rel="noopener noreferrer" className="text-lava-orange underline">Open in new tab</a>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setIsPaymentProofModalOpen(false);
                  setSelectedPaymentProof('');
                }}
                className="px-6 py-2 bg-lava-orange text-lava-black font-bold rounded-lg hover:bg-fiery-yellow transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantDashboard;
