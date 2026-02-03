import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface BlogPost {
  _id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  image?: string;
  tags?: string[];
  readTime?: string;
  published?: boolean;
}

export default function Blog() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs`);
        const data = await response.json();
        setPosts(data.filter((post: BlogPost) => post.published !== false));
      } catch {
        // Use empty state if fetch fails
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'React': 'bg-blue-500/20 text-blue-400',
      'Web Design': 'bg-purple-500/20 text-purple-400',
      'JavaScript': 'bg-yellow-500/20 text-yellow-400',
      'CSS': 'bg-pink-500/20 text-pink-400',
      'TypeScript': 'bg-cyan-500/20 text-cyan-400',
      'Backend': 'bg-green-500/20 text-green-400',
    };
    return colors[category] || 'bg-white/10 text-white';
  };

  return (
    <section id="blog" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm text-gray-500 uppercase tracking-wider"
            >
              My Stories
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              My Blog
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-400 mt-4"
            >
              Sharing insights, experiences, and thoughts on web development and technology
            </motion.p>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                onClick={() => setSelectedPost(post)}
                className="h-96 cursor-pointer group"
              >
                <div className="relative h-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-white/20 p-6 flex flex-col justify-between">
                  {/* Background animation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

                  {/* Image Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + index * 0.1 + 0.2 }}
                    className="relative z-10 mb-4 h-32 rounded-2xl overflow-hidden group/image"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full justify-between flex-1">
                    {/* Top Section */}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                      </div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.5 + index * 0.1 + 0.3 }}
                        className="text-lg md:text-xl font-bold line-clamp-2 group-hover:text-blue-400 transition-colors"
                      >
                        {post.title}
                      </motion.h3>
                    </div>

                    {/* Bottom Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 + 0.4 }}
                      className="flex flex-col gap-2"
                    >
                      <p className="text-gray-300 text-xs md:text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                          <span className="text-xs font-medium text-gray-300 group-hover:text-white">Read</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Expanded Post Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Featured Image */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-6 mt-4"
              >
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(selectedPost.category)}`}>
                    {selectedPost.category}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedPost.date)}
                  </div>
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-4xl font-bold mb-4"
                >
                  {selectedPost.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-gray-300 italic"
                >
                  {selectedPost.excerpt}
                </motion.p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="prose prose-invert max-w-none"
              >
                <div className="text-gray-300 leading-relaxed space-y-4 text-sm md:text-base whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </motion.div>

              {/* Tags */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 pt-6 border-t border-white/10"
                >
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium text-gray-300 transition-colors"
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 pt-6 border-t border-white/10 flex justify-end"
              >
                <button
                  onClick={() => setSelectedPost(null)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
