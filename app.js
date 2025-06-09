// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.firebasestorage.app",
  messagingSenderId: "121888927504",
  appId: "1:121888927504:web:8c11dbf7e6bdab66c97f95"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

function showSection(id) {
  document.querySelectorAll('section').forEach(sec => (sec.style.display = 'none'));
  document.getElementById(id).style.display = 'block';

  // Hide login/signup nav when logged in or in admin dashboard
  if (id === 'admin-dashboard' || id === 'home' || id === 'student-progress' || id === 'fee') {
    document.getElementById('login-nav').style.display = 'none';
    document.getElementById('signup-nav').style.display = 'none';
  }
}

// Navigation for admin user
function setNavForAdmin() {
  const visibleIds = ['home', 'students-tab', 'progress-tab', 'fee-nav', 'logout-nav'];
  // Hide all buttons first
  document.querySelectorAll('nav > button').forEach(btn => (btn.style.display = 'none'));
  document.getElementById('student-dropdown').style.display = 'none';
  // Show required buttons
  visibleIds.forEach(id => {
    document.getElementById(id).style.display = 'inline-block';
  });
  document.getElementById('edit-nav').style.display = 'none';
  document.getElementById('login-nav').style.display = 'none';
  document.getElementById('signup-nav').style.display = 'none';
}

// Navigation for student user
function setNavForStudent() {
  document.querySelectorAll('nav > button').forEach(btn => (btn.style.display = 'none'));
  document.getElementById('student-dropdown').style.display = 'block';
  ['edit-nav', 'fee-nav', 'logout-nav'].forEach(id => {
    document.getElementById(id).style.display = 'inline-block';
  });
  document.getElementById('students-tab').style.display = 'none';
  document.getElementById('progress-tab').style.display = 'none';
  document.getElementById('fee-nav').style.display = 'inline-block';
  document.getElementById('login-nav').style.display = 'none';
  document.getElementById('signup-nav').style.display = 'none';
}

// Navigation for logged out user
function setNavForLoggedOut() {
  document.querySelectorAll('nav > button').forEach(btn => (btn.style.display = 'inline-block'));
  document.getElementById('student-dropdown').style.display = 'none';
  document.getElementById('students-tab').style.display = 'none';
  document.getElementById('progress-tab').style.display = 'none';
  document.getElementById('fee-nav').style.display = 'none';
  document.getElementById('edit-nav').style.display = 'none';
  document.getElementById('logout-nav').style.display = 'none';
  document.getElementById('login-nav').style.display = 'inline-block';
  document.getElementById('signup-nav').style.display = 'inline-block';
}

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('students')
      .doc(user.uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          const data = doc.data();
          if (data.role === 'admin') {
            setNavForAdmin();
            showSection('admin-dashboard');
            document.getElementById('admin-welcome-message').textContent = `Welcome, Admin!`;
            loadStudentTable();
          } else {
            setNavForStudent();
            showSection('home');
          }
        } else {
          // No user doc found - treat as student with minimal data
          setNavForStudent();
          showSection('home');
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setNavForStudent();
        showSection('home');
      });
  } else {
    // logged out state
    setNavForLoggedOut();
    showSection('home');
  }
});

// Login form submit
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('login-form').reset();
    })
    .catch(err => {
      alert('Login failed: ' + err.message);
    });
});

// Google login button
document.getElementById('google-login-btn').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      // Check if user exists in Firestore
      const userDocRef = db.collection('students').doc(user.uid);
      userDocRef.get().then(doc => {
        if (!doc.exists) {
          // Create user doc with student role
          userDocRef.set({
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            batch: '',
            role: 'student',
          });
        }
      });
    })
    .catch(err => {
      alert('Google login failed: ' + err.message);
    });
});

// Signup form submit
document.getElementById('signup-form').addEventListener('submit', e => {
  e.preventDefault();
  const firstName = document.getElementById('signup-firstName').value.trim();
  const lastName = document.getElementById('signup-lastName').value.trim();
  const batch = document.getElementById('signup-batch').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  auth
    .createUserWithEmailAndPassword(email, password)
    .then(cred => {
      const uid = cred.user.uid;
      return db.collection('students').doc(uid).set({
        firstName,
        lastName,
        batch,
        email,
        role: 'student',
      });
    })
    .then(() => {
      alert('Account created successfully!');
      document.getElementById('signup-form').reset();
      showSection('home');
    })
    .catch(err => {
      alert('Signup failed: ' + err.message);
    });
});

// Google Signup button - same as Google login (idempotent)
document.getElementById('google-signup-btn').addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth
    .signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      const userDocRef = db.collection('students').doc(user.uid);
      userDocRef.get().then(doc => {
        if (!doc.exists) {
          userDocRef.set({
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            batch: '',
            role: 'student',
          });
        }
      });
    })
    .catch(err => {
      alert('Google signup failed: ' + err.message);
    });
});

// Password Reset UI toggling
function showPasswordReset() {
  showSection('password-reset-section');
}

// Password reset form submit
document.getElementById('password-reset-form').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('reset-email').value.trim();
  auth
    .sendPasswordResetEmail(email)
    .then(() => {
      alert('Password reset email sent.');
      showSection('login-section');
    })
    .catch(err => {
      alert('Error sending reset email: ' + err.message);
    });
});

function loadStudentTable() {
  db.collection('students')
    .where('role', '==', 'student')
    .get()
    .then(snapshot => {
      const container = document.getElementById('student-table-container');
      container.innerHTML = '';

      if (snapshot.empty) {
        container.textContent = 'No students found.';
        return;
      }

      const table = document.createElement('table');
      table.border = '1';
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';

      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      ['S.No', 'First Name', 'Last Name', 'Batch'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.border = '1px solid #000';
        th.style.padding = '8px';
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      let serial = 1;
      snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement('tr');

        [serial++, data.firstName || '', data.lastName || '', data.batch || ''].forEach(cellText => {
          const td = document.createElement('td');
          td.textContent = cellText;
          td.style.border = '1px solid #000';
          td.style.padding = '8px';
          row.appendChild(td);
        });

        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      container.appendChild(table);
    })
    .catch(err => {
      console.error('Error loading students:', err);
    });
}

document.getElementById('students-tab').addEventListener('click', () => {
  showSection('admin-dashboard');
  loadStudentTable();
});

document.getElementById('progress-tab').addEventListener('click', () => {
  showSection('student-progress');
});

document.getElementById('fee-nav').addEventListener('click', () => {
  showSection('fee');
});

function logout() {
  auth.signOut().then(() => {
    location.reload();
  });
}

// Placeholder for showing edit profile
function showEditProfile() {
  alert('Edit profile functionality not implemented yet.');
}

// Placeholder for showing student option in dropdown
function showStudentOption(option) {
  alert(`Show ${option} students section - to be implemented.`);
}
