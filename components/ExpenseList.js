import React from 'react';

const ExpenseList = ({ expenses }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'makanan': 'bg-orange-100 text-orange-800',
      'transportasi': 'bg-blue-100 text-blue-800',
      'belanja': 'bg-pink-100 text-pink-800',
      'hiburan': 'bg-purple-100 text-purple-800',
      'kesehatan': 'bg-green-100 text-green-800',
      'tagihan': 'bg-red-100 text-red-800',
      'lainnya': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors['lainnya'];
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'makanan': '🍽️',
      'transportasi': '🚗',
      'belanja': '🛍️',
      'hiburan': '🎬',
      'kesehatan': '🏥',
      'tagihan': '💡',
      'lainnya': '📝',
    };
    return icons[category] || icons['lainnya'];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Pengeluaran Terbaru</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {expenses.map((expense, index) => (
          <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getCategoryIcon(expense.category)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {expense.description || 'Pengeluaran'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(expense.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-red-600">
                  - Rp {expense.amount.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500">
                  {expense.username || 'Anonymous'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;