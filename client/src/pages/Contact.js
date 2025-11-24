import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import api from '../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/contacts', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const faqs = [
    {
      question: 'How do I register for a tournament?',
      answer: 'Simply browse our tournaments page, select a tournament, and click "Register Now". You\'ll need to create an account and form a team if required.'
    },
    {
      question: 'How are prizes paid out?',
      answer: 'Prizes are distributed within 7-14 business days after tournament completion. We support multiple payment methods including UPI, bank transfer, and digital wallets.'
    },
    {
      question: 'What are the technical requirements?',
      answer: 'You need a stable internet connection, the latest version of BGMI or Free Fire installed, and a device that meets the game\'s minimum requirements.'
    },
    {
      question: 'Can I change my team after registration?',
      answer: 'Team changes are allowed up to 24 hours before the tournament starts. After that, changes require admin approval.'
    }
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 page-transition">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 neon-text-cyan">Contact Us</h1>
        <p className="text-center text-gray-400 mb-8 sm:mb-12 text-sm sm:text-base">Get in touch with our team</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Methods */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-lava-orange">Contact Methods</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">📧 Support Email</h3>
                  <a href="mailto:official.arenaofchampions@gmail.com" className="text-off-white hover:text-lava-orange transition-colors">
                    official.arenaofchampions@gmail.com
                  </a>
                  <p className="text-sm text-gray-400 mt-1">Response time: Within 24 hours</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">💬 Discord Server</h3>
                  <button className="text-off-white hover:text-lava-orange transition-colors">
                    Join our Discord community
                  </button>
                  <p className="text-sm text-gray-400 mt-1">Live chat available 24/7</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">🕐 Live Chat</h3>
                  <p className="text-off-white">Available: 10 AM - 10 PM IST</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-lava-orange">Follow Us</h2>
              <div className="flex space-x-4">
                {socialLinks.length > 0 ? (
                  socialLinks.map((social) => (
                    <a
                      key={social._id}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-lava-black border border-lava-orange/30 rounded-lg flex items-center justify-center hover:bg-lava-orange hover:text-lava-black transition-colors"
                      aria-label={social.name}
                      title={social.name}
                    >
                      {social.icon.startsWith('<svg') ? (
                        <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: social.icon }} />
                      ) : (
                        <span className="text-xl">{social.icon}</span>
                      )}
                    </a>
                  ))
                ) : (
                  <a 
                    href="https://www.instagram.com/arena_ofchampions/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-lava-black border border-lava-orange/30 rounded-lg flex items-center justify-center hover:bg-lava-orange hover:text-lava-black transition-colors" 
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-lava-orange">Send us a Message</h2>
            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4">
                Thank you for your message! We will get back to you soon.
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange resize-none"
                ></textarea>
              </div>
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-4xl font-bold text-center mb-8 neon-text-cyan">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2 text-lava-orange">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;

