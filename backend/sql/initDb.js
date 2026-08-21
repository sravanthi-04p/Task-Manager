// One-time DB bootstrap script: creates the database + tables from schema.sql
// Run with: npm run db:init
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Database and tables created successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
};

run();
