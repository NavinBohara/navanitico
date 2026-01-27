import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { createBudget, listBudgets, updateBudget, BudgetItem as DbBudgetItem } from '../lib/db';
import { 
  addExpense as addExpenseRow,
  listExpensesByMonth,
  updateExpense as updateExpenseRow,
  deleteExpense as deleteExpenseRow,
  ExpenseCategory
} from '../lib/expenses';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlusIcon,
  MinusIcon,
  LightBulbIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  /** High-level bucket used for 50/30/20 rule */
  category: 'need' | 'want' | 'saving';
  /** Detailed ledger category from Supabase (Food, Rent, EMI, etc.) */
  ledgerCategory: ExpenseCategory;
  /** ISO date string yyyy-mm-dd */
  date: string;
}

interface BudgetData {
  income: number;
  expenses: BudgetItem[];
  savingsGoal: number;
  emergencyFund: number;
  budgetCategories: BudgetCategory[];
  financialGoals: FinancialGoal[];
  recurringExpenses: RecurringExpense[];
}

interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
  icon: string;
}

interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
}

interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  category: string;
  nextDue: string;
}

const BudgetPlanner = () => {
  const { user } = useUser();
  const [budgetData, setBudgetData] = useState<BudgetData>({
    income: 0,
    expenses: [] as BudgetItem[],
    savingsGoal: 0,
    emergencyFund: 0,
    budgetCategories: [
      { id: '1', name: 'Food & Dining', limit: 5000, spent: 0, color: '#ef4444', icon: '🍽️' },
      { id: '2', name: 'Transportation', limit: 3000, spent: 0, color: '#3b82f6', icon: '🚗' },
      { id: '3', name: 'Entertainment', limit: 2000, spent: 0, color: '#8b5cf6', icon: '🎬' },
      { id: '4', name: 'Shopping', limit: 3000, spent: 0, color: '#f59e0b', icon: '🛍️' },
      { id: '5', name: 'Bills & Utilities', limit: 4000, spent: 0, color: '#10b981', icon: '⚡' },
      { id: '6', name: 'Healthcare', limit: 1500, spent: 0, color: '#ec4899', icon: '🏥' }
    ],
    financialGoals: [],
    recurringExpenses: []
  });
  const [newExpense, setNewExpense] = useState({ name: '', amount: 0, category: 'need' as const });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'planner' | 'analysis' | 'tips' | 'goals' | 'categories'>('planner');
  const [saving, setSaving] = useState(false);
  const [loadingServer, setLoadingServer] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'need' | 'want' | 'saving'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<{ name: string; amount: number; category: 'need' | 'want' | 'saving' } | null>(null);
  const [newDate, setNewDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [newNote, setNewNote] = useState<string>('');
  const [newCategoryStd, setNewCategoryStd] = useState<ExpenseCategory>('Food');
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth()); // 0-based
  
  // Advanced features state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: 0, targetDate: '', priority: 'medium' as const });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', limit: 0, color: '#3b82f6', icon: '💰' });

  // Load latest saved budget (expenses only) for this user
  const loadLatestBudget = async () => {
    try {
      setLoadingServer(true);
      setServerMessage(null);
      const budgets = await listBudgets();
      const latest = budgets[0];
      if (!latest) {
        setServerMessage('No saved budgets found.');
        return;
      }
      const items = (latest.items || []) as DbBudgetItem[];
      setBudgetData(prev => ({
        ...prev,
        expenses: items.map((i, idx) => ({
          id: String(idx + 1),
          name: i.category,
          amount: i.actual ?? i.planned ?? 0,
          category:
            (i.category as any) === 'saving'
              ? 'saving'
              : (i.category as any) === 'want'
              ? 'want'
              : 'need',
          // When loading from historical budget snapshots we don't know the exact
          // ledger category or date, so we default them to keep UI consistent.
          ledgerCategory: (i.category as ExpenseCategory) ?? 'Misc',
          date: new Date().toISOString().slice(0, 10)
        }))
      }));
      setServerMessage('Loaded latest saved budget.');
    } catch (e: any) {
      setServerMessage(e?.message || 'Failed to load budget');
    } finally {
      setLoadingServer(false);
    }
  };

  // Save current expenses snapshot to Supabase budgets table
  const saveCurrentBudget = async () => {
    if (!user) {
      setServerMessage('Please sign in to save your budget.');
      return;
    }
    try {
      setSaving(true);
      setServerMessage(null);
      const month = new Date();
      const monthIso = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().slice(0, 10);
      const items: DbBudgetItem[] = budgetData.expenses.map(e => ({
        category: e.name,
        planned: e.amount,
        actual: e.amount
      }));
      const created = await createBudget({ title: 'My Budget', month: monthIso, items });
      setServerMessage('Budget saved.');
      // Optional: immediately update title or items
      await updateBudget(created.id, { items });
    } catch (e: any) {
      setServerMessage(e?.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const calculateTotals = () => {
    const needs = budgetData.expenses.filter(e => e.category === 'need').reduce((sum, e) => sum + e.amount, 0);
    const wants = budgetData.expenses.filter(e => e.category === 'want').reduce((sum, e) => sum + e.amount, 0);
    const savings = budgetData.expenses.filter(e => e.category === 'saving').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = needs + wants + savings;
    const remaining = budgetData.income - totalExpenses;

    return { needs, wants, savings, totalExpenses, remaining };
  };

  const addExpense = () => {
    if (newExpense.name && newExpense.amount > 0) {
      // Persist to Supabase expenses ledger
      const run = async () => {
        try {
          await addExpenseRow({
            amount: newExpense.amount,
            category: newCategoryStd,
            date: newDate,
            note: newNote || newExpense.name
          });
          await loadMonth();
          setNewExpense({ name: '', amount: 0, category: 'need' });
          setNewNote('');
          setNewCategoryStd('Food');
          setNewDate(new Date().toISOString().slice(0,10));
          setShowAddForm(false);
        } catch (e:any) {
          setServerMessage(e?.message || 'Failed to add expense');
        }
      };
      run();
    }
  };

  const removeExpense = (id: string) => {
    const run = async () => {
      try {
        await deleteExpenseRow(id);
        await loadMonth();
      } catch (e:any) {
        setServerMessage(e?.message || 'Failed to delete expense');
      }
    };
    run();
  };

  const startEdit = (id: string) => {
    const exp = budgetData.expenses.find(e => e.id === id);
    if (!exp) return;
    setEditingId(id);
    setEditingDraft({ name: exp.name, amount: exp.amount, category: exp.category });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(null);
  };

  const saveEdit = () => {
    if (!editingId || !editingDraft) return;
    const run = async () => {
      try {
        // Map our categories need/want/saving into closest fixed categories for ledger reporting
        // Keep original note by matching current row
        const current = budgetData.expenses.find(e => e.id === editingId);
        await updateExpenseRow(editingId, {
          amount: editingDraft.amount,
          category: (current?.category === 'saving' ? 'Misc' : current?.category === 'want' ? 'Shopping' : 'Bills') as ExpenseCategory,
          note: current?.name || null
        });
        await loadMonth();
      } catch (e:any) {
        setServerMessage(e?.message || 'Failed to save edit');
      } finally {
        setEditingId(null);
        setEditingDraft(null);
      }
    };
    run();
  };

  const getBudgetHealth = () => {
    const { needs, wants, savings, remaining } = calculateTotals();
    const needsPercentage = (needs / budgetData.income) * 100;
    const wantsPercentage = (wants / budgetData.income) * 100;
    const savingsPercentage = (savings / budgetData.income) * 100;

    if (remaining < 0) return { status: 'critical', message: 'You are overspending!' };
    if (needsPercentage > 60) return { status: 'warning', message: 'Your needs are taking up too much of your income' };
    if (savingsPercentage < 20) return { status: 'warning', message: 'Try to save at least 20% of your income' };
    if (wantsPercentage > 30) return { status: 'caution', message: 'Consider reducing your wants spending' };
    return { status: 'good', message: 'Your budget looks healthy!' };
  };

  const getSmartTips = () => {
    const { needs, wants, savings, remaining } = calculateTotals();
    const tips = [];

    if (remaining < 0) {
      tips.push('🚨 You need to reduce expenses by ₹' + Math.abs(remaining));
    }
    if (wants > needs * 0.5) {
      tips.push('💡 Consider reducing wants spending - it\'s higher than recommended');
    }
    if (savings < budgetData.income * 0.2) {
      tips.push('💰 Try to increase savings to at least 20% of income');
    }
    if (budgetData.emergencyFund < needs * 3) {
      tips.push('🛡️ Build an emergency fund of at least 3 months of expenses');
    }

    return tips;
  };


  const totals = calculateTotals();
  const budgetHealth = getBudgetHealth();
  const smartTips = getSmartTips();

  // Derived views
  const filteredExpenses = useMemo(() => {
    if (filter === 'all') return budgetData.expenses;
    return budgetData.expenses.filter(e => e.category === filter);
  }, [budgetData.expenses, filter]);

  // Aggregation by detailed ledger category (Food, Rent, EMI etc.)
  const categoryAgg = useMemo(() => {
    const agg: Record<string, number> = {};
    for (const e of budgetData.expenses) {
      const key = e.ledgerCategory || 'Other';
      agg[key] = (agg[key] || 0) + e.amount;
    }
    return Object.entries(agg).map(([name, value]) => ({ name, value }));
  }, [budgetData.expenses]);

  // Enhanced smart analysis with detailed insights
  const getDetailedAnalysis = () => {
    const { needs, wants, savings } = calculateTotals();
    const analysis: string[] = [];

    // Category breakdown analysis using detailed ledger categories
    const categoryBreakdown = categoryAgg.reduce((acc, item) => {
      acc[item.name] = item.value;
      return acc;
    }, {} as Record<string, number>);

    const totalSpent = Object.values(categoryBreakdown).reduce((sum, amount) => sum + amount, 0);
    
    if (totalSpent > 0) {
      Object.entries(categoryBreakdown).forEach(([category, amount]) => {
        const percentage = (amount / totalSpent) * 100;

        if (percentage > 30) {
          if (category === 'Food') {
            analysis.push(
              `🍽️ You spent ${percentage.toFixed(
                1
              )}% of your expenses on Food. Try to keep it below 30% for a healthier budget.`
            );
          } else if (category === 'Shopping' || category === 'Entertainment' || category === 'Travel') {
            analysis.push(
              `🛍️ ${category} is ${percentage.toFixed(
                1
              )}% of your spending. Consider trimming discretionary spends to boost savings.`
            );
          } else {
            analysis.push(
              `📊 You spent ${percentage.toFixed(1)}% on ${category} this month.`
            );
          }
        }
      });
    }

    // Savings analysis
    if (budgetData.savingsGoal > 0) {
      const savingsProgress = (savings / budgetData.savingsGoal) * 100;
      if (savingsProgress < 50) {
        analysis.push(`💰 You've saved ${savingsProgress.toFixed(1)}% of your savings goal`);
      } else if (savingsProgress >= 100) {
        analysis.push(`🎉 Congratulations! You've exceeded your savings goal!`);
      }
    }

    // Emergency fund analysis
    if (budgetData.emergencyFund > 0 && needs > 0) {
      const emergencyMonths = budgetData.emergencyFund / needs;
      if (emergencyMonths < 3) {
        const needed = Math.ceil((needs * 3) - budgetData.emergencyFund);
        analysis.push(`🛡️ Emergency fund needs ₹${needed} more to reach 3-month target`);
      } else {
        analysis.push(`✅ Emergency fund is healthy (${emergencyMonths.toFixed(1)} months)`);
      }
    }

    // Spending pattern analysis + EMI rule
    if (budgetData.income > 0) {
      const needsPercentage = (needs / budgetData.income) * 100;
      const wantsPercentage = (wants / budgetData.income) * 100;
      const savingsPercentage = (savings / budgetData.income) * 100;

      if (needsPercentage > 60) {
        analysis.push(`⚠️ Needs spending (${needsPercentage.toFixed(1)}%) exceeds recommended 50%`);
      }
      if (wantsPercentage > 30) {
        analysis.push(`⚠️ Wants spending (${wantsPercentage.toFixed(1)}%) exceeds recommended 30%`);
      }
      if (savingsPercentage < 20) {
        analysis.push(`💡 Savings (${savingsPercentage.toFixed(1)}%) is below recommended 20%`);
      }

      // EMI should ideally be <= 40% of income
      const emiAmount = categoryBreakdown['EMI'] || 0;
      if (emiAmount > 0) {
        const emiPct = (emiAmount / budgetData.income) * 100;
        if (emiPct > 40) {
          analysis.push(
            `⚠️ Your EMIs take up ${emiPct.toFixed(
              1
            )}% of your income, which is above the safe limit of 40%. Consider reducing loan obligations.`
          );
        }
      }
    }

    return analysis;
  };

  const detailedAnalysis = getDetailedAnalysis();

  // Advanced features functions
  const addFinancialGoal = () => {
    if (newGoal.name && newGoal.targetAmount > 0) {
      const goal: FinancialGoal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: newGoal.targetAmount,
        currentAmount: 0,
        targetDate: newGoal.targetDate,
        priority: newGoal.priority
      };
      setBudgetData(prev => ({
        ...prev,
        financialGoals: [...prev.financialGoals, goal]
      }));
      setNewGoal({ name: '', targetAmount: 0, targetDate: '', priority: 'medium' });
      setShowGoalForm(false);
    }
  };

  const addBudgetCategory = () => {
    if (newCategory.name && newCategory.limit > 0) {
      const category: BudgetCategory = {
        id: Date.now().toString(),
        name: newCategory.name,
        limit: newCategory.limit,
        spent: 0,
        color: newCategory.color,
        icon: newCategory.icon
      };
      setBudgetData(prev => ({
        ...prev,
        budgetCategories: [...prev.budgetCategories, category]
      }));
      setNewCategory({ name: '', limit: 0, color: '#3b82f6', icon: '💰' });
      setShowCategoryForm(false);
    }
  };


  const getBudgetHealthScore = () => {
    const { totalExpenses, remaining } = calculateTotals();
    const income = budgetData.income;
    
    if (income === 0) return 0;
    
    const savingsRate = (remaining / income) * 100;
    const expenseRate = (totalExpenses / income) * 100;
    
    let score = 100;
    
    // Deduct points for overspending
    if (remaining < 0) score -= 30;
    
    // Deduct points for low savings rate
    if (savingsRate < 10) score -= 20;
    else if (savingsRate < 20) score -= 10;
    
    // Deduct points for high expense rate
    if (expenseRate > 90) score -= 25;
    else if (expenseRate > 80) score -= 15;
    
    // Bonus points for good financial habits
    if (budgetData.emergencyFund > totalExpenses * 3) score += 10;
    if (budgetData.financialGoals.length > 0) score += 5;
    
    return Math.max(0, Math.min(100, score));
  };

  // Enhanced monthly trend with daily breakdown
  const trendData = useMemo(() => {
    const byDay: Record<string, number> = {};
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      byDay[day.toString()] = 0;
    }
    
    for (const e of budgetData.expenses) {
      const expenseDate = new Date(e.date);
      if (expenseDate.getMonth() === month && expenseDate.getFullYear() === year) {
        const day = expenseDate.getDate();
        byDay[day.toString()] = (byDay[day.toString()] || 0) + e.amount;
      }
    }
    
    return Object.entries(byDay).map(([day, amount]) => ({
      day: `Day ${day}`,
      amount,
      date: day
    }));
  }, [budgetData.expenses, year, month]);

  // Weekly spending trend
  const weeklyTrendData = useMemo(() => {
    const byWeek: Record<string, number> = {};
    for (const e of budgetData.expenses) {
      const expenseDate = new Date(e.date);
      if (expenseDate.getMonth() === month && expenseDate.getFullYear() === year) {
        const week = Math.ceil(expenseDate.getDate() / 7);
        byWeek['Week ' + week] = (byWeek['Week ' + week] || 0) + e.amount;
      }
    }
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    return weeks.map(w => ({ week: w, amount: byWeek[w] || 0 }));
  }, [budgetData.expenses, year, month]);

  // Load month from Supabase expenses
  const loadMonth = async () => {
    try {
      setLoadingServer(true);
      const rows = await listExpensesByMonth(year, month);
      // Map ledger -> local expenses structure
      const mapped: BudgetItem[] = rows.map(r => ({
        id: r.id,
        name: r.note || r.category,
        amount: Number(r.amount),
        // Heuristic mapping to need/want/saving for visualization
        category:
          r.category === 'Rent' ||
          r.category === 'Bills' ||
          r.category === 'Food' ||
          r.category === 'Transport' ||
          r.category === 'Health' ||
          r.category === 'EMI'
            ? ('need' as const)
            : r.category === 'Shopping' ||
              r.category === 'Entertainment' ||
              r.category === 'Travel'
            ? ('want' as const)
            : ('saving' as const),
        ledgerCategory: r.category as ExpenseCategory,
        date: r.date
      }));
      setBudgetData(prev => ({ ...prev, expenses: mapped }));
      setServerMessage(null);
    } catch (e:any) {
      setServerMessage(e?.message || 'Failed to load expenses');
    } finally {
      setLoadingServer(false);
    }
  };

  React.useEffect(() => {
    loadMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, user?.id]);

  const exportCSV = () => {
    const headers = ['Date','Category','Name','Amount'];
    const lines = budgetData.expenses.map(e => {
      // name kept in note in DB; date not tracked locally, so leave blank
      return ['', e.category, e.name.replace(/,/g,';'), String(e.amount)];
    });
    const csv = [headers, ...lines].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${year}-${month+1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            NavaNiti Budget Coach
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Take control of your finances with our intelligent budget planner. 
            Get personalized recommendations and track your financial health.
          </p>
          <div className="mt-6 flex items-center justify-center space-x-3">
            <button
              onClick={saveCurrentBudget}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Budget'}
            </button>
            <button
              onClick={loadLatestBudget}
              disabled={loadingServer}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black disabled:opacity-60"
            >
              {loadingServer ? 'Loading...' : 'Load Latest'}
            </button>
          </div>
          {serverMessage && (
            <div className="mt-3 text-sm text-teal-700 dark:text-teal-300">{serverMessage}</div>
          )}
        </motion.div>

        {/* Summary cards - upgraded to feel like a live finance dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {/* Income */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</span>
              <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              ₹{budgetData.income || 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter your monthly in-hand income to unlock accurate insights.
            </p>
          </div>

          {/* Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</span>
              <ChartBarIcon className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              ₹{totals.totalExpenses}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                style={{
                  width: `${
                    budgetData.income > 0
                      ? Math.min((totals.totalExpenses / budgetData.income) * 100, 100)
                      : 0
                  }%`
                }}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {budgetData.income > 0
                ? `You have used ${(totals.totalExpenses / Math.max(budgetData.income, 1) * 100).toFixed(
                    1
                  )}% of your income.`
                : 'Add your income to see how much of it is being spent.'}
            </p>
          </div>

          {/* Remaining & 50/30/20 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Remaining Balance
              </span>
              <CheckCircleIcon
                className={`w-5 h-5 ${
                  totals.remaining >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              />
            </div>
            <div
              className={`text-3xl font-bold mb-1 ${
                totals.remaining >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ₹{totals.remaining}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {totals.remaining >= 0
                ? 'Great! You are within your monthly budget.'
                : 'You are overspending this month. Review wants & EMI first.'}
            </p>
            {budgetData.income > 0 && (
              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                <span>50/30/20 target</span>
                <span>
                  Needs ≤ 50% • Wants ≤ 30% • Savings ≥ 20%
                </span>
              </div>
            )}
          </div>

          {/* Savings Goal Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Savings Progress
              </span>
              <LightBulbIcon className="w-5 h-5 text-teal-500" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Monthly goal: ₹{budgetData.savingsGoal || 0}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-coral-500 transition-all duration-500"
                style={{
                  width: `${
                    budgetData.savingsGoal > 0
                      ? Math.min(
                          ((Math.max(totals.remaining, 0) || 0) / budgetData.savingsGoal) * 100,
                          100
                        )
                      : 0
                  }%`
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {budgetData.savingsGoal > 0
                ? `You have achieved ${(
                    (Math.max(totals.remaining, 0) / Math.max(budgetData.savingsGoal, 1)) *
                    100
                  ).toFixed(1)}% of your savings goal.`
                : 'Set a monthly savings goal to track how much you are putting aside.'}
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
            {[
              { id: 'planner', label: 'Budget Planner', icon: CalculatorIcon },
              { id: 'analysis', label: 'Analysis', icon: ChartBarIcon },
              { id: 'categories', label: 'Categories', icon: ExclamationTriangleIcon },
              { id: 'goals', label: 'Goals', icon: CheckCircleIcon },
              { id: 'tips', label: 'Smart Tips', icon: LightBulbIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-teal-500 to-coral-500 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
            {/* Month Picker */}
            <div className="flex items-center gap-2 pl-4">
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              >
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i)=> (
                  <option value={i} key={m}>{m}</option>
                ))}
              </select>
              <input
                type="number"
                value={year}
                onChange={(e)=> setYear(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
              <button onClick={exportCSV} className="px-3 py-2 rounded bg-gray-100 dark:bg-gray-700 text-sm">Export CSV</button>
            </div>
          </div>
        </motion.div>

        {/* Budget Planner Tab */}
        {selectedTab === 'planner' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Income & Goals */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Income & Goals
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Income
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={budgetData.income || ''}
                      onChange={(e) => setBudgetData(prev => ({ ...prev, income: Number(e.target.value) }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter your monthly income"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Savings Goal
                  </label>
                  <input
                    type="number"
                    value={budgetData.savingsGoal || ''}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, savingsGoal: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Monthly savings target"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emergency Fund
                  </label>
                  <input
                    type="number"
                    value={budgetData.emergencyFund || ''}
                    onChange={(e) => setBudgetData(prev => ({ ...prev, emergencyFund: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Current emergency fund"
                  />
                </div>
              </div>
            </motion.div>

            {/* Expenses */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Expenses
                </h2>
                <div className="flex items-center gap-3">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="need">Need</option>
                    <option value="want">Want</option>
                    <option value="saving">Saving</option>
                  </select>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Expense</span>
                  </button>
                </div>
              </div>

              {/* Add Expense Form */}
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      value={newExpense.name}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Expense name"
                    />
                    <input
                      type="number"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Amount"
                    />
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e)=> setNewDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <select
                      value={newCategoryStd}
                      onChange={(e)=> setNewCategoryStd(e.target.value as ExpenseCategory)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {['Food','Rent','Transport','Bills','EMI','Shopping','Health','Entertainment','Education','Travel','Misc'].map(c=> (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e)=> setNewNote(e.target.value)}
                    placeholder="Note (optional)"
                    className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <div className="flex items-center justify-between">
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value as any }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="need">Need</option>
                      <option value="want">Want</option>
                      <option value="saving">Saving</option>
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={addExpense}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Expenses List - more like a finance app ledger */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-100 dark:bg-gray-900/40 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  <div className="col-span-5">Expense</div>
                  <div className="col-span-3 text-center">Type</div>
                  <div className="col-span-2 text-right">Amount (₹)</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {filteredExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="grid grid-cols-12 items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors"
                    >
                      <div className="col-span-5 flex items-center space-x-3">
                        <span
                          className={`inline-flex h-2.5 w-2.5 rounded-full ${
                            expense.category === 'need'
                              ? 'bg-red-500'
                              : expense.category === 'want'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        />
                        {editingId === expense.id ? (
                          <input
                            type="text"
                            value={editingDraft?.name || ''}
                            onChange={(e) =>
                              setEditingDraft((prev) => ({ ...(prev as any), name: e.target.value }))
                            }
                            className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-white"
                          />
                        ) : (
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">
                              {expense.name}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="col-span-3">
                        {editingId === expense.id ? (
                          <select
                            value={editingDraft?.category || 'need'}
                            onChange={(e) =>
                              setEditingDraft((prev) => ({
                                ...(prev as any),
                                category: e.target.value as any
                              }))
                            }
                            className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-white capitalize"
                          >
                            <option value="need">Need</option>
                            <option value="want">Want</option>
                            <option value="saving">Saving</option>
                          </select>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
                            {expense.category}
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-right">
                        {editingId === expense.id ? (
                          <input
                            type="number"
                            value={editingDraft?.amount || 0}
                            onChange={(e) =>
                              setEditingDraft((prev) => ({
                                ...(prev as any),
                                amount: Number(e.target.value)
                              }))
                            }
                            className="w-24 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-right text-gray-800 dark:text-white"
                          />
                        ) : (
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ₹{expense.amount}
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 flex items-center justify-end space-x-2">
                        {editingId === expense.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="px-2 py-1 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2 py-1 rounded-lg bg-gray-500 text-white text-xs font-semibold hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(expense.id)}
                              className="text-xs font-medium text-teal-600 hover:text-teal-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeExpense(expense.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"
                            >
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {budgetData.expenses.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      No expenses added yet. Use **Add Expense** to start building your monthly ledger.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Analysis Tab */}
        {selectedTab === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Spending Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold">₹{totals.totalExpenses}</p>
                  </div>
                  <CurrencyDollarIcon className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Savings</p>
                    <p className="text-2xl font-bold">₹{totals.remaining}</p>
                  </div>
                  <ChartBarIcon className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Avg Daily</p>
                    <p className="text-2xl font-bold">₹{Math.round(totals.totalExpenses / new Date(year, month + 1, 0).getDate())}</p>
                  </div>
                  <CalculatorIcon className="w-8 h-8 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Expenses</p>
                    <p className="text-2xl font-bold">{budgetData.expenses.length}</p>
                  </div>
                  <ExclamationTriangleIcon className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Budget Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Budget Overview
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-white">Income</span>
                  <span className="font-bold text-green-600">₹{budgetData.income}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-white">Needs</span>
                  <span className="font-bold text-red-600">₹{totals.needs}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-white">Wants</span>
                  <span className="font-bold text-yellow-600">₹{totals.wants}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <span className="font-medium text-gray-800 dark:text-white">Savings</span>
                  <span className="font-bold text-blue-600">₹{totals.savings}</span>
                </div>
                
                <div className={`flex justify-between items-center p-4 rounded-lg ${
                  totals.remaining >= 0 
                    ? 'bg-green-50 dark:bg-green-900/30' 
                    : 'bg-red-50 dark:bg-red-900/30'
                }`}>
                  <span className="font-medium text-gray-800 dark:text-white">Remaining</span>
                  <span className={`font-bold ${
                    totals.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{totals.remaining}
                  </span>
                </div>
              </div>
            </div>

            {/* Budget Health */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Budget Health
              </h2>
              
              <div className={`p-6 rounded-xl mb-6 ${
                budgetHealth.status === 'good' ? 'bg-green-50 dark:bg-green-900/30' :
                budgetHealth.status === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
                budgetHealth.status === 'caution' ? 'bg-orange-50 dark:bg-orange-900/30' :
                'bg-red-50 dark:bg-red-900/30'
              }`}>
                <div className="flex items-center space-x-3 mb-3">
                  {budgetHealth.status === 'good' ? (
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className={`w-8 h-8 ${
                      budgetHealth.status === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  )}
                  <h3 className={`text-xl font-bold ${
                    budgetHealth.status === 'good' ? 'text-green-800 dark:text-green-200' :
                    budgetHealth.status === 'critical' ? 'text-red-800 dark:text-red-200' :
                    'text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {budgetHealth.status === 'good' ? 'Healthy Budget' :
                     budgetHealth.status === 'critical' ? 'Critical' :
                     budgetHealth.status === 'warning' ? 'Needs Attention' : 'Be Cautious'}
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{budgetHealth.message}</p>
              </div>

              {/* 50/30/20 Rule Visualization */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">50/30/20 Rule Check</h3>
                
                {budgetData.income > 0 && (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Needs (Target: 50%)</span>
                        <span>{((totals.needs / budgetData.income) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((totals.needs / budgetData.income) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Wants (Target: 30%)</span>
                        <span>{((totals.wants / budgetData.income) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((totals.wants / budgetData.income) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Savings (Target: 20%)</span>
                        <span>{((totals.savings / budgetData.income) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((totals.savings / budgetData.income) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-1">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Expenses by Category
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryAgg} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {categoryAgg.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'need' ? '#ef4444' : entry.name === 'want' ? '#f59e0b' : '#22c55e'} />
                      ))}
                    </Pie>
                    <Legend />
                    <ReTooltip formatter={(v: any) => `₹${v}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Monthly Spending Trend
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <ReTooltip 
                      formatter={(v: any) => [`₹${v}`, 'Amount']}
                      labelFormatter={(label) => `Day ${label}`}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#06b6d4" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#06b6d4' }}
                      activeDot={{ r: 6, stroke: '#06b6d4', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Weekly Spending Pattern
              </h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <ReTooltip 
                      formatter={(v: any) => [`₹${v}`, 'Amount']}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#f59e0b" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#f59e0b' }}
                      activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            </div>
          </motion.div>
        )}

        {/* Budget Categories Tab */}
        {selectedTab === 'categories' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Budget Health Score */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Budget Health Score</h2>
                  <p className="text-blue-100">How well you're managing your finances</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{getBudgetHealthScore()}/100</div>
                  <div className="text-blue-100 text-sm">
                    {getBudgetHealthScore() >= 80 ? 'Excellent' : 
                     getBudgetHealthScore() >= 60 ? 'Good' : 
                     getBudgetHealthScore() >= 40 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Budget Categories
                </h2>
                <button
                  onClick={() => setShowCategoryForm(!showCategoryForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Add Category Form */}
              {showCategoryForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Category name"
                    />
                    <input
                      type="number"
                      value={newCategory.limit || ''}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, limit: Number(e.target.value) }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Monthly limit"
                    />
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Icon (emoji)"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={addBudgetCategory}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Add Category
                    </button>
                    <button
                      onClick={() => setShowCategoryForm(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetData.budgetCategories.map((category) => {
                  const percentage = (category.spent / category.limit) * 100;
                  const isOverLimit = category.spent > category.limit;
                  
                  return (
                    <div
                      key={category.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
                        </div>
                        <div className={`text-sm font-bold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{category.spent} / ₹{category.limit}
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isOverLimit ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{percentage.toFixed(1)}% used</span>
                        {isOverLimit && (
                          <span className="text-red-600 font-medium">Over limit!</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Financial Goals Tab */}
        {selectedTab === 'goals' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Financial Goals
                </h2>
                <button
                  onClick={() => setShowGoalForm(!showGoalForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-coral-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Goal</span>
                </button>
              </div>

              {/* Add Goal Form */}
              {showGoalForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Goal name"
                    />
                    <input
                      type="number"
                      value={newGoal.targetAmount || ''}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: Number(e.target.value) }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Target amount"
                    />
                    <input
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={addFinancialGoal}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Add Goal
                    </button>
                    <button
                      onClick={() => setShowGoalForm(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Goals List */}
              <div className="space-y-4">
                {budgetData.financialGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={goal.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white">{goal.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Target: ₹{goal.targetAmount.toLocaleString()} • Due: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                          goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {goal.priority} priority
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-coral-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          ₹{goal.currentAmount.toLocaleString()} / ₹{goal.targetAmount.toLocaleString()}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {progress.toFixed(1)}% complete
                        </span>
                      </div>
                      
                      {daysLeft > 0 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {daysLeft} days remaining
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {budgetData.financialGoals.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No financial goals set yet. Click "Add Goal" to get started.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Smart Tips Tab */}
        {selectedTab === 'tips' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
                Personalized Budget Tips
              </h2>
              
              {(smartTips.length > 0 || detailedAnalysis.length > 0) ? (
                <div className="space-y-6">
                  {/* Smart Tips Section */}
                  {smartTips.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <LightBulbIcon className="w-6 h-6 text-yellow-500 mr-2" />
                        Smart Recommendations
                      </h3>
                      <div className="space-y-4">
                        {smartTips.map((tip, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-700"
                          >
                            <LightBulbIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                            <p className="text-gray-800 dark:text-white">{tip}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Analysis Section */}
                  {detailedAnalysis.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <ChartBarIcon className="w-6 h-6 text-blue-500 mr-2" />
                        Financial Insights
                      </h3>
                      <div className="space-y-4">
                        {detailedAnalysis.map((analysis, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: (smartTips.length + index) * 0.1 }}
                            className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700"
                          >
                            <ChartBarIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <p className="text-gray-800 dark:text-white">{analysis}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Great Job!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your budget looks healthy. Keep up the good work!
                  </p>
                </div>
              )}

              {/* General Tips */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                  General Budgeting Tips
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Pay Yourself First',
                      description: 'Set aside savings before spending on anything else',
                      icon: '💰'
                    },
                    {
                      title: 'Track Every Expense',
                      description: 'Small expenses add up quickly over time',
                      icon: '📊'
                    },
                    {
                      title: 'Build Emergency Fund',
                      description: 'Aim for 3-6 months of living expenses',
                      icon: '🛡️'
                    },
                    {
                      title: 'Review Monthly',
                      description: 'Adjust your budget based on actual spending',
                      icon: '📅'
                    },
                    {
                      title: 'Automate Savings',
                      description: 'Set up automatic transfers to savings accounts',
                      icon: '🤖'
                    },
                    {
                      title: 'Avoid Lifestyle Inflation',
                      description: 'Don\'t increase spending just because income increases',
                      icon: '📈'
                    }
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                      className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{tip.icon}</span>
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                          {tip.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        {tip.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BudgetPlanner;