import { MapPin, Paperclip, Pencil, Trash2 } from 'lucide-react';
import WeatherBadge from './WeatherBadge.jsx';

const statusStyles = {
  PENDING: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
};

const priorityStyles = {
  LOW: 'bg-blue-50 text-blue-600',
  MEDIUM: 'bg-orange-50 text-orange-600',
  HIGH: 'bg-red-50 text-red-600',
};

export const TaskCard = ({ task, weather, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 text-lg">{task.title}</h3>
        <div className="flex gap-1">
          <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-indigo-600 transition">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusStyles[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
      )}

      {task.due_date && (
        <p className="text-xs text-gray-500 mb-3">Due: {task.due_date}</p>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {task.location && (
          <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>{task.location}</span>
          </div>
        )}

        <WeatherBadge weather={weather} />

        {task.file_url && (
          <a
            href={task.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-600 hover:underline px-2.5 py-1 bg-indigo-50 rounded"
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Attachment</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
