const express = require('express');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getWeather,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/uploadConfig');

const router = express.Router();

// All task routes require a valid JWT
router.use(protect);

router.get('/weather/:city', getWeather);

router.route('/')
  .get(getTasks)
  .post(upload.single('attachment'), createTask);

router.route('/:id')
  .get(getTaskById)
  .put(upload.single('attachment'), updateTask)
  .delete(deleteTask);

module.exports = router;
