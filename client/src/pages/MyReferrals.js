import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';

const MyReferrals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/referrals/my-referrals');
      setReferralData(response.data);
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError(err.response?.data?.error || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lava-black">
        <div className="text-lava-orange text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="w-auto"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 neon-text-cyan">
            My Referrals
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            View users who registered using your referral code
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {referralData && (
          <>
            {/* Stats Card */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-lava-orange mb-1">
                    {referralData.referredCount || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Total Referrals</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-fiery-yellow mb-1 font-mono">
                    {referralData.referralCode || 'N/A'}
                  </div>
                  <div className="text-gray-400 text-sm">Your Referral Code</div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-2xl sm:text-3xl font-bold text-lava-orange mb-1">
                    {(referralData.referredCount || 0) * 100}
                  </div>
                  <div className="text-gray-400 text-sm">Points Earned</div>
                  <div className="text-xs text-gray-500 mt-1">
                    (₹{(((referralData.referredCount || 0) * 100) / 100 * 20).toFixed(2)})
                  </div>
                </div>
              </div>
            </div>

            {/* Referred Users List */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-lava-orange mb-4">
                Referred Users
              </h2>
              
              {referralData.referredUsers && referralData.referredUsers.length > 0 ? (
                <div className="space-y-3">
                  {referralData.referredUsers.map((refUser, index) => (
                    <div
                      key={refUser.id}
                      className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 hover:border-lava-orange transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-lava-orange/20 flex items-center justify-center text-lava-orange font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="text-off-white font-semibold text-base sm:text-lg">
                                {refUser.name}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {refUser.email}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs mb-1">Registered On</div>
                          <div className="text-off-white text-sm font-semibold">
                            {new Date(refUser.joinedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {new Date(refUser.joinedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎁</div>
                  <p className="text-gray-400 text-lg mb-2">No referrals yet</p>
                  <p className="text-gray-500 text-sm mb-6">
                    Share your referral code to start earning points!
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyReferrals;

