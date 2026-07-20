import { useState, useEffect } from 'react';
import LoadingState from '../shared/LoadingState';

const emptyForm = {
  title: '',
  description: '',
  categoryTag: '',
  estimatedHours: '',
};

function ScopeItemForm({ initialValues, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initialValues || emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm(initialValues || emptyForm);
    setErrors({});
    setFormError('');
  }, [initialValues]);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    const next = {};
    const title = form.title.trim();
    const tag = form.categoryTag.trim().toLowerCase();
    const hours = Number(form.estimatedHours);

    if (!title || title.length < 3 || title.length > 150) {
      next.title = 'Title must be between 3 and 150 characters';
    }
    if (!/^[a-z0-9-]{2,30}$/.test(tag)) {
      next.categoryTag =
        'Tag must be 2-30 chars: lowercase letters, numbers, hyphens only';
    }
    if (!Number.isFinite(hours) || hours <= 0 || hours > 500) {
      next.estimatedHours = 'Hours must be greater than 0 and at most 500';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        categoryTag: form.categoryTag.trim().toLowerCase(),
        estimatedHours: Number(form.estimatedHours),
      });
      if (!initialValues) {
        setForm(emptyForm);
      }
    } catch (err) {
      setFormError(err.message || 'Unable to save scope item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label htmlFor="scope-title">Title</label>
        <input
          id="scope-title"
          name="title"
          type="text"
          value={form.title}
          onChange={updateField('title')}
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-row">
        <label htmlFor="scope-description">Description (optional)</label>
        <textarea
          id="scope-description"
          name="description"
          rows="3"
          value={form.description}
          onChange={updateField('description')}
        />
      </div>

      <div className="form-row">
        <label htmlFor="scope-tag">Category tag</label>
        <input
          id="scope-tag"
          name="categoryTag"
          type="text"
          placeholder="e.g. frontend"
          value={form.categoryTag}
          onChange={updateField('categoryTag')}
        />
        {errors.categoryTag && (
          <span className="field-error">{errors.categoryTag}</span>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="scope-hours">Estimated hours</label>
        <input
          id="scope-hours"
          name="estimatedHours"
          type="number"
          min="0.01"
          step="0.01"
          value={form.estimatedHours}
          onChange={updateField('estimatedHours')}
        />
        {errors.estimatedHours && (
          <span className="field-error">{errors.estimatedHours}</span>
        )}
      </div>

      {formError && <div className="form-error">{formError}</div>}

      <div className="action-row">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? <LoadingState label="Saving..." /> : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ScopeItemForm;
