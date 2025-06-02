// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.appspot.com",
  messagingSenderId: "121888927504",
  appId: "1:121888927504:web:8c11dbf7e6bdab66c97f95"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// UI logic
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("visible"));
  document.getElementById(id).classList.add("visible");
}

function showStudentOption(option) {
  document.getElementById('new-student').style.display = (option === 'new') ? 'block' : 'none';
  document.getElementById('existing-student').style.display = (option === 'existing') ? 'block' : 'none';
  document.getElementById('student-dashboard').style.display = 'none';
}

// Auth
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      document.getElementById('login-message').textContent = '';
    } catch (err) {
      document.getElementById('login-message').textContent = 'Login failed. Please check credentials.';
    }
  });
}

const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      alert("Signup successful! You can now log in.");
      showSection('students');
    } catch (error) {
      alert("Signup error: " + error.message);
    }
  });
}

const resetForm = document.getElementById('reset-form');
if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-email').value;
    try {
      await auth.sendPasswordResetEmail(email);
      alert("Password reset email sent.");
    } catch (error) {
      alert("Reset error: " + error.message);
    }
  });
}

// Profile Save
const profileForm = document.getElementById('profile-form');
if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const profileData = {
      firstName: document.getElementById('first-name').value,
      lastName: document.getElementById('last-name').value,
      batch: document.getElementById('batch').value
    };

    try {
      await db.collection('students').doc(user.uid).set(profileData);
      document.getElementById('save-message').textContent = 'Profile saved successfully!';
    } catch (err) {
      document.getElementById('save-message').textContent = 'Error saving profile: ' + err.message;
    }
  });
}

// Auth State Observer
auth.onAuthStateChanged(user => {
  const loggedIn = !!user;
  document.getElementById('student-dashboard').style.display = loggedIn ? 'block' : 'none';
  document.getElementById('existing-student').style.display = loggedIn ? 'none' : 'block';
  document.getElementById('fee').style.display = loggedIn ? 'block' : 'none';
  document.getElementById('progress').style.display = loggedIn ? 'block' : 'none';
});
