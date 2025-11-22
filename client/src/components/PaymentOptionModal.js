import React, { useState } from 'react';
import Button from './Button';
import api from '../utils/api';

const PaymentOptionModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'UPI',
    details: '',
    qrCode: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingQR, setGeneratingQR] = useState(false);

  // Generate QR code from payment details
  const generateQRCode = () => {
    if (!formData.details) {
      setError('Please enter payment details first');
      return;
    }

    setGeneratingQR(true);
    setError('');

    try {
      // Generate QR code using a QR code API service
      // Using a free QR code API that generates QR codes from text
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formData.details)}`;
      
      setFormData(prev => ({
        ...prev,
        qrCode: qrCodeUrl
      }));
      
      setGeneratingQR(false);
    } catch (err) {
      setError('Failed to generate QR code');
      setGeneratingQR(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.type || !formData.details) {
      setError('All fields are required');
      return;
    }

    // If type is QR Code, QR code is required
    if (formData.type === 'QR Code' && !formData.qrCode) {
      setError('QR Code is required for QR Code payment type');
      return;
    }

    setLoading(true);

    try {
      await api.post('/payment-options', formData);
      onSuccess();
      setFormData({ name: '', type: 'UPI', details: '', qrCode: '', isActive: true });
      setGeneratingQR(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create payment option');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold neon-text-cyan">Add Payment Option</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-lava-orange transition-colors text-2xl">×</button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              placeholder="e.g., Google Pay, PhonePe"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            >
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Wallet">Wallet</option>
              <option value="Card">Card</option>
              <option value="QR Code">QR Code</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Details *</label>
            <input
              type="text"
              name="details"
              value={formData.details}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              placeholder="e.g., UPI ID, Account Number"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">QR Code *</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="qrCode"
                  value={formData.qrCode}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
                  placeholder="QR Code image URL or generate from details"
                  required={formData.type === 'QR Code'}
                />
                {formData.details && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generateQRCode}
                    disabled={generatingQR}
                    className="whitespace-nowrap"
                  >
                    {generatingQR ? 'Generating...' : 'Generate QR'}
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {formData.type === 'QR Code' 
                  ? 'Enter QR code URL or click "Generate QR" to create from payment details'
                  : 'Optional: Enter QR code image URL or generate from payment details'}
              </p>
              {formData.qrCode && (
                <div className="mt-2 flex flex-col items-center">
                  <img 
                    src={formData.qrCode} 
                    alt="QR Code Preview" 
                    className="w-48 h-48 object-contain bg-white rounded-lg p-2 border border-lava-orange/30"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    QR Code Preview
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm">Active</label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Add Payment Option'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentOptionModal;

