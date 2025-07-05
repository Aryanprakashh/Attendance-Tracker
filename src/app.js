const express = require("express");
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const hbs = require("hbs");

require("./db/conn");
const Register = require("./models/registers");

const port = process.env.PORT || 3000;

(async () => {
    // Ensure admin user exists
    await Register.ensureAdmin();
})();

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));

// Session configuration
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://0.0.0.0:27017/attendenceRegistrationForm',
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// View engine setup
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Admin authentication middleware
const requireAdmin = async (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    const user = await Register.findById(req.session.userId);
    if (user && user.role === 'admin') {
        req.user = user;
        next();
    } else {
        res.status(403).render('error', { message: 'Access denied: Admins only.' });
    }
};

// Routes
app.get("/", (req, res) => {
    res.render("index", { user: req.session.user });
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render("register");
});

app.get("/login", (req, res) => {
    if (req.session.userId) {
        return res.redirect('/dashboard');
    }
    res.render("login");
});

app.get("/dashboard", requireAuth, async (req, res) => {
    try {
        const user = await Register.findById(req.session.userId);
        if (!user) {
            req.session.destroy();
            return res.redirect('/login');
        }
        res.render("dashboard", { user });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render("error", { message: "Internal server error" });
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// API Routes for attendance management
app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
        const { subject, action } = req.body; // action: 'present' or 'absent'
        
        if (!subject || !action) {
            return res.status(400).json({ error: 'Subject and action are required' });
        }

        const user = await Register.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let subjectAttendance = user.attendance.find(att => att.subject === subject);
        
        if (!subjectAttendance) {
            // Create new subject attendance record
            subjectAttendance = {
                subject,
                totalClasses: 0,
                attendedClasses: 0,
                lastUpdated: new Date()
            };
            user.attendance.push(subjectAttendance);
        }

        // Update attendance
        subjectAttendance.totalClasses += 1;
        if (action === 'present') {
            subjectAttendance.attendedClasses += 1;
        }
        subjectAttendance.lastUpdated = new Date();

        await user.save();
        
        res.json({
            success: true,
            attendance: user.attendance,
            overallPercentage: user.getOverallAttendance()
        });
    } catch (error) {
        console.error('Attendance update error:', error);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
});

app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
        const user = await Register.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            attendance: user.attendance,
            overallPercentage: user.getOverallAttendance()
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ error: 'Failed to get attendance' });
    }
});

// Admin dashboard
app.get("/admin", requireAdmin, async (req, res) => {
    try {
        const students = await Register.find({ role: 'student' });
        res.render("admin_dashboard", { admin: req.user, students });
    } catch (error) {
        res.status(500).render("error", { message: "Failed to load admin dashboard." });
    }
});

// Registration endpoint
app.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, phone, subjects, rollnumber, password, confirmpassword } = req.body;

        // Validation
        if (!firstname || !lastname || !email || !phone || !subjects || !rollnumber || !password || !confirmpassword) {
            return res.status(400).render("register", { error: "All fields are required" });
        }

        if (password !== confirmpassword) {
            return res.status(400).render("register", { error: "Passwords do not match" });
        }

        if (password.length < 6) {
            return res.status(400).render("register", { error: "Password must be at least 6 characters long" });
        }

        // Check if user already exists
        const existingUser = await Register.findOne({ 
            $or: [{ email }, { phone }, { rollnumber }] 
        });

        if (existingUser) {
            return res.status(400).render("register", { 
                error: "User with this email, phone, or roll number already exists" 
            });
        }

        // Create new user
        const registerStudent = new Register({
            firstname,
            lastname,
            email,
            phone,
            subjects: parseInt(subjects),
            rollnumber,
            password,
            confirmpassword
        });

        await registerStudent.save();
        
        // Auto-login after registration
        req.session.userId = registerStudent._id;
        req.session.user = {
            firstname: registerStudent.firstname,
            lastname: registerStudent.lastname,
            email: registerStudent.email
        };

        res.redirect('/dashboard');

    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 11000) {
            res.status(400).render("register", { error: "User already exists with this information" });
        } else {
            res.status(500).render("register", { error: "Registration failed. Please try again." });
        }
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render("login", { error: "Email and password are required" });
        }

        const user = await Register.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return res.status(400).render("login", { error: "Invalid email or password" });
        }

        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(400).render("login", { error: "Invalid email or password" });
        }

        // Set session
        req.session.userId = user._id;
        req.session.user = {
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
        };

        res.redirect('/dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render("login", { error: "Login failed. Please try again." });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("error", { message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render("error", { message: "Page not found" });
});

app.listen(port, () => {
    console.log(`Attendance Tracker is running on port ${port}`);
    console.log(`Visit http://localhost:${port} to access the application`);
});