import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon,
  BanknotesIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LightBulbIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface ScamType {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  examples: string[];
  prevention: string[];
  warningSigns: string[];
  color: string;
}

const ScamAwareness = () => {
  const [expandedScam, setExpandedScam] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'digital' | 'investment' | 'identity'>('all');

  const scamTypes: ScamType[] = [
    {
      id: 'phishing',
      title: 'Phishing SMS/Emails',
      icon: EnvelopeIcon,
      description: 'Fraudulent messages designed to steal your personal information, passwords, or banking details.',
      examples: [
        '"Your account will be blocked. Click here to verify: fake-bank-link.com"',
        '"Congratulations! You\'ve won ₹50,000. Share your bank details to claim"',
        '"KYC update required immediately. Click link to avoid account suspension"',
        '"Your card is blocked. Call 9999999999 to unblock immediately"'
      ],
      prevention: [
        'Never click on suspicious links in SMS or emails',
        'Always verify by calling your bank directly',
        'Check the sender\'s email address carefully',
        'Banks never ask for passwords or OTP via email/SMS'
      ],
      warningSigns: [
        'Urgent action required messages',
        'Suspicious links or phone numbers',
        'Poor grammar and spelling',
        'Requests for sensitive information'
      ],
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'fake-apps',
      title: 'Fake Investment Apps',
      icon: DevicePhoneMobileIcon,
      description: 'Fraudulent mobile applications that promise high returns but steal your money.',
      examples: [
        'Apps promising 50% returns in 30 days',
        'Fake trading platforms with manipulated profits',
        'Ponzi scheme apps disguised as investment platforms',
        'Apps asking for upfront fees for "guaranteed" profits'
      ],
      prevention: [
        'Download apps only from official app stores',
        'Check app reviews and ratings carefully',
        'Verify company registration and licenses',
        'Be skeptical of unrealistic return promises'
      ],
      warningSigns: [
        'Guaranteed high returns with no risk',
        'Pressure to invest quickly',
        'No proper company information',
        'Asking for upfront fees or deposits'
      ],
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'loan-scams',
      title: 'Loan Scams',
      icon: BanknotesIcon,
      description: 'Fraudsters offering instant loans but demanding advance fees or personal documents.',
      examples: [
        '"Get ₹5 lakh loan in 2 hours. Pay ₹5000 processing fee first"',
        'Fake loan approval letters demanding advance payment',
        'Requests for original documents before loan approval',
        'Loans without income verification or credit checks'
      ],
      prevention: [
        'Never pay advance fees for loan processing',
        'Verify lender\'s RBI registration',
        'Don\'t share original documents before approval',
        'Check interest rates and terms carefully'
      ],
      warningSigns: [
        'Advance fee demands',
        'Too-good-to-be-true interest rates',
        'No proper documentation',
        'Pressure to decide immediately'
      ],
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'upi-fraud',
      title: 'UPI Frauds',
      icon: CreditCardIcon,
      description: 'Scams involving UPI payments, fake QR codes, and unauthorized transactions.',
      examples: [
        'Fake QR codes at shops or online',
        'Requests to share UPI PIN for "verification"',
        'Fake payment confirmations to trick merchants',
        'Social engineering to make you send money instead of receiving'
      ],
      prevention: [
        'Never share your UPI PIN with anyone',
        'Double-check payment direction (pay vs receive)',
        'Verify QR codes before scanning',
        'Set transaction limits on your UPI apps'
      ],
      warningSigns: [
        'Requests for UPI PIN or OTP',
        'Suspicious QR codes',
        'Pressure to make immediate payments',
        'Unfamiliar transaction requests'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'otp-theft',
      title: 'OTP Theft',
      icon: PhoneIcon,
      description: 'Fraudsters tricking you into sharing One-Time Passwords to access your accounts.',
      examples: [
        '"I\'m from your bank. Share the OTP to verify your account"',
        'Fake customer service calls asking for OTP',
        'Social engineering to make you read OTP aloud',
        'Fake verification calls after online shopping'
      ],
      prevention: [
        'Never share OTP with anyone, ever',
        'Banks never ask for OTP over phone',
        'Hang up and call bank directly if suspicious',
        'Enable transaction alerts on your phone'
      ],
      warningSigns: [
        'Unsolicited calls asking for OTP',
        'Urgent verification requests',
        'Callers claiming to be from bank/company',
        'Pressure to share OTP immediately'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'identity-theft',
      title: 'Identity Theft',
      icon: UserIcon,
      description: 'Criminals using your personal information to commit fraud or access your accounts.',
      examples: [
        'Fake KYC update requests',
        'Requests for Aadhaar/PAN copies for "verification"',
        'Social media information harvesting',
        'Fake job offers asking for personal documents'
      ],
      prevention: [
        'Don\'t share personal documents unnecessarily',
        'Be cautious about information shared on social media',
        'Regularly monitor your credit report',
        'Use strong, unique passwords for all accounts'
      ],
      warningSigns: [
        'Unexpected account activities',
        'Unsolicited document requests',
        'Fake verification calls',
        'Unknown transactions in statements'
      ],
      color: 'from-green-500 to-green-600'
    }
  ];

  const filteredScams = scamTypes.filter(scam => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'digital') return ['phishing', 'fake-apps', 'upi-fraud'].includes(scam.id);
    if (selectedCategory === 'investment') return ['fake-apps', 'loan-scams'].includes(scam.id);
    if (selectedCategory === 'identity') return ['otp-theft', 'identity-theft'].includes(scam.id);
    return true;
  });

  const toggleExpanded = (scamId: string) => {
    setExpandedScam(expandedScam === scamId ? null : scamId);
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
          <div className="flex items-center justify-center space-x-3 mb-4">
            <ShieldCheckIcon className="w-12 h-12 text-red-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
              Stay Scam-Safe
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Protect yourself from financial frauds and scams. Learn to identify, prevent, and report fraudulent activities.
          </p>
        </motion.div>

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <ExclamationTriangleIcon className="w-12 h-12 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-2">⚠️ Remember: If it sounds too good to be true, it probably is!</h2>
              <p className="text-lg">
                No legitimate investment guarantees high returns with zero risk. Always verify before you trust.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
            {[
              { id: 'all', label: 'All Scams' },
              { id: 'digital', label: 'Digital Frauds' },
              { id: 'investment', label: 'Investment Scams' },
              { id: 'identity', label: 'Identity Theft' }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Scam Types */}
        <div className="space-y-6">
          {filteredScams.map((scam, index) => {
            const Icon = scam.icon;
            const isExpanded = expandedScam === scam.id;
            
            return (
              <motion.div
                key={scam.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(scam.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${scam.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {scam.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {scam.description}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUpIcon className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-6 space-y-6">
                        {/* Examples */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                            Common Examples
                          </h4>
                          <div className="space-y-2">
                            {scam.examples.map((example, idx) => (
                              <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border-l-4 border-red-500">
                                <p className="text-red-800 dark:text-red-200 italic">"{example}"</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Warning Signs */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                            Warning Signs
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {scam.warningSigns.map((sign, idx) => (
                              <div key={idx} className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                                <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                <span className="text-yellow-800 dark:text-yellow-200">{sign}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Prevention Tips */}
                        <div>
                          <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center">
                            <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />
                            How to Protect Yourself
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {scam.prevention.map((tip, idx) => (
                              <div key={idx} className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-green-800 dark:text-green-200">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Action Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-teal-500 to-coral-500 rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">What to Do If You're Scammed</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <PhoneIcon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">1. Act Immediately</h3>
              <ul className="text-white/90 space-y-1">
                <li>• Contact your bank immediately</li>
                <li>• Block your cards and accounts</li>
                <li>• Change all passwords</li>
                <li>• Report to cyber crime portal</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <EnvelopeIcon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">2. File Complaints</h3>
              <ul className="text-white/90 space-y-1">
                <li>• Cyber Crime Portal: cybercrime.gov.in</li>
                <li>• National Helpline: 155260</li>
                <li>• Local police station</li>
                <li>• RBI Banking Ombudsman</li>
              </ul>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <LightBulbIcon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">3. Prevent Future Scams</h3>
              <ul className="text-white/90 space-y-1">
                <li>• Enable transaction alerts</li>
                <li>• Regular account monitoring</li>
                <li>• Educate family members</li>
                <li>• Stay updated on new scam types</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Emergency Contacts
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-xl">
              <PhoneIcon className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 dark:text-white">Cyber Crime</h3>
              <p className="text-red-600 font-bold text-lg">155260</p>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <PhoneIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 dark:text-white">Banking Fraud</h3>
              <p className="text-blue-600 font-bold text-lg">1930</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
              <PhoneIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 dark:text-white">Consumer Helpline</h3>
              <p className="text-green-600 font-bold text-lg">1915</p>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
              <PhoneIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-bold text-gray-800 dark:text-white">Police</h3>
              <p className="text-purple-600 font-bold text-lg">100</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScamAwareness;