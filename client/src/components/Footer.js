import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const res = await api.get('/socials');
      setSocialLinks(res.data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
      setSocialLinks([]);
    }
  };

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
              {socialLinks.length > 0 ? (
                socialLinks.map((social) => (
                  <a
                    key={social._id}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-off-white hover:text-lava-orange transition-colors"
                    aria-label={social.name}
                  >
                    {social.icon.startsWith('<svg') ? (
                      <div className="w-8 h-8" dangerouslySetInnerHTML={{ __html: social.icon }} />
                    ) : (
                      <span className="text-2xl">{social.icon}</span>
                    )}
                  </a>
                ))
              ) : (
                <a 
                  href="https://www.instagram.com/arena_ofchampions/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-off-white hover:text-lava-orange transition-colors" 
                  aria-label="Instagram"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
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

