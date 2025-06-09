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

function showStudentOption(type) {
  document.getElementById('new-student').style.display = type === 'new' ? 'block' : 'none';
  document.getElementById('existing-student').style.display = type === 'existing' ? 'block' : 'none';
  showSection('students');
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    const doc = await db.collection('students').doc(user.uid).get();
    const data = doc.data();

    if (data.role === 'admin') {
      document.getElementById('admin-nav').style.display = 'inline-block';
      loadAllStudents();
    } else {
      document.getElementById('fee-nav').style.display = 'inline-block';
      document.getElementById('progress-nav').style.display = 'inline-block';
    }

    document.getElementById('edit-nav').style.display = 'inline-block';
    document.getElementById('logout-nav').style.display = 'inline-block';
    showSection('student-dashboard');
  } catch (error) {
    document.getElementById('login-message').textContent = error.message;
  }
});

function showEditProfile() {
  showSection('edit-profile');
  const user = auth.currentUser;
  db.collection('students').doc(user.uid).get().then(doc => {
    const data = doc.data();
    document.getElementById('first-name').value = data.firstName || '';
    document.getElementById('last-name').value = data.lastName || '';
    document.getElementById('batch').value = data.batch || '';
  });
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  await db.collection('students').doc(user.uid).set({
    firstName: document.getElementById('first-name').value,
    lastName: document.getElementById('last-name').value,
    batch: document.getElementById('batch').value
  }, { merge: true });

  document.getElementById('save-message').textContent = 'Profile saved successfully!';
});

function logout() {
  auth.signOut();
  location.reload();
}
function showAdminDashboard() {
  showSection('admin-dashboard');
  const tableBody = document.querySelector('#students-table tbody');
  tableBody.innerHTML = '';

  db.collection("students").get().then(snapshot => {
    snapshot.forEach(doc => {
      const student = doc.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${student.firstName || ''} ${student.lastName || ''}</td>
        <td>${student.email || ''}</td>
        <td>${student.batch || ''}</td>
        <td><button onclick="editStudent('${doc.id}')">Edit</button></td>
      `;
      tableBody.appendChild(row);
    });
  });
}

function loadAllStudents() {
  const tbody = document.getElementById('student-list');
  tbody.innerHTML = '';
  db.collection('students').get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${data.firstName || ''} ${data.lastName || ''}</td>
        <td>${data.email || ''}</td>
        <td>${data.batch || ''}</td>
        <td><button onclick="alert('Edit feature coming soon')">Edit</button></td>
      `;
      tbody.appendChild(row);
    });
  });
}
