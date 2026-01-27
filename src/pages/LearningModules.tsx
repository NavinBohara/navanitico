import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { 
  BookOpenIcon, 
  ClockIcon, 
  CheckCircleIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const LearningModules = () => {
  const { user } = useUser();
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'basics' | 'investing' | 'planning' | 'safety'>('all');

  const topics = [
    {
      id: 'what-is-money',
      title: 'What is Money?',
      level: 'beginner',
      category: 'basics',
      duration: '15 min',
      description: 'Understanding the fundamental concept of money, its history, and modern forms',
      icon: CurrencyDollarIcon,
      color: 'from-green-500 to-green-600',
      isCompleted: user?.completedModules.includes('what-is-money') || false,
      rating: 4.8
    },
    {
      id: 'budgeting-basics',
      title: 'Budgeting Basics',
      level: 'beginner',
      category: 'basics',
      duration: '20 min',
      description: 'Learn how to create and maintain a personal budget effectively',
      icon: ChartBarIcon,
      color: 'from-blue-500 to-blue-600',
      isCompleted: user?.completedModules.includes('budgeting-basics') || false,
      rating: 4.9
    },
    {
      id: 'savings-habits',
      title: 'Building Savings Habits',
      level: 'beginner',
      category: 'basics',
      duration: '18 min',
      description: 'Develop sustainable saving strategies for long-term financial health',
      icon: BanknotesIcon,
      color: 'from-teal-500 to-teal-600',
      isCompleted: user?.completedModules.includes('savings-habits') || false,
      rating: 4.7
    },
    {
      id: 'banking-essentials',
      title: 'Banking Essentials',
      level: 'beginner',
      category: 'basics',
      duration: '25 min',
      description: 'Navigate the banking system with confidence and security',
      icon: BookOpenIcon,
      color: 'from-purple-500 to-purple-600',
      isCompleted: user?.completedModules.includes('banking-essentials') || false,
      rating: 4.6
    },
    {
      id: 'digital-safety',
      title: 'Digital Financial Safety',
      level: 'intermediate',
      category: 'safety',
      duration: '22 min',
      description: 'Protect yourself from online financial fraud and scams',
      icon: ShieldCheckIcon,
      color: 'from-red-500 to-red-600',
      isCompleted: user?.completedModules.includes('digital-safety') || false,
      rating: 4.8
    },
    {
      id: 'credit-loans',
      title: 'Credit & Loans',
      level: 'intermediate',
      category: 'planning',
      duration: '30 min',
      description: 'Understanding credit scores, loans, and responsible borrowing',
      icon: UserIcon,
      color: 'from-yellow-500 to-yellow-600',
      isCompleted: user?.completedModules.includes('credit-loans') || false,
      rating: 4.5
    },
    {
      id: 'investments',
      title: 'Investment Fundamentals',
      level: 'intermediate',
      category: 'investing',
      duration: '35 min',
      description: 'Introduction to stocks, bonds, mutual funds, and investment strategies',
      icon: ArrowTrendingUpIcon,
      color: 'from-indigo-500 to-indigo-600',
      isCompleted: user?.completedModules.includes('investments') || false,
      rating: 4.7
    },
    {
      id: 'insurance',
      title: 'Insurance Planning',
      level: 'intermediate',
      category: 'planning',
      duration: '28 min',
      description: 'Types of insurance and how to choose the right coverage',
      icon: ShieldCheckIcon,
      color: 'from-pink-500 to-pink-600',
      isCompleted: user?.completedModules.includes('insurance') || false,
      rating: 4.4
    },
    {
      id: 'government-schemes',
      title: 'Government Schemes',
      level: 'advanced',
      category: 'planning',
      duration: '32 min',
      description: 'Explore various government financial schemes and benefits',
      icon: BookOpenIcon,
      color: 'from-cyan-500 to-cyan-600',
      isCompleted: user?.completedModules.includes('government-schemes') || false,
      rating: 4.6
    },
    {
      id: 'financial-planning',
      title: 'Advanced Financial Planning',
      level: 'advanced',
      category: 'planning',
      duration: '40 min',
      description: 'Comprehensive strategies for retirement and wealth building',
      icon: ChartBarIcon,
      color: 'from-orange-500 to-orange-600',
      isCompleted: user?.completedModules.includes('financial-planning') || false,
      rating: 4.9
    }
  ];

  const filteredTopics = topics.filter(topic => {
    const levelMatch = selectedLevel === 'all' || topic.level === selectedLevel;
    const categoryMatch = selectedCategory === 'all' || topic.category === selectedCategory;
    return levelMatch && categoryMatch;
  });

  const levelColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Learning Modules
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Master financial concepts through our structured learning paths. 
            Each module is designed to build upon previous knowledge.
          </p>
        </motion.div>

        {/* Progress Overview */}
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Progress</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelColors[user.level]}`}>
                  {user.level.charAt(0).toUpperCase() + user.level.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-coral-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(user.completedModules.length / topics.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.completedModules.length}/{topics.length} completed
              </span>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="basics">Basics</option>
                <option value="investing">Investing</option>
                <option value="planning">Planning</option>
                <option value="safety">Safety</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Link to={`/learning/${topic.id}`}>
                  <div className={`h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 ${
                    topic.isCompleted ? 'ring-2 ring-green-500' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${topic.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {topic.isCompleted && (
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {topic.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {topic.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelColors[topic.level]}`}>
                        {topic.level.charAt(0).toUpperCase() + topic.level.slice(1)}
                      </span>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-500">{topic.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{topic.rating}</span>
                      </div>
                      <span className="text-sm font-medium text-teal-600 dark:text-teal-400 group-hover:text-coral-600 dark:group-hover:text-coral-400 transition-colors">
                        {topic.isCompleted ? 'Review' : 'Start Learning'} →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Learning Path Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-teal-500 to-coral-500 rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Recommended Learning Path</h2>
          <p className="text-lg mb-6 text-white/90">
            Not sure where to start? Follow our curated learning path designed for your level.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-bold mb-2">Beginner Track</h3>
              <p className="text-sm text-white/80">Start with basics → Build saving habits → Understand banking</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-bold mb-2">Intermediate Track</h3>
              <p className="text-sm text-white/80">Digital safety → Credit & loans → Investment basics</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-bold mb-2">Advanced Track</h3>
              <p className="text-sm text-white/80">Investment strategies → Government schemes → Financial planning</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LearningModules;