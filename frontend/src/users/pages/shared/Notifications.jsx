// src/users/pages/shared/Notifications.jsx
import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Truck, 
  Package, 
  CreditCard, 
  FileText,
  CheckCheck,
  RefreshCw,
  Eye
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Map notification types to icons and colors
const notificationIcons = {
  'request_approved': CheckCircle,
  'request_rejected': AlertCircle,
  'new_request': Package,
  'job_accepted': Truck,
  'delivery_started': Truck,
  'delivery_completed': CheckCircle,
  'payment_received': CreditCard,
  'invoice_generated': FileText,
};

const notificationColors = {
  'request_approved': 'text-green-600 bg-green-50',
  'request_rejected': 'text-red-600 bg-red-50',
  'new_request': 'text-blue-600 bg-blue-50',
  'job_accepted': 'text-purple-600 bg-purple-50',
  'delivery_started': 'text-yellow-600 bg-yellow-50',
  'delivery_completed': 'text-green-600 bg-green-50',
  'payment_received': 'text-emerald-600 bg-emerald-50',
  'invoice_generated': 'text-indigo-600 bg-indigo-50',
};

export default function Notifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ─── Fetch notifications from backend ─────────────────────
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch notifications');

        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to empty state
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // ─── Mark all as read ──────────────────────────────────────
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // ─── Mark single notification as read ──────────────────────
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // ─── Format time ────────────────────────────────────────────
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      {/* ─── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated with platform activity</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#11402D] text-white rounded-xl text-sm font-medium hover:bg-[#0E2A1C] transition"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* ─── Notification List ────────────────────────────────── */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-gray-700">No notifications yet</h3>
          <p className="text-gray-500 mt-2">We'll notify you when something happens</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => {
              const Icon = notificationIcons[notif.type] || Bell;
              const colorClass = notificationColors[notif.type] || 'text-gray-600 bg-gray-50';
              const isUnread = !notif.is_read;

              return (
                <div
                  key={notif.id}
                  className={`p-4 transition cursor-pointer hover:bg-gray-50 ${
                    isUnread ? 'bg-blue-50/30 border-l-4 border-l-[#11402D]' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{notif.title}</p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-400">{formatTime(notif.created_at)}</span>
                        {isUnread && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            New
                          </span>
                        )}
                        {notif.type && (
                          <span className="text-xs text-gray-400 capitalize">
                            {notif.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}