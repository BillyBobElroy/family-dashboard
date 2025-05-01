'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseUser } from '@/hook/useFirebaseUser';
import { AddTaskModal } from '@/components/tasks/AddTaskModal';
import { EditTaskModal } from '@/components/tasks/EditTaskModal';
import { formatDistanceToNowStrict, isBefore } from 'date-fns';
import type { Task } from '@/types/task';

type Member = {
  id: string;
  displayName: string;
  color?: string;
};

type MemberProgress = {
  [memberId: string]: {
    completed: number;
    total: number;
  };
};

const categoryLabels: { [key: string]: string } = {
  morning: '🌅 Morning',
  evening: '🌙 Evening',
  chores: '🧹 Chores',
  school: '🎒 School',
  other: '📦 Other',
};

export default function TaskDashboardPage() {
  const { user } = useFirebaseUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState<MemberProgress>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<{ [taskId: string]: boolean }>({});

  const loadData = useCallback(async () => {
    if (!user?.familyId) return;

    const membersSnap = await getDocs(collection(db, `families/${user.familyId}/members`));
    const memberList: Member[] = membersSnap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Member, 'id'>),
    }));
    setMembers(memberList);

    const tasksSnap = await getDocs(collection(db, `families/${user.familyId}/tasks`));
    const taskList: Task[] = tasksSnap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Task, 'id'>),
    }));
    setTasks(taskList);

    const today = new Date().toISOString().split('T')[0];
    const progressMap: MemberProgress = {};
    for (const member of memberList) {
      const todaysTasks = taskList.filter(t =>
        t.assignedTo === member.id && t.dueDate === today
      );
      const completed = todaysTasks.filter(t => t.completed).length;
      progressMap[member.id] = {
        total: todaysTasks.length,
        completed,
      };
    }
    setProgress(progressMap);
  }, [user?.familyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleTaskComplete = async (task: Task) => {
    if (!user?.familyId) return;

    await updateDoc(doc(db, `families/${user.familyId}/tasks/${task.id}`), {
      completed: !task.completed,
    });

    const updatedTasks = tasks.map(t =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updatedTasks);

    const updatedProgress = { ...progress };
    const isToday = task.dueDate === new Date().toISOString().split('T')[0];
    if (isToday) {
      const p = updatedProgress[task.assignedTo] || { completed: 0, total: 0 };
      updatedProgress[task.assignedTo] = {
        ...p,
        completed: task.completed ? p.completed - 1 : p.completed + 1,
      };
      setProgress(updatedProgress);
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.time) return false;
    const dueDateTime = new Date(`${task.dueDate}T${task.time}`);
    return !task.completed && isBefore(dueDateTime, new Date());
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tasks</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={() => setHideCompleted(prev => !prev)}
          />
          Hide Completed
        </label>
      </div>

      <div className="flex gap-6 overflow-auto pb-6">
        {members.map(member => {
          const memberTasks = tasks
            .filter(t => t.assignedTo === member.id)
            .filter(t => !hideCompleted || !t.completed)
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

          const prog = progress[member.id] || { total: 0, completed: 0 };
          const initial = member.displayName?.charAt(0).toUpperCase() || '?';

          return (
            <div key={member.id} className="w-72 shrink-0 bg-white rounded-xl p-4 shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full text-white font-semibold text-sm flex items-center justify-center"
                    style={{ backgroundColor: member.color || '#3B82F6' }}
                  >
                    {initial}
                  </div>
                  <span className="font-semibold">{member.displayName || 'Unnamed'}</span>
                </div>
                <span className="text-sm text-gray-500">{prog.completed}/{prog.total}</span>
              </div>

              <div className="space-y-2">
                {memberTasks.map(task => {
                  const overdue = isOverdue(task);
                  const priorityDot = {
                    high: 'bg-red-500',
                    medium: 'bg-yellow-400',
                    low: 'bg-green-500',
                  }[task.priority || 'medium'];

                  const checklist = task.checklist || [];
                  const checkedCount = checklist.filter(item => item.checked).length;

                  return (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="w-full text-left"
                    >
                      <div className="bg-gray-50 border rounded px-3 py-2 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${priorityDot}`} />
                            <p className="font-medium text-sm">{task.title}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleTaskComplete(task);
                            }}
                            className="w-4 h-4"
                          />
                        </div>

                        <div className="text-xs text-gray-600 flex justify-between items-center">
                          <span>
                            {task.time && new Date(`1970-01-01T${task.time}`).toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                            {task.repeat && ` • ${task.repeat}`}
                          </span>
                          {overdue && (
                            <span className="text-red-500 font-medium">
                              {formatDistanceToNowStrict(
                                new Date(`${task.dueDate}T${task.time}`),
                                { addSuffix: true }
                              )}
                            </span>
                          )}
                        </div>

                        {task.category && categoryLabels[task.category] && (
                          <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 w-fit">
                            {categoryLabels[task.category]}
                          </span>
                        )}

                        {checklist.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            ✅ {checkedCount}/{checklist.length} checklist items complete
                          </p>
                        )}

                        {task.notes && (
                          <div className="text-xs text-gray-700 mt-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedNotes(prev => ({
                                  ...prev,
                                  [task.id]: !prev[task.id],
                                }));
                              }}
                              className="text-blue-500 hover:underline mb-1"
                            >
                              {expandedNotes[task.id] ? 'Hide Notes' : 'Show Notes'}
                            </button>
                            {expandedNotes[task.id] && (
                              <div className="bg-white p-2 border rounded text-sm whitespace-pre-wrap">
                                {task.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg text-3xl flex items-center justify-center hover:bg-blue-700 transition"
        aria-label="Add Task"
      >
        +
      </button>

      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onTaskAdded={loadData}
        />
      )}

      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={loadData}
        />
      )}
    </div>
  );
}
