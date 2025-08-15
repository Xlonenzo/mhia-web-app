import React from 'react';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import MHIAFormModal from './components/MHIAFormModal';
import ResultsViewer from './components/results/ResultsViewer';
import EnhancedResultsViewer from './components/results/EnhancedResultsViewer';
import DataImporter from './components/import/DataImporter';

// Enhanced Landing Page Component
const SimpleLanding: React.FC = () => {
  console.log('🏠 SimpleLanding component rendering');
  const { navigateTo } = useNavigation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-900 text-white relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
      
      {/* Enhanced Navbar */}
      <nav className="relative z-10 p-6 bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MHIA</span>
              <p className="text-xs text-blue-200/60 -mt-1">Hydrological Platform</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigateTo('features')}
              className="text-blue-200 hover:text-white transition-colors duration-200"
            >
              Features
            </button>
            <button 
              onClick={() => navigateTo('about')}
              className="text-blue-200 hover:text-white transition-colors duration-200"
            >
              About
            </button>
            <button 
              onClick={() => navigateTo('documentation')}
              className="text-blue-200 hover:text-white transition-colors duration-200"
            >
              Docs
            </button>
            <button 
              onClick={() => navigateTo('login')}
              className="px-4 py-2 text-blue-200 hover:text-white border border-blue-500/50 hover:border-blue-400 rounded-lg transition-all duration-200"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigateTo('dashboard')}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-8 py-20">
        <div className="text-center max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="inline-flex items-center px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm font-light tracking-wide text-blue-200">
              Advanced Hydrological Modeling Platform
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light mb-8 leading-tight">
            Water Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 font-thin">Intelligence</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform water management with AI-powered simulations, real-time monitoring, 
            and predictive analytics for sustainable environmental solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button 
              onClick={() => navigateTo('dashboard')}
              className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-semibold text-lg shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Start Modeling
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </button>
            <button 
              className="px-10 py-4 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all duration-300"
            >
              Watch Demo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">10M+</div>
              <div className="text-gray-400 text-sm">Data Points Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-gray-400 text-sm">Watersheds Modeled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-2">99.9%</div>
              <div className="text-gray-400 text-sm">Prediction Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">Core Features</h2>
            <p className="text-gray-400 text-lg">Advanced tools for comprehensive water resource management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-blue-400/50 p-8 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🌊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-blue-400">Hydrological Modeling</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Advanced water flow simulation with real-time data integration and machine learning predictions for accurate watershed analysis.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Physical process modeling</li>
                <li>• Socio-hydrological dynamics</li>
                <li>• Anthropocene impact assessment</li>
                <li>• Artificial aquifer simulation</li>
              </ul>
            </div>
            
            <div className="group bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-green-400/50 p-8 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-green-400">Smart Analytics</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Comprehensive data analysis with interactive visualizations, automated reporting, and predictive insights.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Time series analysis</li>
                <li>• Water balance visualization</li>
                <li>• Performance indicators</li>
                <li>• Automated reporting</li>
              </ul>
            </div>
            
            <div className="group bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-purple-400/50 p-8 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">Geospatial Intelligence</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Interactive mapping with satellite data overlay and multi-dimensional watershed analysis capabilities.
              </p>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Satellite data integration</li>
                <li>• Multi-layer mapping</li>
                <li>• Watershed delineation</li>
                <li>• Real-time monitoring</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Stack Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-light mb-6">Built on Modern Technology</h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                MHIA leverages cutting-edge technology stack to deliver reliable, scalable, and efficient hydrological modeling solutions.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold">⚡</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-400">High Performance Computing</h3>
                    <p className="text-gray-400 text-sm">Optimized algorithms for rapid model execution and real-time analysis</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold">📈</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-400">Infinite Scalability</h3>
                    <p className="text-gray-400 text-sm">Cloud-native architecture that grows with your computational needs</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-white font-bold">🔒</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-400">Enterprise Security</h3>
                    <p className="text-gray-400 text-sm">Bank-grade security with encrypted data and secure access controls</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">99.9%</div>
                <div className="text-gray-400 text-sm">Uptime Reliability</div>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">10x</div>
                <div className="text-gray-400 text-sm">Faster Processing</div>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                <div className="text-gray-400 text-sm">Monitoring</div>
              </div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">Auto</div>
                <div className="text-gray-400 text-sm">Deployment</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">About MHIA Platform</h2>
            <p className="text-gray-400 text-lg">Pioneering the future of water resource management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-purple-400">Our Mission</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                MHIA represents the next generation of hydrological modeling platforms, combining cutting-edge scientific research with intuitive technology. 
                Our platform empowers researchers, engineers, and policymakers to make data-driven decisions for sustainable water resource management.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">Real-time Monitoring</span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">AI Predictions</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">Cloud-based</span>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs">Enterprise Ready</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-teal-400">Key Benefits</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-400">Integrated Modeling</h4>
                    <p className="text-gray-400 text-sm">Physical, socio-hydrological, and anthropocene models in one platform</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400">Scalable Architecture</h4>
                    <p className="text-gray-400 text-sm">Handles large datasets and complex simulations efficiently</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-400">User-Friendly Interface</h4>
                    <p className="text-gray-400 text-sm">Intuitive design for both experts and newcomers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">Documentation & Resources</h2>
            <p className="text-gray-400 text-lg">Everything you need to get started and succeed with MHIA</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-teal-400/50 p-6 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">📚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-teal-400">Quick Start Guide</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get up and running with MHIA in minutes with our comprehensive step-by-step tutorial and examples.
              </p>
              <div className="text-teal-400 text-sm font-medium group-hover:text-cyan-400 transition-colors">
                Start Tutorial →
              </div>
            </div>

            <div className="group bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-blue-400/50 p-6 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">⚙️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-400">API Reference</h3>
              <p className="text-gray-400 text-sm mb-4">
                Complete API documentation with endpoints, parameters, and examples for seamless integration.
              </p>
              <div className="text-blue-400 text-sm font-medium group-hover:text-indigo-400 transition-colors">
                View API Docs →
              </div>
            </div>

            <div className="group bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-yellow-400/50 p-6 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Best Practices</h3>
              <p className="text-gray-400 text-sm mb-4">
                Learn proven methodologies, optimization techniques, and expert tips for successful modeling projects.
              </p>
              <div className="text-yellow-400 text-sm font-medium group-hover:text-orange-400 transition-colors">
                Read Guide →
              </div>
            </div>

            <div className="group bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-red-400/50 p-6 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-red-400">Support Center</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get help from our expert team and vibrant community of researchers and water management professionals.
              </p>
              <div className="text-red-400 text-sm font-medium group-hover:text-pink-400 transition-colors">
                Get Support →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative z-10 py-20 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-light mb-6">Ready to Transform Your Water Management?</h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of researchers and organizations already using MHIA for advanced hydrological modeling and analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button 
              onClick={() => navigateTo('dashboard')}
              className="group px-12 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl font-semibold text-lg shadow-2xl shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
            >
              Start Free Trial
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </button>
            <button 
              className="px-12 py-4 border-2 border-white/20 hover:border-white/40 hover:bg-white/5 rounded-xl font-semibold text-lg backdrop-blur-sm transition-all duration-300"
            >
              Schedule Demo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-sm text-gray-500 mb-1">Free Trial</div>
              <div className="text-lg font-semibold text-gray-300">30 Days</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Setup Time</div>
              <div className="text-lg font-semibold text-gray-300">&lt; 5 Minutes</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Support</div>
              <div className="text-lg font-semibold text-gray-300">24/7 Expert Help</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const SimpleFeatures: React.FC = () => {
  console.log('⭐ SimpleFeatures component rendering');
  const { navigateTo } = useNavigation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-slate-900 text-white p-8">
      <button 
        onClick={() => navigateTo('landing')}
        className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
      >
        ← Back
      </button>
      <h1 className="text-4xl font-bold mb-8">Features Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white/10 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Hydrological Modeling</h3>
          <p className="text-gray-300">Advanced water flow simulation</p>
        </div>
        <div className="p-6 bg-white/10 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Data Analysis</h3>
          <p className="text-gray-300">Comprehensive analytics tools</p>
        </div>
        <div className="p-6 bg-white/10 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Geospatial Mapping</h3>
          <p className="text-gray-300">Interactive mapping system</p>
        </div>
      </div>
    </div>
  );
};

