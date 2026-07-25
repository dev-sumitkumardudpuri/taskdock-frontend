import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import TopBar from "../components/Topbar";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import { socket } from "../socket";
import { LayoutGrid, Plus } from "lucide-react";

function Dashboard({ user, onLogout, onUserUpdate }) {
  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [invitations, setInvitations] = useState([]);

  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [isLoadingBoards, setIsLoadingBoards] = useState(true);

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("app_activeTab") || "board";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      }
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const fetchWorkspacesAndInvitations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoadingWorkspaces(false);
        return;
      }

      try {
        setIsLoadingWorkspaces(true);
        const headers = getAuthHeaders();
        // Fetch Workspaces
        const res = await axios.get(`${BACKEND_BASE}/api/workspaces`, headers);
        if (res.data.success && res.data.workspaces.length > 0) {
          const wsList = res.data.workspaces;
          setWorkspaces(wsList);

          const savedWsId = localStorage.getItem("app_activeWorkspaceId");
          const matchedWs = wsList.find(
            (w) => String(w._id || w.id) === String(savedWsId),
          );

          setActiveWorkspace(matchedWs || wsList[0]);
        }

        const inviteRes = await axios.get(
          `${BACKEND_BASE}/api/invitations/my-requests`,
          headers,
        );
        if (inviteRes.data.success) {
          setInvitations(inviteRes.data.invitations || []);
        }
      } catch (err) {
        toast.dismiss();
        toast.error("Failed to load initial workspace data", {
          id: "init-workspace-error",
        });
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };

    fetchWorkspacesAndInvitations();
  }, [BACKEND_BASE, getAuthHeaders]);

  useEffect(() => {
    if (!activeWorkspace) {
      setIsLoadingBoards(false);
      return;
    }

    localStorage.setItem(
      "app_activeWorkspaceId",
      String(activeWorkspace._id || activeWorkspace.id),
    );

    const fetchBoardsAndLogs = async () => {
      try {
        setIsLoadingBoards(true);
        const headers = getAuthHeaders();
        const boardRes = await axios.get(
          `${BACKEND_BASE}/api/workspaces/${activeWorkspace._id}/boards`,
          headers,
        );
        if (boardRes.data.success) {
          const fetchedBoards = boardRes.data.boards || [];
          setBoards(fetchedBoards);

          if (fetchedBoards.length > 0) {
            const savedBoardId = localStorage.getItem("app_activeBoardId");
            const matchedBoard = fetchedBoards.find(
              (b) => String(b._id || b.id) === String(savedBoardId),
            );

            setActiveBoard(matchedBoard || fetchedBoards[0]);
          } else {
            setActiveBoard(null);
            setTasks([]);
          }
        }

        const logRes = await axios.get(
          `${BACKEND_BASE}/api/tasks/activity/${activeWorkspace._id}`,
          headers,
        );
        if (logRes.data.success) {
          setActivityLogs(logRes.data.logs || []);
        }
      } catch (err) {
        toast.dismiss();
        toast.error("Error loading workspace boards", {
          id: "boards-load-error",
        });
      } finally {
        setIsLoadingBoards(false);
      }
    };

    fetchBoardsAndLogs();
  }, [activeWorkspace, BACKEND_BASE, getAuthHeaders]);

  useEffect(() => {
    if (!activeBoard) return;

    localStorage.setItem(
      "app_activeBoardId",
      String(activeBoard._id || activeBoard.id),
    );

    const fetchTasks = async () => {
      try {
        const headers = getAuthHeaders();
        const res = await axios.get(
          `${BACKEND_BASE}/api/tasks/board/${activeBoard._id}`,
          headers,
        );
        if (res.data.success) {
          setTasks(res.data.tasks || []);
        }
      } catch (err) {
        toast.dismiss();
        toast.error("Failed to load board tasks", {
          id: "tasks-load-error",
        });
      }
    };

    fetchTasks();

    socket.emit("JOIN_BOARD", { boardId: activeBoard._id });

    const handleTaskCreated = (newTask) => {
      if (newTask.boardId === activeBoard._id) {
        setTasks((prev) => [...prev, newTask]);
      }
    };

    const handleTaskUpdated = (updatedTask) => {
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === (updatedTask._id || updatedTask.id)
            ? updatedTask
            : t,
        ),
      );
    };

    const handleTaskMoved = ({ taskId, newColumnName, newPosition }) => {
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === taskId
            ? { ...t, columnName: newColumnName, position: newPosition }
            : t,
        ),
      );
    };

    const handleTaskDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
    };

    const handleNewActivity = (newLog) => {
      setActivityLogs((prev) => [newLog, ...prev]);
    };

    socket.on("TASK_CREATED", handleTaskCreated);
    socket.on("TASK_UPDATED", handleTaskUpdated);
    socket.on("TASK_MOVED", handleTaskMoved);
    socket.on("TASK_DELETED", handleTaskDeleted);
    socket.on("NEW_ACTIVITY_LOG", handleNewActivity);

    return () => {
      socket.emit("LEAVE_BOARD", { boardId: activeBoard._id });
      socket.off("TASK_CREATED", handleTaskCreated);
      socket.off("TASK_UPDATED", handleTaskUpdated);
      socket.off("TASK_MOVED", handleTaskMoved);
      socket.off("TASK_DELETED", handleTaskDeleted);
      socket.off("NEW_ACTIVITY_LOG", handleNewActivity);
    };
  }, [activeBoard, BACKEND_BASE, getAuthHeaders]);

  const handleAddTask = async ({ title, columnName }) => {
    if (!activeBoard || !activeWorkspace) return;
    try {
      await axios.post(
        `${BACKEND_BASE}/api/tasks`,
        {
          title,
          columnName,
          boardId: activeBoard._id,
          workspaceId: activeWorkspace._id,
        },
        getAuthHeaders(),
      );
      toast.dismiss();
      toast.success("Task created!", { id: "global-dashboard-toast" });
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to create task", {
        id: "global-dashboard-toast",
      });
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === taskId ? { ...t, ...data } : t)),
    );

    try {
      await axios.put(
        `${BACKEND_BASE}/api/tasks/${taskId}`,
        { ...data, workspaceId: activeWorkspace?._id },
        getAuthHeaders(),
      );
      toast.dismiss();
      toast.success("Task updated!", { id: "global-dashboard-toast" });
    } catch (err) {
      setTasks(previousTasks);
      toast.dismiss();
      toast.error("Failed to update task", { id: "global-dashboard-toast" });
    }
  };

  const handleMoveTask = async (taskId, targetColumn) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        (t._id || t.id) === taskId ? { ...t, columnName: targetColumn } : t,
      ),
    );

    try {
      await axios.put(
        `${BACKEND_BASE}/api/tasks/${taskId}`,
        {
          columnName: targetColumn,
          workspaceId: activeWorkspace?._id,
        },
        getAuthHeaders(),
      );
    } catch (err) {
      setTasks(previousTasks);
      toast.dismiss();
      toast.error("Failed to move task", { id: "global-dashboard-toast" });
    }
  };

  const handleDeleteTask = async (taskId) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));

    try {
      await axios.delete(`${BACKEND_BASE}/api/tasks/${taskId}`, {
        ...getAuthHeaders(),
        data: { workspaceId: activeWorkspace?._id },
      });
      toast.dismiss();
      toast.success("Task deleted", { id: "global-dashboard-toast" });
    } catch (err) {
      setTasks(previousTasks);
      toast.dismiss();
      toast.error("Failed to delete task", { id: "global-dashboard-toast" });
    }
  };

  const handleCreateBoard = async (title) => {
    if (!activeWorkspace) return;
    try {
      const res = await axios.post(
        `${BACKEND_BASE}/api/workspaces/boards`,
        { title, workspaceId: activeWorkspace._id },
        getAuthHeaders(),
      );
      if (res.data.success) {
        setBoards((prev) => [...prev, res.data.board]);
        setActiveBoard(res.data.board);
        toast.dismiss();
        toast.success("Board created!", { id: "global-dashboard-toast" });
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to create board", { id: "global-dashboard-toast" });
    }
  };

  const handleWorkspaceCreated = (newWorkspace) => {
    setWorkspaces((prev) => {
      const exists = prev.some(
        (w) =>
          String(w._id || w.id) === String(newWorkspace._id || newWorkspace.id),
      );
      if (exists) return prev;
      return [...prev, newWorkspace];
    });
    setActiveWorkspace(newWorkspace);
    setBoards([]);
    setActiveBoard(null);
    setTasks([]);
  };

  const handleInviteMember = async ({ email, role }) => {
    if (!activeWorkspace) {
      toast.dismiss();
      toast.error("No active workspace selected!", {
        id: "global-dashboard-toast",
      });
      return;
    }
    try {
      const res = await axios.post(
        `${BACKEND_BASE}/api/invitations/send`,
        {
          email,
          workspaceId: activeWorkspace._id,
          role: role || "member",
        },
        getAuthHeaders(),
      );
      if (res.data.success) {
        toast.dismiss();
        toast.success(`Invitation sent to ${email}`, {
          id: "global-dashboard-toast",
        });
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Failed to send invitation", {
        id: "global-dashboard-toast",
      });
    }
  };

  const handleAcceptInvite = async (invite) => {
    try {
      const res = await axios.post(
        `${BACKEND_BASE}/api/invitations/${invite._id}/accept`,
        {},
        getAuthHeaders(),
      );

      if (res.data.success) {
        toast.dismiss();
        toast.success(
          `Joined workspace: ${invite.workspaceName || "Workspace"}`,
          { id: "global-dashboard-toast" },
        );
        setInvitations((prev) =>
          prev.filter((item) => item._id !== invite._id),
        );

        if (res.data.workspace) {
          const newWorkspace = res.data.workspace;
          setWorkspaces((prev) => [...prev, newWorkspace]);
          setActiveWorkspace(newWorkspace);
        }
      }
    } catch (err) {
      toast.dismiss();
      toast.error(
        err.response?.data?.message || "Failed to accept invitation",
        { id: "global-dashboard-toast" },
      );
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      const res = await axios.post(
        `${BACKEND_BASE}/api/invitations/${inviteId}/reject`,
        {},
        getAuthHeaders(),
      );

      if (res.data.success) {
        toast.dismiss();
        toast.error("Invitation declined", { id: "global-dashboard-toast" });
        setInvitations((prev) => prev.filter((item) => item._id !== inviteId));
      }
    } catch (err) {
      toast.dismiss();
      toast.error(
        err.response?.data?.message || "Failed to decline invitation",
        { id: "global-dashboard-toast" },
      );
    }
  };

  const isPageLoading = isLoadingWorkspaces || isLoadingBoards;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans">
      <TopBar
        user={user}
        onLogout={onLogout}
        onUserUpdate={onUserUpdate}
        currentWorkspaceName={activeWorkspace?.name}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          workspaces={workspaces}
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
          setWorkspaces={setWorkspaces}
          onWorkspaceCreated={handleWorkspaceCreated}
          boards={boards}
          activeBoard={activeBoard}
          setActiveBoard={setActiveBoard}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCreateBoard={handleCreateBoard}
          onInviteMember={handleInviteMember}
          invitations={invitations}
          onAcceptInvite={handleAcceptInvite}
          onRejectInvite={handleRejectInvite}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {activeTab === "board" ? (
            isPageLoading ? (
              <div className="w-full h-full space-y-6 animate-pulse">
                <div className="flex justify-between items-center pb-2">
                  <div className="h-7 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                  <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((col) => (
                    <div
                      key={col}
                      className="bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-4 space-y-4 min-h-112.5"
                    >
                      <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                      <div className="h-28 bg-white dark:bg-slate-800/60 rounded-2xl"></div>
                      <div className="h-20 bg-white dark:bg-slate-800/60 rounded-2xl"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeBoard ? (
              <KanbanBoard
                board={activeBoard}
                tasks={tasks}
                members={activeWorkspace?.members || []}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onMoveTask={handleMoveTask}
                onDeleteTask={handleDeleteTask}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 mb-4">
                  <LayoutGrid className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  No Active Boards Found
                </h2>
                <p className="text-xs text-slate-400 max-w-sm mb-6">
                  Create a new board in this workspace to start organizing your
                  team tasks.
                </p>
                <button
                  onClick={() => {
                    const name = prompt("Enter board name:");
                    if (name && name.trim()) handleCreateBoard(name.trim());
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Create First Board
                </button>
              </div>
            )
          ) : (
            <div className="max-w-3xl mx-auto space-y-4 py-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">
                Workspace Audit & Activity History
              </h2>
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">
                  No activity history found.
                </p>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log._id || log.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {log.performedBy?.name || "Team Member"}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 ml-2">
                        {log.action}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt || Date.now()).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
