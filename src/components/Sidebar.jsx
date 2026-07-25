import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Plus,
  Layout,
  Activity,
  UserPlus,
  Check,
  ChevronRight,
  X,
  Mail,
  ShieldCheck,
  Inbox,
  CheckCircle2,
  XCircle,
  Pencil,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

function Sidebar({
  workspaces = [],
  activeWorkspace,
  setActiveWorkspace,
  setWorkspaces,
  onWorkspaceCreated,
  boards = [],
  activeBoard,
  setActiveBoard,
  activeTab,
  setActiveTab,
  onCreateBoard,
  onInviteMember,
  invitations = [],
  onAcceptInvite,
  onRejectInvite,
  isOpen = false,
  onClose = () => {},
}) {
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  const [editingWorkspaceId, setEditingWorkspaceId] = useState(null);
  const [editWorkspaceName, setEditWorkspaceName] = useState("");
  const [isRenamingLoading, setIsRenamingLoading] = useState(false);

  const [inviteModalTab, setInviteModalTab] = useState("send");
  const [actionLoading, setActionLoading] = useState(false);

  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const dropdownRef = useRef(null);
  const isRestoredRef = useRef(false);

  const BACKEND_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (isRestoredRef.current) return;

    const savedTab = localStorage.getItem("app_activeTab");
    if (savedTab && setActiveTab) {
      setActiveTab(savedTab);
    }

    const savedWsId = localStorage.getItem("app_activeWorkspaceId");
    if (savedWsId && workspaces.length > 0 && setActiveWorkspace) {
      const matchWs = workspaces.find(
        (w) => String(w._id || w.id) === String(savedWsId),
      );
      if (matchWs) {
        setActiveWorkspace(matchWs);
      }
    }

    const savedBoardId = localStorage.getItem("app_activeBoardId");
    if (savedBoardId && boards.length > 0 && setActiveBoard) {
      const matchBoard = boards.find(
        (b) => String(b._id || b.id) === String(savedBoardId),
      );
      if (matchBoard) {
        setActiveBoard(matchBoard);
      }
      isRestoredRef.current = true;
    }
  }, [boards, workspaces]);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("app_activeTab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeBoard) {
      const bId = activeBoard._id || activeBoard.id;
      if (isRestoredRef.current || !localStorage.getItem("app_activeBoardId")) {
        localStorage.setItem("app_activeBoardId", String(bId));
      }
    }
  }, [activeBoard]);

  useEffect(() => {
    if (activeWorkspace) {
      const wId = activeWorkspace._id || activeWorkspace.id;
      localStorage.setItem("app_activeWorkspaceId", String(wId));
    }
  }, [activeWorkspace]);

  useEffect(() => {
    if (
      isInviteOpen &&
      invitations.length > 0 &&
      inviteModalTab !== "requests"
    ) {
      setInviteModalTab("requests");
    }
  }, [isInviteOpen, invitations.length, inviteModalTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsWorkspaceDropdownOpen(false);
        setEditingWorkspaceId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartRename = (e, ws) => {
    e.stopPropagation();
    setEditingWorkspaceId(ws._id || ws.id);
    setEditWorkspaceName(ws.name);
  };

  const handleSaveRename = async (e, wsId) => {
    e.stopPropagation();
    if (!editWorkspaceName.trim()) {
      toast.error("Workspace name cannot be empty!", { id: "rename-error" });
      return;
    }

    try {
      setIsRenamingLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${BACKEND_BASE}/api/workspaces/${wsId}`,
        { name: editWorkspaceName.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data?.success || res.status === 200) {
        toast.success("Workspace renamed!", { id: "rename-success" });
        const updatedName = editWorkspaceName.trim();

        if (setWorkspaces) {
          setWorkspaces((prevWs) =>
            prevWs.map((w) =>
              String(w._id || w.id) === String(wsId)
                ? { ...w, name: updatedName }
                : w,
            ),
          );
        }

        if (
          String(activeWorkspace?._id || activeWorkspace?.id) === String(wsId)
        ) {
          setActiveWorkspace((prev) => ({ ...prev, name: updatedName }));
        }

        setEditingWorkspaceId(null);
      }
    } catch (error) {
      console.error("Rename Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to rename workspace!",
        { id: "rename-error" },
      );
    } finally {
      setIsRenamingLoading(false);
    }
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingWorkspaceId(null);
  };

  const handleCreateWorkspaceSubmit = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      toast.error("Workspace name is required!", {
        id: "create-ws-error",
      });
      return;
    }

    try {
      setIsCreatingWorkspace(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BACKEND_BASE}/api/workspaces`,
        { name: newWorkspaceName.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const createdWorkspace = res.data?.workspace || res.data;

      if (createdWorkspace) {
        toast.success("Workspace created successfully!", {
          id: "create-ws-success",
        });

        if (setWorkspaces) {
          setWorkspaces((prev) => [...prev, createdWorkspace]);
        }
        if (setActiveWorkspace) {
          setActiveWorkspace(createdWorkspace);
        }

        if (onWorkspaceCreated) {
          onWorkspaceCreated(createdWorkspace);
        }

        setNewWorkspaceName("");
        setIsCreateWorkspaceOpen(false);
        setIsWorkspaceDropdownOpen(false);
      }
    } catch (error) {
      console.error("Create Workspace Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create workspace!",
        { id: "create-ws-error" },
      );
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleCreateBoardSubmit = (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) {
      toast.error("Board title is required!", { id: "create-board-error" });
      return;
    }
    if (onCreateBoard) {
      onCreateBoard(newBoardTitle.trim());
    }
    setNewBoardTitle("");
    setIsCreateBoardOpen(false);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error("Enter a valid email address!", { id: "invite-email-error" });
      return;
    }
    if (onInviteMember) {
      onInviteMember({ email: inviteEmail.trim(), role: inviteRole });
    }
    setInviteEmail("");
    setIsInviteOpen(false);
  };

  const handleAccept = async (invite) => {
    try {
      setActionLoading(true);
      if (onAcceptInvite) {
        await onAcceptInvite(invite);
        toast.success(
          `Joined workspace "${
            invite.workspaceName || invite.workspaceId?.name || "Workspace"
          }"!`,
          { id: `accept-invite-${invite._id || invite.id}` },
        );
      }
      if (invitations.length <= 1) {
        setIsInviteOpen(false);
      }
    } catch (err) {
      toast.error("Failed to accept invitation", { id: "accept-invite-error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (inviteId) => {
    try {
      setActionLoading(true);
      if (onRejectInvite) {
        await onRejectInvite(inviteId);
        toast.error("Invitation declined.", {
          id: `reject-invite-${inviteId}`,
        });
      }
      if (invitations.length <= 1) {
        setIsInviteOpen(false);
      }
    } catch (err) {
      toast.error("Failed to decline invitation", {
        id: "reject-invite-error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Component */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 w-72 lg:w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen lg:h-[calc(100vh-4rem)] select-none transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen
            ? "translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 pt-4 pb-1 border-b border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Menu
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Workspace Selector Dropdown */}
        <div
          className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 relative"
          ref={dropdownRef}
        >
          <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
            Current Workspace
          </label>
          <button
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-100 font-bold text-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                {activeWorkspace?.name
                  ? activeWorkspace.name[0].toUpperCase()
                  : "W"}
              </div>
              <span className="truncate">
                {activeWorkspace?.name || "Select Workspace"}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isWorkspaceDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isWorkspaceDropdownOpen && (
            <div className="absolute left-4 right-4 top-18 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <span className="text-[11px] font-semibold text-slate-400">
                  Switch Workspace
                </span>
                <button
                  onClick={() => {
                    setIsWorkspaceDropdownOpen(false);
                    setIsCreateWorkspaceOpen(true);
                  }}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>

              {workspaces.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400">
                  No workspaces available
                </div>
              ) : (
                workspaces.map((ws) => {
                  const wsId = ws._id || ws.id;
                  const isCurrentActive =
                    String(activeWorkspace?._id || activeWorkspace?.id) ===
                    String(wsId);
                  const isEditing = String(editingWorkspaceId) === String(wsId);

                  return (
                    <div
                      key={wsId}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center justify-between transition-colors cursor-pointer group"
                      onClick={() => {
                        if (!isEditing) {
                          setActiveWorkspace(ws);
                          setIsWorkspaceDropdownOpen(false);
                          onClose();
                        }
                      }}
                    >
                      {isEditing ? (
                        <div
                          className="flex items-center gap-1.5 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editWorkspaceName}
                            onChange={(e) =>
                              setEditWorkspaceName(e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(e, wsId);
                              if (e.key === "Escape") handleCancelRename(e);
                            }}
                            autoFocus
                            disabled={isRenamingLoading}
                            className="w-full text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-indigo-500 text-slate-900 dark:text-white focus:outline-none"
                          />
                          <button
                            onClick={(e) => handleSaveRename(e, wsId)}
                            disabled={isRenamingLoading}
                            className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded shrink-0"
                            title="Save Name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelRename}
                            disabled={isRenamingLoading}
                            className="p-1 bg-rose-500 hover:bg-rose-600 text-white rounded shrink-0"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="truncate pr-2">{ws.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => handleStartRename(e, ws)}
                              className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 transition-all"
                              title="Rename Workspace"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>

                            {isCurrentActive && (
                              <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* 2. Boards List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Boards ({boards.length})
              </span>
              <button
                onClick={() => setIsCreateBoardOpen(true)}
                className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Create New Board"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {boards.map((board) => {
                const currentBoardId = String(board._id || board.id);
                const selectedBoardId = activeBoard
                  ? String(activeBoard._id || activeBoard.id)
                  : null;

                const isActive =
                  activeTab === "board" && currentBoardId === selectedBoardId;

                return (
                  <button
                    key={currentBoardId}
                    onClick={() => {
                      localStorage.setItem("app_activeBoardId", currentBoardId);
                      setActiveBoard(board);
                      setActiveTab("board");
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Layout
                        className={`w-4 h-4 ${
                          isActive ? "text-white" : "text-slate-400"
                        }`}
                      />
                      <span className="truncate">{board.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Activity Stream Link */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block">
              Insights
            </span>
            <button
              onClick={() => {
                setActiveTab("activity");
                onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "activity"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Activity
                className={`w-4 h-4 ${
                  activeTab === "activity" ? "text-white" : "text-slate-400"
                }`}
              />
              <span>Activity Log</span>
            </button>
          </div>

          {/* 4. Team Members Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Team Members ({activeWorkspace?.members?.length || 0})
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="p-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer relative"
                  title="Invite Member & Requests"
                >
                  <UserPlus className="w-4 h-4" />
                  {invitations.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {activeWorkspace?.members?.map((member, idx) => {
                const memberUser = member.user || member;
                const name = memberUser.name || "Member";
                const role = member.role || "member";

                return (
                  <div
                    key={memberUser._id || idx}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] flex items-center justify-center border border-slate-300 dark:border-slate-700 shrink-0">
                        {name[0]?.toUpperCase()}
                      </div>
                      <span className="truncate">{name}</span>
                    </div>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                      {role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Modals */}
      {/* Create Workspace Modal */}
      {isCreateWorkspaceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsCreateWorkspaceOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Create New Workspace
            </h3>
            <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Team, Marketing"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  disabled={isCreatingWorkspace}
                />
              </div>
              <button
                type="submit"
                disabled={isCreatingWorkspace}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
              >
                {isCreatingWorkspace ? "Creating..." : "Create Workspace"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {isCreateBoardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsCreateBoardOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Create New Board
            </h3>
            <form onSubmit={handleCreateBoardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Board Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sprint 1, Launch Roadmap"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                Create Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsInviteOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3 pr-6">
              <button
                onClick={() => setInviteModalTab("send")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  inviteModalTab === "send"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                Send Invite
              </button>
              <button
                onClick={() => setInviteModalTab("requests")}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  inviteModalTab === "requests"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>Requests</span>
                {invitations.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
                    {invitations.length}
                  </span>
                )}
              </button>
            </div>

            {inviteModalTab === "send" ? (
              <div>
                <p className="text-xs text-slate-400 mb-4">
                  Send access link to collaborate on this workspace.
                </p>
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">
                      Workspace Role
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
                      >
                        <option value="member">Member (Can edit tasks)</option>
                        <option value="admin">Admin (Full Control)</option>
                        <option value="viewer">Viewer (Read-only)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    Send Invitation
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {invitations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">
                      No pending invitations
                    </p>
                  </div>
                ) : (
                  invitations.map((invite) => (
                    <div
                      key={invite._id || invite.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800"
                    >
                      <div className="truncate pr-2">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {invite.workspaceName ||
                            invite.workspaceId?.name ||
                            "Workspace Invite"}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          Invited by:{" "}
                          {invite.senderName ||
                            invite.senderEmail ||
                            invite.senderId?.name ||
                            "Admin"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleAccept(invite)}
                          className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                          title="Accept & Join Workspace"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReject(invite._id || invite.id)}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                          title="Decline"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
