import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, CreditCard, Shield, Check, Upload, Car, User as UserIcon, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, isValidEmail, getHotelCategoryLabel, getPlaceCategoryIcon } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CheckoutPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { selectedPackage, setCurrentBooking, addToBookingHistory } = useBooking();
  const { user, isAuthenticated } = useAuth();
  const [packageData, setPackageData] = useState(null);
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    phone: '',
    people_count: 1,
    nights: 1,
    trip_date: '',
    payment_method: 'transfer',
    payment_proof: null
  });
  const [vehicles, setVehicles] = useState([]);
  const [tourGuides, setTourGuides] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    loadPackageData();
    loadVehicles();
    loadTourGuides();
  }, [packageId]);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        user_name: user.name || prev.user_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [isAuthenticated, user]);

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

  const loadVehicles = async () => {
    try {
      const response = await apiService.getAllVehicles();
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  // Auto-select vehicle based on people count (RULES.md requirement)
  useEffect(() => {
    if (vehicles.length > 0 && formData.people_count > 0) {
      const peopleCount = formData.people_count;
      let category;
      
      if (peopleCount <= 4) {
        category = 'normal';
      } else if (peopleCount <= 10) {
        category = 'hiace';
      } else if (peopleCount <= 18) {
        category = 'elf';
      } else {
        category = 'bus';
      }
      
      // Find vehicle with matching category and sufficient capacity
      const recommendedVehicle = vehicles.find(v => 
        v.category === category && 
        v.capacity >= peopleCount &&
        v.available
      );
      
      if (recommendedVehicle) {
        setSelectedVehicle(recommendedVehicle);
      }
    }
  }, [vehicles, formData.people_count]);

  const loadTourGuides = async () => {
    try {
      const response = await apiService.getAllTourGuides();
      setTourGuides(response.data || []);
    } catch (error) {
      console.error('Error loading tour guides:', error);
    }
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

    if (!formData.trip_date) {
      newErrors.trip_date = 'Trip date is required';
    }

    if (formData.people_count < 1) {
      newErrors.people_count = 'At least 1 person is required';
    }

    if (formData.nights < 1) {
      newErrors.nights = 'At least 1 night is required';
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
      // Upload payment proof if provided
      let paymentProofUrl = null;
      if (formData.payment_proof) {
        setUploadingProof(true);
        try {
          const uploadResponse = await apiService.uploadPaymentProof(formData.payment_proof);
          paymentProofUrl = uploadResponse.file_url;
        } catch (uploadError) {
          setErrors({ general: 'Failed to upload payment proof. Please try again.' });
          setIsProcessing(false);
          setUploadingProof(false);
          return;
        }
        setUploadingProof(false);
      }

      // Calculate total rooms based on people count (1 room = 2 people max)
      const totalRooms = Math.ceil(formData.people_count / 2);

      const bookingData = {
        user_name: formData.user_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone ? formData.phone.trim() : null,
        city_id: packageData.hotel.city_id,
        total_price: packageData.total_price,
        budget: packageData.budget,
        hotel_id: packageData.hotel.id,
        tourist_places: packageData.tourist_places.map(place => ({
          id: place.id,
          ticket_price: place.ticket_price
        })),
        user_id: isAuthenticated ? user.id : null,
        vehicle_id: selectedVehicle ? selectedVehicle.id : null,
        guide_id: selectedGuide ? selectedGuide.id : null,
        payment_method: formData.payment_method,
        payment_proof: paymentProofUrl,
        trip_date: formData.trip_date,
        nights: formData.nights,
        total_rooms: totalRooms,
        people_count: formData.people_count
      };

      const response = await apiService.createBooking(bookingData);
      
      // If payment proof was uploaded, create payment record
      if (paymentProofUrl && response.data && response.data.id) {
        try {
          await apiService.createPayment({
            booking_id: response.data.id,
            user_id: isAuthenticated ? user.id : null,
            amount: packageData.total_price,
            payment_method: formData.payment_method,
            proof_image: paymentProofUrl
          });
        } catch (paymentError) {
          console.error('Error creating payment record:', paymentError);
        }
      }
      
      // Update booking context
      setCurrentBooking(response.data);
      addToBookingHistory(response.data);
      
      setBookingId(response.data.id);
      setBookingComplete(true);
      
      // Clear form
      setFormData({
        user_name: '',
        email: '',
        phone: '',
        people_count: 1,
        nights: 1,
        trip_date: '',
        payment_method: 'transfer',
        payment_proof: null
      });
      setSelectedVehicle(null);
      setSelectedGuide(null);
      
    } catch (error) {
      setErrors({ 
        general: error.error || 'Failed to create booking. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
      setUploadingProof(false);
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

                {/* Trip Details Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of People *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="people_count"
                          value={formData.people_count}
                          onChange={handleInputChange}
                          min="1"
                          className="input-field pl-10"
                          placeholder="1"
                          required
                        />
                      </div>
                      {errors.people_count && (
                        <p className="mt-1 text-sm text-red-600">{errors.people_count}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Nights *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="nights"
                          value={formData.nights}
                          onChange={handleInputChange}
                          min="1"
                          className="input-field pl-10"
                          placeholder="1"
                          required
                        />
                      </div>
                      {errors.nights && (
                        <p className="mt-1 text-sm text-red-600">{errors.nights}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trip Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          name="trip_date"
                          value={formData.trip_date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                      {errors.trip_date && (
                        <p className="mt-1 text-sm text-red-600">{errors.trip_date}</p>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    * Rooms will be automatically calculated (1 room = 2 people max)
                  </p>
                </div>

                {/* Vehicle Selection */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Selection (Optional)</h3>
                  <div className="relative">
                    <Car className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedVehicle ? selectedVehicle.id : ''}
                      onChange={(e) => {
                        const vehicle = vehicles.find(v => v.id === parseInt(e.target.value));
                        setSelectedVehicle(vehicle || null);
                      }}
                      className="input-field pl-10"
                    >
                      <option value="">Select a vehicle (optional)</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.category} (Capacity: {vehicle.capacity}) - {formatCurrency(vehicle.price_per_day)}/day
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedVehicle && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {selectedVehicle.name} - {formatCurrency(selectedVehicle.price_per_day)}/day
                    </p>
                  )}
                </div>

                {/* Tour Guide Selection */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tour Guide Selection (Optional)</h3>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedGuide ? selectedGuide.id : ''}
                      onChange={(e) => {
                        const guide = tourGuides.find(g => g.id === parseInt(e.target.value));
                        setSelectedGuide(guide || null);
                      }}
                      className="input-field pl-10"
                    >
                      <option value="">Select a tour guide (optional)</option>
                      {tourGuides.map(guide => (
                        <option key={guide.id} value={guide.id}>
                          {guide.name} - {guide.specialization} - {formatCurrency(guide.price_per_day)}/day
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedGuide && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {selectedGuide.name} - {formatCurrency(selectedGuide.price_per_day)}/day
                    </p>
                  )}
                </div>

                {/* Payment Method */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['transfer', 'cash', 'ewallet', 'credit_card'].map(method => (
                      <label
                        key={method}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.payment_method === method
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method}
                          checked={formData.payment_method === method}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <span className="capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Proof Upload */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Proof</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="payment_proof"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setFormData(prev => ({ ...prev, payment_proof: file }));
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="payment_proof"
                      className="cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-2">
                        {formData.payment_proof ? formData.payment_proof.name : 'Click to upload payment proof'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Accepts: Images (JPG, PNG, GIF) and PDF (Max 5MB)
                      </p>
                    </label>
                  </div>
                  {uploadingProof && (
                    <p className="mt-2 text-sm text-indigo-600">Uploading payment proof...</p>
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
                    {getHotelCategoryLabel(packageData.hotel.category)} • {packageData.nights || 1} malam
                  </div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {formatCurrency(packageData.hotel.price_per_night)} / malam
                    {(packageData.nights || 1) > 1 && (
                      <span className="text-gray-500 ml-1">
                        × {packageData.nights} = {formatCurrency(
                          (packageData.hotel_total || packageData.hotel.price_per_night * (packageData.nights || 1))
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Destinations */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Destinasi ({packageData.tourist_places.length})
                </h4>
                {packageData.itinerary && packageData.itinerary.length > 0 ? (
                  <div className="space-y-3">
                    {packageData.itinerary.map((day, idx) => (
                      <div key={day.malam || day.day || idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-gray-700 mb-2 flex items-baseline justify-between">
                          <span>Malam {day.malam || day.day || (idx + 1)}</span>
                          {day.schedule && day.places && day.places.length > 0 && (
                            <span className="font-mono text-gray-500">{day.schedule.startTime} → {day.schedule.endTime}</span>
                          )}
                        </div>
                        {day.places.length === 0 ? (
                          <div className="text-xs text-gray-500 italic">
                            Free time / waktu istirahat
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {day.places.map((place) => (
                              <div key={place.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <span className="text-sm">{getPlaceCategoryIcon(place.category)}</span>
                                  <span className="text-sm font-medium text-gray-900 truncate">
                                    {place.name}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-600 ml-2 flex-shrink-0">
                                  {formatCurrency(place.ticket_price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
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
