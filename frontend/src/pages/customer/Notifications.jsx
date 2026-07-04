import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getNotifications();

      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && Array.isArray(response.data)) {
        items = response.data;
      } else if (response && Array.isArray(response.notifications)) {
        items = response.notifications;
      } else if (response && response.success === false) {
        throw new Error(response.message || response.error || 'Failed to fetch notifications');
      }

      setNotifications(items);

      if (Array.isArray(items) && items.length > 0) {
        const unread = items.filter((notification) => !notification.is_read);
        if (unread.length > 0) {
          await Promise.all(
            unread.map((notification) =>
              apiService.markNotificationAsRead(notification.id).catch((err) => console.warn('mark read failed', err))
            )
          );
        }
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err?.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Memuat notifikasi..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pesan Saya</h1>
        <p className="text-gray-600 mt-2">Semua notifikasi dan pesan dari sistem dan admin.</p>
      </div>

      {error && <ErrorMessage error={error} />}

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Belum ada notifikasi.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm border p-5 ${item.is_read ? 'border-gray-200' : 'border-indigo-300 bg-indigo-50'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString('id-ID')}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{item.title}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.is_read ? 'bg-gray-100 text-gray-600' : 'bg-indigo-600 text-white'}`}>
                  {item.is_read ? 'Sudah dibaca' : 'Baru'}
                </span>
              </div>
              <div className="mt-4 text-gray-700 whitespace-pre-line">{item.message}</div>
              <div className="mt-4 text-xs text-gray-500">
                Dari: {item.created_by || 'SYSTEM'}{item.admin_name ? ` • ${item.admin_name}` : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
