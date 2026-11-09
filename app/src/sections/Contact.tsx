import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, ExternalLink, Code2, Globe, FileText } from 'lucide-react';
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
      color: 'hover:border-[#D9541E] hover:text-[#D9541E]'
    },
    {
      icon: Github,
      label: 'GitHub',
      value: contact.github,
      href: `https://${contact.github.startsWith('http') ? contact.github.replace(/^https?:\/\//, '') : contact.github}`,
      color: 'hover:border-[#D9541E] hover:text-[#D9541E]'
    },
    {
      icon: Code2,
      label: 'LeetCode',
      value: contact.leetcode,
      href: `https://${contact.leetcode.startsWith('http') ? contact.leetcode.replace(/^https?:\/\//, '') : contact.leetcode}`,
      color: 'hover:border-[#D9541E] hover:text-[#D9541E]'
    },
    {
      icon: Globe,
      label: 'Portfolio',
      value: contact.portfolio,
      href: `https://${contact.portfolio.startsWith('http') ? contact.portfolio.replace(/^https?:\/\//, '') : contact.portfolio}`,
      color: 'hover:border-[#D9541E] hover:text-[#D9541E]'
    }
  ];

  return (
    <section id="contact" data-gsap-reveal className="bg-[#111111] px-5 py-16 text-[#F3EEE3] sm:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="mb-16 grid gap-8 border-t border-[#F3EEE3]/25 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono text-xs uppercase tracking-[0.16em] text-[#F3EEE3]/60"
            >
              08 / Contact
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative inline-block pb-3 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
            >
              Let's Connect
              <svg viewBox="0 0 260 14" className="absolute -bottom-0 left-6 w-[200px] sm:w-[250px]" aria-hidden="true">
                <path d="M3 10 C60 3 160 2 257 6" fill="none" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl font-serif text-lg leading-8 text-[#F3EEE3]/70"
            >
              {contact.message}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-12 border-t border-[#F3EEE3]/25 pt-8 lg:grid-cols-2 lg:gap-20">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="mb-6 font-display text-2xl font-semibold">Contact Information</h3>
              <div className="divide-y divide-[#F3EEE3]/20 border-y border-[#F3EEE3]/20">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 py-4 transition-colors hover:text-[#D9541E] md:gap-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#D9541E] text-[#D9541E] md:h-12 md:w-12">
                      <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/45">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="break-words font-serif text-sm text-[#F3EEE3] transition-colors hover:text-[#D9541E] md:text-base"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-serif text-sm text-[#F3EEE3] md:text-base">{item.value}</p>
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
              <h3 className="mb-6 font-display text-2xl font-semibold">Social Profiles</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className={`group border border-[#F3EEE3]/20 p-4 transition-all duration-300 ${link.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-10 w-10 items-center justify-center border border-[#F3EEE3]/30 text-[#D9541E]">
                        <link.icon className="h-5 w-5" />
                      </div>
                      <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/45">{link.label}</p>
                    <p className="truncate font-serif text-sm font-medium">{link.value}</p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex min-h-12 items-center gap-2 border border-[#D9541E] bg-[#D9541E] px-5 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F3EEE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9541E]"
          >
            <FileText className="h-4 w-4" />
            Open resume
          </a>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-20 border-t border-[#F3EEE3]/20 pt-8 text-center"
          >
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/45">
              © 2025 BAVISETTI MANOJ KUMAR. All rights reserved.
            </p>
            <p className="mt-2 font-serif text-xs text-[#F3EEE3]/35">
              Built with React, TypeScript & Tailwind CSS
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
