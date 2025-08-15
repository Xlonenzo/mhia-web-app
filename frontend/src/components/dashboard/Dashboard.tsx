import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Menu,
  X,
  Home,
  BarChart3,
  Database,
  Settings,
  User,
  ChevronDown,
  Plus,
  TrendingUp,
  Activity,
  Droplets,
  Zap,
  Users,
  Globe,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showNewSimulationModal, setShowNewSimulationModal] = useState(false);

  // Sample data for charts
  const simulationData = [
    { name: 'Jan', simulations: 65, completed: 58 },
    { name: 'Feb', simulations: 78, completed: 72 },
    { name: 'Mar', simulations: 85, completed: 79 },
    { name: 'Apr', simulations: 92, completed: 88 },
    { name: 'May', simulations: 98, completed: 94 },
    { name: 'Jun', simulations: 112, completed: 108 }
  ];

  const waterFlowData = [
    { name: 'Week 1', flow: 420 },
    { name: 'Week 2', flow: 380 },
    { name: 'Week 3', flow: 450 },
    { name: 'Week 4', flow: 390 },
  ];

  const distributionData = [
    { name: 'Surface Water', value: 45, color: '#3B82F6' },
    { name: 'Groundwater', value: 30, color: '#10B981' },
    { name: 'Rainfall', value: 25, color: '#F59E0B' },
  ];

  const sidebarItems = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'simulations', name: 'Simulations', icon: BarChart3 },
    { id: 'data', name: 'Data Management', icon: Database },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const stats = [
    {
      title: 'Active Simulations',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: Activity,
      color: 'blue'
    },
    {
      title: 'Water Sources',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: Droplets,
      color: 'cyan'
    },
    {
      title: 'Processing Power',
      value: '89%',
      change: '-2%',
      changeType: 'negative',
      icon: Zap,
      color: 'yellow'
    },
    {
      title: 'Research Teams',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      color: 'green'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'simulation',
      title: 'Climate Model Analysis completed',
      description: 'Regional precipitation model for South America',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'data',
      title: 'New dataset uploaded',
      description: 'Satellite imagery for flood monitoring',
      time: '4 hours ago',
      status: 'processing'
    },
    {
      id: 3,
      type: 'alert',
      title: 'High computational load detected',
      description: 'Consider scaling resources for better performance',
      time: '6 hours ago',
      status: 'warning'
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:static lg:translate-x-0"
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-lg font-bold text-gradient-primary">MHIA</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="mt-6 px-3">
              {sidebarItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full flex items-center px-3 py-3 mb-1 text-left rounded-lg transition-colors ${
                    selectedTab === item.id
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search simulations..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <motion.button
                className="relative p-2 text-gray-400 hover:text-gray-600"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </motion.button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">Admin User</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {selectedTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="card hover-lift"
                    >
                      <div className="card-body">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            <p className={`text-sm mt-2 ${
                              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stat.change} from last month
                            </p>
                          </div>
                          <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Simulation Trends */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="card"
                  >
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900">Simulation Trends</h3>
                      <div className="flex space-x-2">
                        <button className="btn-ghost btn-sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </button>
                        <button className="btn-secondary btn-sm">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={simulationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="simulations" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="completed" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Water Distribution */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card"
                  >
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900">Water Source Distribution</h3>
                    </div>
                    <div className="card-body">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="mt-4 flex justify-center space-x-6">
                        {distributionData.map((item) => (
                          <div key={item.name} className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-600">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="card"
                >
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <button 
                      onClick={() => setShowNewSimulationModal(true)}
                      className="btn-primary btn-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Simulation
                    </button>
                  </div>
                  <div className="card-body">
                    <div className="space-y-4">
                      {recentActivities.map((activity) => (
                        <motion.div
                          key={activity.id}
                          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.status === 'completed' ? 'bg-green-100' :
                            activity.status === 'processing' ? 'bg-blue-100' : 'bg-yellow-100'
                          }`}>
                            {activity.type === 'simulation' && <BarChart3 className={`w-5 h-5 ${
                              activity.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                            }`} />}
                            {activity.type === 'data' && <Database className="w-5 h-5 text-blue-600" />}
                            {activity.type === 'alert' && <Activity className="w-5 h-5 text-yellow-600" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{activity.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {activity.time}
                            </p>
                          </div>
                          <span className={`badge ${
                            activity.status === 'completed' ? 'badge-success' :
                            activity.status === 'processing' ? 'badge-primary' : 'badge-warning'
                          }`}>
                            {activity.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Other tab contents would go here */}
            {selectedTab !== 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {sidebarItems.find(item => item.id === selectedTab)?.name}
                </h2>
                <p className="text-gray-600">This section is under development.</p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* New Simulation Modal */}
      <AnimatePresence>
        {showNewSimulationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNewSimulationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-light text-white mb-6">Create New Simulation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-light text-blue-200 mb-2">Simulation Name *</label>
                  <input
                    type="text"
                    placeholder="Enter simulation name"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-blue-200 mb-2">Simulation Type</label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-light focus:outline-none focus:border-blue-400 transition-colors">
                    <option value="flood">Flood Prediction</option>
                    <option value="drought">Drought Analysis</option>
                    <option value="quality">Water Quality</option>
                    <option value="flow">Flow Modeling</option>
                    <option value="climate">Climate Impact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-light text-blue-200 mb-2">Region</label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-light focus:outline-none focus:border-blue-400 transition-colors">
                    <option value="amazon">Amazon Basin</option>
                    <option value="nile">Nile Delta</option>
                    <option value="colorado">Colorado River</option>
                    <option value="yangtze">Yangtze River</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light text-blue-200 mb-2">Duration (min)</label>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      defaultValue="60"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light text-blue-200 mb-2">Quality</label>
                    <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-light focus:outline-none focus:border-blue-400 transition-colors">
                      <option value="low">Low (Fast)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Accurate)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowNewSimulationModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg font-light hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Simulation created successfully!');
                    setShowNewSimulationModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-light hover:shadow-lg transition-all duration-300"
                >
                  Create Simulation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;