# How Students Can Login - Simple Guide

## 🎯 For Students Already in the System

If you're already registered and approved, here's how to login:

---

## Method 1: First-Time Login (No Password Set Yet) ⭐

### Step-by-Step:

1. **Go to Student Login Page**
   - URL: `http://localhost:5173/student-login`
   - Or click "Student Login" link

2. **Enter Your Details**
   - **Roll Number**: Enter your roll number (e.g., `R001`)
   - **Password**: Enter your **roll number again** as temporary password (e.g., `R001`)

3. **Click Login**
   - System will detect you need to set up password
   - You'll be redirected to password setup page

4. **Set Your Password**
   - **Temporary Password**: Your roll number (e.g., `R001`)
   - **New Password**: Choose a secure password (minimum 6 characters)
   - **Confirm Password**: Re-enter your new password
   - Click "Set Password"

5. **Done!** ✅
   - You'll be automatically logged in
   - Next time, use your new password

---

## Method 2: Regular Login (Password Already Set)

### Step-by-Step:

1. **Go to Student Login Page**
   - URL: `http://localhost:5173/student-login`

2. **Enter Your Details**
   - **Roll Number**: Your roll number (e.g., `R001`)
   - **Password**: Your password (the one you set or admin gave you)

3. **Click Login**
   - You'll be logged in successfully! ✅

---

## Method 3: Admin Sets Password for You

If admin has set a password for you:

1. **Ask Admin** for your password
2. **Login** with:
   - Roll Number: Your roll number
   - Password: The password admin gave you

---

## 📋 Quick Examples

### Example 1: Ravi (Roll Number: R001) - First Time

```
Step 1: Go to /student-login
Step 2: 
  Roll Number: R001
  Password: R001 (use roll number)
Step 3: Click Login
Step 4: Setup page appears
  Temporary Password: R001
  New Password: MyPass123
  Confirm: MyPass123
Step 5: Click "Set Password"
✅ Logged in!
```

### Example 2: Priya (Roll Number: P002) - Already Has Password

```
Step 1: Go to /student-login
Step 2:
  Roll Number: P002
  Password: PriyaPass2024 (her password)
Step 3: Click Login
✅ Logged in!
```

---

## 🔍 How to Check If You Have Password

**If you get this message:**
- "Password not set. Use your roll number as temporary password"
- → You need to set up password (Method 1)

**If you get this message:**
- "Invalid credentials"
- → Check your roll number and password
- → Make sure you're approved (contact admin)

---

## 🆘 Troubleshooting

### Problem: "Student not approved"
**Solution**: Wait for admin to approve your registration

### Problem: "Password not set"
**Solution**: Use your roll number as password to setup account

### Problem: "Invalid credentials"
**Solution**: 
- Double-check roll number
- Double-check password
- Contact admin if forgot password

### Problem: Can't remember password
**Solution**: Contact admin to reset your password

---

## 📱 Login URLs

- **Student Login**: `/student-login`
- **Admin/Teacher Login**: `/login`
- **Registration**: `/register`
- **Password Setup**: `/setup-password`

---

## ✅ Summary

**For Existing Students:**

1. **No Password?** 
   - Use roll number as password → Setup new password

2. **Have Password?**
   - Use roll number + password → Login

3. **Forgot Password?**
   - Contact admin to reset

**That's it! Simple and easy!** 🎉

