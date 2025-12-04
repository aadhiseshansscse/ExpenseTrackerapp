import { useState } from 'react';
import { supabase, Expense } from '../lib/supabase';
import { Trash2, Calendar, Tag } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseDeleted: () => void;
}

export default function ExpenseList({ expenses, onExpenseDeleted }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      onExpenseDeleted();
    } catch (err) {
      alert('Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const categories = Array.from(new Set(expenses.map((e) => e.category)));
  const filteredExpenses =
    filter === 'all' ? expenses : expenses.filter((e) => e.category === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Expense History</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No expenses found</p>
          <p className="text-sm mt-1">Start tracking by adding your first expense above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatAmount(expense.amount)}
                  </span>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center">
                    <Tag className="w-3 h-3 mr-1" />
                    {expense.category}
                  </span>
                </div>
                {expense.description && (
                  <p className="text-sm text-gray-600 mb-1">{expense.description}</p>
                )}
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(expense.date)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                title="Delete expense"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
