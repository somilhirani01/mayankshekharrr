import { useState } from 'react';
import api from '../../services/api';
import LoadingState from '../shared/LoadingState';
import { getErrorMessage } from '../../utils/errors';
import { formatHours, formatPrice } from '../../utils/format';

function PendingChangeOrders({ token, changeOrders, onResolved }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  if (!changeOrders || changeOrders.length === 0) {
    return null;
  }

  const respond = async (orderId, action) => {
    setError('');
    setBusyId(`${orderId}-${action}`);
    try {
      await api.put(`/api/portal/${token}/change-orders/${orderId}/${action}`);
      onResolved(
        action === 'approve'
          ? 'Change order approved. The project total has been updated.'
          : 'Change order declined. Project totals were not changed.'
      );
    } catch (err) {
      setError(getErrorMessage(err, `Unable to ${action} change order`));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="panel create-panel">
      <h2 className="section-title">Pending change orders</h2>
      {error && <div className="form-error">{error}</div>}
      <div className="data-list">
        {changeOrders.map((order) => (
          <article key={order._id} className="data-row portal-co-row">
            <div>
              <h3>{order.description}</h3>
              <p className="meta">
                {formatHours(order.estimatedHours)} · {formatPrice(order.price)}
                {order.isBlocking ? ' · blocking' : ''}
              </p>
            </div>
            <div className="action-row">
              <button
                type="button"
                className="btn btn-primary"
                disabled={Boolean(busyId)}
                onClick={() => respond(order._id, 'approve')}
              >
                {busyId === `${order._id}-approve` ? (
                  <LoadingState label="Approving..." />
                ) : (
                  'Approve'
                )}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={Boolean(busyId)}
                onClick={() => respond(order._id, 'decline')}
              >
                {busyId === `${order._id}-decline` ? (
                  <LoadingState label="Declining..." />
                ) : (
                  'Decline'
                )}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PendingChangeOrders;
