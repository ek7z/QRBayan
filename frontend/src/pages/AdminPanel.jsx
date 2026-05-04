import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/ToastProvider";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Coins,
  Eye,
  Gift,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(
  /\/api\/?$/,
  "",
);

const statusStyles = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  approved: "border-green-500/20 bg-green-500/10 text-green-200",
  rejected: "border-red-500/20 bg-red-500/10 text-red-200",
};

const formatDate = (value) => {
  if (!value) return "Never";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "Never";

  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const AdminPanel = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("proofs");
  const [proofs, setProofs] = useState([]);
  const [taskSubmissions, setTaskSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingProofs, setLoadingProofs] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [selectedProof, setSelectedProof] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofNotes, setProofNotes] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantForm, setGrantForm] = useState({
    userId: "",
    amount: "",
    notes: "",
  });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    await Promise.all([fetchPendingProofs(), fetchPendingTasks(), fetchUsers()]);
  };

  const fetchPendingProofs = async () => {
    setLoadingProofs(true);
    setError("");
    try {
      const response = await api.get("/credits/admin/pending-proofs");
      setProofs(response.data.data || []);
    } catch (err) {
      setError("Failed to load pending reviews.");
      showToast({
        type: "error",
        title: "Could not load proofs",
        message: err.response?.data?.message || "Please refresh and try again.",
      });
    } finally {
      setLoadingProofs(false);
    }
  };

  const fetchPendingTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await api.get("/admin/task-submissions");
      setTaskSubmissions(response.data.data || []);
    } catch (err) {
      showToast({
        type: "error",
        title: "Could not load tasks",
        message: err.response?.data?.message || "Task review list is unavailable.",
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get("/admin/users");
      setUsers(response.data.data || []);
    } catch (err) {
      showToast({
        type: "error",
        title: "Could not load users",
        message: err.response?.data?.message || "Admin user list is unavailable.",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const requestProofAction = (type, proof) => {
    if (type === "reject" && !proofNotes.trim()) {
      showToast({
        type: "error",
        title: "Notes required",
        message: "Add a rejection reason before rejecting this proof.",
      });
      return;
    }

    setPendingAction({ kind: "proof", type, item: proof });
  };

  const requestTaskAction = (type, task) => {
    if (type === "reject" && !taskNotes.trim()) {
      showToast({
        type: "error",
        title: "Notes required",
        message: "Add a rejection reason before rejecting this task claim.",
      });
      return;
    }

    setPendingAction({ kind: "task", type, item: task });
  };

  const closeActionDialog = () => {
    if (!actionLoading) {
      setPendingAction(null);
    }
  };

  const handlePendingAction = async () => {
    if (!pendingAction) return;

    const { kind, type, item } = pendingAction;
    const isApprove = type === "approve";
    const notes = kind === "proof" ? proofNotes : taskNotes;
    const route =
      kind === "proof"
        ? `/credits/admin/${isApprove ? "approve-proof" : "reject-proof"}/${item.id}`
        : `/admin/task-submissions/${item.id}/${isApprove ? "approve" : "reject"}`;

    setActionLoading(true);
    try {
      await api.post(route, { notes });

      if (kind === "proof") {
        setProofs((current) => current.filter((proof) => proof.id !== item.id));
        setSelectedProof(null);
        setProofNotes("");
      } else {
        setTaskSubmissions((current) =>
          current.filter((submission) => submission.id !== item.id),
        );
        setSelectedTask(null);
        setTaskNotes("");
      }

      setPendingAction(null);
      await fetchUsers();

      showToast({
        type: "success",
        title: isApprove ? "Review approved" : "Review rejected",
        message:
          kind === "proof"
            ? isApprove
              ? "Credits were added from the payment proof."
              : "The payment proof was rejected."
            : isApprove
              ? "The free task reward was approved and credited."
              : "The free task submission was rejected.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Action failed",
        message: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantCredits = async (event) => {
    event.preventDefault();

    if (!grantForm.userId || !grantForm.amount) {
      showToast({
        type: "error",
        title: "Missing details",
        message: "Select a user and enter the credit amount.",
      });
      return;
    }

    setGrantLoading(true);
    try {
      await api.post(`/admin/users/${grantForm.userId}/credits`, {
        amount: Number(grantForm.amount),
        notes: grantForm.notes,
      });

      setGrantForm({ userId: "", amount: "", notes: "" });
      await fetchUsers();
      showToast({
        type: "success",
        title: "Credits granted",
        message: "The user's balance was updated successfully.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Grant failed",
        message: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setGrantLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) =>
      [user.email, user.role, String(user.id)].some((value) =>
        value?.toLowerCase().includes(query),
      ),
    );
  }, [userSearch, users]);

  const userStats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      credits: users.reduce((sum, user) => sum + Number(user.balance || 0), 0),
    }),
    [users],
  );

  const pendingReviewCount = proofs.length + taskSubmissions.length;
  const loadingAny = loadingProofs || loadingTasks || loadingUsers;
  const getImageUrl = (path) => `${apiOrigin}/${path.replace(/\\/g, "/")}`;

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin workspace
          </div>
          <h1 className="text-3xl font-bold text-white">Admin panel</h1>
          <p className="mt-2 text-sm text-slate-400">
            Review top-ups, approve free task claims, and manage user credits.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          disabled={loadingAny}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loadingAny ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
          <p className="text-xs text-slate-400">Pending reviews</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {pendingReviewCount}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
          <p className="text-xs text-slate-400">Registered users</p>
          <p className="mt-1 text-2xl font-semibold text-white">{userStats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
          <p className="text-xs text-slate-400">Total active credits</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {formatNumber(userStats.credits)}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5">
        <button
          type="button"
          onClick={() => setActiveTab("proofs")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
            activeTab === "proofs"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Clock className="h-4 w-4" />
          Payment proofs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
            activeTab === "tasks"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Gift className="h-4 w-4" />
          Free tasks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
            activeTab === "users"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          Users
        </button>
      </div>

      {activeTab === "proofs" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-800 p-3 text-indigo-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Pending proofs</h2>
                <p className="text-sm text-slate-400">
                  Review top-up submissions waiting for approval.
                </p>
              </div>
            </div>

            {loadingProofs ? (
              <div className="py-16 text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
                <p className="text-sm text-slate-400">Loading pending proofs...</p>
              </div>
            ) : proofs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-green-400" />
                <p className="mt-4 text-lg font-semibold text-white">All caught up</p>
                <p className="mt-2 text-sm text-slate-500">
                  There are no pending payment proofs right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {proofs.map((proof) => {
                  const isSelected = selectedProof?.id === proof.id;

                  return (
                    <button
                      key={proof.id}
                      type="button"
                      onClick={() => setSelectedProof(proof)}
                      className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {proof.email}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>{proof.reference_number}</span>
                          <span>{formatNumber(proof.amount)} credits</span>
                          <span>{formatDate(proof.created_at)}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-300">
                        <Eye className="h-4 w-4" />
                        Review
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-800 p-3 text-indigo-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Proof review</h2>
                <p className="text-sm text-slate-400">
                  Approve or reject the selected proof.
                </p>
              </div>
            </div>

            {!selectedProof ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
                <ShieldCheck className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-3 font-medium text-white">No proof selected</p>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a pending payment proof from the list.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-300">
                      Payment proof
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        window.open(getImageUrl(selectedProof.image_path), "_blank")
                      }
                      className="text-xs text-indigo-300 hover:text-indigo-200"
                    >
                      Open full image
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/50">
                    <img
                      src={getImageUrl(selectedProof.image_path)}
                      alt="Payment proof"
                      className="h-auto w-full"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">User</span>
                    <span className="break-all text-right text-white">
                      {selectedProof.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Reference</span>
                    <span className="text-white">{selectedProof.reference_number}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Credits</span>
                    <span className="font-medium text-indigo-300">
                      +{formatNumber(selectedProof.amount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Admin notes
                  </label>
                  <textarea
                    value={proofNotes}
                    onChange={(event) => setProofNotes(event.target.value)}
                    className="h-32 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500"
                    placeholder="Add notes. Required when rejecting a proof."
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => requestProofAction("approve", selectedProof)}
                    disabled={actionLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve proof
                  </button>

                  <button
                    type="button"
                    onClick={() => requestProofAction("reject", selectedProof)}
                    disabled={actionLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject proof
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-800 p-3 text-indigo-400">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Pending free task claims</h2>
                <p className="text-sm text-slate-400">
                  Review social task submissions before giving free credits.
                </p>
              </div>
            </div>

            {loadingTasks ? (
              <div className="py-16 text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
                <p className="text-sm text-slate-400">Loading pending task claims...</p>
              </div>
            ) : taskSubmissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
                <CheckCircle className="mx-auto h-10 w-10 text-green-400" />
                <p className="mt-4 text-lg font-semibold text-white">All caught up</p>
                <p className="mt-2 text-sm text-slate-500">
                  There are no pending free task submissions right now.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {taskSubmissions.map((submission) => {
                  const isSelected = selectedTask?.id === submission.id;

                  return (
                    <button
                      key={submission.id}
                      type="button"
                      onClick={() => setSelectedTask(submission)}
                      className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-colors ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {submission.email}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span>{submission.task_title}</span>
                          <span>{submission.submitted_value}</span>
                          <span>+{formatNumber(submission.reward_credits)} credits</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-300">
                        <Eye className="h-4 w-4" />
                        Review
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-800 p-3 text-indigo-400">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Task review</h2>
                <p className="text-sm text-slate-400">
                  Approve or reject the selected free task claim.
                </p>
              </div>
            </div>

            {!selectedTask ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
                <Gift className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-3 font-medium text-white">No task selected</p>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a pending task submission from the list.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">User</span>
                    <span className="break-all text-right text-white">
                      {selectedTask.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Task</span>
                    <span className="text-right text-white">
                      {selectedTask.task_title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Submitted username</span>
                    <span className="text-right text-white">
                      {selectedTask.submitted_value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Reward</span>
                    <span className="font-medium text-indigo-300">
                      +{formatNumber(selectedTask.reward_credits)} credits
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-400">Submitted</span>
                    <span className="text-right text-white">
                      {formatDateTime(selectedTask.created_at)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Admin notes
                  </label>
                  <textarea
                    value={taskNotes}
                    onChange={(event) => setTaskNotes(event.target.value)}
                    className="h-32 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500"
                    placeholder="Add notes. Required when rejecting a task claim."
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => requestTaskAction("approve", selectedTask)}
                    disabled={actionLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve task reward
                  </button>

                  <button
                    type="button"
                    onClick={() => requestTaskAction("reject", selectedTask)}
                    disabled={actionLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject task reward
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === "users" && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-800 p-3 text-indigo-400">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">User list</h2>
                  <p className="text-sm text-slate-400">
                    See balances, task claims, and manually add credits when needed.
                  </p>
                </div>
              </div>

              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="search"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                  placeholder="Search email, role, or ID"
                />
              </div>
            </div>

            <form
              onSubmit={handleGrantCredits}
              className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-800 p-3 text-emerald-300">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Manual credit grant</h3>
                  <p className="text-sm text-slate-400">
                    Select a user and add credits directly.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  User
                </label>
                <select
                  value={grantForm.userId}
                  onChange={(event) =>
                    setGrantForm((current) => ({
                      ...current,
                      userId: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Credits to add
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={grantForm.amount}
                  onChange={(event) =>
                    setGrantForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                  placeholder="5"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Admin note
                </label>
                <textarea
                  value={grantForm.notes}
                  onChange={(event) =>
                    setGrantForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className="h-24 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                  placeholder="Optional reason for this credit grant"
                />
              </div>

              <button
                type="submit"
                disabled={grantLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {grantLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Add credits
              </button>
            </form>
          </div>

          {loadingUsers ? (
            <div className="py-16 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-sm text-slate-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
              <UserRound className="mx-auto h-10 w-10 text-slate-500" />
              <p className="mt-4 text-lg font-semibold text-white">
                No users found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-3 pr-4 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Credits left</th>
                    <th className="px-4 py-3 font-medium">QRs generated</th>
                    <th className="px-4 py-3 font-medium">Proofs</th>
                    <th className="px-4 py-3 font-medium">Task claims</th>
                    <th className="px-4 py-3 font-medium">Proof credits</th>
                    <th className="px-4 py-3 font-medium">Task credits</th>
                    <th className="px-4 py-3 font-medium">Manual credits</th>
                    <th className="py-3 pl-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="text-slate-300">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-sm font-semibold text-white">
                            {user.email?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {user.email}
                            </p>
                            <p className="text-xs text-slate-500">ID #{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs capitalize text-slate-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-white">
                        {formatNumber(user.balance)}
                      </td>
                      <td className="px-4 py-4">{formatNumber(user.generated_count)}</td>
                      <td className="px-4 py-4">{formatNumber(user.proof_count)}</td>
                      <td className="px-4 py-4">{formatNumber(user.task_claim_count)}</td>
                      <td className="px-4 py-4">
                        {formatNumber(user.approved_credit_total)}
                      </td>
                      <td className="px-4 py-4">
                        {formatNumber(user.task_credit_total)}
                      </td>
                      <td className="px-4 py-4">
                        {formatNumber(user.manual_credit_total)}
                      </td>
                      <td className="py-4 pl-4">{formatDate(user.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-xs text-slate-500">
            Admin accounts: {userStats.admins} of {userStats.total}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={!!pendingAction}
        title={
          pendingAction?.type === "approve"
            ? pendingAction?.kind === "proof"
              ? "Approve payment proof?"
              : "Approve free task reward?"
            : pendingAction?.kind === "proof"
              ? "Reject payment proof?"
              : "Reject free task reward?"
        }
        description={
          pendingAction?.type === "approve"
            ? pendingAction?.kind === "proof"
              ? "Credits will be added to this user's balance immediately."
              : "The free task reward will be credited to the user immediately."
            : pendingAction?.kind === "proof"
              ? "This will mark the proof as rejected and keep the user's credits unchanged."
              : "This will reject the task claim without changing the user's balance."
        }
        confirmLabel={pendingAction?.type === "approve" ? "Approve" : "Reject"}
        variant={pendingAction?.type === "reject" ? "danger" : "primary"}
        loading={actionLoading}
        onConfirm={handlePendingAction}
        onCancel={closeActionDialog}
      />
    </div>
  );
};

export default AdminPanel;
