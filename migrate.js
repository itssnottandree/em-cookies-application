import pkg from 'pg';
const { Pool } = pkg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const sql_client = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createTables() {
  try {
    console.log('Creating tables...');
    
    // Create tables manually using SQL
    await sql_client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        loyalty_points INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql_client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(50) NOT NULL,
        category VARCHAR(100),
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql_client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        delivery_address TEXT NOT NULL,
        items JSONB NOT NULL,
        total VARCHAR(50) NOT NULL,
        points_earned INTEGER DEFAULT 0,
        points_used INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        email_sent BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql_client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        is_approved BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql_client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql_client.query(`
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await sql_client.query(`
      CREATE TABLE IF NOT EXISTS loyalty_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        order_id INTEGER REFERENCES orders(id),
        points INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tables created successfully!');
    
    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  } finally {
    await sql_client.end();
  }
}

async function insertSampleData() {
  try {
    console.log('Inserting sample data...');
    
    // Check if data already exists
    const existingProducts = await sql_client.query('SELECT COUNT(*) FROM products');
    if (parseInt(existingProducts.rows[0].count) > 0) {
      console.log('Sample data already exists, skipping...');
      return;
    }

    // Insert sample products
    await sql_client.query(`
      INSERT INTO products (name, description, price, category, image_url, stock) VALUES
      ('Chocolate Supreme', 'Galletas de chocolate con chips extra grandes y nueces. Una experiencia premium que derrite en tu boca.', '2.50', 'Chocolate', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', 50),
      ('Vainilla Clásica', 'Nuestras tradicionales galletas de vainilla con un toque de canela. Perfectas para acompañar tu café.', '2.00', 'Vainilla', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', 40),
      ('Avena y Pasas', 'Galletas caseras de avena con pasas dulces. Una opción saludable y deliciosa para cualquier momento.', '2.25', 'Avena', 'https://images.unsplash.com/photo-1568051243858-533a607809a5?w=400', 35);
    `);

    // Insert sample reviews
    await sql_client.query(`
      INSERT INTO reviews (customer_name, rating, comment, is_approved) VALUES
      ('María García', 5, '¡Increíbles! Las mejores galletas que he probado en mucho tiempo.', true),
      ('José Rodríguez', 5, 'Excelente calidad y sabor. Muy recomendadas.', true);
    `);

    console.log('Sample data inserted successfully!');
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

createTables();