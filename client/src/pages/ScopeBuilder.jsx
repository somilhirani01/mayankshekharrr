import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/shared/AppShell';
import LoadingState from '../components/shared/LoadingState';
import ScopeItemForm from '../components/scopeBuilder/ScopeItemForm';
import { getErrorMessage } from '../utils/errors';
import { formatHours, formatPrice } from '../utils/format';

function ScopeBuilder() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [scopeItems, setScopeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [rateError, setRateError] = useState('');
  const [rateMessage, setRateMessage] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [projectRes, scopeRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/projects/${id}/scope-items`),
      ]);
      setProject(projectRes.data.project);
      setHourlyRate(String(projectRes.data.project.hourlyRate));
      setScopeItems(scopeRes.data.scopeItems || []);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Unable to load scope builder'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSaveRate = async (event) => {
    event.preventDefault();
    setRateError('');
    setRateMessage('');
    const rate = Number(hourlyRate);
    if (!Number.isFinite(rate) || rate <= 0 || rate > 100000) {
      setRateError('Hourly rate must be greater than 0 and at most 100000');
      return;
    }

    setSavingRate(true);
    try {
      const { data } = await api.put(`/api/projects/${id}`, { hourlyRate: rate });
      setProject(data.project);
      setRateMessage('Hourly rate updated');
    } catch (err) {
      setRateError(getErrorMessage(err, 'Unable to update hourly rate'));
    } finally {
      setSavingRate(false);
    }
  };

  const handleCreate = async (payload) => {
    setActionError('');
    try {
      const { data } = await api.post(`/api/projects/${id}/scope-items`, payload);
      setScopeItems((prev) => [...prev, data.scopeItem]);
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Unable to add scope item'));
    }
  };

  const handleUpdate = async (payload) => {
    setActionError('');
    try {
      const { data } = await api.put(`/api/scope-items/${editingId}`, payload);
      setScopeItems((prev) =>
        prev.map((item) => (item._id === editingId ? data.scopeItem : item))
      );
      setEditingId(null);
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Unable to update scope item'));
    }
  };

  const handleDelete = async (itemId) => {
    setActionError('');
    try {
      await api.delete(`/api/scope-items/${itemId}`);
      setScopeItems((prev) => prev.filter((item) => item._id !== itemId));
      if (editingId === itemId) {
        setEditingId(null);
      }
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to delete scope item'));
    }
  };

  const editingItem = scopeItems.find((item) => item._id === editingId);

  return (
    <AppShell>
      <div className="page-header">
        <div>
          <p className="breadcrumb">
            <Link to="/">Projects</Link>
            {' / '}
            <Link to={`/projects/${id}`}>{project?.title || 'Project'}</Link>
            {' / Scope'}
          </p>
          <h1>Scope builder</h1>
          <p>Define deliverables, tags, and hours for the locked scope.</p>
        </div>
        <Link to={`/projects/${id}`} className="btn btn-ghost">
          Back to project
        </Link>
      </div>

      {loading && <LoadingState label="Loading scope..." />}
      {!loading && loadError && <div className="form-error">{loadError}</div>}

      {!loading && !loadError && project && (
        <>
          <section className="panel create-panel">
            <h2 className="section-title">Hourly rate</h2>
            <form className="inline-form" onSubmit={handleSaveRate} noValidate>
              <div className="form-row">
                <label htmlFor="hourly-rate">Rate (USD)</label>
                <input
                  id="hourly-rate"
                  name="hourlyRate"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
                {rateError && <span className="field-error">{rateError}</span>}
                {rateMessage && <span className="field-success">{rateMessage}</span>}
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingRate}>
                {savingRate ? <LoadingState label="Saving..." /> : 'Save rate'}
              </button>
            </form>
          </section>

          <section className="panel create-panel">
            <h2 className="section-title">
              {editingItem ? 'Edit scope item' : 'Add scope item'}
            </h2>
            <ScopeItemForm
              key={editingItem ? editingItem._id : 'create'}
              initialValues={
                editingItem
                  ? {
                      title: editingItem.title,
                      description: editingItem.description || '',
                      categoryTag: editingItem.categoryTag,
                      estimatedHours: String(editingItem.estimatedHours),
                    }
                  : null
              }
              submitLabel={editingItem ? 'Update item' : 'Add item'}
              onSubmit={editingItem ? handleUpdate : handleCreate}
              onCancel={editingItem ? () => setEditingId(null) : undefined}
            />
          </section>

          <section className="panel">
            <h2 className="section-title">Scope items</h2>
            {actionError && <div className="form-error">{actionError}</div>}
            {scopeItems.length === 0 ? (
              <p className="empty-state">No scope items yet.</p>
            ) : (
              <div className="data-list">
                {scopeItems.map((item) => (
                  <article key={item._id} className="data-row">
                    <div>
                      <h3>{item.title}</h3>
                      <p className="meta">
                        {item.categoryTag} · {formatHours(item.estimatedHours)}
                      </p>
                      {item.description && (
                        <p className="meta description">{item.description}</p>
                      )}
                    </div>
                    <div className="action-row">
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setEditingId(item._id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="meta totals-line">
              Locked hours:{' '}
              {formatHours(
                scopeItems.reduce((sum, item) => sum + Number(item.estimatedHours || 0), 0)
              )}{' '}
              · Rate {formatPrice(project.hourlyRate)}/hr
            </p>
          </section>
        </>
      )}
    </AppShell>
  );
}

export default ScopeBuilder;
