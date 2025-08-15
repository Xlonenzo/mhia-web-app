import React from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../../contexts/NavigationContext';
import { ArrowLeft, Droplets, BarChart3, Globe, Zap, Database, Shield } from 'lucide-react';

const FeaturesPage = () => {
  const { navigateTo } = useNavigation();

  const features = [
    {
      icon: Droplets,
      title: 'Hydrological Modeling',
      description: 'Advanced water flow simulation with real-time data integration',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Data Analysis',
      description: 'Comprehensive analytics and visualization tools',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'Geospatial Mapping',
      description: 'Interactive maps with multiple layer support',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Real-time Monitoring',
      description: 'Live data streaming and alert systems',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Secure storage and efficient data processing',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security and regulatory compliance',
      color: 'from-red-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-cyan-900/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 p-6">
        <motion.button
          onClick={() => navigateTo('landing')}
          className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </motion.button>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Features
            </span>
          </h1>
          <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
            Discover the powerful capabilities that make MHIA the leading hydrological modeling platform
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300"></div>
              <div className="relative p-8 h-full">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-blue-100/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage; 