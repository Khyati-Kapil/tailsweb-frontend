import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';

const statusOptions = ['Draft', 'Published', 'Completed'];

const emptyForm = {
  title: '',
  description: '',
  dueDate: ''
};

const TeacherDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('Draft');
  const [assignments, setAssignments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [editingForm, setEditingForm] = useState(emptyForm);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsAssignment, setSubmissionsAssignment] = useState(null);

  const fetchAssignments = async (pageNumber = 1, filter = statusFilter) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/assignments', {
        params: { status: filter, page: pageNumber, limit: 6 }
      });
      setAssignments(response.data.items || []);
      setPage(response.data.page || 1);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments(1, statusFilter);
  }, [statusFilter]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await api.post('/assignments', form);
      setForm(emptyForm);
      fetchAssignments(1, statusFilter);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create assignment');
    }
  };

  const startEdit = (assignment) => {
    setEditingId(assignment._id);
    setEditingForm({
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate?.slice(0, 16) || ''
    });
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditingForm(emptyForm);
  };

  const saveEdit = async (assignmentId) => {
    setError('');
    try {
      await api.patch(`/assignments/${assignmentId}`, editingForm);
      setEditingId('');
      fetchAssignments(page, statusFilter);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update assignment');
    }
  };

  const deleteAssignment = async (assignmentId) => {
    setError('');
    try {
      await api.delete(`/assignments/${assignmentId}`);
      fetchAssignments(page, statusFilter);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete assignment');
    }
  };

  const transitionStatus = async (assignmentId, nextStatus) => {
    setError('');
    try {
      await api.post(`/assignments/${assignmentId}/status`, { status: nextStatus });
      fetchAssignments(page, statusFilter);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const loadSubmissions = async (assignment) => {
    setError('');
    try {
      const response = await api.get(`/assignments/${assignment._id}/submissions`);
      setSubmissions(response.data.items || []);
      setSubmissionsAssignment(assignment);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load submissions');
    }
  };

  const markReviewed = async (submissionId) => {
    try {
      await api.patch(`/submissions/${submissionId}/review`);
      if (submissionsAssignment) {
        loadSubmissions(submissionsAssignment);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update submission');
    }
  };

  const pageList = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

  return (
    <div className="min-h-screen px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <TopBar title="Teacher Dashboard" />

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-surface rounded-3xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">Create Assignment</h2>
            <p className="mt-2 text-sm text-fog">Draft assignments can be edited or deleted.</p>
            <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="rounded-xl border border-slate/20 bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-ink"
                placeholder="Assignment title"
                required
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="min-h-[120px] rounded-xl border border-slate/20 bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-ink"
                placeholder="Assignment description"
                required
              />
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                className="rounded-xl border border-slate/20 bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-ink"
                required
              />
              <button className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate">
                Save Draft
              </button>
            </form>
          </div>

          <div className="card-surface rounded-3xl p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-ink">Filter Assignments</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    statusFilter === option
                      ? 'bg-ink text-white'
                      : 'border border-slate/20 bg-white/70 text-slate hover:border-ink'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <p className="text-sm text-fog">Total pages: {totalPages}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pageList.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => fetchAssignments(pageNumber, statusFilter)}
                    className={`h-9 w-9 rounded-full text-sm font-semibold transition ${
                      pageNumber === page ? 'bg-ink text-white' : 'bg-white/70 text-slate'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-ink">Assignments</h2>
            {loading && <span className="text-sm text-fog">Loading...</span>}
          </div>
          {error && <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {assignments.map((assignment) => {
              const isEditing = editingId === assignment._id;
              return (
                <article key={assignment._id} className="card-surface rounded-3xl p-6 shadow-soft">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-fog">{assignment.status}</p>
                      {isEditing ? (
                        <input
                          value={editingForm.title}
                          onChange={(event) => setEditingForm((prev) => ({ ...prev, title: event.target.value }))}
                          className="mt-2 w-full rounded-xl border border-slate/20 bg-white/80 px-3 py-2 text-sm text-ink outline-none"
                        />
                      ) : (
                        <h3 className="mt-2 text-xl font-semibold text-ink">{assignment.title}</h3>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => loadSubmissions(assignment)}
                      className="rounded-full border border-slate/20 px-3 py-2 text-xs font-semibold text-slate"
                    >
                      View submissions
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editingForm.description}
                      onChange={(event) => setEditingForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="mt-4 min-h-[100px] w-full rounded-xl border border-slate/20 bg-white/80 px-3 py-2 text-sm text-ink outline-none"
                    />
                  ) : (
                    <p className="mt-4 text-sm text-slate">{assignment.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-fog">
                    <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                    <span>Updated: {new Date(assignment.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {assignment.status === 'Draft' && !isEditing && (
                      <button
                        type="button"
                        onClick={() => startEdit(assignment)}
                        className="rounded-full border border-slate/20 px-4 py-2 text-xs font-semibold text-slate"
                      >
                        Edit
                      </button>
                    )}
                    {assignment.status === 'Draft' && (
                      <button
                        type="button"
                        onClick={() => deleteAssignment(assignment._id)}
                        className="rounded-full border border-coral/40 px-4 py-2 text-xs font-semibold text-coral"
                      >
                        Delete
                      </button>
                    )}
                    {assignment.status === 'Draft' && (
                      <button
                        type="button"
                        onClick={() => transitionStatus(assignment._id, 'Published')}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
                      >
                        Publish
                      </button>
                    )}
                    {assignment.status === 'Published' && (
                      <button
                        type="button"
                        onClick={() => transitionStatus(assignment._id, 'Completed')}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
                      >
                        Mark completed
                      </button>
                    )}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => saveEdit(assignment._id)}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                    )}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-full border border-slate/20 px-4 py-2 text-xs font-semibold text-slate"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {submissionsAssignment && (
          <section className="mt-10 card-surface rounded-3xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-fog">Submissions</p>
                <h3 className="mt-2 text-2xl font-semibold text-ink">{submissionsAssignment.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionsAssignment(null)}
                className="rounded-full border border-slate/20 px-4 py-2 text-xs font-semibold text-slate"
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              {submissions.length === 0 && (
                <p className="text-sm text-fog">No submissions yet.</p>
              )}
              {submissions.map((submission) => (
                <div key={submission._id} className="rounded-2xl border border-slate/10 bg-white/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{submission.student?.name || 'Student'}</p>
                      <p className="text-xs text-fog">{submission.student?.email}</p>
                    </div>
                    <div className="text-xs text-fog">
                      Submitted {new Date(submission.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate">{submission.answerText}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-fog">
                      {submission.reviewedAt ? 'Reviewed' : 'Pending review'}
                    </span>
                    {!submission.reviewedAt && (
                      <button
                        type="button"
                        onClick={() => markReviewed(submission._id)}
                        className="rounded-full border border-ink px-3 py-1 text-xs font-semibold text-ink"
                      >
                        Mark reviewed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
