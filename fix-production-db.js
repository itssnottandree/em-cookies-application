import pkg from 'pg';
const { Client } = pkg;

async function fixProductionDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if the old column exists
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `);

    if (result.rows.length > 0) {
      console.log('Found old password_hash column, renaming to passwordHash...');
      await client.query('ALTER TABLE users RENAME COLUMN password_hash TO "passwordHash"');
      console.log('Column renamed successfully!');
    } else {
      console.log('passwordHash column already exists or table needs to be created');
    }

    // Check if admin user exists
    const adminCheck = await client.query(`
      SELECT * FROM users WHERE email = 'andree@emcookies.com'
    `);

    if (adminCheck.rows.length === 0) {
      console.log('Creating admin user...');
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash('password', 10);
      
      await client.query(`
        INSERT INTO users (name, email, "passwordHash", loyalty_points) 
        VALUES ('Administrador', 'andree@emcookies.com', $1, 0)
      `, [hashedPassword]);
      console.log('Admin user created!');
    } else {
      console.log('Admin user already exists');
    }

  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await client.end();
  }
}

fixProductionDatabase();