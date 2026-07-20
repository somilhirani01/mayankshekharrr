import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingState from './LoadingState';
import { getErrorMessage } from '../../utils/errors';

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load notifications'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const markRead = async (notification) => {
    if (notification.isRead) {
      return;
    }
    try {
      const { data } = await api.put(`/api/notifications/${notification._id}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? data.notification : item
        )
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to mark notification as read'));
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((item) => !item.isRead);
    try {
      await Promise.all(
        unread.map((item) => api.put(`/api/notifications/${item._id}/read`))
      );
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to mark notifications as read'));
    }
  };

  return (
    <div className="notification-wrap" ref={panelRef}>
      <button
        type="button"
        className="btn btn-ghost notification-trigger"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) {
            loadNotifications();
          }
        }}
      >
        <svg
          className="bell-icon"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 20a2 2 0 0 0 4 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-count" aria-label={`${unreadCount} unread`}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel" role="dialog" aria-label="Notifications">
          <div className="notification-panel-header">
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button type="button" className="link-btn" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          {loading && <LoadingState label="Loading..." />}
          {!loading && error && <div className="form-error">{error}</div>}
          {!loading && !error && notifications.length === 0 && (
            <p className="empty-state">No notifications yet.</p>
          )}
          {!loading && !error && notifications.length > 0 && (
            <ul className="notification-list">
              {notifications.map((item) => (
                <li
                  key={item._id}
                  className={item.isRead ? 'is-read' : 'is-unread'}
                >
                  <button
                    type="button"
                    className="notification-item"
                    onClick={() => markRead(item)}
                  >
                    <span>{item.message}</span>
                    <span className="meta">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </button>
                  {item.projectId && (
                    <Link
                      to={`/projects/${item.projectId}`}
                      className="notification-link"
                      onClick={() => {
                        markRead(item);
                        setOpen(false);
                      }}
                    >
                      Open project
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
