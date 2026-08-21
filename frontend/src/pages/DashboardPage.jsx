import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getWeather,
} from '../services/api.js';

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [weatherMap, setWeatherMap] = useState({});
  const [meta, setMeta] = useState({ page: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getTasks({
        page,
        limit: 9,
        status: status || undefined,
        priority: priority || undefined,
        search: search || undefined,
      });
      setTasks(data.data);
      setMeta(data.meta);

      // Fetch weather for tasks with a location (fire in parallel, ignore individual failures)
      const uniqueCities = [...new Set(data.data.filter((t) => t.location).map((t) => t.location))];
      uniqueCities.forEach(async (city) => {
        try {
          const res = await getWeather(city);
          setWeatherMap((prev) => ({ ...prev, [city]: res.data }));
        } catch {
          // weather not available for this city - skip silently
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, status, priority, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateOrUpdate = async (formData, taskId) => {
    if (taskId) {
      await updateTask(taskId, formData);
    } else {
      await createTask(formData);
    }
    fetchTasks();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(id);
    fetchTasks();
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">My Tasks</h1>
          <button
            onClick={handleNewTask}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search tasks..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select
            value={priority}
            onChange={(e) => { setPriority(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">No tasks found. Create your first one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                weather={task.location ? weatherMap[task.location] : null}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.lastPage > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {meta.page} of {meta.lastPage}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, meta.lastPage))}
              disabled={page >= meta.lastPage}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialTask={editingTask}
      />
    </div>
  );
};

export default DashboardPage;
