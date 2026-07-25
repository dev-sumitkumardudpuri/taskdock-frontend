import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Trash2,
  Calendar,
  Save,
  UserCheck,
  AlignLeft,
  ChevronDown,
  Check,
  Flag,
  User,
} from "lucide-react";

const getInitials = (name = "") => (name ? name[0].toUpperCase() : "U");

function TaskModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  members = [],
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const assigneeDropdownRef = useRef(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority((task.priority || "medium").toLowerCase());

      const assignedId = task.assignedTo?._id || task.assignedTo || "";
      setAssignedTo(assignedId);

      if (task.dueDate) {
        try {
          const formattedDate = new Date(task.dueDate)
            .toISOString()
            .split("T")[0];
          setDueDate(formattedDate);
        } catch (e) {
          setDueDate("");
        }
      } else {
        setDueDate("");
      }
    }
  }, [task]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(e.target)
      ) {
        setIsAssigneeOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    const updatedPayload = {
      title: title.trim() || task.title,
      description: description.trim(),
      priority: priority.toLowerCase(),
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
    };

    onUpdate(task._id || task.id, updatedPayload);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task._id || task.id);
    onClose();
  };

  const selectedMember = members.find((m) => {
    const u = m.user || m;
    return (u._id || u.id) === assignedTo;
  });
  const selectedUserName = selectedMember
    ? (selectedMember.user || selectedMember).name ||
      (selectedMember.user || selectedMember).email
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full uppercase tracking-wider truncate max-w-45 sm:max-w-none border border-indigo-100 dark:border-indigo-900/40">
              {task.columnName || "Task Details"}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={handleDelete}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Task Form Content */}
        <div className="mt-4 space-y-5 overflow-y-auto custom-scrollbar pr-1 flex-1">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full p-3 text-xs sm:text-sm font-bold rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Priority Pill Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-indigo-500" /> Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100/70 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              {[
                {
                  id: "low",
                  label: "Low",
                  badge: "bg-emerald-500",
                  active:
                    "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs",
                },
                {
                  id: "medium",
                  label: "Medium",
                  badge: "bg-amber-500",
                  active:
                    "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs",
                },
                {
                  id: "high",
                  label: "High",
                  badge: "bg-rose-500",
                  active:
                    "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs",
                },
              ].map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPriority(p.id)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? p.active
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.badge}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Custom Assignee Dropdown */}
            <div className="relative" ref={assigneeDropdownRef}>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> Assign To
              </label>

              <button
                type="button"
                onClick={() => setIsAssigneeOpen(!isAssigneeOpen)}
                className="w-full p-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 flex items-center justify-between transition-all hover:bg-slate-100/80 dark:hover:bg-slate-800/80 cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  {selectedUserName ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                        {getInitials(selectedUserName)}
                      </div>
                      <span className="truncate">{selectedUserName}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0">
                        <User className="w-3 h-3" />
                      </div>
                      <span className="text-slate-400">Unassigned</span>
                    </>
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Custom Popover Options List */}
              {isAssigneeOpen && (
                <div className="absolute left-0 top-full mt-1.5 z-40 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignedTo("");
                      setIsAssigneeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      !assignedTo
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center">
                        <User className="w-3 h-3" />
                      </div>
                      <span>Unassigned</span>
                    </span>
                    {!assignedTo && <Check className="w-3.5 h-3.5" />}
                  </button>

                  {members.map((m, idx) => {
                    const u = m.user || m;
                    const userId = u._id || u.id || idx;
                    const isSelected = assignedTo === userId;
                    const name = u.name || u.email || "Workspace Member";

                    return (
                      <button
                        type="button"
                        key={userId}
                        onClick={() => {
                          setAssignedTo(userId);
                          setIsAssigneeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors mt-0.5 ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                            {getInitials(name)}
                          </div>
                          <span className="truncate">{name}</span>
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modern Due Date Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Target Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-2xs"
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-500" /> Description
              / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add detailed task notes or sub-tasks..."
              className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none shadow-2xs"
            />
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20 transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
