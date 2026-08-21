// MySQL connection pool using mysql2/promise
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'task_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // return DATE columns as 'YYYY-MM-DD' strings instead of JS Date objects
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL connected: ${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'task_management'}`);
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Did you run `npm run db:init` and set correct DB_* values in .env?');
    process.exit(1);
  }
};

module.exports = { pool, connectDB };
