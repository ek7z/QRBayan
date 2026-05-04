import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Gift, Loader2, ShieldCheck, Ticket } from "lucide-react";
import api from "../api/axios";
import { useToast } from "../components/ToastProvider";

const statusStyles = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  approved: "border-green-500/20 bg-green-500/10 text-green-200",
  rejected: "border-red-500/20 bg-red-500/10 text-red-200",
};

const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const TaskPage = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedTaskKey, setSelectedTaskKey] = useState("");
  const [submittedValue, setSubmittedValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchTaskData();
  }, []);

  const fetchTaskData = async () => {
    setLoading(true);
    try {
      const [taskResponse, submissionResponse] = await Promise.all([
        api.get("/tasks/catalog"),
        api.get("/tasks/my-submissions"),
      ]);

      const nextTasks = taskResponse.data.data || [];
      setTasks(nextTasks);
      setSubmissions(submissionResponse.data.data || []);

      if (!selectedTaskKey && nextTasks[0]?.key) {
        setSelectedTaskKey(nextTasks[0].key);
      }
    } catch (err) {
      showToast({
        type: "error",
        title: "Could not load tasks",
        message: err.response?.data?.message || "Please refresh and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const latestSubmissionByTask = useMemo(() => {
    const map = new Map();

    for (const submission of submissions) {
      if (!map.has(submission.task_key)) {
        map.set(submission.task_key, submission);
      }
    }

    return map;
  }, [submissions]);

  const selectedTask =
    tasks.find((task) => task.key === selectedTaskKey) || tasks[0] || null;
  const selectedTaskSubmission = selectedTask
    ? latestSubmissionByTask.get(selectedTask.key)
    : null;

  const isPending = selectedTaskSubmission?.status === "pending";
  const isApproved = selectedTaskSubmission?.status === "approved";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTask) {
      return;
    }

    if (!submittedValue.trim()) {
      showToast({
        type: "error",
        title: "Submission required",
        message: "Enter your TikTok username or display name first.",
      });
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await api.post("/tasks/submissions", {
        taskKey: selectedTask.key,
        submittedValue,
      });

      setSubmissions((current) => [response.data.data, ...current]);
      setSubmittedValue("");
      showToast({
        type: "success",
        title: "Task submitted",
        message: "Your free credit claim is now waiting for admin review.",
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Submission failed",
        message: err.response?.data?.message || "Please try again.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Gift className="h-3.5 w-3.5" />
            Free credits
          </div>
          <h1 className="text-3xl font-bold text-white">Complete tasks for bonus credits</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Submit simple social tasks here to earn free credits. These claims are manually reviewed by admin before credits are added to your balance.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
          <div className="space-y-1">
            <p className="font-medium text-white">How this works</p>
            <p>1. Pick a free task and do it.</p>
            <p>2. Submit your TikTok username or display name.</p>
            <p>3. Wait for admin approval. Credits are only added after review.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-20 text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-emerald-400" />
          <p className="text-sm text-slate-400">Loading available tasks...</p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">Available tasks</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Each approved task adds free credits to your account once.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {tasks.map((task) => {
                  const latestSubmission = latestSubmissionByTask.get(task.key);
                  const isSelected = selectedTaskKey === task.key;

                  return (
                    <button
                      key={task.key}
                      type="button"
                      onClick={() => setSelectedTaskKey(task.key)}
                      className={`rounded-2xl border p-5 text-left transition-colors ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="rounded-xl bg-slate-800 p-3 text-emerald-300">
                          <Ticket className="h-5 w-5" />
                        </div>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                          +{task.rewardCredits} credits
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-white">{task.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {task.description}
                      </p>
                      {latestSubmission && (
                        <div className="mt-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                              statusStyles[latestSubmission.status] || statusStyles.pending
                            }`}
                          >
                            {latestSubmission.status}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-white">Submit task claim</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Admin will review your submission before the reward is applied.
                </p>
              </div>

              {!selectedTask ? (
                <p className="text-sm text-slate-400">No tasks are configured yet.</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Selected task</p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {selectedTask.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Reward: +{selectedTask.rewardCredits} credits
                        </p>
                      </div>
                      {selectedTask.linkUrl && (
                        <a
                          href={selectedTask.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-200 hover:border-slate-600 hover:text-white"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {selectedTask.linkLabel || "Open link"}
                        </a>
                      )}
                    </div>
                  </div>

                  {selectedTaskSubmission && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-sm">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                            statusStyles[selectedTaskSubmission.status] || statusStyles.pending
                          }`}
                        >
                          {selectedTaskSubmission.status}
                        </span>
                        <span className="text-slate-500">
                          Last submitted {formatDateTime(selectedTaskSubmission.created_at)}
                        </span>
                      </div>
                      <p className="mt-3 text-slate-300">
                        Submitted value:{" "}
                        <span className="font-medium text-white">
                          {selectedTaskSubmission.submitted_value}
                        </span>
                      </p>
                      {selectedTaskSubmission.admin_notes && (
                        <p className="mt-2 text-slate-400">
                          Admin note: {selectedTaskSubmission.admin_notes}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      {selectedTask.submissionLabel}
                    </label>
                    <input
                      type="text"
                      value={submittedValue}
                      onChange={(event) => setSubmittedValue(event.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                      placeholder="Enter your TikTok username or display name"
                      disabled={isPending || isApproved || submitLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitLoading || isPending || isApproved}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isApproved
                      ? "Task already claimed"
                      : isPending
                        ? "Waiting for approval"
                        : "Submit task claim"}
                  </button>
                </form>
              )}
            </div>
          </section>

          <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-800 p-3 text-emerald-300">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Submission history</h2>
                <p className="text-sm text-slate-400">
                  Track which free credit claims are still under review.
                </p>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
                <Gift className="mx-auto h-10 w-10 text-slate-500" />
                <p className="mt-4 text-lg font-semibold text-white">No submissions yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Complete your first free task to start earning credits.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{submission.task_title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDateTime(submission.created_at)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
                          statusStyles[submission.status] || statusStyles.pending
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {submission.submitted_value}
                    </p>
                    {submission.admin_notes && (
                      <p className="mt-2 text-xs text-slate-500">
                        Admin note: {submission.admin_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export default TaskPage;
