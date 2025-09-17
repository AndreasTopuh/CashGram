import db from '../../../lib/database';
import { mockExpenses, generateChartData as generateMockChartData, calculateStats as calculateMockStats } from '../../../lib/mockData';

// Helper function to generate chart data from database results
function generateChartData(expenses) {
  // Daily expenses for area chart
  const dailyData = expenses.reduce((acc, expense) => {
    const date = new Date(expense.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.amount += parseFloat(expense.amount);
    } else {
      acc.push({ date, amount: parseFloat(expense.amount) });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Category data for pie chart
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += parseFloat(expense.amount);
    } else {
      acc.push({ name: expense.category, value: parseFloat(expense.amount) });
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
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Starting expenses API request...');
      console.log('🔍 Environment:', process.env.NODE_ENV);
      console.log('🔍 Database URL exists:', !!process.env.DATABASE_URL);
      
      const { user_id, category, startDate, endDate, limit } = req.query;
      
      // Try database connection
      console.log('🔍 Attempting to fetch from database...');
      const expenses = await db.getExpenses({
        user_id,
        category,
        startDate,
        endDate,
        limit: limit ? parseInt(limit) : 50
      });

      console.log('✅ Database fetch successful, expenses count:', expenses.length);

      // Get statistics
      const stats = await db.getStats(user_id);
      console.log('✅ Stats fetch successful:', stats);
      
      // Generate chart data
      const chartData = generateChartData(expenses);
      
      // Calculate additional stats
      const total = parseFloat(stats.total_amount || 0);
      const transactions = parseInt(stats.total_transactions || 0);
      const avgDaily = total > 0 && transactions > 0 ? total / Math.max(1, transactions) : 0;
      const categories = parseInt(stats.unique_categories || 0);

      console.log('✅ Sending successful response with real data');

      res.status(200).json({
        expenses: expenses.map(expense => ({
          ...expense,
          amount: parseFloat(expense.amount),
          date: expense.expense_date
        })),
        chartData,
        stats: {
          total,
          transactions,
          avgDaily,
          categories,
          monthlyChange: 0,
          trend: 'up'
        },
        success: true,
        source: 'database'
      });
    } catch (error) {
      console.error('❌ Database error:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      // Return error instead of fallback
      res.status(500).json({ 
        error: 'Database connection failed: ' + error.message,
        success: false,
        source: 'database_error'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        user_id, 
        username, 
        first_name, 
        amount, 
        description, 
        category, 
        location,
        payment_method,
        expense_date,
        message_id,
        chat_id 
      } = req.body;
      
      // Validate required fields
      if (!user_id || !amount) {
        return res.status(400).json({
          error: 'user_id and amount are required',
          success: false
        });
      }

      // Create expense in database
      const newExpense = await db.createExpense({
        user_id,
        username,
        first_name,
        amount: parseFloat(amount),
        description: description || 'Pengeluaran',
        category: category || 'other',
        location,
        payment_method: payment_method || 'cash',
        expense_date,
        message_id,
        chat_id
      });

      res.status(201).json({
        expense: {
          ...newExpense,
          amount: parseFloat(newExpense.amount)
        },
        success: true,
        message: 'Expense added successfully'
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Failed to add expense: ' + error.message,
        success: false 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}