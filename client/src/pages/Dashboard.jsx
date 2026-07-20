import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/shared/AppShell';
import LoadingState from '../components/shared/LoadingState';
import { getErrorMessage } from '../utils/errors';

function formatPrice(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await api.get('/api/projects');
      setProjects(data.projects || []);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Unable to load projects'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const validate = () => {
    const next = {};
    if (!title.trim() || title.trim().length < 3 || title.trim().length > 100) {
      next.title = 'Title must be between 3 and 100 characters';
    }
    if (
      !clientName.trim() ||
      clientName.trim().length < 2 ||
      clientName.trim().length > 100
    ) {
      next.clientName = 'Client name must be between 2 and 100 characters';
    }
    const rate = Number(hourlyRate);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 100000) {
      next.hourlyRate = 'Hourly rate must be greater than 0 and at most 100000';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/api/projects', {
        title: title.trim(),
        clientName: clientName.trim(),
        hourlyRate: Number(hourlyRate),
      });
      setProjects((prev) => [data.project, ...prev]);
      setTitle('');
      setClientName('');
      setHourlyRate('');
      setShowCreate(false);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to create project'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Track locked scope, client requests, and change orders.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreate((prev) => !prev)}
        >
          {showCreate ? 'Cancel' : 'New project'}
        </button>
      </div>

      {showCreate && (
        <section className="panel create-panel">
          <form className="form-grid" onSubmit={handleCreate} noValidate>
            <div className="form-row">
              <label htmlFor="title">Project title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Website redesign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-row">
              <label htmlFor="clientName">Client name</label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                placeholder="e.g. Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              {errors.clientName && (
                <span className="field-error">{errors.clientName}</span>
              )}
            </div>

            <div className="form-row">
              <label htmlFor="hourlyRate">Hourly rate (USD)</label>
              <input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 75"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
              {errors.hourlyRate && (
                <span className="field-error">{errors.hourlyRate}</span>
              )}
            </div>

            {formError && <div className="form-error">{formError}</div>}

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <LoadingState label="Creating..." /> : 'Create project'}
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        {loading && <LoadingState label="Loading projects..." />}
        {!loading && loadError && <div className="form-error">{loadError}</div>}
        {!loading && !loadError && projects.length === 0 && (
          <p className="empty-state">No projects yet. Create one to lock your first scope.</p>
        )}
        {!loading && !loadError && projects.length > 0 && (
          <div className="project-list">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="project-row"
              >
                <div>
                  <h3>{project.title}</h3>
                  <p className="meta">{project.clientName}</p>
                </div>
                <div className="meta">Rate {formatPrice(project.hourlyRate)}/hr</div>
                <span
                  className={`status-pill ${
                    project.status === 'paused' ? 'status-paused' : 'status-active'
                  }`}
                >
                  {project.status}
                </span>
                <div className="price">{formatPrice(project.totalPrice)}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default Dashboard;
