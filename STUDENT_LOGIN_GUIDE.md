# Student Login Guide

## How Existing Students Can Login

### Option 1: First-Time Login (Password Not Set)

If a student doesn't have a password set yet:

1. **Go to Student Login**: `/student-login`
2. **Enter Roll Number**: Your roll number
3. **Enter Temporary Password**: Use your **roll number** as the password
4. **You'll be redirected** to password setup page
5. **Set Your New Password**: 
   - Temporary password: Your roll number
   - New password: Choose a secure password (min 6 characters)
   - Confirm password: Re-enter your new password
6. **Auto Login**: After setting password, you'll be automatically logged in

### Option 2: Admin Sets Password

Admin can set password for any student:

1. **Login as Admin**
2. **Go to Students page**
3. **Find the student**
4. **Click "Set Password"** button
5. **Enter new password** (minimum 6 characters)
6. **Password is set** - Student can now login with roll number and password

### Option 3: Regular Login (Password Already Set)

If password is already set:

1. **Go to Student Login**: `/student-login`
2. **Enter Roll Number**: Your roll number
3. **Enter Password**: Your password
4. **Login Successfully**

---

## Step-by-Step: First-Time Student Login

### Example: Student "Ravi" with Roll Number "R001"

1. **Student Registration**:
   - Student registers at `/register`
   - Status: `pending`
   - No password set yet

2. **Admin Approval**:
   - Admin approves student
   - Status: `approved`
   - Still no password

3. **First Login**:
   - Go to `/student-login`
   - Roll Number: `R001`
   - Password: `R001` (use roll number)
   - Click Login

4. **Password Setup**:
   - Redirected to `/setup-password`
   - Temporary Password: `R001`
   - New Password: `MySecurePass123`
   - Confirm Password: `MySecurePass123`
   - Click "Set Password"

5. **Success**:
   - Password set successfully
   - Auto-logged in
   - Can now access dashboard

---

## Admin Setting Password for Student

### Via Students Page

1. Login as admin
2. Navigate to Students → Approved Students
3. Find student (e.g., "Ravi - R001")
4. Click **"Set Password"** button
5. Enter password: `StudentPass123`
6. Click OK
7. Student can now login with:
   - Roll Number: `R001`
   - Password: `StudentPass123`

### Via Create Student Form

When admin creates a student directly:
- Fill in all fields
- **Optional**: Add password field
- If password provided, student can login immediately
- If not provided, student uses roll number for first login

---

## Password Requirements

- **Minimum Length**: 6 characters
- **No Maximum**: Can be as long as needed
- **Security**: Use mix of letters, numbers, and symbols (recommended)

---

## Troubleshooting

### "Password not set" Error

**Solution**: Use your roll number as temporary password to setup account

### "Invalid credentials" Error

**Check**:
- Roll number is correct
- Password is correct
- Student status is "approved" (not pending/rejected)

### "Student not approved" Error

**Solution**: Wait for admin approval before logging in

### Forgot Password

**Current**: Contact admin to reset password
**Future Enhancement**: Password reset via email

---

## API Endpoints

### Student Login
```
POST /api/auth/student-login
Body: { rollNumber, password }
```

### Setup Password
```
POST /api/auth/student/setup-password
Body: { rollNumber, temporaryPassword, newPassword }
```

### Admin Set Password (Admin only)
```
PUT /api/students/:id/set-password
Body: { password }
Headers: Authorization: Bearer <admin_token>
```

---

## Security Notes

1. **First-time login**: Roll number as password is temporary and only works once
2. **Password hashing**: All passwords are hashed with bcrypt
3. **Approved only**: Only approved students can login
4. **Admin control**: Admin can set/reset any student password

---

## Quick Reference

| Scenario | Roll Number | Password |
|----------|-------------|----------|
| First-time login | R001 | R001 (temporary) |
| After password setup | R001 | Your chosen password |
| Admin set password | R001 | Admin-provided password |

---

**All existing students can now login!** 🎉

