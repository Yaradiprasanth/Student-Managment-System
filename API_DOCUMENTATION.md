# Student Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### POST /api/auth/login
Admin/Teacher login

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "admin",
    "role": "admin"
  }
}
```

---

### POST /api/auth/student-login
Student login

**Request:**
```json
{
  "rollNumber": "R001",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "student_id",
    "name": "Student Name",
    "rollNumber": "R001",
    "role": "student"
  }
}
```

---

### GET /api/auth/me
Get current user (requires auth)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_id",
  "username": "admin",
  "role": "admin"
}
```

---

## Student Endpoints

### POST /api/students/enroll
Public student registration

**Request:**
```json
{
  "name": "John Doe",
  "rollNumber": "R001",
  "email": "john@example.com",
  "class": "10A",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

---

### GET /api/students
Get all students (with search & filter)

**Query Parameters:**
- `search` - Search by name, roll number, email
- `class` - Filter by class
- `status` - Filter by status (admin only)

**Headers:**
```
Authorization: Bearer <token>
```

---

### GET /api/students/pending
Get pending students (Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

---

### GET /api/students/:id
Get single student

**Headers:**
```
Authorization: Bearer <token>
```

---

### POST /api/students
Create student (Admin only)

**Request:**
```json
{
  "name": "Jane Doe",
  "rollNumber": "R002",
  "email": "jane@example.com",
  "class": "10B",
  "password": "optional_password"
}
```

---

### PUT /api/students/:id
Update student (Admin only)

---

### PUT /api/students/:id/approve
Approve student (Admin only)

---

### PUT /api/students/:id/reject
Reject student (Admin only)

---

### POST /api/students/bulk-approve
Bulk approve students (Admin only)

**Request:**
```json
{
  "studentIds": ["id1", "id2", "id3"]
}
```

---

### POST /api/students/bulk-reject
Bulk reject students (Admin only)

**Request:**
```json
{
  "studentIds": ["id1", "id2", "id3"]
}
```

---

### DELETE /api/students/:id
Delete student (Admin only)

---

## Attendance Endpoints

### POST /api/attendance
Mark attendance

**Request:**
```json
{
  "studentId": "student_id",
  "date": "2024-01-15",
  "status": "present"
}
```

---

### POST /api/attendance/bulk
Bulk mark attendance

**Request:**
```json
{
  "date": "2024-01-15",
  "attendances": [
    {"studentId": "id1", "status": "present"},
    {"studentId": "id2", "status": "absent"}
  ]
}
```

---

### GET /api/attendance/date/:date
Get attendance by date

---

### GET /api/attendance/student/:studentId
Get student attendance history

---

### GET /api/attendance/monthly/:studentId/:month/:year
Get monthly attendance report

---

## Marks Endpoints

### POST /api/marks
Add marks

**Request:**
```json
{
  "studentId": "student_id",
  "examType": "Midterm",
  "subject": "Mathematics",
  "marks": 85,
  "totalMarks": 100
}
```

---

### GET /api/marks/student/all
Get all marks

---

### GET /api/marks/student/:studentId
Get student marks

---

### GET /api/marks/exam/:examType
Get marks by exam type

---

### GET /api/marks/rank/:examType
Get rank list for exam

---

## Dashboard Endpoints

### GET /api/dashboard
Get dashboard statistics

**Response:**
```json
{
  "totalStudents": 100,
  "pendingStudents": 5,
  "presentToday": 85,
  "totalToday": 100,
  "passPercentage": "75.50",
  "topPerformers": [...],
  "weeklyAttendance": [...],
  "classAttendance": [...],
  "recentStudents": [...]
}
```

---

## Reports Endpoints

### GET /api/reports/attendance
Get attendance report

**Query Parameters:**
- `startDate` - Start date
- `endDate` - End date
- `class` - Filter by class

---

### GET /api/reports/marks
Get marks report

**Query Parameters:**
- `examType` - Filter by exam type
- `class` - Filter by class

---

### GET /api/reports/student/:studentId
Get student performance report

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error message here"
}
```

**Status Codes:**
- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Server Error

---

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

