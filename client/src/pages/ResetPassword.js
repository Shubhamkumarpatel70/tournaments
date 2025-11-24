import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import Button from '../components/Button';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Pre-fill email from location state or URL params
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    } else {
      // Try to get email from URL params if passed
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        setFormData(prev => ({ ...prev, email: emailParam }));
      }
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', {
        email: formData.email,
        password: formData.password
      });
      
      setSuccess(response.data.message || 'Password reset successfully! Redirecting to login...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successfully! Please login with your new password.',
            email: formData.email 
          } 
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lava-black py-12 px-4 page-transition">
      <div className="max-w-md w-full">
        <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-2 neon-text-cyan">Reset Password</h1>
          <p className="text-center text-gray-400 mb-8">Enter your new password</p>

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
                value={formData.email}
                onChange={handleChange}
                required
                disabled
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange opacity-60 cursor-not-allowed"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Re-enter New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                placeholder="Re-enter new password"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;

