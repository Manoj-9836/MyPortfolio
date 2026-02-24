import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { toast } from 'sonner';

interface HeroData {
  _id?: string;
  title: string;
  description: string;
}

interface HeroFormProps {
  onSave: () => void;
}

export default function HeroForm({ onSave }: HeroFormProps) {
  const [heroData, setHeroData] = useState<HeroData>({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchHeroData();
  }, []);

  const fetchHeroData = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/hero`);
      const data = await response.json();
      
      if (data) {
        setHeroData({
          _id: data._id,
          title: data.title || 'AI & Full-Stack Development Enthusiast',
          description: data.description || 'Computer Science undergraduate and Technical Head of the AI Club with strong experience in full-stack development and AI-powered applications. Passionate about mentoring peers and organizing programming initiatives to empower student developers.',
        });
      }
    } catch {
      setError('Failed to load hero data');
      toast.error('Failed to load hero data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/hero`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(heroData),
      });

      if (response.ok) {
        setSuccess('Hero section updated successfully!');
        toast.success('Hero section updated successfully.');
        setTimeout(() => {
          setSuccess('');
          onSave();
        }, 2000);
      } else {
        setError('Failed to update hero section');
        toast.error('Failed to update hero section.');
      }
    } catch {
      setError('Failed to save changes');
      toast.error('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <motion.div
              className="h-4 w-24 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded"
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ backgroundSize: '200% 100%' }}
            />
            <motion.div
              className="h-20 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded"
              animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Title / Role
        </label>
        <input
          type="text"
          value={heroData.title}
          onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none transition-all"
          placeholder="e.g., AI & Full-Stack Development Enthusiast"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          This appears below your name on the hero section
        </p>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={heroData.description}
          onChange={(e) => setHeroData({ ...heroData, description: e.target.value })}
          className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none transition-all min-h-[120px] resize-y"
          placeholder="Brief description about yourself..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          A brief introduction that highlights your expertise and passion
        </p>
      </div>

      {/* Alert Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {success}
        </motion.div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={() => fetchHeroData()}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          disabled={saving}
        >
          Reset
        </button>
        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
          className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base"
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full"
              />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
