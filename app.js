// app.js

const firebaseConfig = {
  apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.appspot.com",
  messagingSenderId: "121888927504",
  appId: "1:121888927504:web:8c11dbf7e6bdab66c97f95"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// UI Section Switching
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// Show student tab options
function showStudentOption(option) {
  document.getElementById("new-student").style.display = option === 'new' ? 'block' : 'none';
  document.getElementById("existing-student").style.display = option === 'existing' ? 'block' : 'none';
  document.getElementById("signup-section").style.display = 'block';
}

// Handle Signup
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const firstName = document.getElementById("signup-first-name").value;
  const lastName = document.getElementById("signup-last-name").value;
  const batch = document.getElementById("signup-batch").value;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("students").doc(cred.user.uid).set({
      firstName,
      lastName,
      batch,
      role: 'student',
      email
    });
    document.getElementById("signup-message").innerText = "Account created successfully!";
  } catch (err) {
    document.getElementById("signup-message").innerText = err.message;
  }
});

// Google Signup
async function signUpWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const userDoc = await db.collection("students").doc(result.user.uid).get();
    if (!userDoc.exists) {
      await db.collection("students").doc(result.user.uid).set({
        firstName: result.user.displayName.split(" ")[0],
        lastName: result.user.displayName.split(" ")[1] || '',
        batch: '',
        role: 'student',
        email: result.user.email
      });
    }
  } catch (err) {
    alert(err.message);
  }
}

// Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    document.getElementById("login-message").innerText = err.message;
  }
});

// Logout
function logout() {
  auth.signOut();
}

// On Auth State Changed
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const doc = await db.collection("students").doc(user.uid).get();
    const data = doc.data();
    if (!data) return;

    document.getElementById("students-tab").style.display = "none";
    document.getElementById("progress-tab").style.display = "none";
    document.getElementById("fee-nav").style.display = "none";
    document.getElementById("edit-nav").style.display = "none";
    document.getElementById("logout-nav").style.display = "block";

    if (data.role === 'admin') {
      document.getElementById("students-tab").style.display = "inline-block";
      document.getElementById("progress-tab").style.display = "inline-block";
      document.getElementById("fee-nav").style.display = "inline-block";
      showSection('admin-dashboard');
    } else {
      document.getElementById("edit-nav").style.display = "inline-block";
      document.getElementById("student-dashboard").style.display = "block";
      showSection('students');
    }
  } else {
    showSection('home');
  }
});

// Show Edit Profile
function showEditProfile() {
  document.getElementById("edit-profile").style.display = "block";
  db.collection("students").doc(auth.currentUser.uid).get().then((doc) => {
    const data = doc.data();
    document.getElementById("first-name").value = data.firstName;
    document.getElementById("last-name").value = data.lastName;
    document.getElementById("batch").value = data.batch;
  });
}

// Save profile
document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const batch = document.getElementById("batch").value;

  await db.collection("students").doc(auth.currentUser.uid).update({
    firstName, lastName, batch
  });

  document.getElementById("save-message").innerText = "Profile saved!";
});

// Admin: Show student list
function showAdminTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(t => t.style.display = "none");
  if (tab === 'students') {
    document.getElementById("admin-students").style.display = "block";
    loadStudentList();
  } else if (tab === 'progress') {
    document.getElementById("admin-progress").style.display = "block";
  }
}

function getFutureMonths(numMonths = 18) {
  const months = [];
  const now = new Date();
  for (let i = 0; i < numMonths; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i);
    const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    months.push(label);
  }
  return months;
}

function loadStudentList() {
  const tableContainer = document.getElementById("student-table-container");
  if (!tableContainer) return;

  db.collection("students").where("role", "==", "student").get().then((querySnapshot) => {
    let html = `<table border="1"><thead><tr>
      <th>#</th><th>First Name</th><th>Last Name</th><th>Batch</th>`;

    const months = getFutureMonths();
    months.forEach(month => {
      html += `<th>${month}</th>`;
    });

    html += `</tr></thead><tbody>`;

    let index = 1;
    querySnapshot.forEach(doc => {
      const data = doc.data();
      html += `<tr>
        <td>${index++}</td>
        <td>${data.firstName}</td>
        <td>${data.lastName}</td>
        <td>${data.batch}</td>`;

      months.forEach(_ => {
        html += `<td></td>`;
      });

      html += `</tr>`;
    });

    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
  });
}


