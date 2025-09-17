import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Test connection with a simple query
      const { data: testData, error: testError } = await supabase
        .from('categories')
        .select('count(*)')
        .single();

      if (testError) {
        throw testError;
      }

      // Get table counts
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('id', { count: 'exact' });

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact' });

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id', { count: 'exact' });

      console.log('✅ Supabase connection successful');

      res.status(200).json({
        success: true,
        message: 'Supabase connection successful',
        database_info: {
          current_time: new Date().toISOString(),
          connection_type: 'supabase_client',
          expenses_count: expenses?.length || 0,
          users_count: users?.length || 0,
          categories_count: categories?.length || 0,
          errors: {
            expenses: expensesError?.message || null,
            users: usersError?.message || null,
            categories: categoriesError?.message || null
          }
        }
      });
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      res.status(500).json({
        success: false,
        error: 'Supabase connection failed: ' + error.message,
        details: error
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}