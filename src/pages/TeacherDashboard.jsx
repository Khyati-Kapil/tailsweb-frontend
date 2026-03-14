import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';

const statusOptions = ['Draft', 'Published', 'Completed'];

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  attachments: []
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
      await api.post('/assignments', {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate
      });
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
      dueDate: assignment.dueDate?.slice(0, 16) || '',
      attachments: []
    });
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditingForm(emptyForm);
  };

  const saveEdit = async (assignmentId) => {
    setError('');
    try {
      await api.patch(`/assignments/${assignmentId}`, {
        title: editingForm.title,
        description: editingForm.description,
        dueDate: editingForm.dueDate
      });
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

  const handleFileSelect = (event, setter) => {
    const files = Array.from(event.target.files || []);
    setter((prev) => ({ ...prev, attachments: files }));
  };

  return (
    <div className="min-h-screen px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <TopBar title="Teacher Command Deck" />

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid-surface rounded-[26px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mono text-xs uppercase tracking-[0.3em] text-slate-700">Create Assignment</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Draft a new task</h2>
              </div>
              <span className="badge mono">Draft</span>
            </div>
            <form className="mt-6 grid gap-4" onSubmit={handleCreate}>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="input-neo"
                placeholder="Assignment title"
                required
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="input-neo min-h-[130px]"
                placeholder="Describe the assignment"
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                  className="input-neo"
                  required
                />
                <label className="grid gap-2 text-sm text-slate-800">
                  Attach files
                  <input
                    type="file"
                    multiple
                    onChange={(event) => handleFileSelect(event, setForm)}
                    className="input-neo"
                  />
                </label>
              </div>
              {form.attachments.length > 0 && (
                <div className="rounded-2xl border-2 border-slate-950 bg-white p-3 text-xs text-slate-700">
                  {form.attachments.map((file) => file.name).join(', ')}
                </div>
              )}
              <button className="button-neo" type="submit">
                Save draft
              </button>
            </form>
          </div>

          <div className="grid-surface rounded-[26px] p-6">
            <h2 className="text-xl font-semibold text-slate-950">Filter assignments</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={`rounded-full border-2 px-4 py-2 text-xs font-semibold transition ${
                    statusFilter === option ? 'border-slate-950 bg-white card-shadow' : 'border-slate-950/40 bg-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="mt-6">
              <p className="mono text-xs uppercase tracking-[0.25em] text-slate-600">Pages</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pageList.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => fetchAssignments(pageNumber, statusFilter)}
                    className={`h-10 w-10 rounded-full border-2 text-xs font-semibold ${
                      pageNumber === page ? 'border-slate-950 bg-white card-shadow' : 'border-slate-950/40 bg-white'
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
            <h2 className="text-2xl font-semibold text-slate-950">Assignments</h2>
            {loading && <span className="mono text-xs uppercase tracking-[0.2em] text-slate-600">Loading</span>}
          </div>
          {error && <p className="mt-3 rounded-2xl border-2 border-slate-950 bg-white px-4 py-3 text-sm text-slate-700">{error}</p>}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {assignments.map((assignment) => {
              const isEditing = editingId === assignment._id;
              return (
                <article key={assignment._id} className="grid-surface rounded-[24px] p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="mono text-xs uppercase tracking-[0.3em] text-slate-600">{assignment.status}</p>
                      {isEditing ? (
                        <input
                          value={editingForm.title}
                          onChange={(event) => setEditingForm((prev) => ({ ...prev, title: event.target.value }))}
                          className="input-neo mt-2"
                        />
                      ) : (
                        <h3 className="mt-2 text-xl font-semibold text-slate-950">{assignment.title}</h3>
                      )}
                    </div>
                    <button type="button" onClick={() => loadSubmissions(assignment)} className="button-ghost text-xs">
                      Submissions
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={editingForm.description}
                      onChange={(event) => setEditingForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="input-neo mt-4 min-h-[100px]"
                    />
                  ) : (
                    <p className="mt-4 text-sm text-slate-700">{assignment.description}</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span>Due: {new Date(assignment.dueDate).toLocaleString()}</span>
                    <span>Updated: {new Date(assignment.updatedAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {assignment.status === 'Draft' && !isEditing && (
                      <button type="button" onClick={() => startEdit(assignment)} className="button-ghost text-xs">
                        Edit
                      </button>
                    )}
                    {assignment.status === 'Draft' && (
                      <button
                        type="button"
                        onClick={() => deleteAssignment(assignment._id)}
                        className="button-ghost text-xs"
                      >
                        Delete
                      </button>
                    )}
                    {assignment.status === 'Draft' && (
                      <button
                        type="button"
                        onClick={() => transitionStatus(assignment._id, 'Published')}
                        className="button-neo"
                      >
                        Publish
                      </button>
                    )}
                    {assignment.status === 'Published' && (
                      <button
                        type="button"
                        onClick={() => transitionStatus(assignment._id, 'Completed')}
                        className="button-neo"
                      >
                        Mark completed
                      </button>
                    )}
                    {isEditing && (
                      <button type="button" onClick={() => saveEdit(assignment._id)} className="button-neo">
                        Save
                      </button>
                    )}
                    {isEditing && (
                      <button type="button" onClick={cancelEdit} className="button-ghost">
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
          <section className="mt-10 grid-surface rounded-[26px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mono text-xs uppercase tracking-[0.3em] text-slate-600">Submissions</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950">{submissionsAssignment.title}</h3>
              </div>
              <button type="button" onClick={() => setSubmissionsAssignment(null)} className="button-ghost">
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              {submissions.length === 0 && (
                <p className="text-sm text-slate-600">No submissions yet.</p>
              )}
              {submissions.map((submission) => (
                <div key={submission._id} className="rounded-2xl border-2 border-slate-950 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{submission.student?.name || 'Student'}</p>
                      <p className="text-xs text-slate-600">{submission.student?.email}</p>
                    </div>
                    <div className="text-xs text-slate-600">
                      Submitted {new Date(submission.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-700">{submission.answerText}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-slate-600">
                      {submission.reviewedAt ? 'Reviewed' : 'Pending review'}
                    </span>
                    {!submission.reviewedAt && (
                      <button
                        type="button"
                        onClick={() => markReviewed(submission._id)}
                        className="button-ghost text-xs"
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
