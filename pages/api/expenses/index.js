import { mockExpenses, generateChartData, calculateStats } from '../../../lib/mockData';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('✅ Using mock data for expenses API');
      
      const chartData = generateChartData(mockExpenses);
      const stats = calculateStats(mockExpenses);
      
      res.status(200).json({
        expenses: mockExpenses,
        chartData,
        stats,
        success: true,
        source: 'mock_data'
      });
    } catch (error) {
      console.error('❌ Error with mock data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch mock expenses: ' + error.message,
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

      // In mock mode, just return the new expense without actually saving
      res.status(201).json({
        expense: newExpense,
        success: true,
        message: 'Mock expense added successfully'
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to add mock expense: ' + error.message,
        success: false 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}