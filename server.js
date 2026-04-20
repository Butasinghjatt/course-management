// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let students = [];
let instructors = [];
let courses = [];
let enrollments = [];

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    res.status(500).json({ error: err.message });
};

// Validation middleware for student
const validateStudent = (student) => {
    if (!student.name || !student.email) {
        throw new Error('Name and email are required');
    }
};

// CRUD for Students
app.post('/students', (req, res, next) => {
    try {
        validateStudent(req.body);
        const student = { id: students.length + 1, ...req.body };
        students.push(student);
        res.status(201).json(student);
    } catch (err) {
        next(err);
    }
});

app.get('/students', (req, res) => {
    res.json(students);
});

// Similar CRUD operations for instructors, courses, and enrollments...

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use(errorHandler);