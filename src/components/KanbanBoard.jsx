import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter,
  Calendar,
  CheckSquare,
  User,
  ArrowRightLeft,
  X,
  Layout,
  ChevronDown,
  Check,
} from "lucide-react";
import TaskModal from "./TaskModal";

const getInitials = (name = "") => (name ? name[0].toUpperCase() : "U");

const getColumnName = (col) => {
  if (!col) return "";
  if (typeof col === "string") return col;
  return col.name || col.title || col._id || "Column";
};

const getColumnKey = (col, index) => {
  if (!col) return `col-${index}`;
  if (typeof col === "string") return col;
  return col._id || col.id || col.name || `col-${index}`;
};

function KanbanBoard({
  board,
  tasks = [],
  members = [],
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) {
  const [columns, setColumns] = useState(["To Do", "In Progress", "Done"]);
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState({});
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Modal State
  const [isAddColModalOpen, setIsAddColModalOpen] = useState(false);
  const [newColumnNameInput, setNewColumnNameInput] = useState("");

  // Popover States for Custom Card Menus
  const [activePriorityMenuId, setActivePriorityMenuId] = useState(null);
  const [activeColumnMenuId, setActiveColumnMenuId] = useState(null);

  useEffect(() => {
    if (board && Array.isArray(board.columns) && board.columns.length > 0) {
      setColumns(board.columns);
    } else {
      setColumns(["To Do", "In Progress", "Done"]);
    }
  }, [board]);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeMembers = Array.isArray(members) ? members : [];

  const filteredTasks = safeTasks.filter((t) => {
    if (!t) return false;
    if (filterPriority === "ALL") return true;
    return (t.priority || "").toLowerCase() === filterPriority.toLowerCase();
  });

  const handleCreateTask = (colName) => {
    const title = newTaskTitle[colName];
    if (!title || !title.trim()) return;
    if (onAddTask) {
      onAddTask({
        title: title.trim(),
        columnName: colName,
        boardId: board?._id || board?.id,
      });
    }
    setNewTaskTitle({ ...newTaskTitle, [colName]: "" });
  };

  const handleAddColumnSubmit = (e) => {
    e.preventDefault();
    if (!newColumnNameInput || !newColumnNameInput.trim()) return;

    const cleanName = newColumnNameInput.trim();
    const existingNames = columns.map((c) => getColumnName(c).toLowerCase());

    if (!existingNames.includes(cleanName.toLowerCase())) {
      setColumns([...columns, cleanName]);
    }
    setNewColumnNameInput("");
    setIsAddColModalOpen(false);
  };

  const handleColumnChange = (taskId, newColName) => {
    if (onMoveTask) {
      onMoveTask(taskId, newColName);
    } else if (onUpdateTask) {
      onUpdateTask(taskId, { columnName: newColName });
    }
    setActiveColumnMenuId(null);
  };

  const handlePriorityChange = (taskId, newPriority) => {
    if (onUpdateTask) {
      onUpdateTask(taskId, { priority: newPriority });
    }
    setActivePriorityMenuId(null);
  };

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnName) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;

    if (!taskId) return;

    const taskToMove = safeTasks.find((t) => t && (t._id || t.id) === taskId);
    if (taskToMove && taskToMove.columnName !== targetColumnName) {
      handleColumnChange(taskId, targetColumnName);
    }
    setDraggedTaskId(null);
  };

  return (
    <div
      className="flex flex-col h-full select-none w-full max-w-7xl mx-auto px-2 sm:px-6"
      onClick={() => {
        setActivePriorityMenuId(null);
        setActiveColumnMenuId(null);
      }}
    >
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            {board?.title || "Project Kanban"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage tasks, update status, and organize workflows smoothly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Pill Filters */}
          <div className="flex items-center bg-slate-200/50 dark:bg-slate-800/60 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-md">
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-slate-500 dark:text-slate-400 text-xs font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Priority:</span>
            </div>

            {[
              { id: "ALL", label: "All" },
              { id: "high", label: "High" },
              { id: "medium", label: "Med" },
              { id: "low", label: "Low" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPriority(p.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterPriority === p.id
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Columns Area */}
      <div className="w-full overflow-x-auto pb-6 custom-scrollbar">
        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 justify-start md:justify-center items-start min-w-full w-max md:w-full">
          {columns.map((col, index) => {
            const colName = getColumnName(col);
            const colKey = getColumnKey(col, index);

            const colTasks = filteredTasks.filter(
              (t) => t && t.columnName === colName,
            );

            return (
              <div
                key={colKey}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, colName)}
                className="bg-slate-100/70 dark:bg-slate-900/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col max-h-150 h-fit transition-all w-[82vw] max-w-[320px] sm:w-75 md:w-full snap-center shrink-0"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3.5 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {colName}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 overflow-y-auto flex-1 min-h-30 max-h-115 pr-1 custom-scrollbar">
                  {colTasks.map((task) => {
                    if (!task) return null;
                    const taskId = task._id || task.id;

                    const priorityKey = (
                      task.priority || "medium"
                    ).toLowerCase();
                    const priorityStyles = {
                      high: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20",
                      medium:
                        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
                      low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
                    };

                    let assigneeName = null;
                    if (task.assignedTo) {
                      if (typeof task.assignedTo === "object") {
                        assigneeName =
                          task.assignedTo.name || task.assignedTo.email;
                      } else if (typeof task.assignedTo === "string") {
                        const matchedMember = safeMembers.find((m) => {
                          if (!m) return false;
                          const u = m.user || m;
                          return (u._id || u.id) === task.assignedTo;
                        });
                        if (matchedMember) {
                          const u = matchedMember.user || matchedMember;
                          assigneeName = u.name || u.email;
                        }
                      }
                    }

                    return (
                      <div
                        key={taskId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, taskId)}
                        onClick={() => setSelectedTask(task)}
                        className={`w-full p-3.5 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing group relative flex flex-col justify-between min-h-27.5 ${
                          draggedTaskId === taskId ? "opacity-40 scale-95" : ""
                        }`}
                      >
                        {/* Top Header: Priority Badge Custom Dropdown & Actions */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {/* Priority Selector Trigger */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePriorityMenuId(
                                  activePriorityMenuId === taskId
                                    ? null
                                    : taskId,
                                );
                                setActiveColumnMenuId(null);
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                                priorityStyles[priorityKey] ||
                                priorityStyles.medium
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  priorityKey === "high"
                                    ? "bg-rose-500"
                                    : priorityKey === "low"
                                      ? "bg-emerald-500"
                                      : "bg-amber-500"
                                }`}
                              />
                              <span>{task.priority || "medium"}</span>
                              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                            </button>

                            {/* Priority Custom Popover */}
                            {activePriorityMenuId === taskId && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute left-0 top-full mt-1.5 z-30 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100"
                              >
                                {[
                                  {
                                    id: "low",
                                    label: "Low Priority",
                                    color: "bg-emerald-500",
                                  },
                                  {
                                    id: "medium",
                                    label: "Medium",
                                    color: "bg-amber-500",
                                  },
                                  {
                                    id: "high",
                                    label: "High Priority",
                                    color: "bg-rose-500",
                                  },
                                ].map((p) => (
                                  <button
                                    key={p.id}
                                    onClick={() =>
                                      handlePriorityChange(taskId, p.id)
                                    }
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                      priorityKey === p.id
                                        ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span
                                        className={`w-2 h-2 rounded-full ${p.color}`}
                                      />
                                      <span className="capitalize">{p.id}</span>
                                    </span>
                                    {priorityKey === p.id && (
                                      <Check className="w-3.5 h-3.5 shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Column Switcher Custom Menu Button */}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveColumnMenuId(
                                  activeColumnMenuId === taskId ? null : taskId,
                                );
                                setActivePriorityMenuId(null);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                              title="Move Task"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Column Selector Popover */}
                            {activeColumnMenuId === taskId && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1.5 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
                              >
                                <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                                  Move to Column
                                </div>
                                {columns.map((c) => {
                                  const cn = getColumnName(c);
                                  const isCurrent = task.columnName === cn;
                                  return (
                                    <button
                                      key={cn}
                                      onClick={() =>
                                        handleColumnChange(taskId, cn)
                                      }
                                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg text-left transition-colors cursor-pointer ${
                                        isCurrent
                                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                      }`}
                                    >
                                      <span className="truncate">{cn}</span>
                                      {isCurrent && (
                                        <Check className="w-3.5 h-3.5 shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div className="my-auto py-0.5">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">
                            {task.title || "Untitled Task"}
                          </p>

                          {task.description && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-1 font-normal">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Footer Section */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="flex items-center gap-1">
                            {task.dueDate ? (
                              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium text-[9px]">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {new Date(task.dueDate).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-400 text-[9px]">
                                <CheckSquare className="w-3 h-3 text-slate-300 dark:text-slate-600" />{" "}
                                Ready
                              </span>
                            )}
                          </div>

                          {/* Member Avatar */}
                          {assigneeName ? (
                            <div
                              title={`Assigned to ${assigneeName}`}
                              className="w-5 h-5 rounded-full bg-linear-to-tr from-indigo-600 to-violet-500 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs"
                            >
                              {getInitials(assigneeName)}
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                              <User className="w-3 h-3 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Add Task Field */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80">
                  <input
                    type="text"
                    placeholder="+ Add task..."
                    value={newTaskTitle[colName] || ""}
                    onChange={(e) =>
                      setNewTaskTitle({
                        ...newTaskTitle,
                        [colName]: e.target.value,
                      })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateTask(colName)
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-2xs transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          members={safeMembers}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(id, data) => {
            if (onUpdateTask) onUpdateTask(id, data);
            setSelectedTask(null);
          }}
          onDelete={(id) => {
            if (onDeleteTask) onDeleteTask(id);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

export default KanbanBoard;
