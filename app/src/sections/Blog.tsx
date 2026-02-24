import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Calendar, X, Heart, Eye, MessageCircle, Share2, Twitter, Facebook, Linkedin, Copy, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Comment {
  _id: string;
  author: string;
  email?: string;
  content: string;
  createdAt: string;
  approved: boolean;
}

interface BlogPost {
  _id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  image?: string;
  leetcodeImage?: string;
  tags?: string[];
  readTime?: string;
  published?: boolean;
  featured?: boolean;
  views?: number;
  likes?: number;
  likedBy?: string[];
  comments?: Comment[];
}

export default function Blog() {
  const ref = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentForm, setCommentForm] = useState({ author: '', email: '', content: '' });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const postsPerPage = 6;

  const getUserId = () => {
    let userId = localStorage.getItem('blogUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('blogUserId', userId);
    }
    return userId;
  };

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

  const isLeetCodePost = (post: BlogPost) => {
    const category = post.category?.toLowerCase() || '';
    const tags = post.tags?.map((tag) => tag.toLowerCase()) || [];
    return category.includes('leetcode') || tags.includes('leetcode');
  };

  const incrementView = async (postId: string) => {
    try {
      await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${postId}/view`, {
        method: 'POST',
      });
      // Update local state
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, views: (p.views || 0) + 1 } : p
      ));
    } catch (error) {
      console.error('Failed to increment view:', error);
    }
  };

  const fetchRelatedPosts = async (postId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${postId}/related`);
      const data = await response.json();
      setRelatedPosts(data);
    } catch (error) {
      console.error('Failed to fetch related posts:', error);
    }
  };

  const checkIfLiked = (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (post?.likedBy) {
      const userId = getUserId();
      setHasLiked(post.likedBy.includes(userId));
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs`);
        const data = await response.json();
        const publishedPosts = data.filter((post: BlogPost) => post.published !== false);
        
        // Sort: featured first, then by date (newest first)
        const sortedPosts = publishedPosts.sort((a: BlogPost, b: BlogPost) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
      } catch {
        // Use empty state if fetch fails
      }
    };

    fetchPosts();
  }, []);

  // Search filter
  useEffect(() => {
    let filtered = posts;

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  // Reset to page 1 only when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reading progress tracker
  useEffect(() => {
    if (!selectedPost || !modalRef.current) return;

    const handleScroll = () => {
      if (!modalRef.current) return;
      const element = modalRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    const modal = modalRef.current;
    modal.addEventListener('scroll', handleScroll);
    return () => modal.removeEventListener('scroll', handleScroll);
  }, [selectedPost]);

  // Increment view count when post is opened
  useEffect(() => {
    if (selectedPost) {
      incrementView(selectedPost._id);
      fetchRelatedPosts(selectedPost._id);
      checkIfLiked(selectedPost._id);
    } else {
      setReadingProgress(0);
      setRelatedPosts([]);
      setShowShareMenu(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPost]);

  useEffect(() => {
    if (!selectedPost) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPost]);

  const handleLike = async (postId: string) => {
    try {
      const userId = getUserId();
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      
      // Update local state with likes count and likedBy array
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const updatedLikedBy = data.hasLiked 
            ? [...(p.likedBy || []), userId]
            : (p.likedBy || []).filter(id => id !== userId);
          return { ...p, likes: data.likes, likedBy: updatedLikedBy };
        }
        return p;
      }));
      
      if (selectedPost && selectedPost._id === postId) {
        const updatedLikedBy = data.hasLiked 
          ? [...(selectedPost.likedBy || []), userId]
          : (selectedPost.likedBy || []).filter(id => id !== userId);
        setSelectedPost({ ...selectedPost, likes: data.likes, likedBy: updatedLikedBy });
      }
      
      setHasLiked(data.hasLiked);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentForm.author || !commentForm.content) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${selectedPost._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      });
      const newComment = await response.json();
      
      const updatedComments = [...(selectedPost.comments || []), newComment];
      
      // Update local state for posts array
      setPosts(prev => prev.map(p => 
        p._id === selectedPost._id 
          ? { ...p, comments: updatedComments }
          : p
      ));
      
      // Update selected post
      setSelectedPost({
        ...selectedPost,
        comments: updatedComments
      });
      
      setCommentForm({ author: '', email: '', content: '' });
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const sharePost = (platform: string) => {
    if (!selectedPost) return;
    const url = window.location.href;
    const title = selectedPost.title;

    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="blog" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-x-clip">
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
              className="text-base sm:text-lg text-gray-400 mt-4"
            >
              Sharing insights, experiences, and thoughts on web development and technology
            </motion.p>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8"
            >
              <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white placeholder-gray-400 transition-all"
                />
                {searchQuery && (
                  <div className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPosts.map((post, index) => (
              <motion.div
                key={post._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                onClick={() => setSelectedPost(post)}
                className="h-auto sm:h-96 cursor-pointer group"
              >
                <div className="relative h-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-white/20 p-4 sm:p-6 flex flex-col justify-between">
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
                      src={post.image || post.leetcodeImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full justify-between flex-1">
                    {/* Top Section */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2 pr-1">
                          <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                          {post.featured && (
                            <span className="px-2 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-400/30">
                              ★ Featured
                            </span>
                          )}
                        </div>
                        {/* Stats */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap self-start sm:self-auto shrink-0">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{post.likes || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments?.length || 0}</span>
                          </div>
                        </div>
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
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors ml-auto">
                          <span className="text-xs font-medium text-gray-300 group-hover:text-white">Read</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 flex items-center justify-center gap-2"
            >
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-400/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          >
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-[60]">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${readingProgress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${readingProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl sm:rounded-3xl max-w-3xl w-full h-[92dvh] sm:h-auto max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPost(null)}
                className="absolute top-3 right-3 md:top-6 md:right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Featured Image */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full rounded-2xl overflow-hidden mb-6 mt-8 sm:mt-4"
              >
                {isLeetCodePost(selectedPost) && selectedPost.image ? (
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.title}
                    className="w-full h-52 sm:h-64 md:h-80 object-cover rounded-2xl"
                  />
                ) : (
                  <img
                    src={selectedPost.image || selectedPost.leetcodeImage}
                    alt={selectedPost.title}
                    className="w-full h-52 sm:h-64 md:h-80 object-cover"
                  />
                )}
              </motion.div>

              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(selectedPost.category)}`}>
                    {selectedPost.category}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedPost.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{selectedPost.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedPost.date)}
                    </div>
                  </div>
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl sm:text-2xl md:text-4xl font-bold mb-4 pr-10 sm:pr-0"
                >
                  {selectedPost.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-base sm:text-lg text-gray-300 italic"
                >
                  {selectedPost.excerpt}
                </motion.p>
                {isLeetCodePost(selectedPost) && selectedPost.leetcodeImage && (
                  <div className="mt-5 w-full">
                    <div className="w-[100px] rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50">
                      <img
                        src={selectedPost.leetcodeImage}
                        alt={`${selectedPost.title} - LeetCode`}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mb-6 flex items-center gap-3 flex-wrap"
              >
                <button
                  onClick={() => handleLike(selectedPost._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    hasLiked
                      ? 'bg-red-500/20 text-red-400 border border-red-400/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{hasLiked ? 'Liked' : 'Like'}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full mt-2 right-0 sm:left-0 sm:right-auto bg-gray-900 border border-white/20 rounded-lg p-2 shadow-xl z-20 min-w-[150px]"
                    >
                      <button
                        onClick={() => sharePost('twitter')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded w-full text-left"
                      >
                        <Twitter className="w-4 h-4" />
                        <span>Twitter</span>
                      </button>
                      <button
                        onClick={() => sharePost('facebook')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded w-full text-left"
                      >
                        <Facebook className="w-4 h-4" />
                        <span>Facebook</span>
                      </button>
                      <button
                        onClick={() => sharePost('linkedin')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded w-full text-left"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </button>
                      <button
                        onClick={() => sharePost('copy')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded w-full text-left"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

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

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 pt-6 border-t border-white/10"
                >
                  <h3 className="text-xl font-bold mb-4">Related Posts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {relatedPosts.map((post) => (
                      <div
                        key={post._id}
                        onClick={() => {
                          setSelectedPost(post);
                          modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="cursor-pointer group p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                      >
                        <img
                          src={post.image || post.leetcodeImage}
                          alt={post.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-400 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-2">{formatDate(post.date)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-8 pt-6 border-t border-white/10"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments ({selectedPost.comments?.length || 0})
                </h3>

                {/* Comment Form */}
                <form onSubmit={handleComment} className="mb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={commentForm.author}
                      onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                      required
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white placeholder-gray-400"
                    />
                    <input
                      type="email"
                      placeholder="Your Email (optional)"
                      value={commentForm.email}
                      onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white placeholder-gray-400"
                    />
                  </div>
                  <textarea
                    placeholder="Write your comment *"
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-white placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500/20 text-blue-400 border border-blue-400/50 rounded-lg hover:bg-blue-500/30 transition-colors font-medium"
                  >
                    Post Comment
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {selectedPost.comments && selectedPost.comments.length > 0 ? (
                    [...selectedPost.comments]
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((comment) => (
                      <div
                        key={comment._id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-blue-400">{comment.author}</span>
                          <span className="text-xs text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
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
