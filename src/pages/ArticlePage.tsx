import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { 
  BookmarkIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ArrowLeftIcon,
  StarIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const ArticlePage = () => {
  const { topic } = useParams<{ topic: string }>();
  const { user, updateProgress, saveArticle } = useUser();
  const [isReading, setIsReading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isReading) {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isReading]);

  const articleData = {
    'what-is-money': {
      title: 'What is Money?',
      subtitle: 'Understanding the fundamental concept of money and its role in our lives',
      estimatedTime: '15 min',
      difficulty: 'Beginner',
      content: [
        {
          title: 'Introduction to Money',
          content: `Money is a medium of exchange that facilitates trade and commerce. It's something we use every day, but have you ever wondered what makes something "money"? In this module, we'll explore the fascinating world of money, from its ancient origins to modern digital currencies.

Money serves three primary functions:
1. **Medium of Exchange**: It allows us to trade goods and services efficiently
2. **Unit of Account**: It provides a common measure of value
3. **Store of Value**: It preserves purchasing power over time

Understanding these functions is crucial for making informed financial decisions in your daily life.`
        },
        {
          title: 'History of Money',
          content: `The concept of money has evolved dramatically over thousands of years:

**Barter System (Before 3000 BCE)**
- People traded goods directly (e.g., wheat for cattle)
- Problems: Double coincidence of wants, no standard value

**Commodity Money (3000 BCE - 1000 CE)**
- Used valuable items like gold, silver, shells
- Advantages: Intrinsic value, durability
- Disadvantages: Heavy, difficult to divide

**Paper Money (1000 CE - Present)**
- Started in China, spread globally
- Backed by gold standard initially
- Modern fiat money has no intrinsic value

**Digital Money (1990s - Present)**
- Credit cards, online banking
- Cryptocurrencies like Bitcoin
- Mobile payments and digital wallets`
        },
        {
          title: 'Types of Money Today',
          content: `In today's world, we use various forms of money:

**Physical Money**
- Coins and banknotes
- Still important for small transactions
- Decreasing in usage globally

**Digital Money**
- Bank deposits and electronic transfers
- Credit and debit cards
- Mobile payment apps (PayTM, GooglePay, PhonePe)

**Cryptocurrency**
- Digital currencies like Bitcoin, Ethereum
- Decentralized and encrypted
- Gaining popularity but still volatile

**Central Bank Digital Currencies (CBDCs)**
- Digital versions of national currencies
- Being developed by many countries
- Combines benefits of digital and traditional money`
        },
        {
          title: 'Money in the Indian Context',
          content: `India has a rich monetary history and is rapidly embracing digital payments:

**Indian Rupee (INR)**
- Our national currency since 1957
- Managed by the Reserve Bank of India (RBI)
- Available in coins (₹1, ₹2, ₹5, ₹10) and notes (₹10, ₹20, ₹50, ₹100, ₹200, ₹500, ₹2000)

**Digital India Initiative**
- Promoting cashless transactions
- UPI (Unified Payments Interface) revolution
- Jan Dhan Yojana for financial inclusion

**Demonetization (2016)**
- Withdrawal of ₹500 and ₹1000 notes
- Accelerated digital payment adoption
- Aimed to reduce black money

**Future of Money in India**
- Digital Rupee (e-INR) being tested
- Increasing smartphone penetration
- Growing fintech ecosystem`
        }
      ],
      quiz: [
        {
          question: 'What are the three primary functions of money?',
          options: [
            'Buy, sell, save',
            'Medium of exchange, unit of account, store of value',
            'Physical, digital, virtual',
            'Coins, notes, cards'
          ],
          correct: 1
        },
        {
          question: 'Which payment system revolutionized digital payments in India?',
          options: [
            'Credit cards',
            'Debit cards',
            'UPI (Unified Payments Interface)',
            'Cash'
          ],
          correct: 2
        },
        {
          question: 'What is the main advantage of digital money over physical money?',
          options: [
            'It has intrinsic value',
            'It cannot be lost',
            'It is convenient and faster for transactions',
            'It is issued by the government'
          ],
          correct: 2
        }
      ]
    },
    'budgeting-basics': {
      title: 'Budgeting Basics',
      subtitle: 'Learn how to create and maintain a personal budget effectively',
      estimatedTime: '20 min',
      difficulty: 'Beginner',
      content: [
        {
          title: 'What is a Budget?',
          content: `A budget is a financial plan that helps you track your income and expenses over a specific period. Think of it as a roadmap for your money – it shows you where your money comes from and where it goes.

**Why is budgeting important?**
- Helps you live within your means
- Enables you to save for future goals
- Reduces financial stress and anxiety
- Helps identify wasteful spending
- Provides financial discipline and control

**Common budgeting myths:**
- "I don't earn enough to budget" - FALSE! Everyone can benefit from budgeting
- "Budgeting is too restrictive" - FALSE! It actually gives you more freedom
- "I'm good with money, I don't need a budget" - FALSE! Even financially savvy people benefit

A budget is not about restricting your lifestyle – it's about making conscious choices with your money.`
        },
        {
          title: 'The 50/30/20 Rule',
          content: `The 50/30/20 rule is a simple budgeting framework that divides your after-tax income into three categories:

**50% for Needs (Essential expenses)**
- Rent or mortgage payments
- Utilities (electricity, water, gas)
- Groceries and essential food
- Transportation (fuel, public transport)
- Insurance premiums
- Minimum debt payments

**30% for Wants (Discretionary expenses)**
- Dining out and entertainment
- Hobbies and recreation
- Shopping for non-essentials
- Subscriptions (Netflix, Spotify)
- Vacations and travel
- Gym memberships

**20% for Savings and Debt Repayment**
- Emergency fund
- Retirement savings
- Goal-based savings
- Extra debt payments
- Investments

**Example for ₹50,000 monthly income:**
- Needs: ₹25,000
- Wants: ₹15,000
- Savings: ₹10,000`
        },
        {
          title: 'Creating Your First Budget',
          content: `Follow these steps to create your personal budget:

**Step 1: Calculate Your Income**
- Salary (after taxes)
- Freelance income
- Investment returns
- Any other regular income

**Step 2: List Your Fixed Expenses**
- Rent/mortgage
- Insurance premiums
- Loan EMIs
- Utility bills
- Subscriptions

**Step 3: Track Variable Expenses**
- Food and groceries
- Transportation
- Entertainment
- Shopping
- Miscellaneous

**Step 4: Set Savings Goals**
- Emergency fund (3-6 months expenses)
- Short-term goals (vacation, gadgets)
- Long-term goals (house, retirement)

**Step 5: Review and Adjust**
- Compare actual vs. planned expenses
- Identify areas for improvement
- Adjust budget monthly

**Budgeting Tools:**
- Pen and paper
- Excel spreadsheets
- Mobile apps (Mint, YNAB, PocketGuard)
- Bank's budgeting tools`
        },
        {
          title: 'Common Budgeting Mistakes to Avoid',
          content: `Learn from these common budgeting mistakes:

**1. Being Too Restrictive**
- Don't eliminate all fun expenses
- Allow for occasional treats
- Build in flexibility for unexpected expenses

**2. Forgetting Irregular Expenses**
- Annual insurance premiums
- Vehicle maintenance
- Festival expenses
- Medical check-ups

**3. Not Tracking Small Expenses**
- Daily tea/coffee
- Small online purchases
- Impulse buys
- These add up over time!

**4. Ignoring Your Budget**
- Review it weekly
- Adjust as needed
- Don't abandon it after one bad month

**5. Not Having an Emergency Fund**
- Start with ₹1,000 emergency fund
- Build up to 3-6 months of expenses
- Keep it in a separate, easily accessible account

**6. Comparing with Others**
- Your budget should reflect YOUR priorities
- What works for others may not work for you
- Focus on your financial goals

**Tips for Success:**
- Start small and be realistic
- Use the envelope method for cash expenses
- Automate savings to pay yourself first
- Celebrate small wins and progress`
        }
      ],
      quiz: [
        {
          question: 'According to the 50/30/20 rule, what percentage should be allocated to savings?',
          options: ['50%', '30%', '20%', '10%'],
          correct: 2
        },
        {
          question: 'What is the recommended emergency fund size?',
          options: [
            '1 month of expenses',
            '3-6 months of expenses',
            '1 year of expenses',
            '2 weeks of expenses'
          ],
          correct: 1
        },
        {
          question: 'Which category includes rent and utilities?',
          options: ['Wants', 'Needs', 'Savings', 'Investments'],
          correct: 1
        }
      ]
    }
  };

  const article = articleData[topic as keyof typeof articleData];

  if (!article) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Article Not Found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            The article you're looking for doesn't exist.
          </p>
          <Link
            to="/learning"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Learning
          </Link>
        </div>
      </div>
    );
  }

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex.toString()
    }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    article.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correct.toString()) {
        correct++;
      }
    });
    return (correct / article.quiz.length) * 100;
  };

  const isCompleted = user?.completedModules.includes(topic || '') || false;
  const isSaved = user?.savedArticles.includes(topic || '') || false;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/learning"
            className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-coral-600 dark:hover:text-coral-400 transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Learning Modules
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                  {article.difficulty}
                </span>
                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4" />
                  <span className="text-sm">{article.estimatedTime}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => saveArticle(topic || '')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isSaved ? (
                    <BookmarkSolidIcon className="w-5 h-5 text-teal-600" />
                  ) : (
                    <BookmarkIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setIsReading(!isReading)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  {isReading ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              {article.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {article.subtitle}
            </p>

            {isReading && (
              <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-teal-800 dark:text-teal-200">
                  Reading time: {Math.floor(readingTime / 60)}:{(readingTime % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}

            {isCompleted && (
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 mb-6 flex items-center space-x-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 dark:text-green-200">
                  You've completed this module!
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Table of Contents
          </h2>
          <div className="space-y-2">
            {article.content.map((section, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  currentSection === index
                    ? 'bg-gradient-to-r from-teal-500 to-coral-500 text-white'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <span className="font-medium">{index + 1}. {section.title}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            {article.content[currentSection].title}
          </h2>
          <div className="prose prose-lg max-w-none dark:prose-invert">
            {article.content[currentSection].content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentSection + 1} of {article.content.length}
            </span>
            <button
              onClick={() => setCurrentSection(Math.min(article.content.length - 1, currentSection + 1))}
              disabled={currentSection === article.content.length - 1}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        </motion.div>

        {/* Quiz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Knowledge Check
          </h2>
          <div className="space-y-6">
            {article.quiz.map((question, qIndex) => (
              <div key={qIndex} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  {qIndex + 1}. {question.question}
                </h3>
                <div className="space-y-3">
                  {question.options.map((option, oIndex) => (
                    <button
                      key={oIndex}
                      onClick={() => handleQuizAnswer(qIndex, oIndex)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        quizAnswers[qIndex] === oIndex.toString()
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {quizAnswers[qIndex] !== undefined && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    quizAnswers[qIndex] === question.correct.toString()
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}>
                    {quizAnswers[qIndex] === question.correct.toString() ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span>Correct!</span>
                      </div>
                    ) : (
                      <div>
                        <p>Incorrect. The correct answer is: {question.options[question.correct]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {Object.keys(quizAnswers).length === article.quiz.length && (
            <div className="mt-8 p-6 bg-gradient-to-r from-teal-500 to-coral-500 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">Quiz Complete!</h3>
                  <p>Your score: {calculateQuizScore()}%</p>
                </div>
                <div className="flex items-center space-x-2">
                  <StarIcon className="w-6 h-6 text-yellow-300" />
                  <span className="text-2xl font-bold">{calculateQuizScore()}%</span>
                </div>
              </div>
              {!isCompleted && (
                <button
                  onClick={() => updateProgress(topic || '')}
                  className="mt-4 px-6 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Mark as Complete
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ArticlePage;