document.addEventListener('DOMContentLoaded', () => {
    // State management
    const state = {
        students: [],
        instructors: [],
        courses: []
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

        // Load data for the active tab
        if (tabId === 'students') loadStudents();
        else if (tabId === 'instructors') loadInstructors();
        else if (tabId === 'courses') loadCourses();
    }

    // --- API Handlers ---

    async function loadStudents() {
        try {
            const res = await fetch('/api/students');
            state.students = await res.json();
            renderStudents();
        } catch (err) {
            showNotification('Failed to load students', 'error');
        }
    }

    async function loadInstructors() {
        try {
            const res = await fetch('/api/instructors');
            state.instructors = await res.json();
            renderInstructors();
        } catch (err) {
            showNotification('Failed to load instructors', 'error');
        }
    }

    async function loadCourses() {
        try {
            const res = await fetch('/api/courses');
            state.courses = await res.json();
            renderCourses();
        } catch (err) {
            showNotification('Failed to load courses', 'error');
        }
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
                <td><button class="delete-btn" onclick="window.deleteStudent(${s.id})">Delete</button></td>
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
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${c.id}</td><td>${c.name}</td>`;
            tbody.appendChild(tr);
        });
    }

    // --- Form Submissions ---

    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('s-id').value;
        const name = document.getElementById('s-name').value;
        const email = document.getElementById('s-email').value;

        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`
        });
        const data = await res.json();
        if (data.success) {
            showNotification('Student added successfully', 'success');
            studentForm.reset();
            loadStudents();
        } else {
            showNotification(data.error || 'Error adding student', 'error');
        }
    });

    instructorForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('i-id').value;
        const name = document.getElementById('i-name').value;

        const res = await fetch('/api/instructors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}&name=${encodeURIComponent(name)}`
        });
        const data = await res.json();
        if (data.success) {
            showNotification('Instructor added successfully', 'success');
            instructorForm.reset();
            loadInstructors();
        }
    });

    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('c-id').value;
        const name = document.getElementById('c-name').value;

        const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}&name=${encodeURIComponent(name)}`
        });
        const data = await res.json();
        if (data.success) {
            showNotification('Course added successfully', 'success');
            courseForm.reset();
            loadCourses();
        }
    });

    enrollForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentId = document.getElementById('e-student').value;
        const courseId = document.getElementById('e-course').value;

        const res = await fetch('/api/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `studentId=${studentId}&courseId=${courseId}`
        });
        const data = await res.json();
        if (data.success) {
            showNotification('Student enrolled successfully', 'success');
            enrollForm.reset();
        } else {
            showNotification(data.error || 'Enrollment failed', 'error');
        }
    });

    // Global delete handler
    window.deleteStudent = async (id) => {
        if (!confirm('Are you sure you want to delete this student?')) return;
        const res = await fetch('/api/students', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
        });
        const data = await res.json();
        if (data.success) {
            showNotification('Student removed', 'success');
            loadStudents();
        }
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
    loadStudents();
});
