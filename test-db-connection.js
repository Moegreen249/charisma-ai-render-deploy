const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connected to database successfully');
    
    console.log('Testing query...');
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query successful:', result.rows[0]);
    
    // Test if User table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'User'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ User table exists');
      
      // Check User table structure
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 User table columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('❌ User table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Connection string format:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@'));
  } finally {
    await client.end();
  }
}

testConnection();