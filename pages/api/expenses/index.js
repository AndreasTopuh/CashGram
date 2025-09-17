import { mockExpenses, generateChartData, calculateStats } from '../../../lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const chartData = generateChartData(mockExpenses);
      const stats = calculateStats(mockExpenses);
      
      res.status(200).json({
        expenses: mockExpenses,
        chartData,
        stats,
        success: true
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to fetch expenses',
        success: false 
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { amount, description, category, username } = req.body;
      
      const newExpense = {
        id: mockExpenses.length + 1,
        amount: parseFloat(amount),
        description: description || 'Pengeluaran',
        category: category || 'lainnya',
        date: new Date().toISOString().split('T')[0],
        username: username || 'anonymous'
      };

      // In a real app, this would be saved to database
      // For now, we just return the new expense
      res.status(201).json({
        expense: newExpense,
        success: true,
        message: 'Expense added successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to add expense',
        success: false 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}