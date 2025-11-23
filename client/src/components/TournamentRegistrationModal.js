import React, { useState, useEffect } from 'react';
import Button from './Button';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CreateTeamModal from './CreateTeamModal';

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
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [paymentProofPreview, setPaymentProofPreview] = useState('');

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
      } else {
        // Reset form if no teams
        setFormData(prev => ({
          ...prev,
          teamId: '',
          teamName: '',
          numberOfPlayers: ''
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleTeamCreated = async () => {
    // Refresh teams list after team is created
    try {
      const teamsRes = await api.get('/teams/my-teams');
      setTeams(teamsRes.data);
      
      // Auto-select the newly created team (should be the last one)
      if (teamsRes.data.length > 0) {
        const newTeam = teamsRes.data[teamsRes.data.length - 1];
        setFormData(prev => ({
          ...prev,
          teamId: newTeam._id,
          teamName: newTeam.name,
          numberOfPlayers: newTeam.members.length
        }));
      }
      
      setIsCreateTeamModalOpen(false);
    } catch (error) {
      console.error('Error fetching teams after creation:', error);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Create a custom axios request without the default Content-Type header
      // FormData needs multipart/form-data with boundary, which axios sets automatically
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': undefined // Let axios set it automatically for FormData
        }
      });

      if (response.data && response.data.imageUrl) {
        setFormData(prev => ({
          ...prev,
          paymentProof: response.data.imageUrl
        }));
        setPaymentProofPreview(response.data.imageUrl);
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (error.response.data.details) {
          errorMessage += ` (${error.response.data.details})`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (teams.length === 0) {
      setError('Please create a team first to join the tournament');
      return;
    }

    if (!formData.teamId || !formData.teamName || !formData.numberOfPlayers || !formData.paymentType || !formData.paymentOption) {
      setError('All fields are required');
      return;
    }

    if (!formData.paymentProof || !formData.paymentProof.trim()) {
      setError('Payment proof image is required');
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
          <p className="text-sm text-gray-400 mb-2">Entry Fee: ₹{tournament.entryFee} per player • Prize Pool: ₹{tournament.prizePool?.toLocaleString()}</p>
          {formData.numberOfPlayers && tournament.entryFee && (
            <div className="mt-3 p-3 bg-lava-orange/10 border border-lava-orange/30 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Total Amount:</span>
                <span className="text-xl font-bold text-fiery-yellow">
                  ₹{(tournament.entryFee * parseInt(formData.numberOfPlayers) || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {tournament.entryFee} × {formData.numberOfPlayers} player{parseInt(formData.numberOfPlayers) > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Select Team *</label>
            {teams.length > 0 ? (
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
            ) : (
              <div className="space-y-3">
                <div className="bg-lava-black/50 border border-lava-orange/30 rounded-lg p-4 text-center">
                  <p className="text-gray-400 text-sm mb-3">You don't have any teams yet. Create a team to join this tournament.</p>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setIsCreateTeamModalOpen(true)}
                    className="w-full"
                  >
                    + Create New Team
                  </Button>
                </div>
              </div>
            )}
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
                disabled
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Automatically set based on selected team</p>
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
                disabled
                className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Automatically set based on selected team</p>
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

          {/* Payment Amount Display */}
          {formData.numberOfPlayers && tournament.entryFee && selectedPaymentOption && (
            <div className="bg-lava-orange/10 border border-lava-orange/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-300">Amount to Pay:</span>
                <span className="text-2xl font-bold text-fiery-yellow">
                  ₹{(tournament.entryFee * parseInt(formData.numberOfPlayers) || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {formData.paymentType === 'UPI' && selectedPaymentOption.details && (
                  <>UPI ID: <span className="text-lava-orange font-mono">{selectedPaymentOption.details}</span></>
                )}
                {formData.paymentType !== 'UPI' && selectedPaymentOption.details && (
                  <>{selectedPaymentOption.name}: {selectedPaymentOption.details}</>
                )}
              </p>
            </div>
          )}

          {/* QR Code Display - Show when QR Code payment type is selected or when payment option has QR code */}
          {formData.paymentType === 'QR Code' && selectedPaymentOption && selectedPaymentOption.qrCode && (
            <div className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
              <p className="text-sm font-bold text-lava-orange mb-2">Scan QR Code to Pay</p>
              {formData.numberOfPlayers && tournament.entryFee && (
                <p className="text-center text-lg font-bold text-fiery-yellow mb-3">
                  ₹{(tournament.entryFee * parseInt(formData.numberOfPlayers) || 0).toLocaleString()}
                </p>
              )}
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
              {formData.numberOfPlayers && tournament.entryFee && (
                <p className="text-center text-lg font-bold text-fiery-yellow mb-3">
                  ₹{(tournament.entryFee * parseInt(formData.numberOfPlayers) || 0).toLocaleString()}
                </p>
              )}
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
            <label className="block text-sm font-bold mb-2">Payment Proof (Image) *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="w-full px-4 py-2 bg-lava-black border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              Upload screenshot of payment (Max 5MB, JPG/PNG/GIF)
            </p>
            {uploadingImage && (
              <p className="text-xs text-lava-orange mt-1">Uploading image...</p>
            )}
            {paymentProofPreview && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                <div className="border border-lava-orange/30 rounded-lg overflow-hidden">
                  <img 
                    src={paymentProofPreview} 
                    alt="Payment proof preview" 
                    className="w-full h-48 object-contain bg-lava-black"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentProofPreview('');
                    setFormData(prev => ({ ...prev, paymentProof: '' }));
                  }}
                  className="mt-2 text-xs text-red-400 hover:text-red-300"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1" 
              disabled={loading || teams.length === 0}
            >
              {loading ? 'Joining...' : 'Join Tournament'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>

        {/* Create Team Modal */}
        <CreateTeamModal
          isOpen={isCreateTeamModalOpen}
          onClose={() => setIsCreateTeamModalOpen(false)}
          onSuccess={handleTeamCreated}
        />
      </div>
    </div>
  );
};

export default TournamentRegistrationModal;

