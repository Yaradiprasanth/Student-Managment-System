# MongoDB Atlas Setup Guide

Follow these steps to set up MongoDB Atlas for your Student Management System.

## Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Sign up with:
   - Email and password, OR
   - Google account, OR
   - GitHub account

## Step 2: Create a Free Cluster

1. After signing up, you'll see the **"Deploy a cloud database"** screen
2. Select **"M0 FREE"** (Free tier - perfect for development)
3. Choose a **Cloud Provider** (AWS, Google Cloud, or Azure)
4. Select a **Region** closest to you (e.g., `N. Virginia (us-east-1)`)
5. Click **"Create"** (cluster name will be auto-generated like "Cluster0")

⏳ **Wait 3-5 minutes** for the cluster to be created

## Step 3: Create Database User

1. Once cluster is created, you'll see a **"Get started"** popup
2. Click **"Create Database User"** or go to **"Database Access"** in the left sidebar
3. Click **"Add New Database User"**
4. Choose **"Password"** authentication
5. Enter:
   - **Username**: `smsadmin` (or any username you prefer)
   - **Password**: Click **"Autogenerate Secure Password"** or create your own
   - **⚠️ IMPORTANT**: **SAVE THIS PASSWORD** - you'll need it!
6. Under **"Database User Privileges"**, select **"Atlas admin"** (or "Read and write to any database")
7. Click **"Add User"**

## Step 4: Configure Network Access

1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. For development, click **"Add Current IP Address"**
4. OR click **"Allow Access from Anywhere"** (for development only - not recommended for production)
   - This adds `0.0.0.0/0` which allows all IPs
5. Click **"Confirm"**

## Step 5: Get Your Connection String

1. Go back to **"Database"** (or "Clusters" in left sidebar)
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Choose:
   - **Driver**: `Node.js`
   - **Version**: `5.5 or later` (or latest)
5. You'll see a connection string like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Copy this connection string**

## Step 6: Update Your .env File

1. Open `D:\SMS\backend\.env`
2. Replace the connection string:
   - Replace `<username>` with your database username (e.g., `smsadmin`)
   - Replace `<password>` with your database password
   - Add database name: Change `/?retryWrites` to `/sms?retryWrites`

### Example:

**Before:**
```
MONGODB_URI=your_mongodb_atlas_connection_string
```

**After:**
```
MONGODB_URI=mongodb+srv://smsadmin:MyPassword123@cluster0.abc123.mongodb.net/sms?retryWrites=true&w=majority
```

**Important Notes:**
- Replace `smsadmin` with your actual username
- Replace `MyPassword123` with your actual password
- Replace `cluster0.abc123` with your actual cluster address
- The `/sms` part is your database name (you can change it)

## Step 7: Test the Connection

1. Save the `.env` file
2. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```
3. You should see:
   ```
   Server running on port 5000
   MongoDB Connected
   ```
4. If you see an error, check:
   - Username and password are correct
   - IP address is whitelisted
   - Connection string format is correct

## Step 8: Seed Default Users

After MongoDB is connected, run the seed script:

```bash
cd backend
node seed.js
```

This creates:
- **Admin**: username=`admin`, password=`admin123`
- **Teacher**: username=`teacher`, password=`teacher123`

## Troubleshooting

### Error: "Authentication failed"
- Check username and password in connection string
- Make sure special characters in password are URL-encoded (e.g., `@` becomes `%40`)

### Error: "IP not whitelisted"
- Go to Network Access in Atlas
- Add your current IP address
- Wait 1-2 minutes for changes to take effect

### Error: "Connection timeout"
- Check your internet connection
- Verify the connection string is correct
- Make sure your firewall isn't blocking the connection

### Password has special characters
If your password has special characters like `@`, `#`, `!`, etc., you need to URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `!` → `%21`
- `$` → `%24`
- `&` → `%26`

Or use a password without special characters for easier setup.

## Quick Reference

- **Atlas Dashboard**: [https://cloud.mongodb.com](https://cloud.mongodb.com)
- **Database Access**: Left sidebar → Database Access
- **Network Access**: Left sidebar → Network Access
- **Connection String**: Clusters → Connect → Connect your application

## Security Best Practices

1. ✅ Use strong passwords
2. ✅ Only whitelist necessary IP addresses
3. ✅ Use environment variables (never commit .env to git)
4. ✅ Rotate passwords regularly
5. ✅ Use different users for different environments (dev/prod)

---

**You're all set!** Once MongoDB is connected, your Student Management System will be ready to use.

