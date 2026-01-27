import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpenIcon, 
  PuzzlePieceIcon, 
  CurrencyDollarIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  NewspaperIcon,
  ChartBarIcon,
  UserIcon,
  StarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const features = [
    {
      title: 'Start Learning',
      description: 'Master financial basics with interactive modules',
      icon: BookOpenIcon,
      href: '/learning',
      color: 'from-teal-500 to-teal-600',
      delay: 0.1
    },
    {
      title: 'Play & Learn',
      description: 'Gamified financial simulator with real scenarios',
      icon: PuzzlePieceIcon,
      href: '/game',
      color: 'from-coral-500 to-coral-600',
      delay: 0.2
    },
    {
      title: 'Budget Planner',
      description: 'Smart budget planning with AI recommendations',
      icon: CurrencyDollarIcon,
      href: '/budget',
      color: 'from-purple-500 to-purple-600',
      delay: 0.3
    },
    {
      title: 'Calculators',
      description: 'Complete suite of financial calculators',
      icon: CalculatorIcon,
      href: '/calculators',
      color: 'from-blue-500 to-blue-600',
      delay: 0.4
    },
    {
      title: 'Scam Awareness',
      description: 'Stay protected from financial frauds',
      icon: ShieldCheckIcon,
      href: '/scam-awareness',
      color: 'from-red-500 to-red-600',
      delay: 0.5
    },
    {
      title: 'News & Tips',
      description: 'Latest financial news and expert tips',
      icon: NewspaperIcon,
      href: '/news',
      color: 'from-green-500 to-green-600',
      delay: 0.6
    }
  ];

  const stats = [
    { label: 'Active Learners', value: '10K+', icon: UserIcon },
    { label: 'Completion Rate', value: '85%', icon: ChartBarIcon },
    { label: 'Average Rating', value: '4.8', icon: StarIcon },
    { label: 'Success Stories', value: '500+', icon: ArrowTrendingUpIcon }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-coral-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-teal-600 via-coral-600 to-purple-600 bg-clip-text text-transparent">
                Master Your Money Journey
              </span>
              <br />
              <span className="text-gray-800 dark:text-gray-200">
                with NavaNiti
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Your comprehensive financial education platform designed for all skill levels.
              Learn, play, and grow your financial knowledge with interactive tools and gamified experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/learning"
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-full font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Start Learning Today
              </Link>
              <Link
                to="/game"
                className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-teal-500 rounded-full font-semibold text-lg hover:bg-teal-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Try the Game
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-teal-200 dark:bg-teal-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-coral-200 dark:bg-coral-800 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Everything You Need to Master Finance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive tools and resources designed to make financial education accessible and engaging
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: feature.delay }}
                  whileHover={{ scale: 1.05 }}
                  className="group"
                >
                  <Link to={feature.href}>
                    <div className="h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-200 dark:border-gray-700">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-500 to-coral-500">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Trusted by Thousands of Learners
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join our growing community of financially empowered individuals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
                >
                  <Icon className="w-12 h-12 text-white mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/90 text-lg">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gray-900 dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start your journey today with our comprehensive financial education platform. 
              It's free, interactive, and designed for your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/learning"
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-full font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Begin Your Learning Journey
              </Link>
              <Link
                to="/profile"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-200"
              >
                Create Your Profile
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;