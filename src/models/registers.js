const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    subjects: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    rollnumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    confirmpassword: {
        type: String,
        required: true
    },
    attendance: [{
        subject: {
            type: String,
            required: true
        },
        totalClasses: {
            type: Number,
            default: 0
        },
        attendedClasses: {
            type: Number,
            default: 0
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    }
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.confirmpassword = this.password;
    }
    next();
});

// Method to compare password
studentSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to calculate attendance percentage
studentSchema.methods.calculateAttendancePercentage = function(subject) {
    const subjectAttendance = this.attendance.find(att => att.subject === subject);
    if (!subjectAttendance || subjectAttendance.totalClasses === 0) {
        return 0;
    }
    return ((subjectAttendance.attendedClasses / subjectAttendance.totalClasses) * 100).toFixed(2);
};

// Method to get overall attendance percentage
studentSchema.methods.getOverallAttendance = function() {
    if (this.attendance.length === 0) {
        return 0;
    }
    let totalClasses = 0;
    let totalAttended = 0;
    this.attendance.forEach(subject => {
        totalClasses += subject.totalClasses;
        totalAttended += subject.attendedClasses;
    });
    if (totalClasses === 0) {
        return 0;
    }
    return ((totalAttended / totalClasses) * 100).toFixed(2);
};

// Static method to create admin if not exists
studentSchema.statics.ensureAdmin = async function() {
    const adminEmail = 'admin@tracker.com';
    const admin = await this.findOne({ email: adminEmail });
    if (!admin) {
        const adminUser = new this({
            firstname: 'Admin',
            lastname: 'User',
            email: adminEmail,
            phone: '9999999999',
            subjects: 1, // changed from 0 to 1 to satisfy min validation
            rollnumber: 'ADMIN',
            password: 'Admin@1234',
            confirmpassword: 'Admin@1234',
            role: 'admin',
            attendance: []
        });
        await adminUser.save();
        return true;
    }
    return false;
};

const Register = mongoose.model("Register", studentSchema);

module.exports = Register;