import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

const Hero = () => {
  const { navigateTo } = useNavigation();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 to-slate-900">
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-12">
            <span className="inline-flex items-center px-6 py-3 rounded-full text-sm font-light tracking-wide bg-white/5 backdrop-blur-sm text-blue-200 border border-white/10">
              🌊 Advanced Hydrological Modeling Platform
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light text-white mb-8 leading-none tracking-tight">
            Transform
            <br />
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent font-light">
              Water
            </span>
            <br />
            <span className="text-white/90 font-light">
              Analysis
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-blue-100/70 mb-16 max-w-4xl mx-auto leading-relaxed font-light tracking-wide">
            Powerful hydrological modeling platform that combines cutting-edge science 
            with intuitive design for comprehensive water resource management.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <button
              onClick={() => navigateTo('dashboard')}
              className="group relative px-10 py-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm text-white border border-white/20 rounded-full hover:border-white/40 transition-all duration-500 overflow-hidden"
            >
              <span className="relative z-10 flex items-center font-light tracking-wide">
                Start Modeling
                <span className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
            
            <button
              onClick={() => navigateTo('features')}
              className="group px-10 py-4 bg-white/5 backdrop-blur-sm text-white border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-500"
            >
              <span className="flex items-center font-light tracking-wide">
                <span className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300">▶</span>
                Watch Demo
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { number: '10K+', label: 'Simulations Run' },
              { number: '500+', label: 'Research Projects' },
              { number: '50+', label: 'Countries' },
              { number: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label} className="text-center group cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-500">
                  <span className="w-7 h-7 text-blue-300">📊</span>
                </div>
                <div className="text-3xl font-light text-white mb-2 tracking-wide">{stat.number}</div>
                <div className="text-sm text-blue-200/60 font-light tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;