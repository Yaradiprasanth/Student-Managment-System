# Student Registration & Approval Workflow

## Overview

This system implements a complete student registration and approval workflow with role-based access control.

## Flow

1. **Student fills registration form** → Data goes to database (status = "pending")
2. **Admin approves or rejects** → Only admin can access approval routes
3. **Student gets activated** → Status changes to "approved" or "rejected"

## Backend Implementation

### 1. Student Model Updates

**File**: `backend/models/Student.js`

Added fields:
- `status`: `'pending' | 'approved' | 'rejected'` (default: `'pending'`)
- `approvedAt`: Date when approved
- `approvedBy`: Reference to User who approved

### 2. Student Registration Endpoint

**Route**: `POST /api/students/enroll`

- **Public access** (no authentication required)
- Creates student with `status: 'pending'`
- Validates unique email and roll number

**Example Request**:
```json
{
  "name": "Ravi",
  "rollNumber": "R001",
  "email": "ravi@example.com",
  "class": "10A",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

**Example Response**:
```json
{
  "message": "Registration submitted successfully. Waiting for admin approval.",
  "student": {
    "_id": "...",
    "name": "Ravi",
    "status": "pending",
    ...
  }
}
```

### 3. Admin Approval Endpoints

#### Approve Student
**Route**: `PUT /api/students/:id/approve`
- **Admin only** (requires authentication + admin role)
- Sets status to `'approved'`
- Records approval date and admin user

#### Reject Student
**Route**: `PUT /api/students/:id/reject`
- **Admin only** (requires authentication + admin role)
- Sets status to `'rejected'`
- Records admin user who rejected

### 4. Get Pending Students

**Route**: `GET /api/students/pending`
- **Admin only**
- Returns all students with `status: 'pending'`

### 5. Updated Get All Students

**Route**: `GET /api/students`
- **Authenticated users** (admin or teacher)
- **Admin**: Sees all students (pending, approved, rejected)
- **Teacher**: Only sees approved students

## Frontend Implementation

### 1. Registration Page

**File**: `frontend/src/pages/Register.jsx`
- Public page (no login required)
- Form fields: Name, Roll Number, Email, Class, Phone, Address
- Success message after submission
- Redirects to login page after 2 seconds

**Route**: `/register`

### 2. Updated Students Page

**File**: `frontend/src/pages/Students.jsx`

**Features**:
- **Tab System** (Admin only):
  - "Approved Students" tab
  - "Pending Approval" tab
- **Status Badges**: Color-coded status indicators
- **Approval Actions** (Admin only):
  - Approve button (green)
  - Reject button (red)
- **Role-based display**:
  - Admin: Sees all students with actions
  - Teacher: Only sees approved students (read-only)

### 3. Updated Login Page

**File**: `frontend/src/pages/Login.jsx`
- Added "Register here" link for new students

### 4. Updated App Routing

**File**: `frontend/src/App.jsx`
- Added `/register` route (public)

## Role-Based Access Control

### Admin Access
- ✅ View all students (pending, approved, rejected)
- ✅ Approve/reject pending registrations
- ✅ Create students directly
- ✅ Edit/delete students
- ✅ Manage attendance and marks

### Teacher Access
- ✅ View only approved students
- ✅ Manage attendance (for approved students)
- ✅ Manage marks (for approved students)
- ❌ Cannot approve/reject registrations
- ❌ Cannot create/edit/delete students

### Student (Public)
- ✅ Register themselves
- ❌ Cannot login (no student login implemented)
- ❌ Cannot access dashboard

## Database Schema

```javascript
{
  name: String (required),
  rollNumber: String (required, unique),
  email: String (required, unique),
  class: String (required),
  phone: String,
  address: String,
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  createdAt: Date,
  approvedAt: Date,
  approvedBy: ObjectId (ref: 'User')
}
```

## API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/students/enroll` | ❌ | Public | Student self-registration |
| GET | `/api/students` | ✅ | All | Get students (filtered by role) |
| GET | `/api/students/pending` | ✅ | Admin | Get pending registrations |
| PUT | `/api/students/:id/approve` | ✅ | Admin | Approve student |
| PUT | `/api/students/:id/reject` | ✅ | Admin | Reject student |
| POST | `/api/students` | ✅ | Admin | Create student directly |
| PUT | `/api/students/:id` | ✅ | Admin | Update student |
| DELETE | `/api/students/:id` | ✅ | Admin | Delete student |

## Testing the Workflow

### 1. Student Registration
1. Go to `/register`
2. Fill in student details
3. Submit form
4. See success message
5. Student appears in database with `status: 'pending'`

### 2. Admin Approval
1. Login as admin
2. Go to Students page
3. Click "Pending Approval" tab
4. See pending registrations
5. Click "Approve" or "Reject"
6. Student status updates

### 3. Teacher View
1. Login as teacher
2. Go to Students page
3. Only see approved students
4. Can manage attendance/marks for approved students

## Example Scenarios

### Example 1: Ravi Registers
```
POST /api/students/enroll
{
  "name": "Ravi",
  "rollNumber": "R001",
  "email": "ravi@example.com",
  "class": "10A"
}

Result: status = "pending"
```

### Example 2: Admin Approves Ravi
```
PUT /api/students/{ravi_id}/approve

Result: 
- status = "approved"
- approvedAt = current date
- approvedBy = admin user ID
```

### Example 3: Priya Registers
```
POST /api/students/enroll
{
  "name": "Priya",
  "rollNumber": "P001",
  "email": "priya@example.com",
  "class": "9B"
}

Result: status = "pending"
```

## Security Features

1. **Role-based access**: Admin-only routes protected by `adminOnly` middleware
2. **Public registration**: No auth required for enrollment
3. **Unique constraints**: Email and roll number must be unique
4. **Status filtering**: Teachers only see approved students
5. **Audit trail**: Records who approved and when

## Future Enhancements

- Email notifications on approval/rejection
- Student login portal to check status
- Bulk approval/rejection
- Registration form validation improvements
- Student profile view after approval


