import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/shared/AppShell';
import LoadingState from '../components/shared/LoadingState';
import { getErrorMessage } from '../utils/errors';
import { formatHours, formatPrice } from '../utils/format';

function ChangeOrderReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [changeOrder, setChangeOrder] = useState(null);
  const [project, setProject] = useState(null);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await api.get(`/api/change-orders/${id}`);
      const order = data.changeOrder;
      setChangeOrder(order);
      setHours(String(order.estimatedHours));
      setDescription(order.description || '');
      setIsBlocking(Boolean(order.isBlocking));

      const projectRes = await api.get(`/api/projects/${order.projectId}`);
      setProject(projectRes.data.project);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Unable to load change order'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const computedPrice = useMemo(() => {
    const rate = Number(project?.hourlyRate) || 0;
    const value = Number(hours);
    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }
    return Math.round(value * rate * 100) / 100;
  }, [hours, project]);

  const isDraft = changeOrder?.status === 'draft';
  const canEdit = isDraft;

  const validate = () => {
    const next = {};
    const value = Number(hours);
    if (!Number.isFinite(value) || value <= 0 || value > 500) {
      next.hours = 'Hours must be greater than 0 and at most 500';
    }
    if (!description.trim() || description.trim().length < 3) {
      next.description = 'Description must be at least 3 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put(`/api/change-orders/${id}`, {
        estimatedHours: Number(hours),
        description: description.trim(),
        isBlocking,
      });
      setChangeOrder(data.changeOrder);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to save draft'));
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    setFormError('');
    if (!validate()) {
      return;
    }

    setSending(true);
    try {
      await api.put(`/api/change-orders/${id}`, {
        estimatedHours: Number(hours),
        description: description.trim(),
        isBlocking,
      });
      const { data } = await api.put(`/api/change-orders/${id}/send`, {
        estimatedHours: Number(hours),
      });
      setChangeOrder(data.changeOrder);
      navigate(`/projects/${data.changeOrder.projectId}`);
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to send change order'));
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      {loading && <LoadingState label="Loading change order..." />}
      {!loading && loadError && <div className="form-error">{loadError}</div>}

      {!loading && !loadError && changeOrder && project && (
        <>
          <div className="page-header">
            <div>
              <p className="breadcrumb">
                <Link to="/">Projects</Link>
                {' / '}
                <Link to={`/projects/${project._id}`}>{project.title}</Link>
                {' / Change order'}
              </p>
              <h1>Change order review</h1>
              <p>
                Status: {changeOrder.status}
                {changeOrder.isBlocking ? ' · blocking' : ''}
              </p>
            </div>
            <Link to={`/projects/${project._id}`} className="btn btn-ghost">
              Back to project
            </Link>
          </div>

          <section className="panel">
            <form className="form-grid" onSubmit={handleSave} noValidate>
              <div className="form-row">
                <label htmlFor="co-description">Description</label>
                <textarea
                  id="co-description"
                  name="description"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canEdit}
                />
                {errors.description && (
                  <span className="field-error">{errors.description}</span>
                )}
              </div>

              <div className="form-row">
                <label htmlFor="co-hours">Estimated hours</label>
                <input
                  id="co-hours"
                  name="estimatedHours"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  disabled={!canEdit}
                />
                {errors.hours && <span className="field-error">{errors.hours}</span>}
              </div>

              <div className="form-row">
                <label htmlFor="co-price">Computed price</label>
                <input
                  id="co-price"
                  name="price"
                  type="text"
                  readOnly
                  value={formatPrice(canEdit ? computedPrice : changeOrder.price)}
                />
                <span className="meta">
                  {formatHours(canEdit ? Number(hours) || 0 : changeOrder.estimatedHours)}{' '}
                  × {formatPrice(project.hourlyRate)}/hr
                </span>
              </div>

              <div className="form-row checkbox-row">
                <input
                  id="co-blocking"
                  name="isBlocking"
                  type="checkbox"
                  checked={isBlocking}
                  onChange={(e) => setIsBlocking(e.target.checked)}
                  disabled={!canEdit}
                />
                <label htmlFor="co-blocking">
                  Mark as blocking (pauses the project until the client responds)
                </label>
              </div>

              {formError && <div className="form-error">{formError}</div>}

              {canEdit ? (
                <div className="action-row">
                  <button type="submit" className="btn btn-ghost" disabled={saving || sending}>
                    {saving ? <LoadingState label="Saving..." /> : 'Save draft'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={saving || sending}
                    onClick={handleSend}
                  >
                    {sending ? <LoadingState label="Sending..." /> : 'Send to client'}
                  </button>
                </div>
              ) : (
                <p className="meta">
                  This change order is {changeOrder.status} and can no longer be edited.
                </p>
              )}
            </form>
          </section>
        </>
      )}
    </AppShell>
  );
}

export default ChangeOrderReview;
