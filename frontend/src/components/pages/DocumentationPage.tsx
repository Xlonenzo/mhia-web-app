import React from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../../contexts/NavigationContext';
import { ArrowLeft, Book, Code, Video, Download, Search, Users } from 'lucide-react';

const DocumentationPage = () => {
  const { navigateTo } = useNavigation();

  const docs = [
    {
      icon: Book,
      title: 'Getting Started',
      description: 'Quick start guide and basic concepts',
      category: 'Beginner',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Complete API documentation and examples',
      category: 'Advanced',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      category: 'All Levels',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Download,
      title: 'SDK & Libraries',
      description: 'Download SDKs and client libraries',
      category: 'Developer',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Search,
      title: 'Best Practices',
      description: 'Recommended patterns and guidelines',
      category: 'Intermediate',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Forums, discussions, and support',
      category: 'All Users',
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
              Documentation
            </span>
          </h1>
          <p className="text-xl text-blue-100/80 max-w-3xl mx-auto">
            Comprehensive guides, tutorials, and resources to help you master MHIA
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-blue-200/60 focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
        </motion.div>

        {/* Documentation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {docs.map((doc, index) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative cursor-pointer"
              whileHover={{ y: -5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300"></div>
              <div className="relative p-8 h-full">
                <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br ${doc.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <doc.icon className="w-8 h-8 text-white" />
                </div>
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                    {doc.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-200 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-blue-100/70 leading-relaxed">
                  {doc.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage; 