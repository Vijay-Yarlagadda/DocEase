# Quick Start Guide - DocEase

## Prerequisites

1. Node.js installed (v16 or higher)
2. MongoDB Atlas account (or local MongoDB)
3. Two terminal windows

## Step 1: Setup Backend

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` folder with:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=mySuperSecretKey
JWT_EXPIRES_IN=7d
```

**Important:** Replace `your_mongodb_atlas_connection_string_here` with your actual MongoDB Atlas connection string.

4. Start the backend server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
📦 Database: docease
🚀 Server running on port 5000
```

## Step 2: Setup Frontend

1. Open a NEW terminal window (keep the backend running)

2. Navigate to the root folder:
```bash
cd C:\Users\yarla\OneDrive\Desktop\DocEase
```

3. Install dependencies (if not already done):
```bash
npm install
```

4. Start the frontend server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or similar port)

## Step 3: Test the Application

1. Open your browser and go to `http://localhost:5173`
2. Try to sign up or login
3. If you see a "Network Error", make sure the backend is running on port 5000

## Troubleshooting

### Network Error
- **Solution:** Make sure the backend server is running. Check Terminal 1 for the backend server status.
- Verify: Open `http://localhost:5000` in your browser - you should see "DocEase backend is running 🚀"

### MongoDB Connection Error
- **Solution:** Check your MONGO_URI in the backend `.env` file
- Make sure your MongoDB Atlas cluster is running and the connection string is correct
- Check if your IP address is whitelisted in MongoDB Atlas

### Port Already in Use
- **Solution:** If port 5000 is already in use, either:
  - Stop the application using port 5000
  - Change the PORT in backend/.env to a different port (e.g., 5001)
  - Update the frontend API URL accordingly

## Running Both Servers

You need BOTH servers running simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Need Help?

Check the `TROUBLESHOOTING.md` file for more detailed solutions.

