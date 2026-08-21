// Raw-SQL "model" for the users table (no ORM - straightforward mysql2 queries)
const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const UserModel = {
  async create({ name, email, password }) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    return { id: result.insertId, name, email };
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async matchPassword(enteredPassword, hashedPassword) {
    return bcrypt.compare(enteredPassword, hashedPassword);
  },
};

module.exports = UserModel;
