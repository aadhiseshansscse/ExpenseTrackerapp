import { useMemo } from 'react';
import { Expense } from '../lib/supabase';
import { TrendingUp, PieChart } from 'lucide-react';

interface SpendingAnalyticsProps {
  expenses: Expense[];
}

export default function SpendingAnalytics({ expenses }: SpendingAnalyticsProps) {
  const analytics = useMemo(() => {
    const byCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(byCategory).reduce((sum, amount) => sum + amount, 0);

    const categoryData = Object.entries(byCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / total) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);

    const last30Days = expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return expenseDate >= thirtyDaysAgo;
    });

    const last30DaysTotal = last30Days.reduce((sum, e) => sum + Number(e.amount), 0);
    const dailyAverage = last30DaysTotal / 30;

    return {
      total,
      categoryData,
      last30DaysTotal,
      dailyAverage,
      expenseCount: expenses.length,
    };
  }, [expenses]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const colors = [
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Spent</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatAmount(analytics.total)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Last 30 Days</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(analytics.last30DaysTotal)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Daily Average</span>
            <TrendingUp className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(analytics.dailyAverage)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Transactions</span>
            <PieChart className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.expenseCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h3>
        <div className="space-y-4">
          {analytics.categoryData.map((item, index) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.category}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatAmount(item.amount)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1 block">
                {item.percentage.toFixed(1)}% of total
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
