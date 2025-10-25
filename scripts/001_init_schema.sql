-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  birth_date DATE,
  additional_phones TEXT[], -- Array of additional phone numbers
  notes TEXT,
  call_status VARCHAR(20) DEFAULT 'not_called', -- 'called', 'not_called'
  call_notes TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  waiting_for_showing BOOLEAN DEFAULT FALSE,
  date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create objects (properties) table
CREATE TABLE IF NOT EXISTS objects (
  id SERIAL PRIMARY KEY,
  address VARCHAR(255) NOT NULL,
  district VARCHAR(100),
  rooms INTEGER NOT NULL,
  area DECIMAL(10, 2) NOT NULL,
  floor INTEGER,
  total_floors INTEGER,
  price DECIMAL(15, 2) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  buyer_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'sold', 'has_candidates'
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create showings table
CREATE TABLE IF NOT EXISTS showings (
  id SERIAL PRIMARY KEY,
  object_id INTEGER REFERENCES objects(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  scheduled_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table for income/expenses tracking
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'income', 'expense'
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  object_id INTEGER REFERENCES objects(id) ON DELETE SET NULL,
  admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admins (Anna and Elena)
INSERT INTO admins (username, password, name) VALUES
  ('Anna', '09876', 'Anna'),
  ('Elena', '12345', 'Elena')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_objects_status ON objects(status);
CREATE INDEX IF NOT EXISTS idx_objects_owner ON objects(owner_id);
CREATE INDEX IF NOT EXISTS idx_objects_buyer ON objects(buyer_id);
CREATE INDEX IF NOT EXISTS idx_clients_hidden ON clients(is_hidden);
CREATE INDEX IF NOT EXISTS idx_clients_waiting ON clients(waiting_for_showing);
CREATE INDEX IF NOT EXISTS idx_showings_object ON showings(object_id);
CREATE INDEX IF NOT EXISTS idx_showings_client ON showings(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions(client_id);
