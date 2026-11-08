import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginModal from '../components/admin/LoginModal';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Education', href: '#education' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Blog', href: '#blog' },
  { label: 'Community', href: '#leadership' },
  { label: 'Credentials', href: '#certifications' },
  { label: 'Recognition', href: '#achievements' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLoginSuccess = () => {
    window.location.href = '/admin';
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+Click or Cmd+Click opens login
      e.preventDefault();
      setIsLoginOpen(true);
    } else {
      // Normal click - scroll to home
      e.preventDefault();
      const element = document.getElementById('home');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Track active section
      const sections = navItems.map(item => item.href.replace('#', ''));
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      // Close menu first
      setIsMobileMenuOpen(false);
      
      // Wait for menu animation to complete before scrolling
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`fixed left-0 right-0 top-0 z-50 border-b border-[#111111]/15 bg-[#F3EEE3] transition-colors duration-300 ${
        isScrolled || isMobileMenuOpen ? 'shadow-[0_1px_0_#D9541E]' : ''
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <motion.a
            href="#home"
            onClick={handleLogoClick}
            className="cursor-pointer font-display text-base font-semibold uppercase tracking-[0.12em] text-[#111111] md:text-lg"
            whileHover={{ scale: 1.05 }}
            title="Ctrl+Click to login"
          >
            BMK
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {navItems.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className={`border-b pb-1 font-mono text-xs uppercase tracking-[0.08em] transition-colors duration-200 ${
                    isActive ? 'border-[#D9541E] text-[#D9541E]' : 'border-transparent text-[#111111]/60 hover:border-[#D9541E] hover:text-[#111111]'
                  }`}
                  whileHover={{ y: -2 }}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </motion.a>
              );
            })}
          </div>

          {/* Year Badge - Click to login */}
          <motion.button
            onClick={() => setIsLoginOpen(true)}
            className="hidden cursor-pointer border border-[#111111] px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] text-[#111111] transition-colors hover:border-[#D9541E] hover:bg-[#D9541E] hover:text-[#F3EEE3] md:block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Click to login"
          >
            ©2026
          </motion.button>

          {/* Mobile Menu Button */}
          <button
            className="relative flex h-11 w-11 items-center justify-center border border-[#111111] p-2 text-[#111111] md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 8 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full origin-center bg-[#111111] h-0.5"
              />
              <motion.span
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  x: isMobileMenuOpen ? -10 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full bg-[#111111] h-0.5"
              />
              <motion.span
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -8 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full origin-center bg-[#111111] h-0.5"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-[#111111]/20 bg-[#F3EEE3] md:hidden"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-1 px-5 py-5 sm:px-8"
            >
              {navItems.map((item, index) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className={`block border-l-2 px-3 py-3 font-mono text-xs uppercase tracking-[0.08em] transition-colors hover:bg-[#111111]/5 ${
                      isActive ? 'border-[#D9541E] text-[#D9541E]' : 'border-transparent text-[#111111]/65 hover:text-[#111111]'
                    }`}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    {item.label}
                  </motion.a>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </motion.nav>
  );
}
