// app.js

const firebaseConfig = {
  apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.appspot.com",
  messagingSenderId: "",
  appId: ""
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const sections = document.querySelectorAll('section');
function showSection(id) {
  sections.forEach(section => section.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
}

function showStudentOption(option) {
  document.getElementById('new-student').style.display = option === 'new' ? 'block' : 'none';
  document.getElementById('existing-student').style.display = option === 'existing' ? 'block' : 'none';
  document.getElementById('signup-section').style.display = option === 'existing' ? 'block' : 'none';
  showSection('students');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    loadUserData(result.user.uid);
  } catch (error) {
    document.getElementById('login-message').textContent = error.message;
  }
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const firstName = document.getElementById('signup-first-name').value;
  const lastName = document.getElementById('signup-last-name').value;
  const batch = document.getElementById('signup-batch').value;
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    await db.collection('students').doc(uid).set({
      email, firstName, lastName, batch, role: 'student'
    });
    document.getElementById('signup-message').textContent = 'Account created! Please login.';
  } catch (error) {
    document.getElementById('signup-message').textContent = error.message;
  }
});

function signUpWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      const docRef = db.collection('students').doc(user.uid);
      docRef.get().then(doc => {
        if (!doc.exists) {
          docRef.set({ email: user.email, firstName: '', lastName: '', batch: '', role: 'student' });
        }
      });
    });
}

auth.onAuthStateChanged(user => {
  if (user) {
    loadUserData(user.uid);
  }
});

function loadUserData(uid) {
  db.collection('students').doc(uid).get().then(doc => {
    const data = doc.data();
    if (data.role === 'admin') {
      document.getElementById('students-tab').style.display = 'inline-block';
      document.getElementById('progress-tab').style.display = 'inline-block';
      document.getElementById('fee-nav').style.display = 'inline-block';
      document.getElementById('logout-nav').style.display = 'inline-block';
      document.getElementById('edit-nav').style.display = 'none';
      showSection('admin-dashboard');
      loadStudentTable();
    } else {
      document.getElementById('edit-nav').style.display = 'inline-block';
      document.getElementById('logout-nav').style.display = 'inline-block';
      showSection('student-dashboard');
    }
  });
}

function logout() {
  auth.signOut();
  location.reload();
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const batch = document.getElementById('batch').value;
  if (user) {
    await db.collection('students').doc(user.uid).update({ firstName, lastName, batch });
    document.getElementById('save-message').textContent = 'Profile updated!';
  }
});

function showEditProfile() {
  const user = auth.currentUser;
  if (!user) return;
  db.collection('students').doc(user.uid).get().then(doc => {
    const data = doc.data();
    document.getElementById('first-name').value = data.firstName;
    document.getElementById('last-name').value = data.lastName;
    document.getElementById('batch').value = data.batch;
    showSection('edit-profile');
  });
}

function showAdminTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(div => div.style.display = 'none');
  document.getElementById('admin-' + tabName).style.display = 'block';
}

function loadStudentTable() {
  db.collection('students').where('role', '==', 'student').get().then(snapshot => {
    const tbody = document.querySelector('#student-table tbody');
    tbody.innerHTML = '';
    let count = 1;
    snapshot.forEach(doc => {
      const data = doc.data();
      const row = `<tr><td>${count++}</td><td>${data.firstName}</td><td>${data.lastName}</td><td>${data.batch}</td></tr>`;
      tbody.innerHTML += row;
    });
  });
}
