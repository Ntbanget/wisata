import React, { useState } from 'react';
import { Settings, Save, Bell, Shield, Database, Globe } from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'Wisata Jawa Tengah',
    siteEmail: 'info@wisata.com',
    sitePhone: '+62 812-3456-7890',
    enableNotifications: true,
    enableAutoApproval: false,
    maintenanceMode: false,
    maxBookingDays: 30,
    minBookingDays: 1,
  });

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement save functionality
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'general' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>General</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notifications' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'database' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Database className="w-5 h-5" />
                <span>Database</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Email
                  </label>
                  <input
                    type="email"
                    value={settings.siteEmail}
                    onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.sitePhone}
                    onChange={(e) => setSettings({ ...settings, sitePhone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                    <p className="text-sm text-gray-600">Disable the site for maintenance</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.maintenanceMode ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable Email Notifications</h3>
                    <p className="text-sm text-gray-600">Send email notifications for bookings</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, enableNotifications: !settings.enableNotifications })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Auto-approve Bookings</h3>
                    <p className="text-sm text-gray-600">Automatically approve bookings without admin verification</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, enableAutoApproval: !settings.enableAutoApproval })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.enableAutoApproval ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.enableAutoApproval ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Database Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Booking Days (in advance)
                  </label>
                  <input
                    type="number"
                    value={settings.maxBookingDays}
                    onChange={(e) => setSettings({ ...settings, maxBookingDays: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                    max="365"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Booking Days (in advance)
                  </label>
                  <input
                    type="number"
                    value={settings.minBookingDays}
                    onChange={(e) => setSettings({ ...settings, minBookingDays: parseInt(e.target.value) })}
                    className="input-field"
                    min="1"
                    max="30"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
