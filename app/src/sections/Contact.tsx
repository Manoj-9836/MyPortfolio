import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, ExternalLink, Code2, Globe } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface ContactData {
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

const DEFAULT_CONTACT: ContactData = {
  email: 'manojbavisetti75@gmail.com',
  phone: '+91-6305321506',
  location: 'Vizianagaram, Andhra Pradesh',
  linkedin: 'linkedin.com/in/mkmanoj-dev',
  github: 'github.com/Manoj-9836',
  leetcode: 'leetcode.com/u/Manoj9836',
  portfolio: 'manoj-9836.github.io/Portfolio',
  message: 'Open to collaborations, opportunities, and interesting conversations'
};

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [contact, setContact] = useState<ContactData>(DEFAULT_CONTACT);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/contact`);
        if (response.ok) {
          const data = await response.json();
          setContact(data);
        }
      } catch (error) {
        console.error('Failed to fetch contact:', error);
        // Keep default contact
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`
    },
    {
      icon: Phone,
      label: 'Phone',
      value: contact.phone,
      href: `tel:${contact.phone.replace(/[^\d+]/g, '')}`
    },
    {
      icon: MapPin,
      label: 'Location',
      value: contact.location,
      href: null
    }
  ];

  const socialLinks = [
    {
      icon: Linkedin,
      label: 'LinkedIn',
      value: contact.linkedin,
      href: `https://${contact.linkedin.startsWith('http') ? contact.linkedin.replace(/^https?:\/\//, '') : contact.linkedin}`,
      color: 'hover:bg-blue-600/20 hover:text-blue-400'
    },
    {
      icon: Github,
      label: 'GitHub',
      value: contact.github,
      href: `https://${contact.github.startsWith('http') ? contact.github.replace(/^https?:\/\//, '') : contact.github}`,
      color: 'hover:bg-gray-600/20 hover:text-gray-300'
    },
    {
      icon: Code2,
      label: 'LeetCode',
      value: contact.leetcode,
      href: `https://${contact.leetcode.startsWith('http') ? contact.leetcode.replace(/^https?:\/\//, '') : contact.leetcode}`,
      color: 'hover:bg-yellow-600/20 hover:text-yellow-400'
    },
    {
      icon: Globe,
      label: 'Portfolio',
      value: contact.portfolio,
      href: `https://${contact.portfolio.startsWith('http') ? contact.portfolio.replace(/^https?:\/\//, '') : contact.portfolio}`,
      color: 'hover:bg-green-600/20 hover:text-green-400'
    }
  ];

  const validateForm = () => {
    const errors = { name: '', email: '', message: '' };
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Enter a valid email';
    }
    if (!formData.message.trim()) errors.message = 'Message is required';

    setFormErrors(errors);
    return !errors.name && !errors.email && !errors.message;
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);

    if (!validateForm()) return;

    const subject = encodeURIComponent(`Portfolio inquiry from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/10 to-black overflow-x-clip">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="mb-16 text-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm text-gray-500 uppercase tracking-wider"
            >
              Get in Touch
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              Let's Connect
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg text-gray-400 mt-4 max-w-2xl mx-auto"
            >
              {contact.message}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {loading && (
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                <div className="h-28 rounded-xl bg-white/5 border border-white/10" />
                <div className="h-28 rounded-xl bg-white/5 border border-white/10" />
              </div>
            )}

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Contact Information</h3>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs md:text-sm text-gray-500">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm md:text-base text-white hover:text-gray-300 transition-colors break-all"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm md:text-base text-white">{item.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Social Profiles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className={`group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 ${link.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <link.icon className="w-5 h-5" />
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-gray-500">{link.label}</p>
                    <p className="text-sm font-medium truncate">{link.value}</p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-10 md:mt-12 p-5 md:p-6 rounded-2xl border border-white/10 bg-white/5"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-1">Quick Message</h3>
            <p className="text-sm text-gray-400 mb-5">Share your requirement and I’ll get back quickly.</p>

            <form onSubmit={handleQuickSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/40"
                />
                {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/40"
                />
                {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
              </div>

              <div className="md:col-span-2">
                <textarea
                  placeholder="Tell me about your project or role"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-white/40"
                />
                {formErrors.message && <p className="text-xs text-red-400 mt-1">{formErrors.message}</p>}
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  Prefer direct contact? Use email or LinkedIn above.
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Send Message
                </button>
              </div>

              {submitted && (
                <p className="md:col-span-2 text-sm text-green-400">Thanks! Your mail app opened with the drafted message.</p>
              )}
            </form>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-20 pt-8 border-t border-white/10 text-center"
          >
            <p className="text-gray-500 text-sm">
              © 2025 BAVISETTI MANOJ KUMAR. All rights reserved.
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Built with React, TypeScript & Tailwind CSS
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
