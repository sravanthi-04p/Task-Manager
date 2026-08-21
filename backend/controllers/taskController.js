const TaskModel = require('../models/Task');
const { getWeatherByCity } = require('../utils/weatherService');
const { sendTaskCreatedEmail, sendTaskCompletedEmail } = require('../utils/emailService');

const buildFileUrl = (req, filename) =>
  `${process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get('host')}`}/uploads/${filename}`;

// @desc    Get logged-in user's tasks with filtering, search & pagination
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search, startDate, endDate } = req.query;

    const result = await TaskModel.findAllForUser(req.user.id, {
      status,
      priority,
      search,
      startDate,
      endDate,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

// @desc    Get a single task by id
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await TaskModel.findByIdForUser(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
};

// @desc    Create a task (with optional file attachment + weather lookup + email)
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, location } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const fileUrl = req.file ? buildFileUrl(req, req.file.filename) : null;

    const task = await TaskModel.create({
      userId: req.user.id,
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      location,
      fileUrl,
    });

    // Fire-and-forget side effects: don't let a slow weather API or email
    // provider delay the response back to the client.
    res.status(201).json(task);

    if (location) {
      getWeatherByCity(location).catch(() => {});
    }
    sendTaskCreatedEmail(req.user.email, task).catch(() => {});
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

// @desc    Update a task (status change to DONE triggers a completion email)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const existing = await TaskModel.findByIdForUser(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const { title, description, status, priority, dueDate, location } = req.body;
    const fields = {
      title,
      description,
      status,
      priority,
      due_date: dueDate,
      location,
    };

    if (req.file) {
      fields.file_url = buildFileUrl(req, req.file.filename);
    }

    const updated = await TaskModel.update(req.params.id, req.user.id, fields);

    res.json(updated);

    if (status === 'DONE' && existing.status !== 'DONE') {
      sendTaskCompletedEmail(req.user.email, updated).catch(() => {});
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const deleted = await TaskModel.remove(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};

// @desc    Get live weather for a city (used by the frontend WeatherBadge)
// @route   GET /api/tasks/weather/:city
// @access  Private
const getWeather = async (req, res) => {
  try {
    const weather = await getWeatherByCity(req.params.city);
    if (!weather) return res.status(404).json({ message: 'Weather unavailable for this location' });
    res.json(weather);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weather', error: error.message });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getWeather };
