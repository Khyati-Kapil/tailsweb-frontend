import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import TopBar from '../components/TopBar';

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [answers, setAnswers] = useState({});
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
      loadSubmissions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answer');
    }
  };

  const now = useMemo(() => new Date(), []);

  return (
    <div className="min-h-screen px-6 pb-16">
      <div className="mx-auto max-w-6xl">
        <TopBar title="Student Dashboard" />
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-ink">Published Assignments</h2>
            {loading && <span className="text-sm text-fog">Loading...</span>}
          </div>
          {error && <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">{error}</p>}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {assignments.map((assignment) => {
              const submission = submissions[assignment._id];
              const dueDate = new Date(assignment.dueDate);
              const isOverdue = dueDate < now;
              return (
                <article key={assignment._id} className="card-surface rounded-3xl p-6 shadow-soft">
                  <p className="text-xs uppercase tracking-[0.3em] text-fog">Published</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink">{assignment.title}</h3>
                  <p className="mt-3 text-sm text-slate">{assignment.description}</p>
                  <div className="mt-4 text-xs text-fog">
                    Due {dueDate.toLocaleString()}
                    {isOverdue && <span className="ml-2 text-coral">Overdue</span>}
                  </div>
                  {submission ? (
                    <div className="mt-5 rounded-2xl border border-slate/10 bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-fog">Your submission</p>
                      <p className="mt-2 text-sm text-slate">{submission.answerText}</p>
                      <p className="mt-2 text-xs text-fog">Submitted {new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3">
                      <textarea
                        value={answers[assignment._id] || ''}
                        onChange={(event) =>
                          setAnswers((prev) => ({ ...prev, [assignment._id]: event.target.value }))
                        }
                        className="min-h-[120px] rounded-xl border border-slate/20 bg-white/80 px-4 py-3 text-sm text-ink outline-none focus:border-ink"
                        placeholder={isOverdue ? 'Submission closed' : 'Write your answer'}
                        disabled={isOverdue}
                      />
                      <button
                        type="button"
                        onClick={() => handleSubmit(assignment._id)}
                        disabled={isOverdue || !(answers[assignment._id] || '').trim()}
                        className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate disabled:opacity-60"
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
