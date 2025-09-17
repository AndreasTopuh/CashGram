import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://czbkxbxuldltpavwaftq.supabase.co';
const supabaseKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Ymt4Ynh1bGRsdHBhdndhZnRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY2MTU2MDgsImV4cCI6MjA0MjE5MTYwOH0.9kf91i8Bgg4YVtOVK_c-vP7XY9rjpPmCBp6iE6PCF6Y';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions using Supabase client
export const db = {
  // Get all expenses with optional filters
  async getExpenses(filters = {}) {
    try {
      console.log('🔍 Fetching expenses from Supabase...');
      
      let query = supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.startDate) {
        query = query.gte('expense_date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('expense_date', filters.endDate);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }

      console.log('✅ Expenses fetched successfully:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error fetching expenses:', error);
      throw error;
    }
  },

  // Create new expense
  async createExpense(expenseData) {
    try {
      console.log('🔍 Creating expense in Supabase...');
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw error;
      }

      console.log('✅ Expense created successfully');
      return data;
    } catch (error) {
      console.error('❌ Error creating expense:', error);
      throw error;
    }
  },

  // Get user or create if not exists
  async getOrCreateUser(userData) {
    try {
      console.log('🔍 Getting/creating user in Supabase...');
      
      // Try to get existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', userData.telegram_id)
        .single();

      if (existingUser) {
        console.log('✅ User found');
        return existingUser;
      }

      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError);
        throw createError;
      }

      console.log('✅ User created successfully');
      return newUser;
    } catch (error) {
      console.error('❌ Error with user operations:', error);
      throw error;
    }
  },

  // Get expense statistics
  async getStats(user_id = null) {
    try {
      console.log('🔍 Getting stats from Supabase...');
      
      let query = supabase
        .from('expenses')
        .select('amount');

      // Filter by user if provided
      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      // Filter to current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      query = query.gte('expense_date', startOfMonth.toISOString().split('T')[0]);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase stats error:', error);
        throw error;
      }

      // Calculate stats
      const total_amount = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const total_transactions = data.length;
      const unique_categories = new Set(data.map(e => e.category)).size;

      const stats = {
        total_amount: total_amount.toString(),
        total_transactions: total_transactions.toString(),
        unique_categories: unique_categories.toString()
      };

      console.log('✅ Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw error;
    }
  },

  // Get category breakdown
  async getCategoryBreakdown(user_id = null, period = 'month') {
    try {
      console.log('🔍 Getting category breakdown from Supabase...');
      
      let query = supabase
        .from('expenses')
        .select('category, amount');

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (period === 'month') {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        query = query.gte('expense_date', startOfMonth.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase category breakdown error:', error);
        throw error;
      }

      // Group by category
      const categoryMap = data.reduce((acc, expense) => {
        const category = expense.category || 'lainnya';
        if (!acc[category]) {
          acc[category] = {
            category,
            name_id: category,
            icon: '💰',
            color: '#5F27CD',
            count: 0,
            total_amount: 0
          };
        }
        acc[category].count++;
        acc[category].total_amount += parseFloat(expense.amount);
        return acc;
      }, {});

      const result = Object.values(categoryMap);
      console.log('✅ Category breakdown calculated:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Error getting category breakdown:', error);
      throw error;
    }
  },

  // Get daily trends
  async getDailyTrends(user_id = null, days = 30) {
    try {
      console.log('🔍 Getting daily trends from Supabase...');
      
      let query = supabase
        .from('expenses')
        .select('expense_date, amount');

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      // Last N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query.gte('expense_date', startDate.toISOString().split('T')[0]);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Supabase daily trends error:', error);
        throw error;
      }

      // Group by date
      const dateMap = data.reduce((acc, expense) => {
        const date = expense.expense_date;
        if (!acc[date]) {
          acc[date] = {
            date,
            total_amount: 0,
            transaction_count: 0
          };
        }
        acc[date].total_amount += parseFloat(expense.amount);
        acc[date].transaction_count++;
        return acc;
      }, {});

      const result = Object.values(dateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
      console.log('✅ Daily trends calculated:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Error getting daily trends:', error);
      throw error;
    }
  },

  // Get all categories
  async getCategories() {
    try {
      console.log('🔍 Getting categories from Supabase...');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Supabase categories error:', error);
        throw error;
      }

      console.log('✅ Categories fetched:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Error getting categories:', error);
      throw error;
    }
  }
};

export default db;