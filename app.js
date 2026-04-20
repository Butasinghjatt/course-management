// Updated app.js

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // Use JSON format

// Example routes (updated)
app.post('/student', (req, res) => {
    const studentData = req.body; // JSON format
    // ...Handle student creation
});

app.post('/instructor', (req, res) => {
    const instructorData = req.body; // JSON format
    // ...Handle instructor creation
});

app.post('/course', (req, res) => {
    const courseData = req.body; // JSON format
    // ...Handle course creation
});

app.post('/enrollment', (req, res) => {
    const enrollmentData = req.body; // JSON format
    // ...Handle enrollment
});

app.delete('/delete', (req, res) => {
    const deleteData = req.body; // JSON format
    // ...Handle deletion
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});