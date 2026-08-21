// Raw-SQL "model" for the tasks table
const { pool } = require('../config/db');

const TaskModel = {
  // Build a dynamic WHERE clause from filters, always scoped to the owning user
  async findAllForUser(userId, { status, priority, search, startDate, endDate, page = 1, limit = 10 }) {
    const conditions = ['user_id = ?'];
    const params = [userId];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }
    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (startDate) {
      conditions.push('due_date >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('due_date <= ?');
      params.push(endDate);
    }

    const whereClause = conditions.join(' AND ');
    const numericPage = Math.max(Number(page) || 1, 1);
    const numericLimit = Math.max(Number(limit) || 10, 1);
    const offset = (numericPage - 1) * numericLimit;

    const [rows] = await pool.query(
      `SELECT * FROM tasks WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, numericLimit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM tasks WHERE ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    return {
      data: rows,
      meta: {
        total,
        page: numericPage,
        limit: numericLimit,
        lastPage: Math.max(Math.ceil(total / numericLimit), 1),
      },
    };
  },

  async findByIdForUser(id, userId) {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    return rows[0] || null;
  },

  async create({ userId, title, description, status, priority, dueDate, location, fileUrl }) {
    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date, location, file_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, title, description || null, status || 'PENDING', priority || 'MEDIUM', dueDate || null, location || null, fileUrl || null]
    );
    return this.findByIdForUser(result.insertId, userId);
  },

  async update(id, userId, fields) {
    const allowed = ['title', 'description', 'status', 'priority', 'due_date', 'location', 'file_url'];
    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (allowed.includes(key) && value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) return this.findByIdForUser(id, userId);

    params.push(id, userId);
    await pool.query(
      `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    return this.findByIdForUser(id, userId);
  },

  async remove(id, userId) {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  },
};

module.exports = TaskModel;
