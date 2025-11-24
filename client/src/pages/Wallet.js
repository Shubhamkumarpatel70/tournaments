import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';

const Wallet = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawType, setWithdrawType] = useState('upi');
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    upiId: '',
    upiName: '',
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    accountHolderName: ''
  });
  const [withdrawing, setWithdrawing] = useState(false);
  const [detectedBankName, setDetectedBankName] = useState('');
  const [upiAccountName, setUpiAccountName] = useState('');
  const [validatingUPI, setValidatingUPI] = useState(false);

  useEffect(() => {
    fetchWalletData();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchWalletData, 30000);
    return () => {
      clearInterval(interval);
      // Cleanup timeout on unmount
      if (upiValidationTimeout) {
        clearTimeout(upiValidationTimeout);
      }
    };
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions')
      ]);
      setBalance(balanceRes.data.balance || 0);
      const fetchedTransactions = transactionsRes.data || [];
      
      // Debug: Log transaction types
      console.log('Fetched transactions:', fetchedTransactions.length);
      const creditCount = fetchedTransactions.filter(t => t.type === 'credit').length;
      const debitCount = fetchedTransactions.filter(t => t.type === 'debit').length;
      console.log(`Credit transactions: ${creditCount}, Debit transactions: ${debitCount}`);
      console.log('All transactions:', fetchedTransactions.map(t => ({ type: t.type, amount: t.amount, description: t.description })));
      
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!withdrawForm.amount || parseFloat(withdrawForm.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const withdrawAmount = parseFloat(withdrawForm.amount);
    
    // Minimum withdrawal amount: ₹100
    if (withdrawAmount < 100) {
      alert('Minimum withdrawal amount is ₹100');
      return;
    }

    if (withdrawAmount > balance) {
      alert('Insufficient wallet balance');
      return;
    }

    if (withdrawType === 'upi' && !withdrawForm.upiId) {
      alert('Please enter UPI ID');
      return;
    }

    if (withdrawType === 'bank_account') {
      const required = ['bankAccountNumber', 'bankName', 'ifscCode', 'accountHolderName'];
      for (const field of required) {
        if (!withdrawForm[field]) {
          alert(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return;
        }
      }
    }

    setWithdrawing(true);
    try {
      const withdrawalDetails = withdrawType === 'upi' 
        ? { 
            upiId: withdrawForm.upiId,
            upiName: withdrawForm.upiName || ''
          }
        : {
            bankAccountNumber: withdrawForm.bankAccountNumber,
            bankName: withdrawForm.bankName,
            ifscCode: withdrawForm.ifscCode,
            accountHolderName: withdrawForm.accountHolderName
          };

      await api.post('/wallet/withdraw', {
        amount: parseFloat(withdrawForm.amount),
        withdrawalType: withdrawType,
        withdrawalDetails: withdrawalDetails
      });

      alert('Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      if (upiValidationTimeout) {
        clearTimeout(upiValidationTimeout);
      }
      setWithdrawForm({
        amount: '',
        upiId: '',
        upiName: '',
        bankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        accountHolderName: ''
      });
      fetchWalletData();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert(error.response?.data?.message || 'Error processing withdrawal request');
    } finally {
      setWithdrawing(false);
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

  const getTypeIcon = (type) => {
    return type === 'credit' ? '➕' : '➖';
  };

  // UPI Provider to Bank Name mapping
  const upiProviderMap = {
    'paytm': 'Paytm Payments Bank',
    'ybl': 'Yes Bank',
    'ibl': 'ICICI Bank',
    'axl': 'Axis Bank',
    'okaxis': 'Axis Bank',
    'okhdfcbank': 'HDFC Bank',
    'okicici': 'ICICI Bank',
    'oksbi': 'State Bank of India',
    'okbob': 'Bank of Baroda',
    'okpnb': 'Punjab National Bank',
    'okcub': 'City Union Bank',
    'okaxis': 'Axis Bank',
    'payu': 'PayU',
    'phonepe': 'PhonePe',
    'gpay': 'Google Pay',
    'bhim': 'BHIM UPI',
    'upi': 'UPI',
    'sbi': 'State Bank of India',
    'hdfc': 'HDFC Bank',
    'icici': 'ICICI Bank',
    'axis': 'Axis Bank',
    'kotak': 'Kotak Mahindra Bank',
    'pnb': 'Punjab National Bank',
    'bob': 'Bank of Baroda',
    'canara': 'Canara Bank',
    'union': 'Union Bank of India',
    'indian': 'Indian Bank',
    'iob': 'Indian Overseas Bank',
    'uco': 'UCO Bank',
    'central': 'Central Bank of India',
    'syndicate': 'Syndicate Bank',
    'federal': 'Federal Bank',
    'southindian': 'South Indian Bank',
    'karur': 'Karur Vysya Bank',
    'indusind': 'IndusInd Bank',
    'rbl': 'RBL Bank',
    'idfc': 'IDFC First Bank',
    'dbs': 'DBS Bank',
    'hsbc': 'HSBC Bank',
    'standard': 'Standard Chartered Bank',
    'citibank': 'Citibank',
    'amex': 'American Express',
    'payzapp': 'HDFC PayZapp',
    'freecharge': 'Freecharge',
    'mobikwik': 'MobiKwik',
    'airtel': 'Airtel Payments Bank',
    'jio': 'Jio Payments Bank',
    'fino': 'Fino Payments Bank',
    'nsdl': 'NSDL Payments Bank'
  };

  const detectBankFromUPI = (upiId) => {
    if (!upiId || !upiId.includes('@')) {
      setDetectedBankName('');
      return;
    }

    const parts = upiId.toLowerCase().split('@');
    if (parts.length !== 2) {
      setDetectedBankName('');
      return;
    }

    const provider = parts[1].trim();
    const bankName = upiProviderMap[provider] || null;

    if (bankName) {
      setDetectedBankName(bankName);
    } else {
      // Try to format the provider name if not in map
      const formattedName = provider
        .split(/[.\-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setDetectedBankName(formattedName || 'Unknown Provider');
    }
  };

  const validateUPIAndGetName = async (upiId) => {
    if (!upiId || !upiId.includes('@')) {
      setUpiAccountName('');
      return;
    }

    // Validate UPI format
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiRegex.test(upiId)) {
      setUpiAccountName('');
      return;
    }

    // Debounce: Wait for user to stop typing
    setValidatingUPI(true);
    
    try {
      const response = await api.post('/wallet/validate-upi', { upiId });
      if (response.data.success && response.data.accountHolderName) {
        setUpiAccountName(response.data.accountHolderName);
      } else {
        setUpiAccountName('');
      }
    } catch (error) {
      console.error('Error validating UPI:', error);
      // Fallback: Extract and format name from UPI ID
      const parts = upiId.split('@');
      const namePart = parts[0];
      const cleanName = namePart.replace(/[0-9]/g, '').replace(/[^a-zA-Z]/g, ' ');
      const formattedName = cleanName
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
      const displayName = formattedName || namePart.split(/[.\-_]/)[0].charAt(0).toUpperCase() + namePart.split(/[.\-_]/)[0].slice(1).toLowerCase();
      setUpiAccountName(displayName || '');
    } finally {
      setValidatingUPI(false);
    }
  };

  // Debounce function for UPI validation
  const [upiValidationTimeout, setUpiValidationTimeout] = useState(null);
  const debouncedValidateUPI = (upiId) => {
    if (upiValidationTimeout) {
      clearTimeout(upiValidationTimeout);
    }
    
    const timeout = setTimeout(() => {
      validateUPIAndGetName(upiId);
    }, 800); // Wait 800ms after user stops typing
    
    setUpiValidationTimeout(timeout);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
        <div className="max-w-4xl mx-auto text-center text-gray-400">Loading wallet...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 neon-text-cyan">
          My Wallet
        </h1>

        {/* Wallet Balance Card */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 sm:p-8 mb-6 sm:mb-8">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl mb-4">💰</div>
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-fiery-yellow mb-2">
              ₹{balance.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm sm:text-base mb-6">Available Balance</div>
            <Button
              variant="primary"
              onClick={() => setShowWithdrawModal(true)}
              disabled={balance < 100}
              className="w-full sm:w-auto"
            >
              Request Withdrawal
            </Button>
            {balance > 0 && balance < 100 && (
              <p className="text-xs text-gray-400 mt-2">Minimum ₹100 required to withdraw</p>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-lava-orange">
            Transaction History
          </h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <div className="text-4xl sm:text-5xl mb-4">📋</div>
              <p className="text-base sm:text-lg">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {transactions
                .filter(transaction => transaction && transaction.type) // Ensure transaction exists and has type
                .map((transaction) => {
                  // Debug: Log each transaction
                  if (!transaction.type) {
                    console.warn('Transaction missing type:', transaction);
                  }
                  
                  // Check if this is a reversal transaction
                  const isReversal = transaction.description?.toLowerCase().includes('reversal:') || transaction.relatedTransactionId;
                  
                  return (
                    <div
                      key={transaction._id}
                      className={`bg-lava-black/50 border rounded-lg p-3 sm:p-4 md:p-5 hover:border-lava-orange/50 transition-all ${
                        isReversal ? 'border-blue-500/50 bg-blue-500/5' : 'border-lava-orange/20'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:gap-4">
                        {/* Top Row: Icon, Description, Amount, Status */}
                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">
                              {isReversal ? '↩️' : getTypeIcon(transaction.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-off-white mb-1 text-sm sm:text-base break-words">
                                {transaction.description}
                                {isReversal && (
                                  <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                                    REVERSAL
                                  </span>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-400">
                                {new Date(transaction.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className={`text-base sm:text-lg md:text-xl font-bold ${
                                transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                              </div>
                              <div className={`text-xs mt-0.5 sm:mt-1 ${
                                transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {isReversal ? 'Reversed' : (transaction.type === 'credit' ? 'Credited' : 'Debited')}
                              </div>
                            </div>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusBadge(transaction.status)}`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Bottom Row: Additional Details */}
                        <div className="flex flex-col gap-1.5 sm:gap-2 pl-7 sm:pl-9 md:pl-11 border-t border-lava-orange/10 pt-2 sm:pt-3">
                          {isReversal && (
                            <div className="text-xs sm:text-sm text-blue-400">
                              <span className="font-semibold">Type:</span> Reversal Transaction - Amount refunded to wallet
                            </div>
                          )}
                          {transaction.withdrawalType && (
                            <div className="text-xs sm:text-sm text-gray-500">
                              <span className="font-semibold">Method:</span> {transaction.withdrawalType === 'upi' ? 'UPI' : 'Bank Account'}
                              {transaction.withdrawalType === 'upi' && transaction.withdrawalDetails?.upiName && (
                                <span className="text-gray-400"> - {transaction.withdrawalDetails.upiName}</span>
                              )}
                            </div>
                          )}
                          {transaction.type === 'debit' && transaction.status === 'completed' && transaction.utrNumber && (
                            <div className="text-xs sm:text-sm text-green-400">
                              <span className="font-semibold">UTR:</span> {transaction.utrNumber}
                            </div>
                          )}
                          {transaction.type === 'debit' && transaction.status === 'rejected' && transaction.rejectionReason && (
                            <div className="text-xs sm:text-sm text-red-400">
                              <span className="font-semibold">Rejection Reason:</span> {transaction.rejectionReason}
                            </div>
                          )}
                          {transaction.type === 'credit' && transaction.processedBy && (
                            <div className="text-xs sm:text-sm text-gray-500">
                              <span className="font-semibold">Added by:</span> {transaction.processedBy?.name || 'Admin'}
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

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-lava-orange">Request Withdrawal</h2>
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    if (upiValidationTimeout) {
                      clearTimeout(upiValidationTimeout);
                    }
                    setWithdrawForm({
                      amount: '',
                      upiId: '',
                      upiName: '',
                      bankAccountNumber: '',
                      bankName: '',
                      ifscCode: '',
                      accountHolderName: ''
                    });
                  }}
                  className="text-gray-400 hover:text-lava-orange text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="100"
                    max={balance}
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                    className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Available: ₹{balance.toLocaleString()} | Minimum: ₹100
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Withdrawal Method *
                  </label>
                  <div className="flex gap-4 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="upi"
                        checked={withdrawType === 'upi'}
                        onChange={(e) => setWithdrawType(e.target.value)}
                        className="text-lava-orange"
                      />
                      <span className="text-gray-300">UPI</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="bank_account"
                        checked={withdrawType === 'bank_account'}
                        onChange={(e) => setWithdrawType(e.target.value)}
                        className="text-lava-orange"
                      />
                      <span className="text-gray-300">Bank Account</span>
                    </label>
                  </div>
                </div>

                {withdrawType === 'upi' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        value={withdrawForm.upiId}
                        onChange={(e) => {
                          setWithdrawForm({ ...withdrawForm, upiId: e.target.value });
                        }}
                        placeholder="yourname@paytm or yourname@ybl"
                        className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Examples: yourname@paytm, yourname@ybl, yourname@okaxis, yourname@phonepe
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Name Related to UPI *
                      </label>
                      <input
                        type="text"
                        value={withdrawForm.upiName}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, upiName: e.target.value })}
                        placeholder="Enter name as shown in UPI app"
                        className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Account Holder Name *
                      </label>
                      <input
                        type="text"
                        value={withdrawForm.accountHolderName}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, accountHolderName: e.target.value })}
                        className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        value={withdrawForm.bankName}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                        className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={withdrawForm.bankAccountNumber}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, bankAccountNumber: e.target.value })}
                        className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        IFSC Code *
                      </label>
                      <input
                        type="text"
                        value={withdrawForm.ifscCode}
                        onChange={(e) => setWithdrawForm({ ...withdrawForm, ifscCode: e.target.value.toUpperCase() })}
                        placeholder="ABCD0123456"
                        className="w-full bg-lava-black border border-lava-orange/30 rounded-lg px-4 py-2 text-off-white focus:border-lava-orange focus:outline-none"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowWithdrawModal(false);
                      if (upiValidationTimeout) {
                        clearTimeout(upiValidationTimeout);
                      }
                      setWithdrawForm({
                        amount: '',
                        upiId: '',
                        upiName: '',
                        bankAccountNumber: '',
                        bankName: '',
                        ifscCode: '',
                        accountHolderName: ''
                      });
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={withdrawing}
                    className="flex-1"
                  >
                    {withdrawing ? 'Processing...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;

