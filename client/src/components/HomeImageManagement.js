import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Button from './Button';

const HomeImageManagement = () => {
  const [homeImages, setHomeImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    imageUrl: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/home-images');
      setHomeImages(response.data || []);
      setError('');
    } catch (error) {
      console.error('Error fetching home images:', error);
      setError('Failed to load home images. Please refresh the page.');
      setHomeImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.imageUrl.trim()) {
      setError('Image URL is required');
      return;
    }

    // Validate URL
    try {
      new URL(formData.imageUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/home-images/${editingId}`, formData);
      } else {
        await api.post('/home-images', formData);
      }
      fetchData();
      setFormData({ imageUrl: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save home image');
    }
  };

  const handleEdit = (image) => {
    setFormData({
      imageUrl: image.imageUrl
    });
    setEditingId(image._id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this home image?')) {
      try {
        await api.delete(`/home-images/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting home image');
      }
    }
  };

  const toggleActive = async (image) => {
    try {
      await api.put(`/home-images/${image._id}`, {
        ...image,
        isActive: !image.isActive
      });
      fetchData();
    } catch (error) {
      alert('Error updating home image');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
  }

  return (
    <div className="bg-charcoal border border-lava-orange/30 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-lava-orange">Home Image</h2>
          <p className="text-sm text-gray-400 mt-1">Manage the background image for the "COMPETE. WIN. DOMINATE." section</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ imageUrl: '' });
            setError('');
          }}
        >
          {showForm ? 'Cancel' : '+ Add Image'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Image URL *</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-charcoal border border-lava-orange/30 rounded-lg text-off-white focus:outline-none focus:border-lava-orange"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">Enter the full URL of the image (e.g., from Unsplash, your CDN, etc.)</p>
          </div>
          {formData.imageUrl && (
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Preview</label>
              <div className="border border-lava-orange/30 rounded-lg overflow-hidden">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div className="hidden text-center py-8 text-gray-400 text-sm">Failed to load image. Please check the URL.</div>
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <Button type="submit" variant="primary">
              {editingId ? 'Update' : 'Add'} Image
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setShowForm(false);
                  setFormData({ imageUrl: '' });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-4">
        {homeImages.map(image => (
          <div key={image._id} className="bg-lava-black border border-lava-orange/20 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    image.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {image.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Updated: {(() => {
                      const date = new Date(image.updatedAt);
                      const day = String(date.getDate()).padStart(2, '0');
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const year = String(date.getFullYear()).slice(-2);
                      return `${day}-${month}-${year}`;
                    })()}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-400 mb-1">Image URL:</p>
                  <p className="text-sm text-off-white break-all">{image.imageUrl}</p>
                </div>
                <div className="border border-lava-orange/30 rounded-lg overflow-hidden max-w-md">
                  <img 
                    src={image.imageUrl} 
                    alt="Home background" 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden items-center justify-center h-32 text-gray-400 text-sm">
                    Failed to load image
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:min-w-[150px]">
                <button
                  onClick={() => handleEdit(image)}
                  className="px-3 py-2 bg-lava-orange text-lava-black text-xs font-bold rounded hover:bg-fiery-yellow"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(image)}
                  className={`px-3 py-2 text-xs font-bold rounded ${
                    image.isActive
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  }`}
                >
                  {image.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {homeImages.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <p>No home images found. Add one to customize the hero section!</p>
        </div>
      )}
    </div>
  );
};

export default HomeImageManagement;

