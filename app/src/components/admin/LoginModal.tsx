import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, Shield } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Disable background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        onLoginSuccess(data.token);
        onClose();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - prevents all background interactions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="box-border bg-gradient-to-br from-black via-gray-950 to-black border-0 sm:border border-white/10 rounded-none sm:rounded-2xl p-4 sm:p-8 w-full max-w-full sm:max-w-md h-[100dvh] sm:h-auto max-h-none sm:max-h-[90vh] overflow-hidden sm:overflow-y-auto relative shadow-none sm:shadow-2xl">
              {/* Subtle corner accents */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -ml-16 -mb-16" />
              
              {/* Relative z-index for content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="mb-5 sm:mb-8">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-white/5 border border-white/10 rounded-lg flex-shrink-0">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">Admin Access</h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg flex-shrink-0"
                      aria-label="Close login modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm">Sign in to manage your portfolio content</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-lg pl-12 pr-4 py-2.5 sm:py-3 focus:outline-none transition-all focus:bg-white/10 text-white placeholder:text-gray-600"
                        placeholder="your@email.com"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-gray-300 transition-colors" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-white/30 rounded-lg pl-12 pr-4 py-2.5 sm:py-3 focus:outline-none transition-all focus:bg-white/10 text-white placeholder:text-gray-600"
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/10 border border-red-500/20 rounded-lg p-3.5 text-red-400 text-sm flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      {error}
                    </motion.div>
                  )}

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    className="w-full bg-white text-black rounded-lg py-3 sm:py-3.5 font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group shadow-lg shadow-white/5"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full"
                          />
                          Authenticating...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </span>
                  </motion.button>
                </form>

                {/* Footer */}
                <div className="mt-4 pt-4 sm:mt-6 sm:pt-6 border-t border-white/10">
                  <p className="text-center text-xs text-gray-500">
                    Protected dashboard • Secure authentication
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
