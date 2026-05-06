import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  currentBooking: null,
  selectedPackage: null,
  bookingHistory: [],
  isLoading: false,
  error: null
};

// Action types
const BOOKING_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SELECTED_PACKAGE: 'SET_SELECTED_PACKAGE',
  SET_CURRENT_BOOKING: 'SET_CURRENT_BOOKING',
  ADD_TO_BOOKING_HISTORY: 'ADD_TO_BOOKING_HISTORY',
  CLEAR_BOOKING: 'CLEAR_BOOKING',
  UPDATE_BOOKING_STATUS: 'UPDATE_BOOKING_STATUS'
};

// Reducer
const bookingReducer = (state, action) => {
  switch (action.type) {
    case BOOKING_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case BOOKING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case BOOKING_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case BOOKING_ACTIONS.SET_SELECTED_PACKAGE:
      return {
        ...state,
        selectedPackage: action.payload,
        error: null
      };
    
    case BOOKING_ACTIONS.SET_CURRENT_BOOKING:
      return {
        ...state,
        currentBooking: action.payload,
        isLoading: false,
        error: null
      };
    
    case BOOKING_ACTIONS.ADD_TO_BOOKING_HISTORY:
      return {
        ...state,
        bookingHistory: [action.payload, ...state.bookingHistory]
      };
    
    case BOOKING_ACTIONS.CLEAR_BOOKING:
      return {
        ...state,
        currentBooking: null,
        selectedPackage: null,
        error: null
      };
    
    case BOOKING_ACTIONS.UPDATE_BOOKING_STATUS:
      return {
        ...state,
        currentBooking: state.currentBooking 
          ? { ...state.currentBooking, status: action.payload }
          : null
      };
    
    default:
      return state;
  }
};

// Context
const BookingContext = createContext();

// Hook
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Provider
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Load booking history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('bookingHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        dispatch({ type: BOOKING_ACTIONS.SET_BOOKING_HISTORY, payload: history });
      } catch (error) {
        console.error('Error loading booking history:', error);
      }
    }
  }, []);

  // Save booking history to localStorage when it changes
  useEffect(() => {
    if (state.bookingHistory.length > 0) {
      localStorage.setItem('bookingHistory', JSON.stringify(state.bookingHistory));
    }
  }, [state.bookingHistory]);

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });
  };

  const setSelectedPackage = (packageData) => {
    dispatch({ type: BOOKING_ACTIONS.SET_SELECTED_PACKAGE, payload: packageData });
  };

  const setCurrentBooking = (bookingData) => {
    dispatch({ type: BOOKING_ACTIONS.SET_CURRENT_BOOKING, payload: bookingData });
  };

  const addToBookingHistory = (bookingData) => {
    dispatch({ type: BOOKING_ACTIONS.ADD_TO_BOOKING_HISTORY, payload: bookingData });
  };

  const clearBooking = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_BOOKING });
  };

  const updateBookingStatus = (status) => {
    dispatch({ type: BOOKING_ACTIONS.UPDATE_BOOKING_STATUS, payload: status });
  };

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    setSelectedPackage,
    setCurrentBooking,
    addToBookingHistory,
    clearBooking,
    updateBookingStatus,
    BOOKING_ACTIONS
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
