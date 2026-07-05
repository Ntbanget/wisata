import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, CreditCard, Shield, Check, Upload, Car, User as UserIcon, Calendar, Copy, Landmark, Wallet } from 'lucide-react';
import apiService from '../services/api';
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
  const [vehicleQuantity, setVehicleQuantity] = useState(1);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [customVehicleSelection, setCustomVehicleSelection] = useState(null);
  const [vehicleMode, setVehicleMode] = useState('automatic');
  const [displayTotalPrice, setDisplayTotalPrice] = useState(0);
  const [copiedValue, setCopiedValue] = useState('');

  useEffect(() => {
    loadPackageData();
    loadVehicles();
    loadTourGuides();
    loadCustomVehicleSelection();
  }, [packageId]);

  const loadCustomVehicleSelection = () => {
    const savedSelection = sessionStorage.getItem('customVehicleSelection');
    if (savedSelection) {
      try {
        const selection = JSON.parse(savedSelection);
        setCustomVehicleSelection(selection);
        setVehicleMode('custom');
        setFormData(prev => ({
          ...prev,
          people_count: selection.peopleCount,
          nights: selection.nights
        }));
      } catch (error) {
        console.error('Error loading custom vehicle selection:', error);
      }
    }
  };

  // Calculate hotel price based on room capacity
  const calculateHotelPrice = () => {
    if (!packageData || !packageData.hotel) return 0;
    const roomCapacity = parseInt(packageData.hotel.room_capacity, 10) || 2;
    const peopleCount = parseInt(formData.people_count, 10) || 1;
    const roomsNeeded = Math.ceil(peopleCount / roomCapacity);
    const nights = parseInt(formData.nights, 10) || 1;
    const pricePerNight = Number(packageData.hotel.price_per_night) || 0;
    return roomsNeeded * pricePerNight * nights;
  };

  // Calculate tourist places price
  const calculateTouristPlacesPrice = () => {
    if (!packageData || !packageData.tourist_places) return 0;
    return packageData.tourist_places.reduce(
      (sum, place) => sum + Number(place.ticket_price || 0),
      0
    );
  };

  // Calculate vehicle price
  const calculateVehiclePrice = () => {
    if (vehicleMode === 'custom' && customVehicleSelection) {
      return Number(customVehicleSelection.vehicleCost) || 0;
    }
    if (selectedVehicle) {
      const nights = parseInt(formData.nights, 10) || 1;
      const pricePerDay = Number(selectedVehicle.price_per_day) || 0;
      return pricePerDay * vehicleQuantity * nights;
    }
    return 0;
  };

  // Calculate tour guide price
  const calculateTourGuidePrice = () => {
    if (selectedGuide) {
      const nights = parseInt(formData.nights, 10) || 1;
      const pricePerDay = Number(selectedGuide.price_per_day) || 0;
      return pricePerDay * nights;
    }
    return 0;
  };

  // Calculate total package price
  const calculateTotalPrice = () => {
    return calculateHotelPrice() + calculateTouristPlacesPrice() + calculateVehiclePrice() + calculateTourGuidePrice();
  };

  // Update formData when packageData is loaded
  useEffect(() => {
    if (packageData) {
      setFormData(prev => ({
        ...prev,
        nights: packageData.nights !== undefined ? packageData.nights : prev.nights
      }));
    }
  }, [packageData]);

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
      console.log('=== VEHICLES API RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.success:', response.success);
      console.log('Response.count:', response.count);
      setVehicles(response.data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  // Auto-select vehicle based on people count (smallest capacity that fits)
  useEffect(() => {
    if (vehicleMode === 'automatic' && vehicles.length > 0 && formData.people_count > 0) {
      const peopleCount = parseInt(formData.people_count, 10) || 1;

      // Filter vehicles with capacity >= people_count and sort by capacity ascending
      const suitableVehicles = vehicles
        .filter(v => v.capacity >= peopleCount && v.available)
        .sort((a, b) => a.capacity - b.capacity);

      // Select the vehicle with smallest capacity that fits
      if (suitableVehicles.length > 0) {
        setSelectedVehicle(suitableVehicles[0]);
        setVehicleQuantity(1); // Reset quantity to 1 when auto-selecting
      }
    } else if (vehicleMode === 'automatic' && formData.people_count === 0) {
      // Clear vehicle selection if people_count is 0
      setSelectedVehicle(null);
      setVehicleQuantity(1);
    }
  }, [vehicles, formData.people_count, vehicleMode]);

  // Auto-calculate vehicle quantity when vehicle or people_count changes
  useEffect(() => {
    if (selectedVehicle && vehicleMode === 'automatic' && formData.people_count > 0) {
      const peopleCount = parseInt(formData.people_count, 10) || 1;
      const neededQuantity = Math.ceil(peopleCount / selectedVehicle.capacity);
      setVehicleQuantity(neededQuantity);
    }
  }, [selectedVehicle, formData.people_count, vehicleMode]);

  // Recalculate total price when dependencies change
  useEffect(() => {
    if (packageData) {
      setDisplayTotalPrice(calculateTotalPrice());
    }
  }, [formData.people_count, formData.nights, selectedVehicle, vehicleQuantity, selectedGuide, vehicleMode, customVehicleSelection, packageData]);

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
    const numericValue = (name === 'people_count' || name === 'nights') ? parseInt(value, 10) : value;
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(''), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const paymentOptions = [
    { value: 'transfer', label: 'Transfer Bank / E-Money', icon: Landmark },
    { value: 'qris', label: 'QRIS', icon: Wallet }
  ];

  const paymentDetails = {
    transfer: [
      { bank: 'BANK BCA', account: '1234567890', name: 'WisataJateng', icon: '🏦' },
      { bank: 'BANK MANDIRI', account: '9876543210', name: 'WisataJateng', icon: '🏦' },
      { bank: 'DANA', account: '081234567890', name: 'WisataJateng', icon: '💳' },
      { bank: 'OVO', account: '081234567890', name: 'WisataJateng', icon: '💳' },
      { bank: 'GOPAY', account: '081234567890', name: 'WisataJateng', icon: '💳' }
    ],
    qris: null
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
      // Upload payment proof - REQUIRED
      let paymentProofUrl = null;
      if (!formData.payment_proof) {
        setErrors({ general: 'Payment proof is required. Please upload your transfer proof.' });
        setIsProcessing(false);
        return;
      }
      setUploadingProof(true);
      try {
        const uploadResponse = await apiService.uploadPaymentProof(formData.payment_proof);
        paymentProofUrl = uploadResponse.file_url;
        console.log("=== PAYMENT PROOF UPLOADED === URL:", paymentProofUrl);
      } catch (uploadError) {
        setErrors({ general: 'Failed to upload payment proof. Please try again.' });
        setIsProcessing(false);
        setUploadingProof(false);
        return;
      }
      setUploadingProof(false);

      // Calculate total rooms based on people count (1 room = 2 people max)
      const totalRooms = Math.ceil(formData.people_count / 2);

      // Calculate total price using the new calculation functions
      const totalPrice = calculateTotalPrice();

      const bookingData = {
        user_name: formData.user_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone ? formData.phone.trim() : null,
        city_id: packageData.hotel.city_id,
        total_price: totalPrice,
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
        people_count: formData.people_count,
        vehicle_mode: vehicleMode,
        custom_vehicles: vehicleMode === 'custom' && customVehicleSelection
          ? customVehicleSelection.selectedVehicles
          : (selectedVehicle && vehicleQuantity > 1
            ? { [selectedVehicle.id]: vehicleQuantity }
            : null),
        is_custom: packageData?.isCustom || false
      };

      console.log('=== BOOKING PAYLOAD ===');
      console.log('Full bookingData:', bookingData);
      console.log('is_custom:', bookingData.is_custom);
      console.log('vehicle_mode:', bookingData.vehicle_mode);
      console.log('custom_vehicles:', bookingData.custom_vehicles);
      console.log('tourist_places:', bookingData.tourist_places);
      console.log('budget:', bookingData.budget);
      console.log('total_price:', bookingData.total_price);

      const response = await apiService.createBooking(bookingData);

      console.log("=== BOOKING API RESPONSE ===", response);
      console.log("=== RESPONSE.SUCCESS ===", response.success);
      console.log("=== RESPONSE.DATA ===", response.data);
      console.log("=== RESPONSE.MESSAGE ===", response.message);

      // Payment is now created automatically in Booking.create() transaction
      // No need for separate payment creation call

      // Update booking context
      setCurrentBooking(response.data);
      addToBookingHistory(response.data);

      setBookingId(response.data.id);

      // Buat payment record agar muncul di admin panel
      try {
        const paymentData = {
          booking_id: response.data.id,
          amount: totalPrice,
          payment_method: formData.payment_method || 'transfer',
          proof_image: paymentProofUrl
        };
        await apiService.createPayment(paymentData);
        console.log("=== PAYMENT CREATED ===", paymentData);
      } catch (paymentError) {
        console.error("=== PAYMENT CREATION FAILED ===", paymentError);
      }

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
      console.error("=== BOOKING FAILED ===", error);
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {vehicleMode === 'custom' ? 'Custom Vehicle Selection' : 'Vehicle Selection (Optional)'}
                  </h3>
                  
                  {vehicleMode === 'custom' && customVehicleSelection ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Selected Vehicles:</p>
                      {Object.entries(customVehicleSelection.selectedVehicles).map(([vehicleId, quantity]) => {
                        const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
                        if (!vehicle || quantity === 0) return null;
                        return (
                          <div key={vehicleId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                            <div>
                              <p className="font-medium text-gray-900">{vehicle.name}</p>
                              <p className="text-sm text-gray-600">
                                {vehicle.category} • {vehicle.capacity} orang • {formatCurrency(vehicle.price_per_day)}/hari
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">× {quantity}</p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(vehicle.price_per_day * quantity * formData.nights)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">Total Vehicle Cost:</span>
                          <span className="font-bold text-primary-600">
                            {formatCurrency(customVehicleSelection.vehicleCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Car className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <select
                          value={selectedVehicle ? selectedVehicle.id : ''}
                          onChange={(e) => {
                            const vehicle = vehicles.find(v => v.id === parseInt(e.target.value));
                            setSelectedVehicle(vehicle || null);
                            setVehicleQuantity(1); // Reset quantity when manually changing vehicle
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
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity (Auto-calculated based on people count)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={vehicleQuantity}
                            onChange={(e) => setVehicleQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="input-field"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Capacity: {selectedVehicle.capacity} × {vehicleQuantity} = {selectedVehicle.capacity * vehicleQuantity} people
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedVehicle && vehicleMode === 'automatic' && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Selected: {vehicleQuantity} × {selectedVehicle.name} - {formatCurrency(selectedVehicle.price_per_day)}/day
                      </p>
                      <p className="text-xs text-gray-500">
                        Total: {formatCurrency(selectedVehicle.price_per_day * vehicleQuantity * formData.nights)}
                      </p>
                    </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentOptions.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.value}
                          className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all shadow-sm ${
                            formData.payment_method === method.value
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment_method"
                            value={method.value}
                            checked={formData.payment_method === method.value}
                            onChange={handleInputChange}
                            className="mr-3"
                          />
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="font-medium text-gray-800">{method.label}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {formData.payment_method === 'transfer' && (
                    <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Landmark className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-semibold text-gray-900">Transfer Bank / E-Money</h4>
                      </div>
                      <div className="space-y-3">
                        {paymentDetails.transfer.map((item) => (
                          <div key={item.bank} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{item.icon} {item.bank}</p>
                                <p className="text-sm text-gray-600">No Rekening: {item.account}</p>
                                <p className="text-sm text-gray-600">Atas Nama: {item.name}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(item.account)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                              >
                                <Copy className="w-4 h-4" />
                                {copiedValue === item.account ? 'Tersalin' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.payment_method === 'qris' && (
                    <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Wallet className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-semibold text-gray-900">QRIS WisataJateng</h4>
                      </div>
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-center">
                        <img
                          src="/images/qris-wisatajateng.png"
                          alt="QRIS WisataJateng"
                          className="mx-auto h-56 w-56 object-contain rounded-xl bg-white p-3 shadow-sm"
                        />
                        <p className="mt-4 text-sm font-semibold text-gray-900">[ QRIS WISATAJATENG ]</p>
                        <p className="mt-2 text-sm text-gray-600">Scan menggunakan Mobile Banking atau E-Wallet.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Proof Upload */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Proof</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-white shadow-sm">
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
              
              {/* Price Breakdown */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3 text-sm">Rincian Harga</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wisata</span>
                    <span className="font-medium">{formatCurrency(calculateTouristPlacesPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hotel</span>
                    <span className="font-medium">{formatCurrency(calculateHotelPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kendaraan</span>
                    <span className="font-medium">{formatCurrency(calculateVehiclePrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tour Guide</span>
                    <span className="font-medium">{formatCurrency(calculateTourGuidePrice())}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-900">TOTAL</span>
                      <span className="text-indigo-600">{formatCurrency(displayTotalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Hotel */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Hotel</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{packageData.hotel.name}</div>
                  <div className="text-sm text-gray-600">
                    {getHotelCategoryLabel(packageData.hotel.category)} • {packageData.nights || 1} malam
                  </div>
                  <div className="text-sm text-gray-600">
                    Kapasitas: {packageData.hotel.room_capacity || 2} orang/kamar • {Math.ceil(formData.people_count / (packageData.hotel.room_capacity || 2))} kamar
                  </div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {formatCurrency(packageData.hotel.price_per_night)} / malam
                    {(packageData.nights || 1) > 1 && (
                      <span className="text-gray-500 ml-1">
                        × {packageData.nights} malam × {Math.ceil(formData.people_count / (packageData.hotel.room_capacity || 2))} kamar = {formatCurrency(calculateHotelPrice())}
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
                    <span className="font-medium">{formatCurrency(displayTotalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(displayTotalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings */}
              {packageData.budget > displayTotalPrice && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm text-green-800">
                    <span>You save</span>
                    <span className="font-medium">
                      {formatCurrency(packageData.budget - displayTotalPrice)}
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
