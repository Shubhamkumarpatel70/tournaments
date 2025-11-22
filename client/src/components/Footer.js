import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubscribed, setIsSubscribed] = useState(false);

  const checkSubscription = async (emailToCheck) => {
    if (!emailToCheck) {
      setIsSubscribed(false);
      return;
    }
    try {
      const response = await api.get(`/newsletter/check/${encodeURIComponent(emailToCheck)}`);
      setIsSubscribed(response.data.isSubscribed || false);
    } catch (error) {
      setIsSubscribed(false);
    }
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    checkSubscription(newEmail);
    setMessage({ type: '', text: '' });
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isSubscribed) {
        await api.post('/newsletter/unsubscribe', { email });
        setMessage({ type: 'success', text: 'Successfully unsubscribed from newsletter!' });
        setIsSubscribed(false);
      } else {
        await api.post('/newsletter/subscribe', { email });
        setMessage({ type: 'success', text: 'Successfully subscribed to newsletter!' });
        setIsSubscribed(true);
      }
      setEmail('');
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to subscribe. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-charcoal border-t border-lava-orange/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Column 1: Quick Links */}
          <div>
            <h3 className="text-lava-orange font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-off-white hover:text-lava-orange transition-colors">Home</Link></li>
              <li><Link to="/tournaments" className="text-off-white hover:text-lava-orange transition-colors">Tournaments</Link></li>
              <li><Link to="/leaderboards" className="text-off-white hover:text-lava-orange transition-colors">Leaderboards</Link></li>
              <li><Link to="/about" className="text-off-white hover:text-lava-orange transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-off-white hover:text-lava-orange transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 2: Game Links */}
          <div>
            <h3 className="text-lava-orange font-bold mb-4">Games</h3>
            <ul className="space-y-2">
              <li><Link to="/tournaments?game=bgmi" className="text-off-white hover:text-lava-orange transition-colors">BGMI Tournaments</Link></li>
              <li><Link to="/tournaments?game=freefire" className="text-off-white hover:text-lava-orange transition-colors">Free Fire Tournaments</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h3 className="text-lava-orange font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-off-white hover:text-lava-orange transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-off-white hover:text-lava-orange transition-colors">Contact Us</Link></li>
              <li><Link to="/rules" className="text-off-white hover:text-lava-orange transition-colors">Rules & Regulations</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div>
            <h3 className="text-lava-orange font-bold mb-4">Stay Connected</h3>
            <div className="mb-4">
              <form onSubmit={handleSubscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Your email"
                  required
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white placeholder-gray-500 focus:outline-none focus:border-lava-orange"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className={`mt-2 w-full font-bold py-2 rounded-lg transition-all disabled:opacity-50 ${
                    isSubscribed 
                      ? 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30' 
                      : 'bg-lava-gradient text-lava-black hover:bg-lava-gradient-reverse'
                  }`}
                >
                  {loading 
                    ? (isSubscribed ? 'Unsubscribing...' : 'Subscribing...') 
                    : (isSubscribed ? 'Unsubscribe' : 'Subscribe')
                  }
                </button>
              </form>
              {message.text && (
                <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <button className="text-off-white hover:text-lava-orange transition-colors" aria-label="Discord">
                <span className="text-2xl">💬</span>
              </button>
              <button className="text-off-white hover:text-lava-orange transition-colors" aria-label="YouTube">
                <span className="text-2xl">▶️</span>
              </button>
              <button className="text-off-white hover:text-lava-orange transition-colors" aria-label="Instagram">
                <span className="text-2xl">📷</span>
              </button>
              <button className="text-off-white hover:text-lava-orange transition-colors" aria-label="Twitter">
                <span className="text-2xl">🐦</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-lava-orange/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} arenaofchampions. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
            <Link to="/terms" className="text-gray-500 hover:text-lava-orange text-xs sm:text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-lava-orange text-xs sm:text-sm transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

