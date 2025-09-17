import db from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Test database connection
      const result = await db.query('SELECT NOW() as current_time, version() as postgres_version');
      
      // Get basic stats
      const expenseCount = await db.query('SELECT COUNT(*) as count FROM expenses');
      const userCount = await db.query('SELECT COUNT(*) as count FROM users');
      const categoryCount = await db.query('SELECT COUNT(*) as count FROM categories');

      res.status(200).json({
        success: true,
        message: 'Database connection successful',
        database_info: {
          current_time: result.rows[0].current_time,
          postgres_version: result.rows[0].postgres_version,
          expenses_count: parseInt(expenseCount.rows[0].count),
          users_count: parseInt(userCount.rows[0].count),
          categories_count: parseInt(categoryCount.rows[0].count)
        }
      });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({
        success: false,
        error: 'Database connection failed: ' + error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}