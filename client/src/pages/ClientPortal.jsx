import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingState from '../components/shared/LoadingState';
import RequestForm from '../components/clientPortal/RequestForm';
import PendingChangeOrders from '../components/clientPortal/PendingChangeOrders';
import PortalTimeline from '../components/clientPortal/PortalTimeline';
import { getErrorMessage } from '../utils/errors';
import { formatHours, formatPrice } from '../utils/format';

function SuccessIcon() {
  return (
    <svg
      className="success-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClientPortal() {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [categoryTags, setCategoryTags] = useState([]);
  const [pendingChangeOrders, setPendingChangeOrders] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [totals, setTotals] = useState({ totalPrice: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadPortal = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [portalRes, timelineRes] = await Promise.all([
        api.get(`/api/portal/${token}`),
        api.get(`/api/portal/${token}/timeline`),
      ]);

      setProject(portalRes.data.project);
      setCategoryTags(portalRes.data.categoryTags || []);
      setPendingChangeOrders(portalRes.data.pendingChangeOrders || []);
      setTimeline(timelineRes.data.timeline || []);
      setTotals(
        timelineRes.data.totals || {
          totalPrice: portalRes.data.project.totalPrice,
          totalHours: portalRes.data.project.totalHours,
        }
      );
    } catch (err) {
      setLoadError(getErrorMessage(err, 'Unable to open this portal link'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortal();
  }, [token]);

  const handleRequestSubmitted = () => {
    setSuccessMessage('Your request was submitted. The freelancer has been notified.');
    loadPortal();
  };

  const handleChangeOrderResolved = (message) => {
    setSuccessMessage(message);
    loadPortal();
  };

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="brand">ScopeLock</div>
        <p className="meta">Client portal</p>
      </header>

      <main className="portal-main">
        {loading && <LoadingState label="Loading portal..." />}
        {!loading && loadError && <div className="form-error">{loadError}</div>}

        {!loading && !loadError && project && (
          <>
            <section className="portal-intro">
              <h1>{project.title}</h1>
              <p>
                Prepared for {project.clientName}. Submit requests against the locked
                scope, and review any change orders here.
              </p>
              <p className="meta">
                Project status: {project.status} · Running total{' '}
                {formatPrice(totals.totalPrice)} / {formatHours(totals.totalHours)}
              </p>
            </section>

            {successMessage && (
              <div className="success-banner" role="status">
                <SuccessIcon />
                <span>{successMessage}</span>
              </div>
            )}

            <PendingChangeOrders
              token={token}
              changeOrders={pendingChangeOrders}
              onResolved={handleChangeOrderResolved}
            />

            <section className="panel create-panel">
              <h2 className="section-title">Submit a request</h2>
              <RequestForm
                token={token}
                categoryTags={categoryTags}
                onSubmitted={handleRequestSubmitted}
              />
            </section>

            <section className="panel">
              <h2 className="section-title">Scope timeline</h2>
              <PortalTimeline timeline={timeline} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ClientPortal;
