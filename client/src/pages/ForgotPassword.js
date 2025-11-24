import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Button from '../components/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(response.data.message || 'Password reset link sent! Redirecting to reset page...');
      
      // Redirect to reset password page with email pre-filled
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { email } 
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lava-black py-12 px-4 page-transition">
      <div className="max-w-md w-full">
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-2 neon-text-cyan">Forgot Password</h1>
          <p className="text-center text-gray-400 mb-8">Enter your email to reset your password</p>

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                placeholder="your@email.com"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-400">
            Remember your password?{' '}
            <Link to="/login" className="text-lava-orange hover:text-fiery-yellow transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

