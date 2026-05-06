# 🚀 Quick Start Guide

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Google Maps API Key
- Git

## 🗄️ Database Setup

1. **Create Database**
   ```bash
   mysql -u root -p
   CREATE DATABASE wisata_db;
   ```

2. **Import Schema & Data**
   ```bash
   mysql -u root -p wisata_db < database/schema.sql
   mysql -u root -p wisata_db < database/seed.sql
   ```

3. **Verify Setup**
   ```bash
   mysql -u root -p wisata_db -e "SELECT COUNT(*) as cities FROM cities; SELECT COUNT(*) as hotels FROM hotels; SELECT COUNT(*) as places FROM tourist_places;"
   ```

## ⚙️ Backend Setup

1. **Navigate to Backend**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp ../.env.example .env
   # Edit .env with your database credentials
   ```

4. **Start Backend Server**
   ```bash
   npm start
   ```
   
   Backend will run on: `http://localhost:5000`

## 🎨 Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Create .env file with your Google Maps API key
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here" >> .env
   ```

4. **Start Frontend**
   ```bash
   npm start
   ```
   
   Frontend will run on: `http://localhost:3000`

## 🔑 Google Maps API Setup

1. **Get API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable "Maps JavaScript API" and "Directions API"
   - Create API key with appropriate restrictions

2. **Configure API Key**
   - Add your API key to `frontend/.env`
   - Set up API key restrictions for security

## 🧪 Testing

1. **Test Backend**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/cities
   ```

2. **Test Frontend**
   - Open `http://localhost:3000` in browser
   - Test search functionality
   - Test map integration (requires API key)

## 📱 Features to Test

- ✅ Multi-city selection
- ✅ Budget-based package generation
- ✅ Package customization
- ✅ Interactive maps with routes
- ✅ Booking system
- ✅ Google Maps navigation integration

## 🔧 Troubleshooting

### Database Issues
- Ensure MySQL service is running
- Check database credentials in `.env`
- Verify database and tables exist

### Backend Issues
- Check if port 5000 is available
- Verify Node.js version compatibility
- Check console for error messages

### Frontend Issues
- Clear browser cache
- Check API URL configuration
- Verify Google Maps API key is valid

### Map Issues
- Ensure Google Maps API is enabled
- Check API key restrictions
- Verify network connectivity

## 📊 Database Statistics

After setup, you should have:
- **9 Cities**: Major cities in Central Java
- **30+ Hotels**: Various budget categories
- **70+ Tourist Places**: Different categories and price ranges

## 🚀 Production Deployment

For production deployment:

1. **Backend**
   - Use PM2 for process management
   - Set up reverse proxy (Nginx)
   - Configure SSL/HTTPS
   - Set up environment variables

2. **Frontend**
   - Build production bundle: `npm run build`
   - Serve with static file server
   - Configure routing for SPA

3. **Database**
   - Use managed database service
   - Set up backups
   - Configure connection pooling

## 📞 Support

For issues and questions:
- Check the documentation
- Review error logs
- Test API endpoints individually
- Verify environment configurations
