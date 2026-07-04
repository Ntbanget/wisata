import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container max-w-4xl">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-sm">
              {getInitials(user?.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
              <p className="text-gray-600">Informasi akun Anda tetap aman dan digunakan hanya untuk kelengkapan booking.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Nama</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{user?.name || '-'}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{user?.email || '-'}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-5 md:col-span-2">
              <p className="text-sm text-gray-500">Nomor Telepon</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">{user?.phone || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
