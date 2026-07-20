import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import AppShell from '../components/shared/AppShell';
import LoadingState from '../components/shared/LoadingState';
import { getErrorMessage } from '../utils/errors';
import {
  classificationLabel,
  formatHours,
  formatPrice,
} from '../utils/format';

const TABS = [
  { id: 'scope', label: 'Scope' },
  { id: 'requests', label: 'Requests' },
  { id: 'changeOrders', label: 'Change orders' },
  { id: 'timeline', label: 'Timeline' },
];

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('scope');
  const [project, setProject] = useState(null);
  const [scopeItems, setScopeItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [changeOrders, setChangeOrders] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [copied, setCopied] = useState(false);
  const [creatingFor, setCreatingFor] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [projectRes, scopeRes, requestRes, changeRes, timelineRes] =
        await Promise.all([
          api.get(`/api/projects/${id}`),
          api.get(`/api/projects/${id}/scope-items`),
          api.get(`/api/projects/${id}/requests`),
          api.get(`/api/projects/${id}/change-orders`),
          api.get(`/api/projects/${id}/timeline`),
        ]);

      setProject(projectRes.data.project);
      setScopeItems(scopeRes.data.scopeItems || []);
      setRequests(requestRes.data.requests || []);
      setChangeOrders(changeRes.data.changeOrders || []);
      setTimeline(timelineRes.data.timeline || []);
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Unable to load project'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const portalUrl =
    project && typeof window !== 'undefined'
      ? `${window.location.origin}/portal/${project.portalToken}`
      : '';

  const copyPortalLink = async () => {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      setActionError('Unable to copy portal link');
    }
  };

  const handleGenerateChangeOrder = async (requestId) => {
    setActionError('');
    setCreatingFor(requestId);
    try {
      const { data } = await api.post(`/api/requests/${requestId}/change-order`, {
        estimatedHours: 2,
        isBlocking: false,
      });
      navigate(`/change-orders/${data.changeOrder._id}`);
    } catch (err) {
      setActionError(getErrorMessage(err, 'Unable to create change order'));
    } finally {
      setCreatingFor(null);
    }
  };

  return (
    <AppShell>
      {loading && <LoadingState label="Loading project..." />}
      {!loading && loadError && <div className="form-error">{loadError}</div>}

      {!loading && !loadError && project && (
        <>
          <div className="page-header">
            <div>
              <p className="breadcrumb">
                <Link to="/">Projects</Link>
                {' / '}
                {project.title}
              </p>
              <h1>{project.title}</h1>
              <p>
                Client {project.clientName} · {formatPrice(project.hourlyRate)}/hr ·
                Running total {formatPrice(project.totalPrice)} /{' '}
                {formatHours(project.totalHours)}
              </p>
            </div>
            <div className="action-row">
              <span
                className={`status-pill ${
                  project.status === 'paused' ? 'status-paused' : 'status-active'
                }`}
              >
                {project.status}
              </span>
              <Link to={`/projects/${id}/scope`} className="btn btn-primary">
                Open scope builder
              </Link>
            </div>
          </div>

          <section className="panel create-panel">
            <h2 className="section-title">Client portal link</h2>
            <div className="portal-link-row">
              <input
                aria-label="Client portal link"
                type="text"
                readOnly
                value={portalUrl}
              />
              <button type="button" className="btn btn-ghost" onClick={copyPortalLink}>
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
          </section>

          {actionError && <div className="form-error">{actionError}</div>}

          <div className="tabs" role="tablist" aria-label="Project sections">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={`tab ${tab === item.id ? 'tab-active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <section className="panel">
            {tab === 'scope' && (
              <>
                {scopeItems.length === 0 ? (
                  <p className="empty-state">
                    No scope items yet.{' '}
                    <Link to={`/projects/${id}/scope`}>Add items in the scope builder</Link>.
                  </p>
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
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'requests' && (
              <>
                {requests.length === 0 ? (
                  <p className="empty-state">No client requests yet.</p>
                ) : (
                  <div className="data-list">
                    {requests.map((request) => (
                      <article key={request._id} className="data-row">
                        <div>
                          <h3>{request.requestText}</h3>
                          <p className="meta">
                            {classificationLabel(request.classification)}
                            {request.categoryTag ? ` · ${request.categoryTag}` : ''}
                          </p>
                        </div>
                        <div className="action-row">
                          {(request.classification === 'possible_extra' ||
                            request.classification === 'unclear') &&
                            !request.changeOrderId && (
                              <button
                                type="button"
                                className="btn btn-primary"
                                disabled={creatingFor === request._id}
                                onClick={() => handleGenerateChangeOrder(request._id)}
                              >
                                {creatingFor === request._id ? (
                                  <LoadingState label="Creating..." />
                                ) : (
                                  'Generate change order'
                                )}
                              </button>
                            )}
                          {request.changeOrderId && (
                            <Link
                              to={`/change-orders/${request.changeOrderId}`}
                              className="btn btn-ghost"
                            >
                              View change order
                            </Link>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'changeOrders' && (
              <>
                {changeOrders.length === 0 ? (
                  <p className="empty-state">No change orders yet.</p>
                ) : (
                  <div className="data-list">
                    {changeOrders.map((order) => (
                      <article key={order._id} className="data-row">
                        <div>
                          <h3>{order.description}</h3>
                          <p className="meta">
                            {order.status}
                            {order.isBlocking ? ' · blocking' : ''} ·{' '}
                            {formatHours(order.estimatedHours)} ·{' '}
                            {formatPrice(order.price)}
                          </p>
                        </div>
                        <Link
                          to={`/change-orders/${order._id}`}
                          className="btn btn-ghost"
                        >
                          Open
                        </Link>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'timeline' && (
              <>
                {timeline.length === 0 ? (
                  <p className="empty-state">Timeline is empty.</p>
                ) : (
                  <ol className="timeline-list">
                    {timeline.map((entry) => (
                      <li key={`${entry.type}-${entry.id}`}>
                        <div className="timeline-marker" aria-hidden="true" />
                        <div>
                          <p className="meta">
                            {entry.type === 'scope_item' ? 'Scope item' : 'Approved change'}
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
                )}
              </>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

export default ProjectDetail;
