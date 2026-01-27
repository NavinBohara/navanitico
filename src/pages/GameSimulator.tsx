import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { 
  CurrencyDollarIcon, 
  HeartIcon, 
  TrophyIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface GameScenario {
  id: string;
  title: string;
  description: string;
  options: GameOption[];
  correctChoice: number;
  explanation: string;
  level: number;
}

interface GameOption {
  text: string;
  impact: {
    money: number;
    score: number;
    consequence: string;
  };
}

const GameSimulator = () => {
  const { user, updateGameProgress } = useUser();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [balance, setBalance] = useState(100);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'playing' | 'paused' | 'gameOver' | 'levelComplete'>('playing');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const scenarios: GameScenario[] = [
    {
      id: 'level1-1',
      title: 'Monthly Grocery Shopping',
      description: 'You have ₹100 for the month. You need to buy groceries, but there\'s also a sale on your favorite snacks.',
      options: [
        {
          text: 'Buy essential groceries (₹60)',
          impact: { money: -60, score: 20, consequence: 'Good choice! You prioritized needs over wants.' }
        },
        {
          text: 'Buy snacks on sale (₹40)',
          impact: { money: -40, score: 5, consequence: 'You might get hungry later. Snacks are wants, not needs.' }
        },
        {
          text: 'Buy both groceries and snacks (₹90)',
          impact: { money: -90, score: 10, consequence: 'You spent most of your money. Be careful with your budget!' }
        },
        {
          text: 'Don\'t buy anything today',
          impact: { money: 0, score: 0, consequence: 'You avoided spending, but you still need groceries.' }
        }
      ],
      correctChoice: 0,
      explanation: 'Essential groceries are a need, while snacks are a want. Always prioritize needs first!',
      level: 1
    },
    {
      id: 'level1-2',
      title: 'Emergency Fund Decision',
      description: 'You have ₹40 left. Your friend invites you to a movie (₹20), but you also want to save for emergencies.',
      options: [
        {
          text: 'Go to the movie',
          impact: { money: -20, score: 5, consequence: 'You enjoyed the movie, but what about emergencies?' }
        },
        {
          text: 'Save all ₹40',
          impact: { money: 0, score: 25, consequence: 'Excellent! You\'re building an emergency fund.' }
        },
        {
          text: 'Save ₹20, go to movie',
          impact: { money: -20, score: 15, consequence: 'Balanced approach! You saved some and enjoyed some.' }
        },
        {
          text: 'Lend money to friend',
          impact: { money: -20, score: 0, consequence: 'Be careful lending money when you need it yourself.' }
        }
      ],
      correctChoice: 1,
      explanation: 'Building an emergency fund is crucial. Even small amounts add up over time!',
      level: 1
    },
    {
      id: 'level2-1',
      title: 'Insurance vs Investment',
      description: 'You have ₹100. You can buy health insurance (₹50) or invest in a scheme promising 50% returns.',
      options: [
        {
          text: 'Buy health insurance',
          impact: { money: -50, score: 30, consequence: 'Smart choice! Insurance protects you from financial disasters.' }
        },
        {
          text: 'Invest in high-return scheme',
          impact: { money: -100, score: -20, consequence: 'Danger! High returns usually mean high risk or scams.' }
        },
        {
          text: 'Do both partially',
          impact: { money: -75, score: 10, consequence: 'You tried to balance, but the investment might be risky.' }
        },
        {
          text: 'Save all money',
          impact: { money: 0, score: 5, consequence: 'You saved money but missed important insurance protection.' }
        }
      ],
      correctChoice: 0,
      explanation: 'Insurance is protection, not investment. Always secure yourself first!',
      level: 2
    },
    {
      id: 'level2-2',
      title: 'Loan Temptation',
      description: 'You want to buy a smartphone worth ₹150. You have ₹50. A friend offers an easy loan at 10% per month.',
      options: [
        {
          text: 'Take the loan and buy phone',
          impact: { money: -110, score: -25, consequence: 'Bad choice! 10% monthly = 120% annual interest!' }
        },
        {
          text: 'Wait and save more',
          impact: { money: 0, score: 25, consequence: 'Excellent patience! Avoid high-interest loans.' }
        },
        {
          text: 'Buy a cheaper phone (₹50)',
          impact: { money: -50, score: 15, consequence: 'Good compromise! You got what you needed within budget.' }
        },
        {
          text: 'Borrow from family (no interest)',
          impact: { money: -100, score: 5, consequence: 'Better than high-interest loans, but still creates debt.' }
        }
      ],
      correctChoice: 1,
      explanation: 'High-interest loans can trap you in debt. Patience and saving are better strategies!',
      level: 2
    },
    {
      id: 'level3-1',
      title: 'Investment Scam Alert',
      description: 'You receive a call about a "guaranteed" investment doubling your money in 30 days. You have ₹200.',
      options: [
        {
          text: 'Invest ₹200 immediately',
          impact: { money: -200, score: -50, consequence: 'SCAM! You lost everything. No investment guarantees such returns.' }
        },
        {
          text: 'Invest ₹100 to test',
          impact: { money: -100, score: -25, consequence: 'Still a scam! Never invest in "guaranteed" high returns.' }
        },
        {
          text: 'Research and decline',
          impact: { money: 0, score: 40, consequence: 'Perfect! You avoided a scam by being cautious.' }
        },
        {
          text: 'Ask for written guarantee',
          impact: { money: 0, score: 20, consequence: 'Good thinking! Scammers avoid written commitments.' }
        }
      ],
      correctChoice: 2,
      explanation: 'Remember: If it sounds too good to be true, it probably is! Always research before investing.',
      level: 3
    }
  ];

  const currentScenarioData = scenarios[currentScenario];

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    if (gameState === 'playing') {
      setIsTimerActive(true);
      setTimeLeft(30);
    } else {
      setIsTimerActive(false);
    }
  }, [gameState, currentScenario]);

  const handleTimeUp = () => {
    setLives(prev => Math.max(0, prev - 1));
    setShowFeedback(true);
    setSelectedOption(null);
    if (lives <= 1) {
      setGameState('gameOver');
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null || gameState !== 'playing') return;

    setSelectedOption(optionIndex);
    setIsTimerActive(false);
    
    const option = currentScenarioData.options[optionIndex];
    setBalance(prev => Math.max(0, prev + option.impact.money));
    setScore(prev => prev + option.impact.score);
    
    // Save progress after each choice
    if (user) {
      const newBalance = Math.max(0, balance + option.impact.money);
      const newScore = score + option.impact.score;
      updateGameProgress(currentLevel, newScore, newBalance).catch(console.error);
    }

    // Check for achievements
    if (option.impact.score >= 25) {
      setAchievements(prev => [...prev, 'Perfect Decision!']);
    }
    if (balance + option.impact.money <= 0) {
      setLives(prev => Math.max(0, prev - 1));
    }

    setShowFeedback(true);

    if (balance + option.impact.money <= 0 || lives <= 1) {
      setTimeout(() => setGameState('gameOver'), 2000);
    }
  };

  const handleNextScenario = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    
    if (currentScenario < scenarios.length - 1) {
      setCurrentScenario(prev => prev + 1);
      setTimeLeft(30);
    } else {
      setGameState('levelComplete');
      if (user) {
        updateGameProgress(currentLevel + 1, score, balance).catch(console.error);
      }
    }
  };

  const resetGame = () => {
    setCurrentLevel(1);
    setCurrentScenario(0);
    setBalance(100);
    setScore(0);
    setLives(3);
    setGameState('playing');
    setSelectedOption(null);
    setShowFeedback(false);
    setAchievements([]);
    setTimeLeft(30);
  };

  const pauseGame = () => {
    setGameState('paused');
    setIsTimerActive(false);
  };

  const resumeGame = () => {
    setGameState('playing');
    setIsTimerActive(true);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            Financial Game Simulator
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Test your financial decision-making skills in real-world scenarios. 
            Make smart choices to grow your virtual wealth!
          </p>
        </motion.div>

        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
        >
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Balance</span>
              </div>
              <div className="text-2xl font-bold text-green-600">₹{balance}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrophyIcon className="w-6 h-6 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Score</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">{score}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <HeartIcon className="w-6 h-6 text-red-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Lives</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{lives}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <PlayIcon className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Level</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{currentLevel}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Time</span>
              </div>
              <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600' : 'text-orange-600'}`}>
                {timeLeft}s
              </div>
            </div>
          </div>
        </motion.div>

        {/* Game Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center space-x-4 mb-8"
        >
          {gameState === 'playing' && (
            <button
              onClick={pauseGame}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <PauseIcon className="w-5 h-5" />
              <span>Pause</span>
            </button>
          )}
          {gameState === 'paused' && (
            <button
              onClick={resumeGame}
              className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              <span>Resume</span>
            </button>
          )}
          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5" />
            <span>Restart</span>
          </button>
        </motion.div>

        {/* Game Content */}
        {gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Scenario {currentScenario + 1}: {currentScenarioData.title}
                </h2>
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                  timeLeft <= 10 ? 'border-red-500 text-red-500' : 'border-orange-500 text-orange-500'
                }`}>
                  <span className="text-xl font-bold">{timeLeft}</span>
                </div>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {currentScenarioData.description}
              </p>
            </div>

            <div className="grid gap-4">
              {currentScenarioData.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  disabled={selectedOption !== null}
                  className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedOption === index
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${selectedOption !== null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-800 dark:text-white">
                      {option.text}
                    </span>
                    <div className="flex items-center space-x-2">
                      {option.impact.money > 0 && (
                        <span className="flex items-center text-green-600">
                          <ArrowUpIcon className="w-4 h-4 mr-1" />
                          ₹{option.impact.money}
                        </span>
                      )}
                      {option.impact.money < 0 && (
                        <span className="flex items-center text-red-600">
                          <ArrowDownIcon className="w-4 h-4 mr-1" />
                          ₹{Math.abs(option.impact.money)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Feedback */}
            {showFeedback && selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-coral-50 dark:from-teal-900/30 dark:to-coral-900/30 rounded-xl border border-teal-200 dark:border-teal-700"
              >
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  {selectedOption === currentScenarioData.correctChoice ? 'Excellent Choice!' : 'Learning Opportunity!'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {currentScenarioData.options[selectedOption].impact.consequence}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Explanation:</strong> {currentScenarioData.explanation}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Money:</span>
                      <span className={`font-bold ${
                        currentScenarioData.options[selectedOption].impact.money >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {currentScenarioData.options[selectedOption].impact.money >= 0 ? '+' : ''}
                        ₹{currentScenarioData.options[selectedOption].impact.money}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Score:</span>
                      <span className={`font-bold ${
                        currentScenarioData.options[selectedOption].impact.score >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {currentScenarioData.options[selectedOption].impact.score >= 0 ? '+' : ''}
                        {currentScenarioData.options[selectedOption].impact.score}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleNextScenario}
                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-6">
              <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Game Over!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Don't worry! Financial literacy comes with practice.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Final Score</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold text-green-600">₹{balance}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Final Balance</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600">{score}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Play Again
              </button>
              <button
                onClick={() => window.location.href = '/learning'}
                className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        )}

        {/* Level Complete Screen */}
        {gameState === 'levelComplete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-6">
              <TrophyIcon className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Level Complete!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Congratulations! You've mastered this level.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-teal-50 to-coral-50 dark:from-teal-900/30 dark:to-coral-900/30 rounded-xl p-6 mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Level {currentLevel} Results</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-3xl font-bold text-green-600">₹{balance}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Final Balance</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600">{score}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">{lives}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lives Left</div>
                </div>
              </div>
            </div>

            {achievements.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Achievements</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {achievements.map((achievement, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-full text-sm font-medium"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setCurrentLevel(prev => prev + 1);
                  resetGame();
                }}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Next Level
              </button>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Achievements Panel */}
        {achievements.length > 0 && gameState === 'playing' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed top-20 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 max-w-xs"
          >
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Recent Achievements</h3>
            <div className="space-y-2">
              {achievements.slice(-3).map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-gradient-to-r from-teal-50 to-coral-50 dark:from-teal-900/30 dark:to-coral-900/30 rounded-lg"
                >
                  <TrophyIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-800 dark:text-white">{achievement}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default GameSimulator;