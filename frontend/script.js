// Global Variables
let currentUser = null;
let isAdmin = false;
let currentPage = 'home';

// Page switching
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId)?.classList.add('active');
    currentPage = pageId;
    window.scrollTo(0, 0);
}

// Login Functions
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + 'Login').classList.add('active');
}

async function selfLogin() {
    const id = document.getElementById('selfId').value;
    const password = document.getElementById('selfPassword').value;
    
    if (id === 'gvs-website' && password === 'hacker-gvs-website-anmol') {
        isAdmin = true;
        currentUser = 'ADMIN';
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        showStudentStatus();
        alert('Admin Login Successful!');
    } else {
        alert('Invalid Admin Credentials!');
    }
}

async function studentLogin() {
    const name = document.getElementById('studentName').value;
    const password = document.getElementById('studentPassword').value;
    
    try {
        const response = await fetch('/api/students/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            isAdmin = false;
            currentUser = name;
            document.getElementById('loginModal').style.display = 'none';
            showStudentStatus();
            alert('Student Login Successful!');
            window.location.href = 'result.html';
        } else {
            alert('Invalid Student Credentials!');
        }
    } catch (error) {
        alert('Login Failed! Please try again.');
    }
}

function showStudentStatus() {
    const status = document.getElementById('studentStatus');
    const studentName = document.getElementById('currentStudent');
    
    status.style.display = 'block';
    studentName.textContent = currentUser;
    
    if (isAdmin) {
        document.getElementById('adminPanel').style.display = 'block';
    }
}

async function showAdminOptions() {
    const options = `
        <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-top: 1rem;">
            <h3>Admin Panel</h3>
            <button onclick="showAddStudentForm()" style="margin: 5px; padding: 10px 20px; background: #ffca28; border: none; border-radius: 10px; cursor: pointer;">Add New Student</button>
            <button onclick="showAllStudents()" style="margin: 5px; padding: 10px 20px; background: #2c3e50; color: white; border: none; border-radius: 10px; cursor: pointer;">All Students</button>
            <button onclick="showAddMarksheet()" style="margin: 5px; padding: 10px 20px; background: #27ae60; color: white; border: none; border-radius: 10px; cursor: pointer;">Add Student Marksheet</button>
        </div>
    `;
    
    // Create dynamic admin panel
    const adminDiv = document.createElement('div');
    adminDiv.innerHTML = options;
    adminDiv.id = 'adminOptions';
    document.body.appendChild(adminDiv);
}

async function showAddStudentForm() {
    const form = `
        <div id="addStudentModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1001;">
            <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 400px; width: 90%;">
                <h3>Add New Student</h3>
                <input id="newStudentName" placeholder="Student Name" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px;">
                <input id="newStudentPassword" type="password" placeholder="Password" style="width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 8px;">
                <button onclick="addNewStudent()" style="width: 100%; padding: 12px; background: #ffca28; border: none; border-radius: 8px; font-weight: 600;">Add Student</button>
                <button onclick="closeModal('addStudentModal')" style="width: 100%; padding: 12px; background: #ddd; border: none; border-radius: 8px; margin-top: 10px;">Cancel</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', form);
}

async function addNewStudent() {
    const name = document.getElementById('newStudentName').value;
    const password = document.getElementById('newStudentPassword').value;
    
    if (!name || !password) {
        alert('Please fill all fields!');
        return;
    }
    
    try {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, password })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Student added successfully!');
            closeModal('addStudentModal');
            document.getElementById('adminOptions').remove();
        } else {
            alert('Error adding student!');
        }
    } catch (error) {
        alert('Error! Please try again.');
    }
}

async function showAllStudents() {
    try {
        const response = await fetch('/api/students');
        const students = await response.json();
        
        let studentList = '<div style="max-height: 400px; overflow-y: auto;"><h3>All Students</h3>';
        students.forEach(student => {
            studentList += `<div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                <span>${student.name}</span>
                <span style="color: #666; font-family: monospace;">${student.password}</span>
            </div>`;
        });
        studentList += '</div>';
        
        // Show in alert or modal
        alert(studentList);
    } catch (error) {
        alert('Error fetching students!');
    }
}

async function showAddMarksheet() {
    try {
        const response = await fetch('/api/students');
        const students = await response.json();
        
        let studentOptions = '<div style="max-height: 300px; overflow-y: auto;"><h3>Select Student</h3>';
        students.forEach(student => {
            studentOptions += `<button onclick="uploadMarksheet('${student.name}')" style="width: 100%; padding: 12px; margin: 5px 0; background: #ffca28; border: none; border-radius: 8px; cursor: pointer;">${student.name}</button>`;
        });
        studentOptions += '</div>';
        
        const modal = document.createElement('div');
        modal.innerHTML = studentOptions;
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1001; padding: 2rem;';
        document.body.appendChild(modal);
    } catch (error) {
        alert('Error fetching students!');
    }
}

function uploadMarksheet(studentName) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('marksheet', file);
            formData.append('studentName', studentName);
            
            try {
                const response = await fetch('/api/marksheet', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Marksheet uploaded successfully!');
                    document.querySelectorAll('[style*="position: fixed"]').forEach(el => el.remove());
                }
            } catch (error) {
                alert('Upload failed!');
            }
        }
    };
    input.click();
}

function closeModal(modalId) {
    document.getElementById(modalId)?.remove();
}

// Mobile menu toggle
document.querySelector('.hamburger').addEventListener('click', () => {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Auto-close login modal on page load if already logged in
window.addEventListener('load', () => {
    if (localStorage.getItem('currentUser')) {
        currentUser = localStorage.getItem('currentUser');
        isAdmin = localStorage.getItem('isAdmin') === 'true';
        showStudentStatus();
    } else {
        document.getElementById('loginModal').style.display = 'flex';
    }
});

// Result Page Functions
function loadResult() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load student result
    fetch(`/api/students/${currentUser}/result`)
        .then(res => res.json())
        .then(data => {
            if (data.marksheet) {
                displayResult(data);
            } else {
                document.getElementById('resultContent').innerHTML = '<p>No result available yet.</p>';
            }
        });
}

function displayResult(data) {
    const resultHTML = `
        <div class="marksheet">
            <div class="marksheet-header">
                <h1>CERTIFICATE OF SUCCESS</h1>
                <p>GVS Computer Center</p>
                ${data.photo ? `<img src="${data.photo}" alt="Student Photo" class="student-photo">` : ''}
            </div>
            <div class="student-info">
                <div class="info-row"><strong>Name:</strong> ${data.name}</div>
                <div class="info-row"><strong>Course:</strong> ${data.course || 'N/A'}</div>
                <div class="info-row"><strong>Result:</strong> <span style="color: #27ae60; font-weight: bold;">PASS</span></div>
            </div>
            ${data.marksheet ? `<img src="${data.marksheet}" alt="Marksheet" style="width: 100%; max-width: 600px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">` : ''}
            <div class="download-btns">
                <a href="${data.marksheet}" download="GVS-${data.name}-Marksheet.jpg" class="download-btn">📥 Download Marksheet</a>
                ${data.photo ? `<a href="${data.photo}" download="GVS-${data.name}-Photo.jpg" class="download-btn">📥 Download Photo</a>` : ''}
            </div>
        </div>
    `;
    document.getElementById('resultContent').innerHTML = resultHTML;
}

// Initialize
if (window.location.pathname.includes('result.html')) {
    loadResult();
}