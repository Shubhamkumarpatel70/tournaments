# Setup Guide

## Quick Start

1. **Install Dependencies**

   First, install root dependencies:
   ```bash
   npm install
   ```

   Then install client dependencies:
   ```bash
   npm run install-client
   ```

2. **Configure Environment Variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/tournament
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

   For the client, create `client/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start MongoDB**

   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in `.env`.

4. **Run the Application**

   Start both server and client:
   ```bash
   npm run dev
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Backend
   npm run server

   # Terminal 2 - Frontend
   npm run client
   ```

5. **Access the Application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## MongoDB Setup

### Local MongoDB

1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/tournament`

### MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in `.env`

## Troubleshooting

### Port Already in Use

If port 3000 or 5000 is already in use:
- Change `PORT` in `.env` for backend
- Set `PORT=3001` in `client/.env` for frontend

### MongoDB Connection Issues

- Verify MongoDB is running
- Check connection string format
- Ensure network access if using Atlas

### Tailwind CSS Not Working

- Ensure `tailwind.config.js` is in `client/` directory
- Check `postcss.config.js` exists
- Restart the development server

## Production Build

1. Build the React app:
   ```bash
   npm run build
   ```

2. The built files will be in `client/build/`

3. Serve with a production server (e.g., serve the build folder with Express or deploy to hosting)

