import React from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../../contexts/NavigationContext';
import { ArrowLeft, Building, Users, Globe, Shield, Zap, TrendingUp } from 'lucide-react';

const SolutionsPage = () => {
  const { navigateTo } = useNavigation();

  const solutions = [
    {
      icon: Building,
      title: 'Enterprise Solutions',
      description: 'Comprehensive hydrological modeling for large organizations',
      features: ['Advanced Analytics', 'Custom Integration', '24/7 Support'],
      color: 'from-blue-600 to-indigo-600'
    },
    {
      icon: Users,
      title: 'Research Institutions',
      description: 'Academic and research-focused hydrological modeling tools',
      features: ['Open Data Access', 'Collaborative Tools', 'Publication Support'],
      color: 'from-green-600 to-emerald-600'
    },
    {
      icon: Globe,
      title: 'Government Agencies',
      description: 'Regulatory compliance and policy-making support',
      features: ['Compliance Tools', 'Audit Trails', 'Policy Integration'],
      color: 'from-purple-600 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Environmental Consulting',
      description: 'Professional consulting and assessment services',
      features: ['Expert Analysis', 'Report Generation', 'Client Portal'],
      color: 'from-red-600 to-orange-600'
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
              Solutions
            </span>
          </h1>
          <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
            Tailored solutions for every organization's unique hydrological modeling needs
          </p>
        </motion.div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={solution.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300"></div>
              <div className="relative p-8 h-full">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${solution.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <solution.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                  {solution.title}
                </h3>
                <p className="text-blue-100/70 mb-6 leading-relaxed">
                  {solution.description}
                </p>
                <ul className="space-y-2">
                  {solution.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 + featureIndex * 0.1 }}
                      className="flex items-center text-blue-100/80"
                    >
                      <TrendingUp className="w-4 h-4 mr-3 text-blue-400" />
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolutionsPage; 