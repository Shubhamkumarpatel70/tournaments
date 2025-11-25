# Microsoft Clarity Setup Guide

## ✅ Installation Complete

Microsoft Clarity has been installed and configured in your React app.

---

## 📋 Setup Steps

### Step 1: Get Your Clarity Project ID

1. **Go to Microsoft Clarity:**
   - Visit: https://clarity.microsoft.com/
   - Sign in with your Microsoft account (or create one)

2. **Create a New Project:**
   - Click "Add New Project"
   - Enter project name: "Arena of Champions" or "Tournament Website"
   - Enter website URL: `https://arenaofchampions.in`
   - Click "Create"

3. **Copy Your Project ID:**
   - After creating the project, you'll see a Project ID
   - It looks like: `abc123xyz456` (alphanumeric string)
   - Copy this ID

---

### Step 2: Add Project ID to Environment Variables

#### For Local Development:

1. **Create `.env` file** in `client/` folder:
   ```
   REACT_APP_CLARITY_PROJECT_ID=your-project-id-here
   ```

2. **Replace `your-project-id-here`** with your actual Clarity Project ID

#### For Production (Render):

1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add new variable:
   - **Key:** `REACT_APP_CLARITY_PROJECT_ID`
   - **Value:** Your Clarity Project ID
5. Click "Save Changes"
6. This will trigger a new deployment

---

## 🔍 How It Works

Clarity is initialized in `client/src/index.js`:

```javascript
import Clarity from '@microsoft/clarity';

// Initialize Microsoft Clarity
if (process.env.REACT_APP_CLARITY_PROJECT_ID) {
  Clarity.start(process.env.REACT_APP_CLARITY_PROJECT_ID);
}
```

**What It Does:**
- Automatically tracks user behavior
- Records heatmaps (where users click)
- Tracks user sessions
- Shows user journeys
- Identifies issues and frustrations

---

## 📊 What You'll See in Clarity Dashboard

### 1. **Heatmaps**
- See where users click most
- Identify popular features
- Find dead clicks (clicks that don't work)

### 2. **Recordings**
- Watch real user sessions
- See how users navigate your site
- Identify UX issues

### 3. **Insights**
- Most clicked elements
- User rage clicks (frustrated clicks)
- Dead clicks
- JavaScript errors

### 4. **Filters**
- Filter by device type
- Filter by country
- Filter by traffic source

---

## ✅ Verification

### Check if Clarity is Working:

1. **After deployment, visit your website**
2. **Open browser DevTools (F12)**
3. **Go to Network tab**
4. **Look for requests to:** `clarity.ms` or `www.clarity.ms`
5. **If you see these requests = Clarity is working!**

### Alternative Check:

1. Visit your Clarity dashboard
2. Wait 5-10 minutes after visiting your site
3. Check if sessions appear in dashboard
4. If sessions appear = Working correctly!

---

## 🚨 Troubleshooting

### Clarity Not Working?

1. **Check Environment Variable:**
   - Ensure `REACT_APP_CLARITY_PROJECT_ID` is set
   - Variable name must start with `REACT_APP_` for React apps
   - Restart dev server after adding `.env` file

2. **Check Project ID:**
   - Make sure Project ID is correct
   - No extra spaces or quotes
   - Should be alphanumeric only

3. **Rebuild After Changes:**
   - If you add env variable in production
   - Render will auto-rebuild
   - Wait for deployment to complete

4. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console for errors
   - Look for Clarity-related errors

---

## 📝 Example .env File

Create `client/.env`:

```env
REACT_APP_CLARITY_PROJECT_ID=abc123xyz456
REACT_APP_API_URL=https://arenaofchampions.in/api
```

**Important:**
- Don't commit `.env` file to Git (it's in .gitignore)
- Add `.env.example` file with placeholder values
- Use actual values only in production environment

---

## 🎯 Best Practices

1. **Privacy:**
   - Clarity is GDPR compliant
   - Automatically masks sensitive data
   - No personal information collected

2. **Performance:**
   - Clarity is lightweight
   - Minimal impact on page load
   - Runs asynchronously

3. **Data Retention:**
   - Free plan: 1 year of data
   - Upgrade for longer retention

---

## 🔗 Useful Links

- **Clarity Dashboard:** https://clarity.microsoft.com/
- **Documentation:** https://docs.microsoft.com/en-us/clarity/
- **Support:** Available in Clarity dashboard

---

## ✅ Checklist

- [ ] Microsoft Clarity account created
- [ ] Project created in Clarity dashboard
- [ ] Project ID copied
- [ ] Environment variable added (local `.env` file)
- [ ] Environment variable added (Render production)
- [ ] Site deployed with Clarity
- [ ] Verified Clarity is tracking (check dashboard after 10 minutes)

---

**Note:** It may take 5-10 minutes for data to appear in Clarity dashboard after first visit.

