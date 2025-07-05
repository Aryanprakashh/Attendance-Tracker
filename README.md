# 📊 Attendance Tracker - Fixed & Enhanced

A comprehensive web application for tracking student attendance with real-time statistics, secure authentication, and detailed reporting.

## ✨ Features

### 🔐 **Security & Authentication**
- **Secure Password Hashing**: Passwords are encrypted using bcryptjs
- **Session Management**: Persistent user sessions with MongoDB storage
- **Input Validation**: Comprehensive form validation and sanitization
- **Error Handling**: Graceful error handling with user-friendly messages

### 📈 **Attendance Tracking**
- **Subject Management**: Add and manage multiple subjects
- **Real-time Updates**: Instant attendance updates with live statistics
- **Attendance Marking**: Mark present/absent for each subject
- **Percentage Calculation**: Automatic attendance percentage calculation
- **Visual Indicators**: Color-coded attendance status (Good/Warning/Critical)

### 📊 **Dashboard & Analytics**
- **Comprehensive Dashboard**: Modern, responsive dashboard with attendance overview
- **Subject-wise Tracking**: Individual attendance tracking for each subject
- **Overall Statistics**: Overall attendance percentage with visual indicators
- **Quick Actions**: Bulk operations for marking all subjects present/absent
- **Attendance Reports**: Generate detailed attendance reports

### 🎨 **User Interface**
- **Modern Design**: Clean, responsive design with Bootstrap 5
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Mobile Friendly**: Fully responsive design for all devices
- **Intuitive Navigation**: Easy-to-use navigation and user flow

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Installation

1. **Clone or navigate to the project**:
   ```bash
   cd Attendance-Tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start MongoDB** (if not already running):
   ```bash
   # On Windows
   mongod
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

5. **Access the application**:
   - Open your browser and go to `http://localhost:3000`
   - Register a new account or login with existing credentials

## 📋 Usage Guide

### Registration
1. Click "Sign Up" on the homepage
2. Fill in all required fields:
   - First Name & Last Name
   - Email (must be unique)
   - Phone Number (10 digits)
   - Number of Subjects (1-10)
   - Roll Number (unique identifier)
   - Password (minimum 6 characters)
3. Click "Register" to create your account

### Login
1. Click "Log In" on the homepage
2. Enter your email and password
3. Click "Log In" to access your dashboard

### Dashboard Features

#### Adding Subjects
1. In the dashboard, use the "Add New Subject" form
2. Enter subject name, total classes, and attended classes
3. Click "Add Subject" to create the subject

#### Marking Attendance
1. For each subject card, click "Present" or "Absent"
2. Attendance is updated in real-time
3. Percentage is automatically calculated

#### Quick Actions
- **Mark All Present**: Marks all subjects as present for today
- **Mark All Absent**: Marks all subjects as absent for today
- **Generate Report**: Creates a detailed attendance report
- **Reset All**: Clears all attendance data (with confirmation)

#### Viewing Statistics
- Overall attendance percentage is displayed prominently
- Color-coded indicators:
  - 🟢 Green: 75%+ (Good)
  - 🟡 Yellow: 60-74% (Warning)
  - 🔴 Red: Below 60% (Critical)

## 🛠️ Technical Details

### Architecture
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: Handlebars templating with Bootstrap 5
- **Authentication**: Session-based with bcryptjs password hashing
- **Session Storage**: MongoDB session store

### Database Schema
```javascript
{
  firstname: String (required),
  lastname: String (required),
  email: String (required, unique),
  phone: String (required, unique),
  subjects: Number (required, 1-10),
  rollnumber: String (required, unique),
  password: String (required, hashed),
  attendance: [{
    subject: String,
    totalClasses: Number,
    attendedClasses: Number,
    lastUpdated: Date
  }],
  createdAt: Date
}
```

### API Endpoints
- `GET /` - Homepage
- `GET /register` - Registration page
- `GET /login` - Login page
- `GET /dashboard` - User dashboard (authenticated)
- `GET /logout` - Logout user
- `POST /register` - Create new user
- `POST /login` - Authenticate user
- `GET /api/attendance` - Get user attendance data
- `POST /api/attendance` - Update attendance

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=mongodb://0.0.0.0:27017/attendenceRegistrationForm
SESSION_SECRET=your-secret-key-change-this-in-production
```

### Database Configuration
The application connects to MongoDB at `mongodb://0.0.0.0:27017/attendenceRegistrationForm` by default.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running on port 27017
   - Check if the database service is started

2. **Port Already in Use**
   - Change the PORT in your environment variables
   - Or kill the process using the current port

3. **Session Issues**
   - Clear browser cookies and cache
   - Restart the application

4. **Password Issues**
   - Ensure password is at least 6 characters long
   - Check that confirm password matches

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## 📁 Project Structure
```
Attendance-Tracker/
├── src/
│   ├── app.js              # Main application file
│   ├── db/
│   │   └── conn.js         # Database connection
│   └── models/
│       └── registers.js    # User and attendance model
├── templates/
│   └── views/
│       ├── index.hbs       # Homepage
│       ├── register.hbs    # Registration page
│       ├── login.hbs       # Login page
│       ├── dashboard.hbs   # User dashboard
│       └── error.hbs       # Error page
├── public/
│   ├── css/                # Stylesheets
│   └── assets/             # Images and other assets
├── package.json
└── README.md
```

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **Input Validation**: Server-side validation for all inputs
- **Session Security**: Secure session configuration
- **SQL Injection Protection**: Mongoose provides built-in protection
- **XSS Protection**: Handlebars automatically escapes content

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use a strong session secret
3. Configure MongoDB connection string
4. Set up proper logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

