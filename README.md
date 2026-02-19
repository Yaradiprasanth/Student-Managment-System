# Student Management System (SMS)

A full-stack web application to manage students, marks, and attendance.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Recharts
- **Backend**: Node.js, Express, MongoDB (Atlas)
- **Auth**: JWT
- **Deployment**: Frontend → Vercel, Backend → Render

## Features

### Core Features
✅ **Multi-Role Authentication** (Admin, Teacher, Student)
✅ **Student Registration & Approval Workflow**
✅ **Student CRUD** (Create, Read, Update, Delete)
✅ **Attendance System** with date-based tracking
✅ **Marks Management** with grade calculation
✅ **Dashboard** with comprehensive statistics and charts

### Enhanced Features
✅ **Search & Filter** - Search students by name, roll number, email; Filter by class and status
✅ **Student Profile Page** - Detailed view with attendance and marks history, charts, and export
✅ **Student Login Portal** - Students can view their own data
✅ **Bulk Operations** - Bulk approve/reject students, bulk mark attendance
✅ **Export Functionality** - Export attendance and marks to Excel
✅ **Advanced Dashboard** - Weekly attendance trends, class-wise statistics, top performers
✅ **Toast Notifications** - Modern UI feedback instead of alerts
✅ **Loading States** - Better UX with loading indicators
✅ **Responsive Design** - Works on all devices
✅ **Reports System** - Generate attendance and marks reports

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in backend folder:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=5000
   ```

4. Seed default users:
   ```bash
   node seed.js
   ```
   This creates:
   - Admin: username=`admin`, password=`admin123`
   - Teacher: username=`teacher`, password=`teacher123`

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Update `.env` file if needed:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Default Login Credentials

- **Admin**: username=`admin`, password=`admin123`
- **Teacher**: username=`teacher`, password=`teacher123`
- **Student**: 
  - **First-time login**: Use roll number as both roll number and password, then set up your password
  - **After setup**: Use roll number + your password
  - **Admin can also set password**: Admin can set password for any student from Students page

## Deployment

### Backend (Render)

1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT` (optional, defaults to 5000)

### Frontend (Vercel)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Add environment variable:
   - `VITE_API_URL` (your Render backend URL)

## Project Structure

```
SMS/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Attendance.js
│   │   └── Mark.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── students.js
│   │   ├── attendance.js
│   │   ├── marks.js
│   │   ├── dashboard.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── seed.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── StudentLogin.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── StudentProfile.jsx
│   │   ├── Attendance.jsx
│   │   └── Marks.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Toast.jsx
│   │   └── Loading.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```


