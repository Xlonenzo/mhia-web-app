import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

const Footer = () => {
  const { navigateTo } = useNavigation();

  const footerLinks = {
    product: [
      { name: 'Features', href: 'features' },
      { name: 'Solutions', href: 'solutions' },
      { name: 'Documentation', href: 'documentation' },
      { name: 'API Reference', href: 'documentation' }
    ],
    company: [
      { name: 'About', href: 'about' },
      { name: 'Careers', href: 'about' },
      { name: 'Contact', href: 'about' },
      { name: 'Privacy Policy', href: 'about' }
    ],
    resources: [
      { name: 'Blog', href: 'documentation' },
      { name: 'Tutorials', href: 'documentation' },
      { name: 'Support', href: 'documentation' },
      { name: 'Community', href: 'documentation' }
    ]
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-t border-white/10">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div className="ml-3">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MHIA</span>
                <p className="text-xs text-blue-200/60">Hydrological Platform</p>
              </div>
            </div>
            <p className="text-blue-100/70 mb-6 leading-relaxed">
              Transforming water resource management through advanced hydrological modeling and cutting-edge technology.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigateTo(link.href as any)}
                    className="text-blue-100/70 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigateTo(link.href as any)}
                    className="text-blue-100/70 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => navigateTo(link.href as any)}
                    className="text-blue-100/70 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-blue-100/60 text-sm">
            © 2024 MHIA. All rights reserved. | Built with ❤️ for the future of water resource management.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;