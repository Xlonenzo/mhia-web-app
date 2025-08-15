import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { navigateTo } = useNavigation();

  const navigation = [
    { name: 'Home', href: 'landing' },
    { name: 'Features', href: 'features' },
    { name: 'Solutions', href: 'solutions' },
    { name: 'Documentation', href: 'documentation' },
    { name: 'About', href: 'about' },
  ];

  const handleNavigation = (href: string) => {
    navigateTo(href as any);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => handleNavigation('landing')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="ml-3 hidden sm:block">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MHIA</span>
              <p className="text-xs text-blue-200/60">Hydrological Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className="text-blue-100/80 hover:text-white transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => handleNavigation('login')}
              className="px-4 py-2 text-blue-100/80 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNavigation('dashboard')}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-blue-100/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <span className="block h-6 w-6">✕</span>
              ) : (
                <span className="block h-6 w-6">☰</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className="block w-full text-left px-3 py-2 text-blue-100/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {item.name}
              </button>
            ))}
            <div className="pt-4 pb-3 border-t border-white/20 space-y-2">
              <button 
                onClick={() => handleNavigation('login')}
                className="w-full px-3 py-2 text-blue-100/80 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => handleNavigation('dashboard')}
                className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;