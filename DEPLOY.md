# Deploy to Render - Step by Step Guide

## Prerequisites
1. GitHub account with your code pushed
2. MongoDB Atlas account (free tier available)
3. Render account (sign up at https://render.com)

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a new cluster (choose FREE tier)
4. Wait for cluster to be created (5-10 minutes)
5. Click "Connect" on your cluster
6. Choose "Connect your application"
7. Copy the connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
8. Replace `<password>` with your database password
9. Add database name at the end: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tournament?retryWrites=true&w=majority`
10. **Save this connection string** - you'll need it in Step 3

---

## Step 2: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

---

## Step 3: Deploy Backend + Frontend (Single Service)

### Option A: Using Render Dashboard (Recommended)

1. **Create New Web Service**
   - Click "New +" button in Render dashboard
   - Select "Web Service"
   - Connect your GitHub account if not already connected
   - Select repository: `Shubhamkumarpatel70/tournaments`
   - Click "Connect"

2. **Configure Service Settings**
   - **Name**: `arenaofchampions` (or any name you prefer)
   - **Region**: Choose closest to your users (e.g., Singapore, Mumbai)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root of repo)
   - **Environment**: `Node`
   - **Build Command**: 
     ```
     npm install && cd client && npm install && npm run build && cd ..
     ```
   - **Start Command**: 
     ```
     npm run server
     ```

3. **Add Environment Variables**
   Click "Advanced" and add these environment variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string from Step 1 |
   | `JWT_SECRET` | Any random long string (e.g., `your-super-secret-jwt-key-here-12345`) |
   | `PORT` | `10000` (Render sets this automatically, but good to have) |
   | `REACT_APP_API_URL` | Leave empty for now (we'll set after deployment) |

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build to complete (5-10 minutes)
   - Once deployed, copy your service URL (e.g., `https://arenaofchampions.onrender.com`)

5. **Update API URL**
   - Go back to Environment Variables
   - Add/Update `REACT_APP_API_URL` with your service URL + `/api`
   - Example: `https://arenaofchampions.onrender.com/api`
   - Click "Save Changes"
   - This will trigger a new deployment

### Option B: Using render.yaml (Alternative)

1. The `render.yaml` file is already in your repository
2. In Render dashboard:
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Fill in environment variables (MONGODB_URI, JWT_SECRET)
   - Click "Apply"

---

## Step 4: Verify Deployment

1. Once deployment is complete, visit your Render service URL
2. Test the application:
   - Homepage loads
   - Can register new user
   - Can login
   - Can create team
   - Can view tournaments

---

## Step 5: Create Admin User (Important!)

After deployment, you need to create an admin user. You have two options:

### Option A: Using MongoDB Atlas
1. Go to MongoDB Atlas → Browse Collections
2. Find `users` collection
3. Create a new document:
   ```json
   {
     "name": "Admin",
     "email": "admin@example.com",
     "password": "$2a$10$hashedpasswordhere", // Use bcrypt to hash your password
     "role": "admin"
   }
   ```

### Option B: Using MongoDB Compass or mongo shell
Connect to your database and insert admin user directly.

**Note**: For production, create admin through a secure registration endpoint or seed script.

---

## Step 6: Configure Custom Domain (Optional)

1. In Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain
4. Update DNS records as instructed by Render

---

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for Render)
- Ensure database user has proper permissions

### API Not Working
- Check `REACT_APP_API_URL` environment variable
- Verify CORS settings in server
- Check server logs in Render dashboard

### Static Files Not Loading
- Ensure `client/build` folder is created during build
- Check that server serves static files correctly

---

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/tournament` |
| `JWT_SECRET` | Secret for JWT tokens | `your-random-secret-key-12345` |
| `PORT` | Server port | `10000` (auto-set by Render) |
| `REACT_APP_API_URL` | Frontend API URL | `https://your-app.onrender.com/api` |

---

## Important Notes

1. **Free Tier Limitations**:
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Consider upgrading for production use

2. **MongoDB Atlas Free Tier**:
   - 512 MB storage
   - Shared cluster
   - Perfect for development and small projects

3. **Security**:
   - Never commit `.env` files
   - Use strong JWT_SECRET
   - Keep MongoDB credentials secure

---

## Support

If you encounter issues:
1. Check Render build logs
2. Check Render runtime logs
3. Verify environment variables
4. Test MongoDB connection separately

Good luck with your deployment! 🚀

