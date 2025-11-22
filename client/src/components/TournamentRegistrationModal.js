import React, { useState, useEffect } from 'react';
import Button from './Button';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TournamentRegistrationModal = ({ isOpen, onClose, tournament, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    teamId: '',
    teamName: '',
    numberOfPlayers: '',
    paymentType: 'UPI',
    paymentOption: '',
    paymentProof: ''
  });
  const [teams, setTeams] = useState([]);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [teamsRes, paymentOptionsRes] = await Promise.all([
        api.get('/teams/my-teams'),
        api.get('/payment-options')
      ]);
      setTeams(teamsRes.data);
      setPaymentOptions(paymentOptionsRes.data);
      
      if (teamsRes.data.length > 0) {
        const firstTeam = teamsRes.data[0];
        setFormData(prev => ({
          ...prev,
          teamId: firstTeam._id,
          teamName: firstTeam.name,
          numberOfPlayers: firstTeam.members.length
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');

    // Update team name and player count when team is selected
    if (name === 'teamId') {
      const selectedTeam = teams.find(t => t._id === value);
      if (selectedTeam) {
        setFormData(prev => ({
          ...prev,
          teamName: selectedTeam.name,
          numberOfPlayers: selectedTeam.members.length
        }));
      }
    }

    // Update selected payment option when payment option changes
    if (name === 'paymentOption') {
      const selected = paymentOptions.find(opt => opt.name === value);
      setSelectedPaymentOption(selected || null);
    }
    
    // Reset payment option when payment type changes
    if (name === 'paymentType') {
      setFormData(prev => ({
        ...prev,
        paymentOption: '',
        [name]: value
      }));
      setSelectedPaymentOption(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.teamId || !formData.teamName || !formData.numberOfPlayers || !formData.paymentType || !formData.paymentOption) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      await api.post('/tournament-registrations', {
        tournamentId: tournament._id,
        ...formData
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register for tournament');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !tournament) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold neon-text-cyan">Join Tournament</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-lava-orange transition-colors text-2xl">×</button>
        </div>

        <div className="mb-4 p-4 bg-lava-black border border-lava-orange/20 rounded-lg">
          <h3 className="font-bold text-lg mb-2">{tournament.name}</h3>
          <p className="text-sm text-gray-400">Entry Fee: ₹{tournament.entryFee} • Prize Pool: ₹{tournament.prizePool?.toLocaleString()}</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Select Team *</label>
            <select
              name="teamId"
              value={formData.teamId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name} ({team.members.length} players)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2">Team Name *</label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Number of Players *</label>
              <input
                type="number"
                name="numberOfPlayers"
                value={formData.numberOfPlayers}
                onChange={handleChange}
                required
                min="1"
                max="4"
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Payment Type *</label>
            <select
              name="paymentType"
              value={formData.paymentType}
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
            <label className="block text-sm font-bold mb-2">Payment Option *</label>
            <select
              name="paymentOption"
              value={formData.paymentOption}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            >
              <option value="">Select payment option</option>
              {paymentOptions
                .filter(opt => {
                  if (formData.paymentType === 'QR Code') {
                    // For QR Code type, only show options that have QR codes
                    return opt.qrCode && opt.qrCode.trim() !== '';
                  }
                  return opt.type === formData.paymentType;
                })
                .map(option => (
                  <option key={option._id} value={option.name}>{option.name} - {option.details}</option>
                ))}
            </select>
          </div>

          {/* QR Code Display - Show when QR Code payment type is selected or when payment option has QR code */}
          {formData.paymentType === 'QR Code' && selectedPaymentOption && selectedPaymentOption.qrCode && (
            <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
              <p className="text-sm font-bold text-lava-orange mb-2">Scan QR Code to Pay</p>
              <div className="flex justify-center">
                <img 
                  src={selectedPaymentOption.qrCode} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 object-contain bg-white rounded-lg p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                {selectedPaymentOption.name}: {selectedPaymentOption.details}
              </p>
            </div>
          )}
          
          {/* Also show QR code for other payment types if they have QR code */}
          {formData.paymentType !== 'QR Code' && selectedPaymentOption && selectedPaymentOption.qrCode && (
            <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
              <p className="text-sm font-bold text-lava-orange mb-2">Scan QR Code to Pay</p>
              <div className="flex justify-center">
                <img 
                  src={selectedPaymentOption.qrCode} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 object-contain bg-white rounded-lg p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                {selectedPaymentOption.name}: {selectedPaymentOption.details}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2">Payment Proof (Optional)</label>
            <input
              type="text"
              name="paymentProof"
              value={formData.paymentProof}
              onChange={handleChange}
              placeholder="Transaction ID or screenshot URL"
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Joining...' : 'Join Tournament'}
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

export default TournamentRegistrationModal;

