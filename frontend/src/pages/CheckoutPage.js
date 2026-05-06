import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, CreditCard, Shield, Check } from 'lucide-react';
import { apiService } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatCurrency, isValidEmail, getHotelCategoryLabel, getPlaceCategoryIcon } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CheckoutPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { selectedPackage, setCurrentBooking, addToBookingHistory } = useBooking();
  const [packageData, setPackageData] = useState(null);
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    loadPackageData();
  }, [packageId]);

  const loadPackageData = () => {
    const numericId = parseInt(packageId);

    // Prefer current in-memory selection
    if (selectedPackage && selectedPackage.id === numericId) {
      setPackageData(selectedPackage);
      return;
    }

    // Custom trip path: id=0 from /explore "Book This Trip"
    if (numericId === 0) {
      const savedCustom = sessionStorage.getItem('customPackage');
      if (savedCustom) {
        try {
          setPackageData(JSON.parse(savedCustom));
          return;
        } catch (error) {
          // fall through
        }
      }
      navigate('/explore');
      return;
    }

    // Fallback: pre-made package from search results
    const savedResults = sessionStorage.getItem('searchResults');
    if (savedResults) {
      try {
        const results = JSON.parse(savedResults);
        const foundPackage = results.packages.find(p => p.id === numericId);
        if (foundPackage) {
          setPackageData(foundPackage);
          return;
        }
      } catch (error) {
        // fall through
      }
    }
    navigate('/packages');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = 'Name is required';
    } else if (formData.user_name.trim().length < 2) {
      newErrors.user_name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!packageData) {
      setErrors({ general: 'Package data not found' });
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      const bookingData = {
        user_name: formData.user_name.trim(),
        email: formData.email.trim().toLowerCase(),
        city_id: packageData.hotel.city_id,
        total_price: packageData.total_price,
        budget: packageData.budget,
        hotel_id: packageData.hotel.id,
        tourist_places: packageData.tourist_places.map(place => ({
          id: place.id,
          ticket_price: place.ticket_price
        }))
      };

      const response = await apiService.createBooking(bookingData);
      
      // Update booking context
      setCurrentBooking(response.data);
      addToBookingHistory(response.data);
      
      setBookingId(response.data.id);
      setBookingComplete(true);
      
      // Clear form
      setFormData({
        user_name: '',
        email: '',
        phone: ''
      });
      
    } catch (error) {
      setErrors({ 
        general: error.error || 'Failed to create booking. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (packageData?.isCustom || parseInt(packageId) === 0) {
      navigate('/explore');
    } else {
      navigate(`/detail/${packageId}`);
    }
  };

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading checkout..." />
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Confirmed!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your travel package has been successfully booked. 
              Booking ID: #{bookingId}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/success/${bookingId}`)}
                className="w-full btn-primary"
              >
                View Booking Details
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full btn-outline"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
                {packageData?.isCustom && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                    Custom Trip
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                {packageData?.isCustom
                  ? `Your custom trip with ${packageData.hotel.name}`
                  : 'Complete your booking'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="user_name"
                      value={formData.user_name}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  {errors.user_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.user_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field pl-10"
                      placeholder="+62 812-3456-7890"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <ErrorMessage error={errors.general} className="mb-6" />

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Secure Booking</p>
                      <p>Your personal information is protected with industry-standard security. We never share your data with third parties.</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="small" text="" />
                      <span>Processing Booking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Complete Booking</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Hotel */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Hotel</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{packageData.hotel.name}</div>
                  <div className="text-sm text-gray-600">
                    {getHotelCategoryLabel(packageData.hotel.category)} • 1 night
                  </div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {formatCurrency(packageData.hotel.price_per_night)}
                  </div>
                </div>
              </div>

              {/* Destinations */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Destinations ({packageData.tourist_places.length})
                </h4>
                <div className="space-y-2">
                  {packageData.tourist_places.map((place, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{getPlaceCategoryIcon(place.category)}</span>
                          <span className="text-sm font-medium text-gray-900">{place.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatCurrency(place.ticket_price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(packageData.total_price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(packageData.total_price)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings */}
              {packageData.budget > packageData.total_price && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm text-green-800">
                    <span>You save</span>
                    <span className="font-medium">
                      {formatCurrency(packageData.budget - packageData.total_price)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
