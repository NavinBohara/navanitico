import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  NewspaperIcon, 
  LightBulbIcon, 
  BookmarkIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  ChevronRightIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'news' | 'tip' | 'scheme' | 'market';
  level: 'beginner' | 'intermediate' | 'advanced';
  readTime: string;
  publishedAt: string;
  image: string;
  tags: string[];
  isBookmarked?: boolean;
}

const NewsAndTips = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'news' | 'tips' | 'schemes' | 'market'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);

  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'RBI Announces New Digital Rupee Pilot Program',
      summary: 'Reserve Bank of India launches digital currency pilot with select banks to test CBDC functionality.',
      content: 'The Reserve Bank of India has announced a comprehensive pilot program for the Digital Rupee (e-INR), marking a significant step towards a cashless economy...',
      category: 'news',
      level: 'intermediate',
      readTime: '5 min',
      publishedAt: '2024-01-15',
      image: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg',
      tags: ['RBI', 'Digital Currency', 'CBDC', 'Banking']
    },
    {
      id: '2',
      title: '5 Simple Ways to Start Investing with ₹500',
      summary: 'Beginner-friendly investment options that require minimal capital but can grow significantly over time.',
      content: 'Starting your investment journey doesn\'t require a large sum. Here are practical ways to begin with just ₹500...',
      category: 'tip',
      level: 'beginner',
      readTime: '3 min',
      publishedAt: '2024-01-14',
      image: 'https://images.pexels.com/photos/3483098/pexels-photo-3483098.jpeg',
      tags: ['Investment', 'SIP', 'Mutual Funds', 'Beginner']
    },
    {
      id: '3',
      title: 'New Tax-Saving Schemes for FY 2024-25',
      summary: 'Government introduces enhanced tax benefits for retirement planning and health insurance.',
      content: 'The latest budget has introduced several new tax-saving opportunities that can help you reduce your tax liability...',
      category: 'scheme',
      level: 'intermediate',
      readTime: '7 min',
      publishedAt: '2024-01-13',
      image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
      tags: ['Tax Saving', 'Government Schemes', 'Budget 2024']
    },
    {
      id: '4',
      title: 'Stock Market Hits All-Time High: What It Means for Investors',
      summary: 'Market analysis and expert opinions on the recent bull run and its implications for retail investors.',
      content: 'The Indian stock market has reached unprecedented levels, with both Sensex and Nifty hitting new records...',
      category: 'market',
      level: 'advanced',
      readTime: '6 min',
      publishedAt: '2024-01-12',
      image: 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg',
      tags: ['Stock Market', 'Sensex', 'Nifty', 'Bull Run']
    },
    {
      id: '5',
      title: 'Emergency Fund: How Much is Enough?',
      summary: 'Calculate the right emergency fund size based on your lifestyle and financial obligations.',
      content: 'An emergency fund is your financial safety net, but determining the right amount can be challenging...',
      category: 'tip',
      level: 'beginner',
      readTime: '4 min',
      publishedAt: '2024-01-11',
      image: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg',
      tags: ['Emergency Fund', 'Financial Planning', 'Savings']
    },
    {
      id: '6',
      title: 'Pradhan Mantri Vaya Vandana Yojana Extended',
      summary: 'Government extends the pension scheme for senior citizens with enhanced benefits and coverage.',
      content: 'The popular pension scheme for senior citizens has been extended with improved terms and conditions...',
      category: 'scheme',
      level: 'beginner',
      readTime: '5 min',
      publishedAt: '2024-01-10',
      image: 'https://images.pexels.com/photos/5650026/pexels-photo-5650026.jpeg',
      tags: ['Pension', 'Senior Citizens', 'Government Scheme']
    },
    {
      id: '7',
      title: 'Cryptocurrency Regulations: What Investors Need to Know',
      summary: 'Latest regulatory updates on cryptocurrency trading and taxation in India.',
      content: 'The regulatory landscape for cryptocurrencies in India continues to evolve...',
      category: 'news',
      level: 'advanced',
      readTime: '8 min',
      publishedAt: '2024-01-09',
      image: 'https://images.pexels.com/photos/8369648/pexels-photo-8369648.jpeg',
      tags: ['Cryptocurrency', 'Regulation', 'Taxation']
    },
    {
      id: '8',
      title: 'Smart Ways to Use Your Credit Card Rewards',
      summary: 'Maximize the value of your credit card points and cashback with these strategic tips.',
      content: 'Credit card rewards can provide significant value if used wisely. Here\'s how to make the most of them...',
      category: 'tip',
      level: 'intermediate',
      readTime: '4 min',
      publishedAt: '2024-01-08',
      image: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg',
      tags: ['Credit Cards', 'Rewards', 'Cashback']
    }
  ];

  const filteredItems = newsItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || 
      (selectedCategory === 'tips' && item.category === 'tip') ||
      (selectedCategory === 'schemes' && item.category === 'scheme') ||
      (selectedCategory === 'market' && item.category === 'market') ||
      (selectedCategory === 'news' && item.category === 'news');
    
    const levelMatch = selectedLevel === 'all' || item.level === selectedLevel;
    
    const searchMatch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && levelMatch && searchMatch;
  });

  const toggleBookmark = (itemId: string) => {
    setBookmarkedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'news': return NewspaperIcon;
      case 'tip': return LightBulbIcon;
      case 'scheme': return BookmarkIcon;
      case 'market': return ArrowTrendingUpIcon;
      default: return NewspaperIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news': return 'from-blue-500 to-blue-600';
      case 'tip': return 'from-yellow-500 to-yellow-600';
      case 'scheme': return 'from-green-500 to-green-600';
      case 'market': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Financial News & Tips
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stay updated with the latest financial news, expert tips, and government schemes. 
            Make informed decisions with curated content for every skill level.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news, tips, or schemes..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {[
                { id: 'all', label: 'All Content', icon: FunnelIcon },
                { id: 'news', label: 'Latest News', icon: NewspaperIcon },
                { id: 'tips', label: 'Expert Tips', icon: LightBulbIcon },
                { id: 'schemes', label: 'Gov Schemes', icon: BookmarkIcon },
                { id: 'market', label: 'Market Updates', icon: ArrowTrendingUpIcon }
              ].map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-teal-500 to-coral-500 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Level Filters */}
            <div className="flex justify-center gap-2">
              {[
                { id: 'all', label: 'All Levels' },
                { id: 'beginner', label: 'Beginner' },
                { id: 'intermediate', label: 'Intermediate' },
                { id: 'advanced', label: 'Advanced' }
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedLevel === level.id
                      ? 'bg-gradient-to-r from-teal-500 to-coral-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured Article */}
        {filteredItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-teal-500 to-coral-500 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(filteredItems[0].level)}`}>
                      {filteredItems[0].level.charAt(0).toUpperCase() + filteredItems[0].level.slice(1)}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{filteredItems[0].title}</h2>
                  <p className="text-lg text-white/90 mb-6">{filteredItems[0].summary}</p>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">{filteredItems[0].readTime}</span>
                    </div>
                    <span className="text-sm">{new Date(filteredItems[0].publishedAt).toLocaleDateString()}</span>
                  </div>
                  <button className="flex items-center space-x-2 px-6 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    <span>Read Full Article</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <img
                    src={filteredItems[0].image}
                    alt={filteredItems[0].title}
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => toggleBookmark(filteredItems[0].id)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                    >
                      {bookmarkedItems.includes(filteredItems[0].id) ? (
                        <BookmarkSolidIcon className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.slice(1).map((item, index) => {
            const CategoryIcon = getCategoryIcon(item.category);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group"
              >
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(item.category)} rounded-lg flex items-center justify-center`}>
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => toggleBookmark(item.id)}
                      className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      {bookmarkedItems.includes(item.id) ? (
                        <BookmarkSolidIcon className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <BookmarkIcon className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                      {item.level.charAt(0).toUpperCase() + item.level.slice(1)}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm">{item.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        <ShareIcon className="w-4 h-4" />
                      </button>
                      <button className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                        <span className="text-sm font-medium">Read More</span>
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-12"
          >
            <NewspaperIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              No Articles Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search query to find relevant content.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedLevel('all');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-teal-500 to-coral-500 rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Get the latest financial news, tips, and government scheme updates delivered to your inbox weekly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-6 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-sm text-white/80 mt-4">
            No spam, unsubscribe anytime. Your privacy is important to us.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsAndTips;