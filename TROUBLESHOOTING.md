# Troubleshooting Guide

## Network Error When Signing Up

If you're getting a "Network Error" when trying to sign up, follow these steps:

### 1. Make Sure Backend Server is Running

The backend server must be running on port 5000 for the frontend to work.

**To start the backend:**
```bash
cd backend
npm install  # If you haven't already
npm run dev  # Starts the server with nodemon
```

You should see:
```
✅ MongoDB Connected Successfully
📦 Database: docease
🚀 Server running on port 5000
```

### 2. Check Backend .env File

Make sure you have a `.env` file in the `backend` folder with:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=mySuperSecretKey
JWT_EXPIRES_IN=7d
```

**Important:** Replace `your_mongodb_atlas_connection_string_here` with your actual MongoDB Atlas connection string.

### 3. Verify Backend is Running

Open your browser and go to: `http://localhost:5000`

You should see: "DocEase backend is running 🚀"

### 4. Check Browser Console

Open your browser's developer console (F12) and check for any error messages. The improved error handling will now show more specific errors.

### 5. Common Issues

**Issue: "Cannot connect to server"**
- Solution: Make sure the backend server is running on port 5000

**Issue: "MongoDB connection error"**
- Solution: Check your MONGO_URI in the .env file and make sure MongoDB Atlas is accessible

**Issue: "CORS error"**
- Solution: CORS is already enabled in the backend, but make sure both servers are running

### 6. Running Both Servers

You need to run both the frontend and backend simultaneously:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or similar)
The backend will run on `http://localhost:5000`

### 7. Test the API

You can test if the backend is working by running:
```bash
curl http://localhost:5000
```

Or open it in your browser.

### 8. Check API Base URL

The frontend is configured to connect to `http://localhost:5000/api` by default. You can change this by creating a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## Still Having Issues?

1. Check that both servers are running
2. Verify the backend .env file has the correct MongoDB URI
3. Check browser console for detailed error messages
4. Make sure no other application is using port 5000
5. Try restarting both servers

