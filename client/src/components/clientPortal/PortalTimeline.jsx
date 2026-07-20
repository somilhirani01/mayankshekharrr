import { formatHours, formatPrice } from '../../utils/format';

function PortalTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return <p className="empty-state">No scope items yet.</p>;
  }

  return (
    <ol className="timeline-list">
      {timeline.map((entry) => (
        <li key={`${entry.type}-${entry.id}`}>
          <div className="timeline-marker" aria-hidden="true" />
          <div>
            <p className="meta">
              {entry.type === 'scope_item' ? 'Original scope' : 'Approved change'}
            </p>
            <h3>{entry.title}</h3>
            <p className="meta">
              {formatHours(entry.hours)}
              {entry.price != null ? ` · ${formatPrice(entry.price)}` : ''}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default PortalTimeline;
