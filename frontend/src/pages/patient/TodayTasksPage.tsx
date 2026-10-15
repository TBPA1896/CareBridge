import React, { useState, useEffect } from 'react';
import { taskApi } from '../../api/taskApi';
import { RecoveryTask, TodayTasksResponse } from '../../types/task';
import { Badge } from '../../components/common/Badge';
import { TaskLoggerModal } from '../../components/adherence/TaskLoggerModal';
import { CheckSquare, Filter, Clock, Pill, HeartPulse, Activity } from 'lucide-react';

export const TodayTasksPage: React.FC = () => {
  const [data, setData] = useState<TodayTasksResponse | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedTask, setSelectedTask] = useState<RecoveryTask | null>(null);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const res = await taskApi.getTodayTasks();
      setData(res);
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const tasks = data?.tasks || [];
  const filteredTasks = tasks.filter((t) => {
    if (categoryFilter === 'ALL') return true;
    return t.category === categoryFilter;
  });

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'LATE_COMPLETED':
        return <Badge variant="warning">Late Completed</Badge>;
      case 'MISSED':
        return <Badge variant="danger">Missed</Badge>;
      case 'NOT_COMPLETED':
        return <Badge variant="warning">Skipped</Badge>;
      default:
        return <Badge variant="info">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-navy-950">Today's Recovery Schedule</h2>
          <p className="text-xs text-slate-500">
            Date: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'MEDICATION', 'WOUND_CARE', 'DIET', 'ACTIVITY_RESTRICTION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
          No tasks found under this category filter today.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.scheduledTime}
                  </span>
                  {getTaskStatusBadge(task.status)}
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{task.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{task.description}</p>

                {task.instructions && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                    <span className="font-semibold text-slate-900">Physician Note:</span> {task.instructions}
                  </div>
                )}

                {task.actualReportedTime && (
                  <div className="mt-2 text-[11px] text-slate-400 font-mono">
                    Logged actual time: {task.actualReportedTime}
                    {task.reportedNotes && ` • Notes: ${task.reportedNotes}`}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setIsLoggerOpen(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    task.status === 'PENDING'
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {task.status === 'PENDING' ? 'Record Dose / Done' : 'Update Log'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TaskLoggerModal
        task={selectedTask}
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        onSuccess={loadTasks}
      />
    </div>
  );
};
