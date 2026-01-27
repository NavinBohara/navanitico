import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LearningModules from './pages/LearningModules';
import GameSimulator from './pages/GameSimulator';
import BudgetPlanner from './pages/BudgetPlanner';
import CalculatorSuite from './pages/CalculatorSuite';
import ScamAwareness from './pages/ScamAwareness';
import NewsAndTips from './pages/NewsAndTips';
import Profile from './pages/Profile';
import ArticlePage from './pages/ArticlePage';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-teal-50 to-coral-50 dark:from-gray-900 dark:to-gray-800 transition-all duration-300">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/learning" element={<LearningModules />} />
                <Route path="/learning/:topic" element={<ArticlePage />} />
                <Route path="/game" element={<GameSimulator />} />
                <Route path="/budget" element={<BudgetPlanner />} />
                <Route path="/calculators" element={<CalculatorSuite />} />
                <Route path="/scam-awareness" element={<ScamAwareness />} />
                <Route path="/news" element={<NewsAndTips />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <ChatBot />
          </div>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;