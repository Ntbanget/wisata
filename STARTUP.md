# 🚀 Quick Start Guide

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- Git

> Maps use Leaflet + OpenStreetMap tiles, so **no API key is needed**.

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
   # Create .env file (optional — frontend defaults to http://localhost:5000/api)
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   ```

4. **Start Frontend**
   ```bash
   npm start
   ```
   
   Frontend will run on: `http://localhost:3000`

## 🧪 Testing

1. **Test Backend**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/cities
   ```

2. **Test Frontend**
   - Open `http://localhost:3000` in browser
   - Test search functionality
   - Test map integration (Leaflet + OpenStreetMap, no API key needed)

## 📱 Features to Test

- ✅ Multi-city selection
- ✅ Budget-based package generation
- ✅ Package customization
- ✅ Interactive Leaflet maps with routes
- ✅ Booking system
- ✅ OpenStreetMap navigation integration

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

### Map Issues
- Verify network connectivity to OpenStreetMap tile servers
- Check the browser console for any tile-loading errors

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
