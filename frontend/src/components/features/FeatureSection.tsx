import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';

const FeatureSection = () => {
  const { navigateTo } = useNavigation();

  const features = [
    {
      title: 'Hydrological Modeling',
      description: 'Advanced water flow simulation with real-time data integration and predictive analytics.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Data Analysis',
      description: 'Comprehensive analytics and visualization tools for water resource assessment.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Geospatial Mapping',
      description: 'Interactive maps with multiple layer support and real-time data overlay.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Real-time Monitoring',
      description: 'Live data streaming and alert systems for critical water resource management.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Data Management',
      description: 'Secure storage and efficient data processing for large-scale hydrological datasets.',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      title: 'Security & Compliance',
      description: 'Enterprise-grade security and regulatory compliance for sensitive water data.',
      color: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
            Discover the comprehensive suite of tools designed to revolutionize your hydrological modeling workflow
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative cursor-pointer"
              onClick={() => navigateTo('features')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300"></div>
              <div className="relative p-8 h-full">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <span className="w-8 h-8 text-white">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-blue-100/70 leading-relaxed mb-6">
                  {feature.description}
                </p>
                <div className="flex items-center text-blue-300 group-hover:text-blue-200 transition-colors">
                  <span className="text-sm font-medium">Learn more</span>
                  <span className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Transform Your Water Analysis?
            </h3>
            <p className="text-blue-100/80 mb-6 max-w-2xl mx-auto">
              Join thousands of researchers and professionals who trust MHIA for their hydrological modeling needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateTo('dashboard')}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigateTo('documentation')}
                className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;