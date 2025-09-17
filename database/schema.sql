-- CashGram Database Schema
-- Buat database schema untuk expense tracking

-- 1. Create Categories Table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  name_id VARCHAR(50) NOT NULL,           -- Nama dalam bahasa Indonesia
  icon VARCHAR(20) NOT NULL,              -- Emoji icon
  color VARCHAR(7) NOT NULL,              -- Hex color
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, name_id, icon, color) VALUES
('food', 'makanan', '🍔', '#FF6B6B'),
('transport', 'transportasi', '🚗', '#4ECDC4'),
('shopping', 'belanja', '🛍️', '#45B7D1'),
('bills', 'tagihan', '💡', '#96CEB4'),
('health', 'kesehatan', '🏥', '#22C55E'),
('entertainment', 'hiburan', '🎬', '#FF9FF3'),
('education', 'pendidikan', '📚', '#54A0FF'),
('other', 'lainnya', '💰', '#5F27CD');

-- 2. Create Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  telegram_id VARCHAR(50) UNIQUE NOT NULL,
  username VARCHAR(100),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- User Preferences
  language VARCHAR(10) DEFAULT 'id',
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  currency VARCHAR(10) DEFAULT 'IDR',
  
  -- Budget Settings
  daily_limit DECIMAL(15,2),
  monthly_limit DECIMAL(15,2),
  notification_enabled BOOLEAN DEFAULT true,
  
  -- Analytics
  total_expenses DECIMAL(15,2) DEFAULT 0,
  expense_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Expenses Table
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  
  -- User Information
  user_id VARCHAR(50) NOT NULL,
  username VARCHAR(100),
  first_name VARCHAR(100),
  
  -- Expense Details
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'other',
  
  -- Location & Context
  location VARCHAR(255),
  receipt_url VARCHAR(500),
  payment_method VARCHAR(50) DEFAULT 'cash',
  
  -- Timestamps
  expense_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  currency VARCHAR(10) DEFAULT 'IDR',
  is_recurring BOOLEAN DEFAULT false,
  tags TEXT[],
  
  -- Bot Context
  message_id INTEGER,
  chat_id BIGINT,
  
  -- Foreign Keys
  FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE
);

-- 4. Create Indexes for Performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_amount ON expenses(amount);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- 5. Create Views for Analytics
CREATE VIEW monthly_expenses AS
SELECT 
  user_id,
  username,
  DATE_TRUNC('month', expense_date) as month,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount
FROM expenses 
GROUP BY user_id, username, DATE_TRUNC('month', expense_date)
ORDER BY month DESC;

CREATE VIEW category_summary AS
SELECT 
  user_id,
  username,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_amount
FROM expenses 
GROUP BY user_id, username, category
ORDER BY total_amount DESC;

-- 6. Insert Sample Data untuk Testing
INSERT INTO users (telegram_id, username, first_name) VALUES
('123456789', 'john_doe', 'John'),
('987654321', 'jane_smith', 'Jane'),
('555666777', 'alice_brown', 'Alice');

INSERT INTO expenses (user_id, username, first_name, amount, description, category, expense_date) VALUES
('123456789', 'john_doe', 'John', 50000, 'Makan siang di restoran', 'food', '2025-09-17'),
('123456789', 'john_doe', 'John', 25000, 'Grab ke kantor', 'transport', '2025-09-17'),
('987654321', 'jane_smith', 'Jane', 150000, 'Belanja bulanan', 'shopping', '2025-09-16'),
('987654321', 'jane_smith', 'Jane', 35000, 'Nonton bioskop', 'entertainment', '2025-09-16'),
('555666777', 'alice_brown', 'Alice', 100000, 'Bayar listrik', 'bills', '2025-09-15'),
('555666777', 'alice_brown', 'Alice', 75000, 'Konsultasi dokter', 'health', '2025-09-15'),
('123456789', 'john_doe', 'John', 20000, 'Kopi pagi', 'food', '2025-09-14'),
('987654321', 'jane_smith', 'Jane', 300000, 'Beli sepatu', 'shopping', '2025-09-14'),
('555666777', 'alice_brown', 'Alice', 45000, 'Ojek online', 'transport', '2025-09-13'),
('123456789', 'john_doe', 'John', 80000, 'Dinner dengan keluarga', 'food', '2025-09-13');

-- 7. Create Function untuk Update User Stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users 
    SET total_expenses = total_expenses + NEW.amount,
        expense_count = expense_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE telegram_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users 
    SET total_expenses = total_expenses - OLD.amount,
        expense_count = expense_count - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE telegram_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create Trigger
CREATE TRIGGER trigger_update_user_stats
AFTER INSERT OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_user_stats();