# How to Get Microsoft Clarity Project ID - Step by Step

## 🎯 Quick Guide

Follow these steps to get your Clarity Project ID:

---

## Step 1: Go to Microsoft Clarity

1. **Open your browser**
2. **Visit:** https://clarity.microsoft.com/
3. You'll see the Clarity homepage

---

## Step 2: Sign In

1. **Click "Sign In"** (top right corner)
2. **Choose one of these options:**
   - Sign in with Microsoft account
   - Sign in with Google account
   - Sign in with GitHub account
   - Or create a new Microsoft account

**Note:** If you don't have an account, click "Sign up" to create one (it's free!)

---

## Step 3: Create a New Project

After signing in, you'll see the Clarity dashboard:

1. **Click the "Add New Project" button** (usually a big blue button or "+" icon)
2. **Fill in the project details:**
   - **Project Name:** Enter "Arena of Champions" or "Tournament Website"
   - **Website URL:** Enter `https://arenaofchampions.in`
   - **Industry:** Select "Gaming" or "Entertainment" (optional)
3. **Click "Create" or "Add Project"**

---

## Step 4: Get Your Project ID

After creating the project, you'll see a page with setup instructions:

### Option A: From Setup Instructions Page

1. You'll see a page titled "Add Clarity to your website"
2. Look for a code snippet that looks like this:
   ```html
   <script type="text/javascript">
       (function(c,l,a,r,i,t,y){
           c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
           t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
           y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
       })(window, document, "clarity", "script", "YOUR_PROJECT_ID_HERE");
   </script>
   ```
3. **The Project ID is the string inside the quotes** after `"script",`
   - Example: If you see `"script", "abc123xyz456"`, then `abc123xyz456` is your Project ID

### Option B: From Project Settings

1. **Go to your project dashboard**
2. **Click on "Settings"** (usually a gear icon or in the top menu)
3. **Look for "Project ID"** or "Installation Code"
4. **Copy the Project ID** (it's usually a long alphanumeric string)

### Option C: From Installation Tab

1. In your project dashboard, look for **"Installation"** or **"Setup"** tab
2. Click on it
3. You'll see installation instructions
4. **The Project ID is shown in the code snippet**

---

## Step 5: Copy Your Project ID

1. **Select and copy the Project ID**
   - It looks like: `abc123xyz456` or `xyz789abc123`
   - Usually 10-15 characters long
   - Alphanumeric (letters and numbers)

2. **Save it somewhere safe** (notepad, notes app, etc.)

---

## 📸 What to Look For

Your Project ID will look something like:
- `k8xyz9abc1`
- `m2n3p4q5r6`
- `abc123def456`
- `xyz789uvw012`

**It's NOT:**
- ❌ The project name ("Arena of Champions")
- ❌ The website URL ("arenaofchampions.in")
- ❌ Your Microsoft account email

**It IS:**
- ✅ A short alphanumeric code
- ✅ Usually shown in installation code
- ✅ Unique to your project

---

## 🔍 Alternative: Find Existing Project ID

If you already created a project:

1. **Go to:** https://clarity.microsoft.com/
2. **Sign in**
3. **Click on your project** from the dashboard
4. **Go to Settings** → **Project Settings**
5. **Look for "Project ID"** or **"Installation Code"**
6. **Copy the ID**

---

## ✅ After Getting Your Project ID

### For Local Development:

1. **Create a file:** `client/.env`
2. **Add this line:**
   ```
   REACT_APP_CLARITY_PROJECT_ID=your-project-id-here
   ```
3. **Replace `your-project-id-here`** with your actual Project ID
4. **Save the file**
5. **Restart your dev server** (`npm start`)

### For Production (Render):

1. **Go to Render dashboard**
2. **Select your service**
3. **Go to "Environment" tab**
4. **Click "Add Environment Variable"**
5. **Enter:**
   - **Key:** `REACT_APP_CLARITY_PROJECT_ID`
   - **Value:** Your Project ID (paste it here)
6. **Click "Save Changes"**
7. **Wait for deployment to complete**

---

## 🚨 Troubleshooting

### Can't Find Project ID?

1. **Check the Installation/Settings page** in your project
2. **Look for code snippets** - the ID is usually in JavaScript code
3. **Check browser console** - sometimes shown in setup instructions

### Project ID Not Working?

1. **Make sure there are no spaces** before or after the ID
2. **Don't include quotes** around the ID in .env file
3. **Restart your dev server** after adding to .env
4. **Check spelling** - Project IDs are case-sensitive

### Still Stuck?

1. **Try creating a new project** - you'll see the ID during setup
2. **Contact Microsoft Clarity support** through their dashboard
3. **Check Clarity documentation:** https://docs.microsoft.com/en-us/clarity/

---

## 📝 Example

Here's what your `.env` file should look like:

```env
REACT_APP_CLARITY_PROJECT_ID=k8xyz9abc1
REACT_APP_API_URL=https://arenaofchampions.in/api
```

**Important:** 
- No spaces around the `=`
- No quotes around the Project ID
- Must start with `REACT_APP_` for React apps

---

## 🎯 Quick Checklist

- [ ] Signed in to Microsoft Clarity
- [ ] Created a new project
- [ ] Found the Project ID in setup instructions
- [ ] Copied the Project ID
- [ ] Added to `.env` file (local) or Render environment variables (production)
- [ ] Restarted dev server / Deployed to production
- [ ] Verified Clarity is working (check dashboard after 10 minutes)

---

**Need Help?** Check `CLARITY_SETUP.md` for more detailed setup instructions!

