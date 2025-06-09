// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function showSection(id) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('visible'));
  document.getElementById(id).classList.add('visible');
}

function showStudentOption(type) {
  document.getElementById('new-student').style.display = type === 'new' ? 'block' : 'none';
  document.getElementById('existing-student').style.display = type === 'existing' ? 'block' : 'none';
  showSection('students');
}

function showEditProfile() {
  showSection('students');
  document.getElementById('student-dashboard').style.display = 'none';
  document.getElementById('edit-profile').style.display = 'block';
}

auth.onAuthStateChanged(user => {
  if (user) {
    db.collection('students').doc(user.uid).get().then(doc => {
      if (doc.exists) {
        const data = doc.data();

        // Hide all sections
        document.querySelectorAll('section').forEach(sec => sec.classList.remove('visible'));

        if (data.role === 'admin') {
          // Admin view setup
          document.getElementById('admin-dashboard').classList.add('visible');
          document.getElementById('students-tab').style.display = 'inline-block';
          document.getElementById('progress-tab').style.display = 'inline-block';
          document.getElementById('edit-nav').style.display = 'none';
          document.getElementById('fee-nav').style.display = 'none';
          document.getElementById('logout-nav').style.display = 'inline-block';

          loadStudentTable();
        } else {
          // Student view setup
          document.getElementById('student-dashboard').style.display = 'block';
          document.getElementById('edit-nav').style.display = 'inline-block';
          document.getElementById('fee-nav').style.display = 'inline-block';
          document.getElementById('logout-nav').style.display = 'inline-block';

          document.getElementById('students').classList.add('visible');
        }
      }
    });
  }
});


document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => document.getElementById('login-message').textContent = '')
    .catch(err => document.getElementById('login-message').textContent = err.message);
});

document.getElementById('profile-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  const firstName = document.getElementById('first-name').value;
  const lastName = document.getElementById('last-name').value;
  const batch = document.getElementById('batch').value;
  db.collection('students').doc(user.uid).set({
    firstName,
    lastName,
    batch,
    role: 'student',
    email: user.email
  }, { merge: true }).then(() => {
    document.getElementById('save-message').textContent = 'Profile saved!';
  });
});

function logout() {
  auth.signOut().then(() => location.reload());
}

function showAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(div => div.style.display = 'none');
  document.getElementById(`admin-${tab}`).style.display = 'block';
}

function loadStudentTable() {
  db.collection('students').where('role', '==', 'student').get().then(snapshot => {
    const container = document.getElementById('student-table-container');
    container.innerHTML = '';
    const table = document.createElement('table');
    table.border = '1';
    const months = getFutureMonths('2025-06', '2026-12');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['First Name', 'Last Name', 'Batch', ...months].forEach(text => {
      const th = document.createElement('th');
      th.textContent = text;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    snapshot.forEach(doc => {
      const data = doc.data();
      const row = document.createElement('tr');
      [data.firstName || '', data.lastName || '', data.batch || ''].forEach(text => {
        const td = document.createElement('td');
        td.textContent = text;
        row.appendChild(td);
      });
      months.forEach(month => {
        const td = document.createElement('td');
        td.textContent = (data.feeStatus && data.feeStatus[month]) ? data.feeStatus[month] : '-';
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  });
}

function getFutureMonths(start, end) {
  const result = [];
  const [startYear, startMonth] = start.split('-').map(Number);
  const [endYear, endMonth] = end.split('-').map(Number);
  const currentDate = new Date();
  let year = startYear;
  let month = startMonth;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
    const date = new Date(`${monthStr}-01`);
    if (date >= currentDate) {
      const label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      result.push(label);
    }
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  return result;
}
