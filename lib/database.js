import { Pool } from 'pg';

// For Vercel serverless, we need a simpler approach
let globalConnection = null;

function getConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  if (!globalConnection) {
    console.log('🔧 Creating database connection...');
    console.log('🔧 Environment:', process.env.NODE_ENV);
    console.log('🔧 Database URL exists:', !!process.env.DATABASE_URL);
    
    // Clean connection string without additional parameters
    const connectionString = process.env.DATABASE_URL;
    
    globalConnection = new Pool({
      connectionString,
      ssl: true, // Force SSL for Supabase
      max: 1,
      min: 0,
      connectionTimeoutMillis: 60000, // Increase timeout
      idleTimeoutMillis: 60000,
    });
    
    globalConnection.on('error', (err) => {
      console.error('💥 Database connection error:', err);
    });
    
    globalConnection.on('connect', () => {
      console.log('✅ Database connected successfully!');
    });
  }
  
  return globalConnection;
}

// Database helper functions
export const db = {
  // Generic query function
  async query(text, params) {
    const pool = getConnection();
    let client;
    
    try {
      console.log('🔍 Connecting to database...');
      client = await pool.connect();
      console.log('✅ Connected to database');
      console.log('🔍 Executing query:', text.substring(0, 100) + '...');
      
      const result = await client.query(text, params);
      console.log('✅ Query executed, rows returned:', result.rows.length);
      
      return result;
    } catch (error) {
      console.error('❌ Database error:', error.message);
      console.error('❌ Error details:', error);
      throw new Error(`Database query failed: ${error.message}`);
    } finally {
      if (client) {
        console.log('🔄 Releasing database client');
        client.release();
      }
    }
  },

  // Get all expenses with optional filters
  async getExpenses(filters = {}) {
    const { user_id, category, startDate, endDate, limit = 50 } = filters;
    
    let query = `
      SELECT e.*, c.icon, c.color 
      FROM expenses e 
      LEFT JOIN categories c ON (e.category = c.name OR e.category = c.name_id)
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      query += ` AND e.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
    }

    if (startDate) {
      paramCount++;
      query += ` AND e.expense_date >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND e.expense_date <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` ORDER BY e.created_at DESC LIMIT $${paramCount + 1}`;
    params.push(limit);

    const result = await this.query(query, params);
    return result.rows;
  },

  // Create new expense
  async createExpense(expenseData) {
    const {
      user_id,
      username,
      first_name,
      amount,
      description,
      category = 'other',
      location,
      payment_method = 'cash',
      expense_date,
      message_id,
      chat_id
    } = expenseData;

    const query = `
      INSERT INTO expenses (
        user_id, username, first_name, amount, description, category,
        location, payment_method, expense_date, message_id, chat_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const params = [
      user_id, username, first_name, amount, description, category,
      location, payment_method, expense_date || new Date().toISOString().split('T')[0],
      message_id, chat_id
    ];

    const result = await this.query(query, params);
    return result.rows[0];
  },

  // Get user or create if not exists
  async getOrCreateUser(userData) {
    const { telegram_id, username, first_name, last_name } = userData;

    // Try to get existing user
    let result = await this.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegram_id]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create new user
    result = await this.query(`
      INSERT INTO users (telegram_id, username, first_name, last_name)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [telegram_id, username, first_name, last_name]);

    return result.rows[0];
  },

  // Get expense statistics
  async getStats(user_id = null, period = 'month') {
    let dateFilter = '';
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      params.push(user_id);
      dateFilter += ` AND user_id = $${paramCount}`;
    }

    // Current period filter
    if (period === 'month') {
      dateFilter += ` AND expense_date >= DATE_TRUNC('month', CURRENT_DATE)`;
    } else if (period === 'week') {
      dateFilter += ` AND expense_date >= DATE_TRUNC('week', CURRENT_DATE)`;
    } else if (period === 'year') {
      dateFilter += ` AND expense_date >= DATE_TRUNC('year', CURRENT_DATE)`;
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount,
        COUNT(DISTINCT category) as unique_categories
      FROM expenses 
      WHERE 1=1 ${dateFilter}
    `;

    const result = await this.query(statsQuery, params);
    return result.rows[0];
  },

  // Get category breakdown
  async getCategoryBreakdown(user_id = null, period = 'month') {
    let dateFilter = '';
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      params.push(user_id);
      dateFilter += ` AND e.user_id = $${paramCount}`;
    }

    if (period === 'month') {
      dateFilter += ` AND e.expense_date >= DATE_TRUNC('month', CURRENT_DATE)`;
    }

    const query = `
      SELECT 
        e.category,
        COALESCE(c.name_id, e.category) as name_id,
        COALESCE(c.icon, '💰') as icon,
        COALESCE(c.color, '#5F27CD') as color,
        COUNT(*) as count,
        SUM(e.amount) as total_amount
      FROM expenses e
      LEFT JOIN categories c ON (e.category = c.name OR e.category = c.name_id)
      WHERE 1=1 ${dateFilter}
      GROUP BY e.category, c.name_id, c.icon, c.color
      ORDER BY total_amount DESC
    `;

    const result = await this.query(query, params);
    return result.rows;
  },

  // Get daily expense trends
  async getDailyTrends(user_id = null, days = 30) {
    let userFilter = '';
    const params = [days];
    let paramCount = 1;

    if (user_id) {
      paramCount++;
      params.push(user_id);
      userFilter = ` AND user_id = $${paramCount}`;
    }

    const query = `
      SELECT 
        expense_date::date as date,
        SUM(amount) as total_amount,
        COUNT(*) as transaction_count
      FROM expenses 
      WHERE expense_date >= CURRENT_DATE - INTERVAL '${days} days' ${userFilter}
      GROUP BY expense_date::date
      ORDER BY date ASC
    `;

    const result = await this.query(query, params);
    return result.rows;
  },

  // Get all categories
  async getCategories() {
    const result = await this.query('SELECT * FROM categories ORDER BY name');
    return result.rows;
  }
};

export default db;