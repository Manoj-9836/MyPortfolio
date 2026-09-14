import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../config/api';
import { Mail, Trash2, Reply, X, Check, Clock, AlertCircle, Send } from 'lucide-react';

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  repliedTo: boolean;
  adminReply?: string;
  adminReplyDate?: string;
  submittedAt: string;
}

interface Stats {
  total: number;
  unread: number;
  replied: number;
  unreplied: number;
}

export default function MessagesForm() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, unread: 0, replied: 0, unreplied: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'replied' | 'unreplied'>('all');
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/messages-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getFilteredMessages = () => {
    switch (filter) {
      case 'unread':
        return messages.filter(m => !m.isRead);
      case 'replied':
        return messages.filter(m => m.repliedTo);
      case 'unreplied':
        return messages.filter(m => !m.repliedTo);
      default:
        return messages;
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setMessages(messages.filter(m => m._id !== id));
        setSelectedMessage(null);
        await fetchStats();
        toast.success('Message deleted');
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setSendingReply(true);
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/messages/${selectedMessage._id}/reply`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminReply: replyText })
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(messages.map(m => m._id === selectedMessage._id ? updatedMessage : m));
        setSelectedMessage(updatedMessage);
        setReplyText('');
        await fetchStats();
        toast.success('Reply sent successfully');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredMessages = getFilteredMessages();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Messages', value: stats.total, color: 'bg-blue-500/10 text-blue-400' },
          { label: 'Unread', value: stats.unread, color: 'bg-yellow-500/10 text-yellow-400' },
          { label: 'Replied', value: stats.replied, color: 'bg-green-500/10 text-green-400' },
          { label: 'Unreplied', value: stats.unreplied, color: 'bg-red-500/10 text-red-400' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${stat.color} border border-white/10 rounded-xl p-4`}
          >
            <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'unread', 'replied', 'unreplied'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === f
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400/50'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No messages found</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedMessage(message)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedMessage?._id === message._id
                    ? 'bg-white/10 border-white/30'
                    : message.isRead
                    ? 'bg-white/5 border-white/10 hover:bg-white/8'
                    : 'bg-blue-500/5 border-blue-400/30 hover:bg-blue-500/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{message.name}</h3>
                      {!message.isRead && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                          <Clock className="w-3 h-3" /> Unread
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{message.email}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-2">{message.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.repliedTo && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">{formatDate(message.submittedAt)}</p>
              </motion.div>
            ))
          )}
        </div>

        {/* Message Detail & Reply */}
        <AnimatePresence>
          {selectedMessage && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-6 space-y-4 max-h-[600px] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white">{selectedMessage.name}</h3>
                  <p className="text-sm text-gray-400">{selectedMessage.email}</p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Date & Status */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Mail className="w-4 h-4" />
                {formatDate(selectedMessage.submittedAt)}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10" />

              {/* Original Message */}
              <div>
                <p className="text-xs uppercase text-gray-500 mb-2">Original Message</p>
                <div className="bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-gray-300 whitespace-pre-wrap break-words">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Reply Section */}
              {selectedMessage.repliedTo && selectedMessage.adminReply && (
                <div>
                  <p className="text-xs uppercase text-green-500 mb-2 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Your Reply
                  </p>
                  <div className="bg-green-500/5 border border-green-400/20 rounded-lg p-3 text-sm text-green-200 whitespace-pre-wrap break-words">
                    {selectedMessage.adminReply}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Sent on {formatDate(selectedMessage.adminReplyDate || '')}
                  </p>
                </div>
              )}

              {/* Reply Form */}
              {!selectedMessage.repliedTo && (
                <div className="space-y-3">
                  <p className="text-xs uppercase text-gray-500">Send Reply</p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={4}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/70 resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sendingReply || !replyText.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-400/50 rounded-lg hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              )}

              {/* Delete Button */}
              <button
                onClick={() => handleDeleteMessage(selectedMessage._id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Message
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
