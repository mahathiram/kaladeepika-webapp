// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.firebasestorage.app",
  messagingSenderId: "121888927504",
  appId: "1:121888927504:web:8c11dbf7e6bdab66c97f95",
  measurementId: "G-NX0BEN41Y1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// UI Logic
function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("visible"));
  document.getElementById(id).classList.add("visible");
}

function showStudentOption(option) {
  showSection("students");
  document.getElementById('new-student').style.display = (option === 'new') ? 'block' : 'none';
  document.getElementById('existing-student').style.display = (option === 'existing') ? 'block' : 'none';
  document.getElementById('student-dashboard').style.display = 'none';
  document.getElementById('edit-profile').style.display = 'none';
}

function showEditProfile() {
  document.getElementById('edit-profile').style.display = 'block';
  document.getElementById('save-message').textContent = '';
}

function logout() {
  auth.signOut();
}

// Auth logic
document.getElementById('login-form').addEventListener('submit', async (e) => {
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

auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById('student-dashboard').style.display = 'block';
    document.getElementById('existing-student').style.display = 'none';
    document.getElementById('fee-nav').style.display = 'inline-block';
    document.getElementById('progress-nav').style.display = 'inline-block';
  } else {
    document.getElementById('student-dashboard').style.display = 'none';
    document.getElementById('fee-nav').style.display = 'none';
    document.getElementById('progress-nav').style.display = 'none';
  }
});

// Save profile
document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (user) {
    const data = {
      firstName: document.getElementById('first-name').value,
      lastName: document.getElementById('last-name').value,
      batch: document.getElementById('batch').value
    };
    try {
      await db.collection("students").doc(user.uid).set(data);
      document.getElementById('save-message').textContent = 'Profile saved successfully!';
    } catch (err) {
      document.getElementById('save-message').textContent = 'Failed to save profile.';
    }
  }
});
