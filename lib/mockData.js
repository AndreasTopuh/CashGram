// Mock data untuk testing dashboard
export const mockExpenses = [
  {
    id: 1,
    amount: 50000,
    description: 'Makan siang di restoran',
    category: 'makanan',
    date: '2025-09-17',
    username: 'john_doe'
  },
  {
    id: 2,
    amount: 25000,
    description: 'Grab ke kantor',
    category: 'transportasi',
    date: '2025-09-17',
    username: 'jane_smith'
  },
  {
    id: 3,
    amount: 150000,
    description: 'Belanja bulanan',
    category: 'belanja',
    date: '2025-09-16',
    username: 'alice_brown'
  },
  {
    id: 4,
    amount: 35000,
    description: 'Nonton bioskop',
    category: 'hiburan',
    date: '2025-09-16',
    username: 'bob_wilson'
  },
  {
    id: 5,
    amount: 100000,
    description: 'Bayar listrik',
    category: 'tagihan',
    date: '2025-09-15',
    username: 'carol_davis'
  },
  {
    id: 6,
    amount: 75000,
    description: 'Konsultasi dokter',
    category: 'kesehatan',
    date: '2025-09-15',
    username: 'david_miller'
  },
  {
    id: 7,
    amount: 20000,
    description: 'Kopi pagi',
    category: 'makanan',
    date: '2025-09-14',
    username: 'eva_garcia'
  },
  {
    id: 8,
    amount: 300000,
    description: 'Beli sepatu',
    category: 'belanja',
    date: '2025-09-14',
    username: 'frank_rodriguez'
  },
  {
    id: 9,
    amount: 45000,
    description: 'Ojek online',
    category: 'transportasi',
    date: '2025-09-13',
    username: 'grace_lee'
  },
  {
    id: 10,
    amount: 80000,
    description: 'Dinner dengan keluarga',
    category: 'makanan',
    date: '2025-09-13',
    username: 'henry_kim'
  }
];

// Generate chart data
export const generateChartData = (expenses) => {
  // Daily expenses for area chart
  const dailyData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ date, amount: expense.amount });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Category data for pie chart
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  // Category data for bar chart
  const categoryBarData = categoryData.map(item => ({
    category: item.name,
    amount: item.value
  }));

  return {
    daily: dailyData,
    category: categoryData,
    categoryBar: categoryBarData
  };
};

// Calculate statistics
export const calculateStats = (expenses) => {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonth = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  });
  const lastMonth = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
    return expenseDate.getMonth() === lastMonthDate.getMonth() && expenseDate.getFullYear() === lastMonthDate.getFullYear();
  });

  const thisMonthTotal = thisMonth.reduce((sum, expense) => sum + expense.amount, 0);
  const lastMonthTotal = lastMonth.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0;

  const avgDaily = thisMonth.length > 0 ? thisMonthTotal / thisMonth.length : 0;
  const categories = [...new Set(expenses.map(e => e.category))].length;

  return {
    total: thisMonthTotal,
    transactions: thisMonth.length,
    avgDaily,
    categories,
    monthlyChange: Math.abs(monthlyChange),
    trend: monthlyChange > 0 ? 'up' : 'down'
  };
};