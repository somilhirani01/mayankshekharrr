import { Link } from 'react-router-dom';
import { formatHours, formatPrice } from '../../utils/format';

function ChangeOrderSummary({ changeOrder, hourlyRate }) {
  if (!changeOrder) {
    return null;
  }

  return (
    <article className="data-row">
      <div>
        <h3>{changeOrder.description}</h3>
        <p className="meta">
          {changeOrder.status}
          {changeOrder.isBlocking ? ' · blocking' : ''} ·{' '}
          {formatHours(changeOrder.estimatedHours)} · {formatPrice(changeOrder.price)}
          {hourlyRate != null ? ` (${formatPrice(hourlyRate)}/hr)` : ''}
        </p>
      </div>
      <Link to={`/change-orders/${changeOrder._id}`} className="btn btn-ghost">
        Open
      </Link>
    </article>
  );
}

export default ChangeOrderSummary;