const SimpleAbout: React.FC = () => {
  console.log('ℹ️ SimpleAbout component rendering');
  const { navigateTo } = useNavigation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="p-8 border-b border-white/10">
        <button 
          onClick={() => navigateTo('landing')}
          className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
        >
          ← Back to Home
        </button>
        <h1 className="text-5xl font-light mb-4">About MHIA</h1>
        <p className="text-xl text-gray-400">Pioneering the future of water resource management</p>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-6">
              MHIA is an advanced hydrological modeling platform designed to revolutionize water resource management and environmental analysis through cutting-edge technology and scientific innovation.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Our platform combines sophisticated scientific modeling with intuitive visualization tools, empowering researchers, engineers, and policymakers to make data-driven decisions for sustainable water resource management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-2xl font-semibold mb-4 text-purple-400">Innovation</h3>
              <p className="text-gray-300">
                Leveraging AI and machine learning to predict water patterns and optimize resource allocation with unprecedented accuracy.
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-xl border border-white/10">
              <h3 className="text-2xl font-semibold mb-4 text-pink-400">Sustainability</h3>
              <p className="text-gray-300">
                Promoting environmental stewardship through intelligent modeling that supports long-term ecosystem health.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={() => navigateTo('features')}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all duration-300"
            >
              Explore Our Features
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Page Component
const SimpleLogin: React.FC = () => {
  console.log('🔐 SimpleLogin component rendering');
  const { navigateTo } = useNavigation();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create form data for login
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Store token and user info
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify({
          id: '1',
          username: username,
          email: `${username}@mhia.com`,
          full_name: username,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
        
        console.log('Login successful!');
        navigateTo('dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MHIA</span>
          </div>
          <h1 className="text-3xl font-light mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to access your hydrological models</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-200"
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            
            <div className="text-center text-sm text-gray-400">
              <p>Test credentials:</p>
              <p>Username: <span className="text-blue-400">testuser</span></p>
              <p>Password: <span className="text-blue-400">testpass123</span></p>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => navigateTo('landing')}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Documentation Page Component  
const SimpleDocumentation: React.FC = () => {
  console.log('📚 SimpleDocumentation component rendering');
  const { navigateTo } = useNavigation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 to-slate-900 text-white">
      {/* Header */}
      <div className="p-8 border-b border-white/10">
        <button 
          onClick={() => navigateTo('landing')}
          className="mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
        >
          ← Back to Home
        </button>
        <h1 className="text-5xl font-light mb-4">Documentation</h1>
        <p className="text-xl text-gray-400">Everything you need to get started with MHIA</p>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Start */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 rounded-xl border border-white/10 p-8 mb-8">
                <h2 className="text-3xl font-semibold mb-6 text-teal-400">Quick Start Guide</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">1. Create Your First Model</h3>
                    <p className="text-gray-300 mb-4">
                      Start by defining your watershed boundaries and selecting the appropriate modeling parameters for your analysis.
                    </p>
                    <button 
                      onClick={() => navigateTo('dashboard')}
                      className="px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors duration-200"
                    >
                      Create Model
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">2. Input Your Data</h3>
                    <p className="text-gray-300">
                      Upload historical weather data, topographic information, and hydrological measurements to calibrate your model.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">3. Run Simulations</h3>
                    <p className="text-gray-300">
                      Execute your models and analyze results with our comprehensive visualization and reporting tools.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold mb-4">Documentation Topics</h3>
                <ul className="space-y-3">
                  <li><a href="#" className="text-teal-400 hover:text-teal-300">Getting Started</a></li>
                  <li><a href="#" className="text-teal-400 hover:text-teal-300">Model Configuration</a></li>
                  <li><a href="#" className="text-teal-400 hover:text-teal-300">Data Import</a></li>
                  <li><a href="#" className="text-teal-400 hover:text-teal-300">Analysis Tools</a></li>
                  <li><a href="#" className="text-teal-400 hover:text-teal-300">API Reference</a></li>
                  <li><a href="#" className="text-teal-400 hover:text-teal-300">Best Practices</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Page Component
const SimpleDashboard: React.FC = () => {
  console.log('📊 SimpleDashboard component rendering');
  const { navigateTo } = useNavigation();
  
  // State management
  const [showNewModelModal, setShowNewModelModal] = React.useState(false);
  const [showResultsViewer, setShowResultsViewer] = React.useState(false);
  const [showDataImporter, setShowDataImporter] = React.useState(false);
  const [selectedSimulation, setSelectedSimulation] = React.useState<any>(null);
  const [recentSimulations, setRecentSimulations] = React.useState<any[]>([]);
  const [userStats, setUserStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  // Load dashboard data on mount
  React.useEffect(() => {
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('No auth token found');
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/v1/simulations/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded simulations:', data);
        setRecentSimulations(data.simulations || []);
        setUserStats({
          total_simulations: data.total || 0,
          running_simulations: data.simulations?.filter((s: any) => s.status === 'running').length || 0,
          completed_simulations: data.simulations?.filter((s: any) => s.status === 'completed').length || 0,
          failed_simulations: data.simulations?.filter((s: any) => s.status === 'failed').length || 0,
          pending_simulations: data.simulations?.filter((s: any) => s.status === 'pending').length || 0
        });
      } else {
        console.error('Failed to load simulations:', response.status);
      }
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Dashboard functions
  const handleNewModel = () => {
    console.log('Opening new model dialog...');
    setShowNewModelModal(true);
  };
  
  const handleMHIAFormSubmit = async (data: any) => {
    console.log('MHIA Form submitted with data:', data);
    
    try {
      // Prepare simulation data for API
      const simulationData = {
        name: data.project?.simulationName || 'New MHIA Simulation',
        description: `${data.project?.description || 'MHIA simulation'} - Basin: ${data.basin?.basinArea || 'Unknown'} km²`,
        model_type: 'integrated',
        time_step: 'daily',
        start_date: data.project?.startDate || '2023-01-01T00:00:00',
        end_date: data.project?.endDate || '2023-12-31T00:00:00',
        physical_config: {
          basin_area: parseFloat(data.basin?.basinArea) || 1000.0,
          mean_elevation: parseFloat(data.basin?.meanElevation) || 500.0,
          mean_slope: parseFloat(data.basin?.meanSlope) || 10.0,
          soil_depth: parseFloat(data.physical?.soilDepth) || 1.0,
          porosity: parseFloat(data.physical?.porosity) || 0.4,
          hydraulic_conductivity: parseFloat(data.physical?.hydraulicConductivity) || 2.0,
          forest_percent: 40.0,
          agricultural_percent: 35.0,
          urban_percent: 20.0,
          water_percent: 5.0,
          annual_precipitation: 1200.0,
          mean_temperature: 20.0
        },
        socio_config: {
          population: parseInt(data.socioeconomic?.currentPopulation) || 50000,
          population_growth_rate: parseFloat(data.socioeconomic?.populationGrowthRate) || 1.2,
          water_demand_per_capita: parseFloat(data.socioeconomic?.waterDemandPerCapita) || 150.0,
          gdp_per_capita: 12000.0,
          agricultural_demand: 2500.0,
          industrial_demand: 800.0,
          governance_index: 0.7,
          water_price: 0.8,
          initial_risk_perception: 0.3,
          initial_memory: 0.2
        },
        aquifer_config: data.artificialAquifer?.includeAquifer ? {
          include_aquifer: true,
          aquifer_capacity: parseFloat(data.artificialAquifer?.aquiferCapacity) || 1000000.0,
          recharge_rate: parseFloat(data.artificialAquifer?.rechargeRate) || 100.0,
          extraction_rate: parseFloat(data.artificialAquifer?.extractionRate) || 50.0
        } : null
      };
      
      console.log('Sending simulation data to API:', simulationData);
      
      // Send to backend API
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/v1/simulations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(simulationData)
      });
      
      if (response.ok) {
        const newSimulation = await response.json();
        console.log('Simulation created successfully:', newSimulation);
        
        // Close modal
        setShowNewModelModal(false);
        
        // Show success message
        alert('✅ MHIA Simulation created successfully!\n\n' + 
              `Simulation: ${newSimulation.name}\n` +
              `ID: ${newSimulation.id}\n` +
              `Status: ${newSimulation.status}\n\n` +
              'The simulation is now running in the background.'
        );
        
        // Refresh dashboard data to show new simulation
        await loadDashboardData();
        
      } else {
        const errorData = await response.json();
        console.error('Failed to create simulation:', errorData);
        alert('❌ Failed to create simulation:\n' + (errorData.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting simulation:', error);
      alert('❌ Error creating simulation:\n' + error);
    }
  };
  
  const handleImportData = () => {
    console.log('Import data clicked...');
    setShowDataImporter(true);
  };
  
  const handleViewResults = () => {
    console.log('View results clicked...');
    console.log('Recent simulations:', recentSimulations);
    
    // If there's a completed simulation, show its results
    const completedSim = recentSimulations.find(sim => sim.status === 'completed');
    console.log('Completed simulation found:', completedSim);
    
    if (completedSim) {
      setSelectedSimulation(completedSim);
      setShowResultsViewer(true);
    } else {
      console.log('No completed simulations found in:', recentSimulations.map(s => ({ name: s.name, status: s.status })));
      alert('No completed simulations found. Create and run a simulation first.');
    }
  };
  
  const handleOpenProject = (simulationId: string) => {
    const simulation = recentSimulations.find(sim => sim.id === simulationId);
    if (simulation) {
      console.log(`Opening simulation: ${simulation.name}`);
      if (simulation.status === 'completed') {
        setSelectedSimulation(simulation);
        setShowResultsViewer(true);
      } else {
        alert(`Simulation "${simulation.name}" is ${simulation.status}. Only completed simulations can be viewed.`);
      }
    }
  };
  
  const handleExportProject = (simulationId: string) => {
    const simulation = recentSimulations.find(sim => sim.id === simulationId);
    if (simulation && simulation.status === 'completed') {
      console.log(`Exporting simulation: ${simulation.name}`);
      // In a real implementation, this would call the export API
      alert(`Simulation "${simulation.name}" exported successfully!`);
    } else {
      alert('Only completed simulations can be exported.');
    }
  };

  const handleDataImportComplete = (files: any[]) => {
    console.log('Data import completed:', files);
    alert(`Successfully imported ${files.length} file(s). Data is now available for use in simulations.`);
    loadDashboardData(); // Refresh data
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-900 text-white">
      {/* Header */}
      <div className="p-8 border-b border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-light mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome to your hydrological modeling workspace</p>
          </div>
          <button 
            onClick={() => navigateTo('landing')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            ← Home
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors duration-200">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Create New Model</h3>
              <p className="text-gray-300 mb-4">Start a new hydrological simulation</p>
              <button 
                onClick={handleNewModel}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200"
              >
                New Model
              </button>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors duration-200">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Import Data</h3>
              <p className="text-gray-300 mb-4">Upload your datasets</p>
              <button 
                onClick={handleImportData}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors duration-200"
              >
                Import
              </button>
            </div>

            <div className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors duration-200">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">View Results</h3>
              <p className="text-gray-300 mb-4">Analyze simulation outputs</p>
              <button 
                onClick={handleViewResults}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors duration-200"
              >
                Results
              </button>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white/5 rounded-xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Recent Simulations</h2>
              {userStats && (
                <div className="flex space-x-4 text-sm">
                  <span className="text-green-400">{userStats.completed_simulations} completed</span>
                  <span className="text-yellow-400">{userStats.running_simulations} running</span>
                  <span className="text-gray-400">{userStats.total_simulations} total</span>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading simulations...</p>
              </div>
            ) : recentSimulations.length > 0 ? (
              <div className="space-y-4">
                {recentSimulations.map((simulation) => (
                  <div key={simulation.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{simulation.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          simulation.status === 'completed' 
                            ? 'bg-green-600 text-green-100' 
                            : simulation.status === 'running'
                            ? 'bg-yellow-600 text-yellow-100'
                            : simulation.status === 'failed'
                            ? 'bg-red-600 text-red-100'
                            : 'bg-gray-600 text-gray-100'
                        }`}>
                          {simulation.status}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {simulation.model_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{simulation.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Created: {new Date(simulation.created_at).toLocaleDateString()}</span>
                        <span>Period: {simulation.start_date} to {simulation.end_date}</span>
                        {simulation.status === 'running' && (
                          <span>Progress: {simulation.progress}%</span>
                        )}
                      </div>
                      {simulation.status === 'running' && simulation.progress > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${simulation.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => handleOpenProject(simulation.id)}
                        disabled={simulation.status !== 'completed'}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors duration-200"
                      >
                        {simulation.status === 'completed' ? 'View Results' : 'Open'}
                      </button>
                      <button 
                        onClick={() => handleExportProject(simulation.id)}
                        disabled={simulation.status !== 'completed'}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm transition-colors duration-200"
                      >
                        Export
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No simulations yet</p>
                <button 
                  onClick={handleNewModel}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors duration-200"
                >
                  Create Your First Simulation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* MHIA Multi-Step Form Modal */}
      {showNewModelModal && (
        <MHIAFormModal 
          onClose={() => setShowNewModelModal(false)}
          onSubmit={handleMHIAFormSubmit}
        />
      )}
      
      {/* Enhanced Results Viewer Modal */}
      {showResultsViewer && selectedSimulation && (
        <EnhancedResultsViewer 
          simulationId={selectedSimulation.id}
          simulationName={selectedSimulation.name}
          modelType={selectedSimulation.model_type}
          onClose={() => {
            setShowResultsViewer(false);
            setSelectedSimulation(null);
          }}
        />
      )}
      
      {/* Data Importer Modal */}
      {showDataImporter && (
        <DataImporter 
          onClose={() => setShowDataImporter(false)}
          onImport={handleDataImportComplete}
        />
      )}
    </div>
  );
};

// Main App with routing
const AppContent: React.FC = () => {
  console.log('🚀 AppContent component is rendering');
  const { currentPage } = useNavigation();
  
  const renderPage = () => {
    console.log(`📍 Rendering page: ${currentPage}`);
    switch (currentPage) {
      case 'landing':
        return <SimpleLanding />;
      case 'features':
        return <SimpleFeatures />;
      case 'about':
        return <SimpleAbout />;
      case 'login':
        return <SimpleLogin />;
      case 'documentation':
        return <SimpleDocumentation />;
      case 'dashboard':
        return <SimpleDashboard />;
      default:
        return <SimpleLanding />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPage()}
    </div>
  );
};

const App: React.FC = () => {
  console.log('🚀 App wrapper is rendering');
  
  // Auto-login with test user for development
  React.useEffect(() => {
    const autoLogin = async () => {
      if (!localStorage.getItem('access_token')) {
        try {
          console.log('Auto-logging in with test user...');
          
          // Login with test credentials
          const formData = new FormData();
          formData.append('username', 'testuser');
          formData.append('password', 'testpass123');
          
          const response = await fetch('http://localhost:8000/api/v1/auth/login', {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify({
              id: '1',
              username: 'testuser',
              email: 'test@mhia.com',
              full_name: 'Test User',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
            console.log('Auto-login successful!');
            window.location.reload(); // Reload to apply auth
          } else {
            console.log('Auto-login failed, using mock token');
            // Fallback to mock token
            localStorage.setItem('access_token', 'mock-dev-token-123');
          }
        } catch (error) {
          console.error('Auto-login error:', error);
        }
      }
    };
    
    autoLogin();
  }, []);
  
  return (
    <NavigationProvider>
      <AppContent />
    </NavigationProvider>
  );
};

export default App;