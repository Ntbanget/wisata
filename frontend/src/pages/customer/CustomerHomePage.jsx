import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Users, Calendar, Search } from 'lucide-react';
import apiService from '../../services/api';

const CustomerHomePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city_id: '',
    budget: '',
    people: 1,
    nights: 1
  });
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await apiService.get('/cities');
        const cityList = response.data || response;
        setCities(Array.isArray(cityList) ? cityList : []);
      } catch (error) {
        console.error('Gagal fetch cities:', error);
        // Fallback hardcode
        setCities([
          { id: 1, name: 'Semarang' },
          { id: 2, name: 'Magelang' },
          { id: 3, name: 'Wonosobo' },
          { id: 4, name: 'Jepara' },
          { id: 5, name: 'Karanganyar' },
          { id: 6, name: 'Banyumas' },
          { id: 7, name: 'Solo' },
          { id: 8, name: 'Kebumen' },
          { id: 9, name: 'Klaten' },
          { id: 10, name: 'Purworejo' }
        ]);
      }
    };
    fetchCities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const getVehicleInfo = (people) => {
    if (people <= 4) return '🚗 Mobil';
    if (people <= 10) return '🚐 Hiace';
    if (people <= 18) return '🚌 Elf';
    if (people <= 30) return '🚌 Medium Bus';
    return '🚌 Big Bus';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!formData.city_id) {
      setError('Pilih kota terlebih dahulu');
      return;
    }
    if (!formData.budget || formData.budget < 10000) {
      setError('Budget minimal Rp 10.000');
      return;
    }
    if (!formData.nights || formData.nights < 1) {
      setError('Jumlah malam minimal 1');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        city_id: String(formData.city_id),
        budget: String(formData.budget),
        nights: String(formData.nights)
      });

      const response = await apiService.get(`/packages?${params}`);

      const packages = response?.data?.packages || response?.packages || [];

      if (packages.length === 0) {
        setError('Tidak ada paket yang sesuai. Coba ubah budget atau kota.');
        setIsProcessing(false);
        return;
      }

      sessionStorage.setItem('searchResults', JSON.stringify({
        packages: packages
      }));
      sessionStorage.setItem('searchCriteria', JSON.stringify({
        city_id: formData.city_id,
        budget: formData.budget,
        nights: formData.nights,
        people: formData.people
      }));

      navigate('/packages');

    } catch (error) {
      console.error('Search error full:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      setError('Gagal mencari paket. Pastikan server berjalan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Rencanakan Perjalanan Impianmu
          </h1>
          <p className="text-lg text-gray-600">
            Jelajahi keindahan Jawa Tengah bersama orang tersayang
          </p>
        </div>

        {/* Search Form Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* City Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota Tujuan
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    name="city_id"
                    value={formData.city_id}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Pilih Kota</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (Rp)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                    placeholder="Contoh: 2000000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="10000"
                  />
                  {formData.budget && (
                    <span className="text-sm text-gray-500 mt-1">
                      Rp {parseInt(formData.budget).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </div>

              {/* People and Nights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Orang
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="people"
                      value={formData.people}
                      onChange={(e) => setFormData({ ...formData, people: parseInt(e.target.value) })}
                      placeholder="Contoh: 4"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      min="1"
                    />
                  </div>
                  {formData.people && (
                    <p className="text-sm text-blue-600 mt-1">
                      Kendaraan: {getVehicleInfo(formData.people)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Malam
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      name="nights"
                      value={formData.nights}
                      onChange={handleInputChange}
                      placeholder="1"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <span>Mencari...</span>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Cari Paket Wisata</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerHomePage;
