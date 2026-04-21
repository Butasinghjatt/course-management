document.addEventListener('DOMContentLoaded', () => {
    // --- Storage Service ---
    const Storage = {
        save: (key, data) => localStorage.setItem(`cms_${key}`, JSON.stringify(data)),
        load: (key) => {
            const data = localStorage.getItem(`cms_${key}`);
            return data ? JSON.parse(data) : [];
        }
    };

    // State management
    const state = {
        students: Storage.load('students'),
        instructors: Storage.load('instructors'),
        courses: Storage.load('courses')
    };

    // DOM Elements
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Forms
    const studentForm = document.getElementById('student-form');
    const instructorForm = document.getElementById('instructor-form');
    const courseForm = document.getElementById('course-form');
    const enrollForm = document.getElementById('enroll-form');

    // Tab Switching Logic
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    function switchTab(tabId) {
        // Update UI
        navItems.forEach(nav => {
            nav.classList.toggle('active', nav.getAttribute('data-tab') === tabId);
        });

        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });

        // Refresh lists when switching
        if (tabId === 'students') renderStudents();
        else if (tabId === 'instructors') renderInstructors();
        else if (tabId === 'courses') renderCourses();
    }

    // --- Core Logic (Independent of Server) ---

    function persistState() {
        Storage.save('students', state.students);
        Storage.save('instructors', state.instructors);
        Storage.save('courses', state.courses);
    }

    // --- Render Functions ---

    function renderStudents() {
        const tbody = document.querySelector('#students-table tbody');
        const filter = document.getElementById('search-students').value.toLowerCase();
        
        tbody.innerHTML = '';
        state.students.filter(s => 
            s.name.toLowerCase().includes(filter) || 
            s.id.toString().includes(filter) ||
            (s.email && s.email.toLowerCase().includes(filter))
        ).forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.id}</td>
                <td>${s.name}</td>
                <td>${s.email || 'N/A'}</td>
                <td><button class="delete-btn" onclick="deleteStudent(${s.id})">Delete</button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderInstructors() {
        const tbody = document.querySelector('#instructors-table tbody');
        tbody.innerHTML = '';
        state.instructors.forEach(i => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${i.id}</td><td>${i.name}</td>`;
            tbody.appendChild(tr);
        });
    }

    function renderCourses() {
        const tbody = document.querySelector('#courses-table tbody');
        tbody.innerHTML = '';
        state.courses.forEach(c => {
            const enrolledCount = c.studentIds ? c.studentIds.length : 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${c.id}</td><td>${c.name} (${enrolledCount} enrolled)</td>`;
            tbody.appendChild(tr);
        });
    }

    // --- Form Submissions ---

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('s-id').value);
        const name = document.getElementById('s-name').value;
        const email = document.getElementById('s-email').value;

        if (state.students.find(s => s.id === id)) {
            showNotification('Student ID already exists', 'error');
            return;
        }

        state.students.push({ id, name, email });
        persistState();
        showNotification('Student added successfully', 'success');
        studentForm.reset();
        renderStudents();
    });

    instructorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('i-id').value);
        const name = document.getElementById('i-name').value;

        if (state.instructors.find(i => i.id === id)) {
            showNotification('Instructor ID already exists', 'error');
            return;
        }

        state.instructors.push({ id, name });
        persistState();
        showNotification('Instructor added successfully', 'success');
        instructorForm.reset();
        renderInstructors();
    });

    courseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('c-id').value);
        const name = document.getElementById('c-name').value;

        if (state.courses.find(c => c.id === id)) {
            showNotification('Course ID already exists', 'error');
            return;
        }

        state.courses.push({ id, name, studentIds: [] });
        persistState();
        showNotification('Course added successfully', 'success');
        courseForm.reset();
        renderCourses();
    });

    enrollForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const studentId = parseInt(document.getElementById('e-student').value);
        const courseId = parseInt(document.getElementById('e-course').value);

        const student = state.students.find(s => s.id === studentId);
        const course = state.courses.find(c => c.id === courseId);

        if (!student) {
            showNotification('Student not found', 'error');
            return;
        }
        if (!course) {
            showNotification('Course not found', 'error');
            return;
        }

        if (!course.studentIds) course.studentIds = [];
        if (course.studentIds.includes(studentId)) {
            showNotification('Student already enrolled in this course', 'error');
            return;
        }

        course.studentIds.push(studentId);
        persistState();
        showNotification('Student enrolled successfully', 'success');
        enrollForm.reset();
    });

    // Global delete handler
    window.deleteStudent = (id) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        
        state.students = state.students.filter(s => s.id !== id);
        
        // Also remove from courses
        state.courses.forEach(c => {
            if (c.studentIds) {
                c.studentIds = c.studentIds.filter(sid => sid !== id);
            }
        });

        persistState();
        showNotification('Student removed', 'success');
        renderStudents();
    };

    // Helper: Notification
    function showNotification(msg, type) {
        const area = document.getElementById('notification-area');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = msg;
        area.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // Search event
    document.getElementById('search-students').addEventListener('input', renderStudents);

    // Initial Load
    renderStudents();
});
