import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [answers, setAnswers] = useState({});
  const [attachments, setAttachments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/assignments', { params: { page: 1, limit: 12 } });
      setAssignments(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await api.get('/submissions/mine');
      const map = {};
      (response.data.items || []).forEach((submission) => {
        map[submission.assignment?._id] = submission;
      });
      setSubmissions(map);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load submissions');
    }
  };

  useEffect(() => {
    loadAssignments();
    loadSubmissions();
  }, []);

  const handleSubmit = async (assignmentId) => {
    setError('');
    try {
      const payload = { assignmentId, answerText: answers[assignmentId] || '' };
      await api.post('/submissions', payload);
      setAnswers((prev) => ({ ...prev, [assignmentId]: '' }));
      setAttachments((prev) => ({ ...prev, [assignmentId]: [] }));
      loadSubmissions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answer');
    }
  };

  const handleFileSelect = (assignmentId, event) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => ({ ...prev, [assignmentId]: files }));
  };

  const now = useMemo(() => new Date(), []);

  return (
    <div className="min-h-screen px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <TopBar title="Student Mission Control" />
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-950">Published assignments</h2>
            {loading && <span className="mono text-xs uppercase tracking-[0.2em] text-slate-600">Loading</span>}
          </div>
          {error && <p className="mt-3 rounded-2xl border-2 border-slate-950 bg-white px-4 py-3 text-sm text-slate-700">{error}</p>}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {assignments.map((assignment) => {
              const submission = submissions[assignment._id];
              const dueDate = new Date(assignment.dueDate);
              const isOverdue = dueDate < now;
              return (
                <article key={assignment._id} className="grid-surface rounded-[24px] p-6">
                  <p className="mono text-xs uppercase tracking-[0.3em] text-slate-600">Published</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{assignment.title}</h3>
                  <p className="mt-3 text-sm text-slate-700">{assignment.description}</p>
                  <div className="mt-4 text-xs text-slate-600">
                    Due {dueDate.toLocaleString()}
                    {isOverdue && <span className="ml-2 text-slate-950">Overdue</span>}
                  </div>
                  {submission ? (
                    <div className="mt-5 rounded-2xl border-2 border-slate-950 bg-white p-4">
                      <p className="mono text-xs uppercase tracking-[0.25em] text-slate-600">Your submission</p>
                      <p className="mt-2 text-sm text-slate-700">{submission.answerText}</p>
                      <p className="mt-2 text-xs text-slate-600">Submitted {new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3">
                      <textarea
                        value={answers[assignment._id] || ''}
                        onChange={(event) =>
                          setAnswers((prev) => ({ ...prev, [assignment._id]: event.target.value }))
                        }
                        className="input-neo min-h-[120px]"
                        placeholder={isOverdue ? 'Submission closed' : 'Write your answer'}
                        disabled={isOverdue}
                      />
                      <label className="grid gap-2 text-sm text-slate-900">
                        Attach files
                        <input
                          type="file"
                          multiple
                          onChange={(event) => handleFileSelect(assignment._id, event)}
                          className="input-neo"
                          disabled={isOverdue}
                        />
                      </label>
                      {attachments[assignment._id]?.length > 0 && (
                        <div className="rounded-2xl border-2 border-slate-950 bg-white p-3 text-xs text-slate-700">
                          {attachments[assignment._id].map((file) => file.name).join(', ')}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSubmit(assignment._id)}
                        disabled={isOverdue || !(answers[assignment._id] || '').trim()}
                        className="button-neo"
                      >
                        Submit answer
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
