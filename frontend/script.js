// Global State
let currentUser = null;
let isAdmin = false;
let currentPage = 'home';

// Initialize app
window.addEventListener('load', initApp);

function initApp() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    const savedAdmin = localStorage.getItem('isAdmin');
    
    if (savedUser) {
        currentUser = savedUser;
        isAdmin = savedAdmin === 'true';
        showUserStatus();
        updateNav();
    }
    
    // Mobile menu
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.nav-menu').classList.toggle('active');
    });
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            showPage(this.getAttribute('href').slice(1));
        });
    });
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId)?.classList.add('active');
    currentPage = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('.nav-menu').classList.remove('active');
}

function toggleLogin() {
    const modal = document.getElementById('loginModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

// Admin Login
async function adminLogin() {
    const id = document.getElementById('adminId').value;
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password, type: 'self' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            isAdmin = true;
            saveUserSession();
            showUserStatus();
            updateNav();
            closeLogin();
            showAdminPanel();
            alert('Admin Login Successful!');
        } else {
            alert('Invalid Admin Credentials!');
        }
    } catch (error) {
        alert('Login Failed!');
    }
}

// Student Login
async function studentLogin() {
    const id = document.getElementById('studentId').value;
    const password = document.getElementById('studentPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password, type: 'student' })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            isAdmin = false;
            saveUserSession();
            showUserStatus();
            updateNav();
            closeLogin();
            alert('Student Login Successful!');
            // Redirect to result page after 1 second
            setTimeout(() => {
                window.open('result.html', '_blank');
            }, 1000);
        } else {
            alert('Invalid Student Credentials!');
        }
    } catch (error) {
        alert('Login Failed!');
    }
}

function saveUserSession() {
    localStorage.setItem('currentUser', currentUser);
    localStorage.setItem('isAdmin', isAdmin);
}

function showUserStatus() {
    const status = document.getElementById('userStatus');
    const userName = document.getElementById('currentUser');
    userName.textContent = isAdmin ? '👑 ADMIN' : `Student: ${currentUser}`;
    status.style.display = 'block';
}

function updateNav() {
    document.getElementById('loginBtn').style.display = currentUser ? 'none' : 'block';
    document.getElementById('logoutBtn').style.display = currentUser ? 'block' : 'none';
}

function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    document.getElementById('userStatus').style.display = 'none';
    updateNav();
    closeLogin();
    alert('Logged out successfully!');
}

// Admin Panel
function showAdminPanel() {
    if (!isAdmin) return;
    
    const panelHTML = `
        <div id="adminPanel" class="admin-panel">
            <button class="admin-btn primary" onclick="window.open('admin.html', '_blank')">⚙️ Admin Dashboard</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', panelHTML);
}

// Result Page Functions (for result.html)
function loadResult() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    fetch(`/api/results/${currentUser}`)
        .then(res => res.json())
        .then(data => {
            displayResult(data);
        }).catch(() => {
            document.getElementById('resultContent').innerHTML = '<p>No result available yet. Contact admin.</p>';
        });
}

function displayResult(data) {
    const resultHTML = `
        <div class="marksheet">
            <div class="marksheet-header">
                <h1>🎉 CERTIFICATE OF SUCCESS</h1>
                <p>GVS Computer Center</p>
            </div>
            <div class="student-info">
                <div class="info-row"><strong>👤 Name:</strong> ${currentUser}</div>
                <div class="info-row"><strong>📋 Result:</strong> <span style="color: #27ae60; font-size: 1.2em;">PASS ✅</span></div>
                <div class="info-row"><strong>📅 Issued:</strong> ${data.uploadedAt ? new Date(data.uploadedAt).toLocaleDateString() : 'N/A'}</div>
            </div>
            ${data.marksheet ? `
                <div class="marksheet-image">
                    <img src="${data.marksheet}" alt="Marksheet">
                </div>
                <div class="download-section">
                    <a href="${data.marksheet}" download="GVS-${currentUser}-Marksheet.jpg" class="download-btn primary">📥 Download Marksheet</a>
                </div>
            ` : '<p style="text-align: center; color: #666; font-size: 1.1em;">Result will be available soon...</p>'}
        </div>
    `;
    document.getElementById('resultContent').innerHTML = resultHTML;
}
