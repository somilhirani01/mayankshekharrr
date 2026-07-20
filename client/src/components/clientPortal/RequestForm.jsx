import { useState } from 'react';
import api from '../../services/api';
import LoadingState from '../shared/LoadingState';
import { getErrorMessage } from '../../utils/errors';

function RequestForm({ token, categoryTags, onSubmitted }) {
  const [requestText, setRequestText] = useState('');
  const [categoryTag, setCategoryTag] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    const text = requestText.trim();
    if (!text || text.length < 10 || text.length > 2000) {
      next.requestText = 'Request text must be between 10 and 2000 characters';
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
      const body = { requestText: requestText.trim() };
      if (categoryTag) {
        body.categoryTag = categoryTag;
      }
      await api.post(`/api/portal/${token}/requests`, body);
      setRequestText('');
      setCategoryTag('');
      onSubmitted();
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to submit request'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label htmlFor="portal-request">Request details</label>
        <textarea
          id="portal-request"
          name="requestText"
          rows="5"
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          placeholder="Describe what you need..."
        />
        {errors.requestText && (
          <span className="field-error">{errors.requestText}</span>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="portal-tag">Category tag (optional)</label>
        <select
          id="portal-tag"
          name="categoryTag"
          value={categoryTag}
          onChange={(e) => setCategoryTag(e.target.value)}
        >
          <option value="">No tag</option>
          {categoryTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {formError && <div className="form-error">{formError}</div>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? <LoadingState label="Submitting..." /> : 'Submit request'}
      </button>
    </form>
  );
}

export default RequestForm;
