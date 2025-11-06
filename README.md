# Gym Management System

A comprehensive gym management system built with React frontend and Node.js backend, featuring member management, attendance tracking, payment processing, and announcements.

## Features

- **Dashboard**: Overview of gym statistics and recent activities
- **Member Management**: Add, edit, and manage gym members
- **Attendance Tracking**: Manual check-in/check-out system with time tracking
- **Payment Management**: Record and track member payments
- **Plan Management**: Create and manage membership plans
- **Announcements**: Create and manage gym announcements
- **Responsive Design**: Modern UI that works on all devices

## Technology Stack

### Backend
- Node.js with Express.js
- MySQL database
- JWT authentication
- RESTful API design

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Recharts for data visualization
- Lucide React for icons
- React Toastify for notifications

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

### 1. Database Setup

1. Create a MySQL database named `gym`
2. Run the SQL script from `telsql.sql` to create tables and sample data:

```sql
mysql -u your_username -p gym < telsql.sql
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=gym
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will be running on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## Default Login Credentials

- **Username**: john_admin
- **Password**: admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/today` - Get today's attendance
- `POST /api/attendance/checkin` - Manual check-in
- `PUT /api/attendance/checkout/:id` - Manual check-out

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Plans
- `GET /api/plans` - Get all plans
- `POST /api/plans` - Create new plan
- `PUT /api/plans/:id` - Update plan
- `DELETE /api/plans/:id` - Delete plan

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create new announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/stats` - Get detailed statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

## Key Features Explained

### Manual Attendance System
The attendance system is designed for manual entry by gym staff:
- Staff can check members in/out manually
- System timestamps are automatically generated
- Duration is calculated automatically
- Current gym occupancy is tracked

### Date and Time Handling
- All dates and times are handled automatically by the system
- Manual entry allows staff to override timestamps if needed
- Timezone handling is built into the system

### Responsive Design
- Mobile-first approach
- Works on tablets, phones, and desktops
- Touch-friendly interface for mobile devices

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Starts React development server
```

### Building for Production

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
```

## Project Structure

```
gym-management-system/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── members.js
│   │   ├── attendance.js
│   │   ├── payments.js
│   │   ├── plans.js
│   │   ├── announcements.js
│   │   └── dashboard.js
│   ├── app.js
│   ├── db.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Members.js
│   │   │   ├── Attendance.js
│   │   │   ├── Payments.js
│   │   │   ├── Plans.js
│   │   │   ├── Announcements.js
│   │   │   ├── Sidebar.js
│   │   │   └── Header.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── telsql.sql
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository.
