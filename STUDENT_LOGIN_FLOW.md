# Student Login Flow - Complete Guide

## 📊 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│           STUDENT ALREADY EXISTS IN PORTAL              │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────┐
        │  Go to /student-login     │
        └───────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────┐
        │  Enter Roll Number        │
        │  Enter Password           │
        └───────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │                       │
            ▼                       ▼
    ┌───────────────┐      ┌───────────────┐
    │ Password Set?  │      │ No Password?  │
    │      YES       │      │      NO       │
    └───────────────┘      └───────────────┘
            │                       │
            │                       ▼
            │           ┌──────────────────────┐
            │           │ Use Roll Number as    │
            │           │ Temporary Password    │
            │           └──────────────────────┘
            │                       │
            │                       ▼
            │           ┌──────────────────────┐
            │           │ Redirect to          │
            │           │ /setup-password      │
            │           └──────────────────────┘
            │                       │
            │                       ▼
            │           ┌──────────────────────┐
            │           │ Set New Password      │
            │           │ (Min 6 characters)    │
            │           └──────────────────────┘
            │                       │
            │                       ▼
            │           ┌──────────────────────┐
            │           │ Auto Login            │
            │           └──────────────────────┘
            │                       │
            └───────────┬───────────┘
                        │
                        ▼
            ┌──────────────────────┐
            │   LOGGED IN ✅        │
            │   Access Dashboard    │
            └──────────────────────┘
```

---

## 🔄 Complete Login Process

### Scenario A: Student Has No Password (First Time)

```
1. Student Registration
   └─> Status: pending
   
2. Admin Approval
   └─> Status: approved
   └─> Password: NOT SET
   
3. Student Login Attempt
   └─> Roll Number: R001
   └─> Password: R001 (roll number)
   └─> System: Detects no password
   └─> Action: Redirects to /setup-password
   
4. Password Setup
   └─> Temporary Password: R001
   └─> New Password: MySecurePass123
   └─> Confirm: MySecurePass123
   └─> System: Saves password, auto-login
   
5. Success ✅
   └─> Logged in
   └─> Can access dashboard
```

### Scenario B: Student Has Password

```
1. Student Login
   └─> Roll Number: R001
   └─> Password: MySecurePass123
   └─> System: Validates credentials
   
2. Success ✅
   └─> Logged in
   └─> Access dashboard
```

### Scenario C: Admin Sets Password

```
1. Admin Action
   └─> Goes to Students page
   └─> Finds student "Ravi"
   └─> Clicks "Set Password"
   └─> Enters: AdminPass123
   └─> System: Saves password
   
2. Student Can Now Login
   └─> Roll Number: R001
   └─> Password: AdminPass123
   └─> Success ✅
```

---

## 🎯 Quick Reference Table

| Student Status | Roll Number | Password | Result |
|---------------|-------------|----------|--------|
| No password (first time) | R001 | R001 | → Setup password page |
| Password set | R001 | MyPass123 | → Login successful ✅ |
| Admin set password | R001 | AdminPass | → Login successful ✅ |
| Not approved | R001 | Any | → Error: Not approved |
| Wrong password | R001 | WrongPass | → Error: Invalid credentials |

---

## 📱 Step-by-Step Instructions

### For Existing Students (No Password)

1. **Open Browser**
   - Go to: `http://localhost:5173/student-login`

2. **Enter Credentials**
   ```
   Roll Number: [Your Roll Number]
   Password: [Your Roll Number] ← Same as roll number
   ```

3. **Click Login**
   - You'll see: "Please set up your password"
   - Redirected to password setup page

4. **Set Password**
   ```
   Temporary Password: [Your Roll Number]
   New Password: [Choose secure password]
   Confirm Password: [Re-enter password]
   ```

5. **Click "Set Password"**
   - Password saved
   - Auto-logged in ✅

### For Existing Students (Has Password)

1. **Open Browser**
   - Go to: `http://localhost:5173/student-login`

2. **Enter Credentials**
   ```
   Roll Number: [Your Roll Number]
   Password: [Your Password]
   ```

3. **Click Login**
   - Logged in successfully ✅

---

## 🔐 Password Rules

- **Minimum**: 6 characters
- **Recommended**: Mix of letters, numbers, symbols
- **Security**: All passwords are hashed (bcrypt)

---

## ✅ Summary

**Existing students can login in 2 ways:**

1. **First-time (no password)**:
   - Use roll number as password
   - Setup new password
   - Auto-login ✅

2. **Regular (has password)**:
   - Use roll number + password
   - Login ✅

**That's it! Simple!** 🎉

