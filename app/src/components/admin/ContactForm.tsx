import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Linkedin, Github, Code2, Globe, Save, X } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface Contact {
  _id?: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  leetcode: string;
  portfolio: string;
  message: string;
}

interface ContactFormProps {
  onSave: () => void;
}

export default function ContactForm({ onSave }: ContactFormProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<Contact>({
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    leetcode: '',
    portfolio: '',
    message: '',
  });

  useEffect(() => {
    fetchContact();
  }, []);

  const fetchContact = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/contact`);
      const data = await response.json();
      setContact(data);
      setFormData(data);
    } catch {
      setError('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = contact?._id
        ? `${API_ENDPOINTS.PORTFOLIO}/contact/${contact._id}`
        : `${API_ENDPOINTS.PORTFOLIO}/contact`;
      const method = contact?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setContact(updatedData);
        setSuccess('Contact information updated!');
        setTimeout(() => {
          setSuccess('');
          setIsEditing(false);
          onSave();
        }, 1500);
      } else {
        setError('Failed to save contact information');
      }
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-20 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg"
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ backgroundSize: '200% 100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode */}
      {!isEditing && contact && (
        <div className="space-y-4">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: Mail, label: 'Email', value: contact.email },
              { icon: Phone, label: 'Phone', value: contact.phone },
              { icon: MapPin, label: 'Location', value: contact.location },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <item.icon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-white break-words">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Social Links Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: Linkedin, label: 'LinkedIn', value: contact.linkedin },
              { icon: Github, label: 'GitHub', value: contact.github },
              { icon: Code2, label: 'LeetCode', value: contact.leetcode },
              { icon: Globe, label: 'Portfolio', value: contact.portfolio },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs sm:text-sm text-white line-clamp-1 break-words">{item.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Section */}
          {contact.message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Default Message</p>
              <p className="text-xs sm:text-sm text-gray-300">{contact.message}</p>
            </motion.div>
          )}

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(true)}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit Contact Information
          </button>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-black via-gray-950 to-black border border-white/10 rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold">Edit Contact Information</h3>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(contact || {
                  email: '',
                  phone: '',
                  location: '',
                  linkedin: '',
                  github: '',
                  leetcode: '',
                  portfolio: '',
                  message: '',
                });
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                  placeholder="+91-XXXXXXXXXX"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                placeholder="City, State"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">LinkedIn *</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                  placeholder="linkedin.com/in/your-profile"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">GitHub *</label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                  placeholder="github.com/your-username"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">LeetCode *</label>
                <input
                  type="url"
                  value={formData.leetcode}
                  onChange={(e) => setFormData({ ...formData, leetcode: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                  placeholder="leetcode.com/u/your-username"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Portfolio URL *</label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                  placeholder="your-portfolio.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Default Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all min-h-[100px] resize-y"
                placeholder="Optional: A message to display on the contact section"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(contact || {
                    email: '',
                    phone: '',
                    location: '',
                    linkedin: '',
                    github: '',
                    leetcode: '',
                    portfolio: '',
                    message: '',
                  });
                }}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors font-medium text-xs sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
