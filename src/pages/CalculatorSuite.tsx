import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalculatorIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  HomeIcon,
  AcademicCapIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const CalculatorSuite = () => {
  const [activeCalculator, setActiveCalculator] = useState('emi');

  // EMI Calculator State
  const [emiData, setEmiData] = useState({
    principal: 100000,
    rate: 10,
    tenure: 12
  });

  // SIP Calculator State
  const [sipData, setSipData] = useState({
    monthlyAmount: 5000,
    rate: 12,
    tenure: 120
  });

  // FD Calculator State
  const [fdData, setFdData] = useState({
    principal: 100000,
    rate: 6.5,
    tenure: 12
  });

  // PPF Calculator State
  const [ppfData, setPpfData] = useState({
    monthlyAmount: 12500,
    tenure: 15
  });

  // Tax Calculator State
  const [taxData, setTaxData] = useState({
    income: 500000,
    regime: 'old'
  });

  // Retirement Calculator State
  const [retirementData, setRetirementData] = useState({
    currentAge: 30,
    retirementAge: 60,
    monthlyExpenses: 50000,
    inflation: 6,
    returns: 12
  });

  const calculators = [
    { id: 'emi', name: 'EMI Calculator', icon: CurrencyDollarIcon, color: 'from-blue-500 to-blue-600' },
    { id: 'sip', name: 'SIP Calculator', icon: ArrowTrendingUpIcon, color: 'from-green-500 to-green-600' },
    { id: 'fd', name: 'FD Calculator', icon: BanknotesIcon, color: 'from-yellow-500 to-yellow-600' },
    { id: 'ppf', name: 'PPF Calculator', icon: ShieldCheckIcon, color: 'from-purple-500 to-purple-600' },
    { id: 'tax', name: 'Tax Calculator', icon: CalculatorIcon, color: 'from-red-500 to-red-600' },
    { id: 'retirement', name: 'Retirement Planner', icon: ClockIcon, color: 'from-indigo-500 to-indigo-600' },
    { id: 'goal', name: 'Goal Planning', icon: AcademicCapIcon, color: 'from-pink-500 to-pink-600' },
    { id: 'loan', name: 'Loan Eligibility', icon: HomeIcon, color: 'from-teal-500 to-teal-600' },
    { id: 'emergency', name: 'Emergency Fund', icon: HeartIcon, color: 'from-orange-500 to-orange-600' }
  ];

  // EMI Calculation
  const calculateEMI = () => {
    const { principal, rate, tenure } = emiData;
    const monthlyRate = rate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalAmount = emi * tenure;
    const totalInterest = totalAmount - principal;
    
    return { emi: Math.round(emi), totalAmount: Math.round(totalAmount), totalInterest: Math.round(totalInterest) };
  };

  // SIP Calculation
  const calculateSIP = () => {
    const { monthlyAmount, rate, tenure } = sipData;
    const monthlyRate = rate / (12 * 100);
    const futureValue = monthlyAmount * (((Math.pow(1 + monthlyRate, tenure) - 1) / monthlyRate) * (1 + monthlyRate));
    const totalInvestment = monthlyAmount * tenure;
    const totalReturns = futureValue - totalInvestment;
    
    return { 
      futureValue: Math.round(futureValue), 
      totalInvestment: Math.round(totalInvestment), 
      totalReturns: Math.round(totalReturns) 
    };
  };

  // FD Calculation
  const calculateFD = () => {
    const { principal, rate, tenure } = fdData;
    const maturityAmount = principal * Math.pow(1 + (rate / 100), tenure / 12);
    const interest = maturityAmount - principal;
    
    return { maturityAmount: Math.round(maturityAmount), interest: Math.round(interest) };
  };

  // PPF Calculation
  const calculatePPF = () => {
    const { monthlyAmount, tenure } = ppfData;
    const rate = 7.1; // Current PPF rate
    const annualAmount = monthlyAmount * 12;
    let balance = 0;
    
    for (let year = 1; year <= tenure; year++) {
      balance = (balance + annualAmount) * (1 + rate / 100);
    }
    
    const totalInvestment = annualAmount * tenure;
    const totalReturns = balance - totalInvestment;
    
    return { 
      maturityAmount: Math.round(balance), 
      totalInvestment: Math.round(totalInvestment), 
      totalReturns: Math.round(totalReturns) 
    };
  };

  // Tax Calculation (Simplified)
  const calculateTax = () => {
    const { income, regime } = taxData;
    let tax = 0;
    
    if (regime === 'old') {
      if (income > 250000) tax += Math.min(income - 250000, 250000) * 0.05;
      if (income > 500000) tax += Math.min(income - 500000, 500000) * 0.20;
      if (income > 1000000) tax += (income - 1000000) * 0.30;
    } else {
      if (income > 300000) tax += Math.min(income - 300000, 300000) * 0.05;
      if (income > 600000) tax += Math.min(income - 600000, 300000) * 0.10;
      if (income > 900000) tax += Math.min(income - 900000, 300000) * 0.15;
      if (income > 1200000) tax += Math.min(income - 1200000, 300000) * 0.20;
      if (income > 1500000) tax += (income - 1500000) * 0.30;
    }
    
    const cess = tax * 0.04;
    const totalTax = tax + cess;
    const netIncome = income - totalTax;
    
    return { tax: Math.round(tax), cess: Math.round(cess), totalTax: Math.round(totalTax), netIncome: Math.round(netIncome) };
  };

  // Retirement Calculation
  const calculateRetirement = () => {
    const { currentAge, retirementAge, monthlyExpenses, inflation, returns } = retirementData;
    const yearsToRetirement = retirementAge - currentAge;
    const retirementYears = 25; // Assuming 25 years post retirement
    
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + inflation / 100, yearsToRetirement);
    const corpusRequired = (futureMonthlyExpenses * 12 * retirementYears) / (returns / 100);
    const monthlySIP = corpusRequired / (((Math.pow(1 + returns / (12 * 100), yearsToRetirement * 12) - 1) / (returns / (12 * 100))) * (1 + returns / (12 * 100)));
    
    return {
      corpusRequired: Math.round(corpusRequired),
      monthlySIP: Math.round(monthlySIP),
      futureMonthlyExpenses: Math.round(futureMonthlyExpenses)
    };
  };

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'emi':
        const emiResult = calculateEMI();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">EMI Calculator</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Amount (₹)
                </label>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={emiData.principal}
                  onChange={(e) => setEmiData(prev => ({ ...prev, principal: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹10K</span>
                  <span className="font-bold">₹{emiData.principal.toLocaleString()}</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interest Rate (% per annum)
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={emiData.rate}
                  onChange={(e) => setEmiData(prev => ({ ...prev, rate: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>1%</span>
                  <span className="font-bold">{emiData.rate}%</span>
                  <span>20%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Tenure (months)
                </label>
                <input
                  type="range"
                  min="6"
                  max="360"
                  step="6"
                  value={emiData.tenure}
                  onChange={(e) => setEmiData(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>6 months</span>
                  <span className="font-bold">{emiData.tenure} months ({Math.round(emiData.tenure / 12)} years)</span>
                  <span>30 years</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Results</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Monthly EMI</span>
                  <span className="text-2xl font-bold text-blue-600">₹{emiResult.emi.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Amount</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">₹{emiResult.totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Interest</span>
                  <span className="text-lg font-bold text-red-600">₹{emiResult.totalInterest.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Tip:</strong> EMI should not exceed 40% of your monthly income for a healthy financial profile.
                </p>
              </div>
            </div>
          </div>
        );

      case 'sip':
        const sipResult = calculateSIP();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">SIP Calculator</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Investment (₹)
                </label>
                <input
                  type="range"
                  min="500"
                  max="100000"
                  step="500"
                  value={sipData.monthlyAmount}
                  onChange={(e) => setSipData(prev => ({ ...prev, monthlyAmount: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹500</span>
                  <span className="font-bold">₹{sipData.monthlyAmount.toLocaleString()}</span>
                  <span>₹1L</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Return (% per annum)
                </label>
                <input
                  type="range"
                  min="1"
                  max="25"
                  step="0.5"
                  value={sipData.rate}
                  onChange={(e) => setSipData(prev => ({ ...prev, rate: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>1%</span>
                  <span className="font-bold">{sipData.rate}%</span>
                  <span>25%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Period (months)
                </label>
                <input
                  type="range"
                  min="12"
                  max="600"
                  step="12"
                  value={sipData.tenure}
                  onChange={(e) => setSipData(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>1 year</span>
                  <span className="font-bold">{sipData.tenure} months ({Math.round(sipData.tenure / 12)} years)</span>
                  <span>50 years</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Results</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Future Value</span>
                  <span className="text-2xl font-bold text-green-600">₹{sipResult.futureValue.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Investment</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">₹{sipResult.totalInvestment.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Returns</span>
                  <span className="text-lg font-bold text-green-600">₹{sipResult.totalReturns.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Start SIP early to benefit from the power of compounding. Even small amounts can grow significantly over time.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <CalculatorIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Calculator Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This calculator is under development. Please try EMI or SIP calculator.
            </p>
          </div>
        );
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
            NavaNiti Smart Finance Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive suite of financial calculators to help you make informed decisions. 
            Plan your investments, loans, and financial goals with precision.
          </p>
        </motion.div>

        {/* Calculator Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
        >
          {calculators.map((calc, index) => {
            const Icon = calc.icon;
            return (
              <motion.button
                key={calc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCalculator(calc.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  activeCalculator === calc.id
                    ? `bg-gradient-to-r ${calc.color} text-white border-transparent shadow-lg`
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-8 h-8 mx-auto mb-2" />
                <div className="text-sm font-medium text-center">{calc.name}</div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Calculator Content */}
        <motion.div
          key={activeCalculator}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
        >
          {renderCalculator()}
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 bg-gradient-to-r from-teal-500 to-coral-500 rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Financial Planning Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <ChartBarIcon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Start Early</h3>
              <p className="text-white/90">The power of compounding works best when you start investing early. Even small amounts can grow significantly over time.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <BanknotesIcon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Diversify</h3>
              <p className="text-white/90">Don't put all your eggs in one basket. Spread your investments across different asset classes to reduce risk.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <ArrowTrendingUpIcon className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Stay Consistent</h3>
              <p className="text-white/90">Regular investments through SIPs help you benefit from rupee cost averaging and build wealth systematically.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CalculatorSuite;