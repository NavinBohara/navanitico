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

  // Goal Planning Calculator State
  const [goalData, setGoalData] = useState({
    goalAmount: 1000000,
    currentSavings: 100000,
    monthlyInvestment: 10000,
    expectedReturns: 12,
    timePeriod: 60
  });

  // Loan Eligibility Calculator State
  const [loanData, setLoanData] = useState({
    monthlyIncome: 100000,
    existingEMI: 20000,
    interestRate: 10,
    tenure: 240,
    loanType: 'home'
  });

  // Emergency Fund Calculator State
  const [emergencyData, setEmergencyData] = useState({
    monthlyExpenses: 50000,
    monthsCoverage: 6,
    currentSavings: 50000
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

  // Goal Planning Calculation
  const calculateGoal = () => {
    const { goalAmount, currentSavings, monthlyInvestment, expectedReturns, timePeriod } = goalData;
    const monthlyRate = expectedReturns / (12 * 100);
    const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, timePeriod);
    const futureValueOfSIP = monthlyInvestment * (((Math.pow(1 + monthlyRate, timePeriod) - 1) / monthlyRate) * (1 + monthlyRate));
    const totalFutureValue = futureValueOfCurrentSavings + futureValueOfSIP;
    const shortfall = Math.max(0, goalAmount - totalFutureValue);
    const surplus = Math.max(0, totalFutureValue - goalAmount);
    
    return {
      totalFutureValue: Math.round(totalFutureValue),
      shortfall: Math.round(shortfall),
      surplus: Math.round(surplus),
      futureValueOfCurrentSavings: Math.round(futureValueOfCurrentSavings),
      futureValueOfSIP: Math.round(futureValueOfSIP)
    };
  };

  // Loan Eligibility Calculation
  const calculateLoanEligibility = () => {
    const { monthlyIncome, existingEMI, interestRate, tenure, loanType } = loanData;
    const maxEMI = monthlyIncome * (loanType === 'home' ? 0.4 : 0.5); // 40% for home, 50% for others
    const availableEMI = maxEMI - existingEMI;
    const monthlyRate = interestRate / (12 * 100);
    const loanAmount = availableEMI * ((Math.pow(1 + monthlyRate, tenure) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, tenure)));
    
    return {
      maxEMI: Math.round(maxEMI),
      availableEMI: Math.round(Math.max(0, availableEMI)),
      eligibleLoanAmount: Math.round(Math.max(0, loanAmount))
    };
  };

  // Emergency Fund Calculation
  const calculateEmergencyFund = () => {
    const { monthlyExpenses, monthsCoverage, currentSavings } = emergencyData;
    const targetAmount = monthlyExpenses * monthsCoverage;
    const shortfall = Math.max(0, targetAmount - currentSavings);
    const surplus = Math.max(0, currentSavings - targetAmount);
    const coverageMonths = Math.round((currentSavings / monthlyExpenses) * 10) / 10;
    
    return {
      targetAmount: Math.round(targetAmount),
      shortfall: Math.round(shortfall),
      surplus: Math.round(surplus),
      coverageMonths: coverageMonths
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

      case 'fd':
        const fdResult = calculateFD();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Fixed Deposit Calculator</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Principal Amount (₹)
                </label>
                <input
                  type="range"
                  min="1000"
                  max="10000000"
                  step="1000"
                  value={fdData.principal}
                  onChange={(e) => setFdData(prev => ({ ...prev, principal: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹1K</span>
                  <span className="font-bold">₹{fdData.principal.toLocaleString()}</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interest Rate (% per annum)
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.1"
                  value={fdData.rate}
                  onChange={(e) => setFdData(prev => ({ ...prev, rate: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>3%</span>
                  <span className="font-bold">{fdData.rate}%</span>
                  <span>10%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tenure (months)
                </label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="1"
                  value={fdData.tenure}
                  onChange={(e) => setFdData(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>1 month</span>
                  <span className="font-bold">{fdData.tenure} months ({Math.round(fdData.tenure / 12 * 10) / 10} years)</span>
                  <span>10 years</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Results</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Maturity Amount</span>
                  <span className="text-2xl font-bold text-yellow-600">₹{fdResult.maturityAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Interest Earned</span>
                  <span className="text-lg font-bold text-green-600">₹{fdResult.interest.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> FDs offer guaranteed returns and are ideal for risk-averse investors. Consider tax implications on interest income.
                </p>
              </div>
            </div>
          </div>
        );

      case 'ppf':
        const ppfResult = calculatePPF();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">PPF Calculator</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Contribution (₹)
                </label>
                <input
                  type="range"
                  min="500"
                  max="12500"
                  step="100"
                  value={ppfData.monthlyAmount}
                  onChange={(e) => setPpfData(prev => ({ ...prev, monthlyAmount: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹500</span>
                  <span className="font-bold">₹{ppfData.monthlyAmount.toLocaleString()}</span>
                  <span>₹12,500</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum annual contribution: ₹1.5L</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Investment Period (years)
                </label>
                <input
                  type="range"
                  min="15"
                  max="50"
                  step="1"
                  value={ppfData.tenure}
                  onChange={(e) => setPpfData(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>15 years</span>
                  <span className="font-bold">{ppfData.tenure} years</span>
                  <span>50 years</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Results</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Maturity Amount</span>
                  <span className="text-2xl font-bold text-purple-600">₹{ppfResult.maturityAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Investment</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">₹{ppfResult.totalInvestment.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Returns</span>
                  <span className="text-lg font-bold text-green-600">₹{ppfResult.totalReturns.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Tip:</strong> PPF offers tax-free returns and is EEE (Exempt-Exempt-Exempt). Current rate: 7.1% p.a.
                </p>
              </div>
            </div>
          </div>
        );

      case 'tax':
        const taxResult = calculateTax();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Income Tax Calculator</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Annual Income (₹)
                </label>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="10000"
                  value={taxData.income}
                  onChange={(e) => setTaxData(prev => ({ ...prev, income: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹0</span>
                  <span className="font-bold">₹{taxData.income.toLocaleString()}</span>
                  <span>₹50L</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tax Regime
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTaxData(prev => ({ ...prev, regime: 'old' }))}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      taxData.regime === 'old'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    Old Regime
                  </button>
                  <button
                    onClick={() => setTaxData(prev => ({ ...prev, regime: 'new' }))}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      taxData.regime === 'new'
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    New Regime
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Tax Calculation</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Taxable Income</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">₹{taxData.income.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Income Tax</span>
                  <span className="text-lg font-bold text-red-600">₹{taxResult.tax.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Cess (4%)</span>
                  <span className="text-lg font-bold text-red-600">₹{taxResult.cess.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Tax</span>
                  <span className="text-2xl font-bold text-red-600">₹{taxResult.totalTax.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg shadow">
                  <span className="font-medium text-green-800 dark:text-green-200">Net Income</span>
                  <span className="text-xl font-bold text-green-600">₹{taxResult.netIncome.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> This is a simplified calculation. Actual tax may vary based on deductions, exemptions, and rebates.
                </p>
              </div>
            </div>
          </div>
        );

      case 'retirement':
        const retirementResult = calculateRetirement();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Retirement Planner</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Age
                </label>
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="1"
                  value={retirementData.currentAge}
                  onChange={(e) => setRetirementData(prev => ({ ...prev, currentAge: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>20</span>
                  <span className="font-bold">{retirementData.currentAge} years</span>
                  <span>60</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Retirement Age
                </label>
                <input
                  type="range"
                  min="50"
                  max="70"
                  step="1"
                  value={retirementData.retirementAge}
                  onChange={(e) => setRetirementData(prev => ({ ...prev, retirementAge: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>50</span>
                  <span className="font-bold">{retirementData.retirementAge} years</span>
                  <span>70</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Monthly Expenses (₹)
                </label>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={retirementData.monthlyExpenses}
                  onChange={(e) => setRetirementData(prev => ({ ...prev, monthlyExpenses: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹10K</span>
                  <span className="font-bold">₹{retirementData.monthlyExpenses.toLocaleString()}</span>
                  <span>₹2L</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Inflation (% per annum)
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.5"
                  value={retirementData.inflation}
                  onChange={(e) => setRetirementData(prev => ({ ...prev, inflation: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>3%</span>
                  <span className="font-bold">{retirementData.inflation}%</span>
                  <span>10%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Returns (% per annum)
                </label>
                <input
                  type="range"
                  min="8"
                  max="15"
                  step="0.5"
                  value={retirementData.returns}
                  onChange={(e) => setRetirementData(prev => ({ ...prev, returns: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>8%</span>
                  <span className="font-bold">{retirementData.returns}%</span>
                  <span>15%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Retirement Plan</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Future Monthly Expenses</span>
                  <span className="text-lg font-bold text-indigo-600">₹{retirementResult.futureMonthlyExpenses.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Corpus Required</span>
                  <span className="text-2xl font-bold text-indigo-600">₹{retirementResult.corpusRequired.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Monthly SIP Needed</span>
                  <span className="text-xl font-bold text-green-600">₹{retirementResult.monthlySIP.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Start saving early for retirement. The earlier you start, the less you need to invest monthly due to compounding.
                </p>
              </div>
            </div>
          </div>
        );

      case 'goal':
        const goalResult = calculateGoal();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Goal Planning Calculator</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Amount (₹)
                </label>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={goalData.goalAmount}
                  onChange={(e) => setGoalData(prev => ({ ...prev, goalAmount: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹10K</span>
                  <span className="font-bold">₹{goalData.goalAmount.toLocaleString()}</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Savings (₹)
                </label>
                <input
                  type="range"
                  min="0"
                  max={goalData.goalAmount}
                  step="1000"
                  value={goalData.currentSavings}
                  onChange={(e) => setGoalData(prev => ({ ...prev, currentSavings: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹0</span>
                  <span className="font-bold">₹{goalData.currentSavings.toLocaleString()}</span>
                  <span>₹{goalData.goalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Investment (₹)
                </label>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={goalData.monthlyInvestment}
                  onChange={(e) => setGoalData(prev => ({ ...prev, monthlyInvestment: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹1K</span>
                  <span className="font-bold">₹{goalData.monthlyInvestment.toLocaleString()}</span>
                  <span>₹1L</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Returns (% per annum)
                </label>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.5"
                  value={goalData.expectedReturns}
                  onChange={(e) => setGoalData(prev => ({ ...prev, expectedReturns: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>6%</span>
                  <span className="font-bold">{goalData.expectedReturns}%</span>
                  <span>18%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Period (months)
                </label>
                <input
                  type="range"
                  min="12"
                  max="360"
                  step="12"
                  value={goalData.timePeriod}
                  onChange={(e) => setGoalData(prev => ({ ...prev, timePeriod: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>1 year</span>
                  <span className="font-bold">{goalData.timePeriod} months ({Math.round(goalData.timePeriod / 12)} years)</span>
                  <span>30 years</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Goal Analysis</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Future Value</span>
                  <span className="text-2xl font-bold text-pink-600">₹{goalResult.totalFutureValue.toLocaleString()}</span>
                </div>
                
                {goalResult.shortfall > 0 ? (
                  <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow">
                    <span className="font-medium text-red-800 dark:text-red-200">Shortfall</span>
                    <span className="text-xl font-bold text-red-600">₹{goalResult.shortfall.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg shadow">
                    <span className="font-medium text-green-800 dark:text-green-200">Surplus</span>
                    <span className="text-xl font-bold text-green-600">₹{goalResult.surplus.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Increase monthly investment or extend time period to achieve your goal faster.
                </p>
              </div>
            </div>
          </div>
        );

      case 'loan':
        const loanResult = calculateLoanEligibility();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Loan Eligibility Calculator</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Income (₹)
                </label>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="5000"
                  value={loanData.monthlyIncome}
                  onChange={(e) => setLoanData(prev => ({ ...prev, monthlyIncome: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹20K</span>
                  <span className="font-bold">₹{loanData.monthlyIncome.toLocaleString()}</span>
                  <span>₹5L</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Existing EMI (₹)
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.round(loanData.monthlyIncome * 0.5)}
                  step="1000"
                  value={loanData.existingEMI}
                  onChange={(e) => setLoanData(prev => ({ ...prev, existingEMI: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹0</span>
                  <span className="font-bold">₹{loanData.existingEMI.toLocaleString()}</span>
                  <span>₹{Math.round(loanData.monthlyIncome * 0.5).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Interest Rate (% per annum)
                </label>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.1"
                  value={loanData.interestRate}
                  onChange={(e) => setLoanData(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>6%</span>
                  <span className="font-bold">{loanData.interestRate}%</span>
                  <span>18%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Tenure (months)
                </label>
                <input
                  type="range"
                  min="12"
                  max="360"
                  step="12"
                  value={loanData.tenure}
                  onChange={(e) => setLoanData(prev => ({ ...prev, tenure: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>1 year</span>
                  <span className="font-bold">{loanData.tenure} months ({Math.round(loanData.tenure / 12)} years)</span>
                  <span>30 years</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Loan Type
                </label>
                <select
                  value={loanData.loanType}
                  onChange={(e) => setLoanData(prev => ({ ...prev, loanType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                  <option value="home">Home Loan</option>
                  <option value="personal">Personal Loan</option>
                  <option value="car">Car Loan</option>
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Eligibility Results</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Max EMI Capacity</span>
                  <span className="text-lg font-bold text-teal-600">₹{loanResult.maxEMI.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Available EMI</span>
                  <span className="text-lg font-bold text-blue-600">₹{loanResult.availableEMI.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg shadow">
                  <span className="font-medium text-green-800 dark:text-green-200">Eligible Loan Amount</span>
                  <span className="text-2xl font-bold text-green-600">₹{loanResult.eligibleLoanAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Actual eligibility may vary based on credit score, employment type, and other factors considered by lenders.
                </p>
              </div>
            </div>
          </div>
        );

      case 'emergency':
        const emergencyResult = calculateEmergencyFund();
        return (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Emergency Fund Calculator</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monthly Expenses (₹)
                </label>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="5000"
                  value={emergencyData.monthlyExpenses}
                  onChange={(e) => setEmergencyData(prev => ({ ...prev, monthlyExpenses: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹10K</span>
                  <span className="font-bold">₹{emergencyData.monthlyExpenses.toLocaleString()}</span>
                  <span>₹2L</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Desired Coverage (months)
                </label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={emergencyData.monthsCoverage}
                  onChange={(e) => setEmergencyData(prev => ({ ...prev, monthsCoverage: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>3 months</span>
                  <span className="font-bold">{emergencyData.monthsCoverage} months</span>
                  <span>12 months</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Savings (₹)
                </label>
                <input
                  type="range"
                  min="0"
                  max={emergencyData.monthlyExpenses * 12}
                  step="1000"
                  value={emergencyData.currentSavings}
                  onChange={(e) => setEmergencyData(prev => ({ ...prev, currentSavings: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>₹0</span>
                  <span className="font-bold">₹{emergencyData.currentSavings.toLocaleString()}</span>
                  <span>₹{(emergencyData.monthlyExpenses * 12).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl p-6">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Emergency Fund Status</h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Target Amount</span>
                  <span className="text-2xl font-bold text-orange-600">₹{emergencyResult.targetAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Current Coverage</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">{emergencyResult.coverageMonths} months</span>
                </div>
                
                {emergencyResult.shortfall > 0 ? (
                  <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg shadow">
                    <span className="font-medium text-red-800 dark:text-red-200">Shortfall</span>
                    <span className="text-xl font-bold text-red-600">₹{emergencyResult.shortfall.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg shadow">
                    <span className="font-medium text-green-800 dark:text-green-200">Surplus</span>
                    <span className="text-xl font-bold text-green-600">₹{emergencyResult.surplus.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Tip:</strong> Aim for 3-6 months of expenses as emergency fund. Keep it in liquid assets like savings account or FDs.
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
              This calculator is under development. Please try other calculators.
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