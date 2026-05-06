import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Check } from 'lucide-react';
import { apiService } from '../services/api';
import { formatCurrency, getRatingStars } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const LandingPage = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [budget, setBudget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popularDestinations, setPopularDestinations] = useState([]);

  useEffect(() => {
    fetchCities();
    fetchPopularDestinations();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await apiService.getCities();
      setCities(response.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchPopularDestinations = async () => {
    try {
      const response = await apiService.getPopularDestinations({ limit: 6 });
      setPopularDestinations(response.data);
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedCity) {
      setError('Please select a city');
      return;
    }

    if (!budget || budget < 10000) {
      setError('Please enter a valid budget (minimum Rp 10,000)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.generatePackages({
        city_id: selectedCity,
        budget: parseFloat(budget),
        packages_count: 3,
        max_places: 4
      });

      if (response.data.packages.length === 0) {
        setError('No packages found for your criteria. Try increasing your budget or selecting a different city.');
      } else {
        // Store search results in sessionStorage for PackagePage
        sessionStorage.setItem('searchResults', JSON.stringify(response.data));
        sessionStorage.setItem('searchCriteria', JSON.stringify({
          city_id: selectedCity,
          budget: parseFloat(budget)
        }));
        
        navigate('/packages');
      }
    } catch (error) {
      setError('Failed to search packages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: MapPin,
      title: 'Multi-City Support',
      description: 'Explore 9 major cities in Central Java with comprehensive travel information'
    },
    {
      icon: Calendar,
      title: 'Smart Planning',
      description: 'AI-powered package generation based on your budget and preferences'
    },
    {
      icon: Users,
      title: 'Local Experiences',
      description: 'Authentic cultural experiences and hidden gems recommended by locals'
    },
    {
      icon: Star,
      title: 'Best Value',
      description: 'Optimized packages that give you the most value for your budget'
    }
  ];

  const citiesToShow = cities.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white hero-pattern">
        <div className="container section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Discover Central Java
              <span className="block text-3xl md:text-5xl mt-2 text-primary-200">
                Your Perfect Adventure Awaits
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-100 mb-12 animate-slide-up">
              Plan your dream trip with AI-powered travel packages tailored to your budget
            </p>

            {/* Search Form */}
            <form id="search-form" onSubmit={handleSearch} className="bg-white rounded-2xl shadow-large p-6 md:p-8 max-w-2xl mx-auto animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Select City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="select-field"
                    required
                  >
                    <option value="">Choose a city...</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Budget (IDR)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g., 1500000"
                    className="input-field"
                    min="10000"
                    step="10000"
                    required
                  />
                </div>
              </div>

              <ErrorMessage error={error} className="mb-4" />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner size="small" text="" />
                    <span>Finding your perfect trip...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Find My Trip</span>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Wisata Jateng?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the best of Central Java with our intelligent travel planning system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Cities
            </h2>
            <p className="text-xl text-gray-600">
              Explore amazing destinations across Central Java
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {citiesToShow.map((city) => (
              <div key={city.id} className="card-hover cursor-pointer group">
                <div className="h-48 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-t-xl flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {city.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Discover amazing destinations and experiences
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCity(String(city.id));
                      setBudget('1500000');
                      const form = document.getElementById('search-form');
                      if (form) {
                        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1 group-hover:space-x-2 transition-all duration-200"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      {popularDestinations.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trending Destinations
              </h2>
              <p className="text-xl text-gray-600">
                Most visited places by our travelers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDestinations.map((destination, index) => (
                <div key={index} className="card-hover">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {destination.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {destination.city_name}
                        </p>
                      </div>
                      <span className="badge-primary">
                        {destination.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">
                          {destination.booking_count} bookings
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">
                          {destination.total_visits} visits
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered the beauty of Central Java with our smart travel planner
          </p>
          <button
            onClick={() => {
              const form = document.getElementById('search-form');
              if (form) {
                form.scrollIntoView({ behavior: 'smooth', block: 'center' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="btn-accent text-lg px-8 py-3"
          >
            Start Planning Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
