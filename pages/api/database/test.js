export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('✅ Using mock mode - No database connection');

      res.status(200).json({
        success: true,
        message: 'Mock mode active - Database not connected',
        database_info: {
          current_time: new Date().toISOString(),
          connection_type: 'mock_data',
          expenses_count: 8,
          users_count: 1,
          categories_count: 5,
          errors: {
            expenses: null,
            users: null,
            categories: null
          }
        }
      });
    } catch (error) {
      console.error('❌ Mock mode error:', error);
      res.status(500).json({
        success: false,
        error: 'Mock mode failed: ' + error.message,
        details: error
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}