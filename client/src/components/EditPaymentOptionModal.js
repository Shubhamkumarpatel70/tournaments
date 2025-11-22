import React, { useState, useEffect } from 'react';
import Button from './Button';
import api from '../utils/api';

const EditPaymentOptionModal = ({ isOpen, onClose, paymentOption, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'UPI',
    details: '',
    qrCode: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && paymentOption) {
      setFormData({
        name: paymentOption.name || '',
        type: paymentOption.type || 'UPI',
        details: paymentOption.details || '',
        qrCode: paymentOption.qrCode || '',
        isActive: paymentOption.isActive !== undefined ? paymentOption.isActive : true
      });
    }
  }, [isOpen, paymentOption]);

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
      setError('All required fields must be filled');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/payment-options/${paymentOption._id}`, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update payment option');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !paymentOption) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold neon-text-cyan">Edit Payment Option</h2>
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
            <label className="block text-sm font-bold mb-2">QR Code URL (Optional)</label>
            <input
              type="text"
              name="qrCode"
              value={formData.qrCode}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              placeholder="QR Code image URL"
            />
            {formData.qrCode && (
              <div className="mt-2 flex justify-center">
                <img 
                  src={formData.qrCode} 
                  alt="QR Code Preview" 
                  className="w-32 h-32 object-contain bg-white rounded-lg p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
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
              {loading ? 'Updating...' : 'Update Payment Option'}
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

export default EditPaymentOptionModal;

