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

// Show only one section at a time
function showSection(id) {
  document.querySelectorAll("section").forEach(s => (s.style.display = "none"));
  const el = document.getElementById(id);
  if (el) el.style.display = "block";

  // Reset messages
  clearMessages();

  // Hide all nav buttons except home and logout or based on role later
  if (id === "home") {
    document.getElementById("students-tab").style.display = "none";
    document.getElementById("progress-tab").style.display = "none";
    document.getElementById("fee-nav").style.display = "none";
    document.getElementById("edit-nav").style.display = "none";
    document.getElementById("logout-nav").style.display = "none";
  }
}

function clearMessages() {
  ["signup-message", "login-message", "save-message"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

function showStudentOption(option) {
  if (option === "new") {
    showSection("signup-section");
  } else if (option === "existing") {
    showSection("existing-student");
  }
}

// Sign up new user
document.getElementById("signup-form").addEventListener("submit", async e => {
  e.preventDefault();
  const firstName = document.getElementById("signup-first-name").value.trim();
  const lastName = document.getElementById("signup-last-name").value.trim();
  const batch = document.getElementById("signup-batch").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("students").doc(cred.user.uid).set({
      firstName,
      lastName,
      batch,
      email,
      role: "student"
    });
    document.getElementById("signup-message").textContent = "Account created successfully! Logging you in...";
  } catch (err) {
    document.getElementById("signup-message").textContent = err.message;
  }
});

// Google Sign In / Sign Up
async function signUpWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const userDoc = await db.collection("students").doc(result.user.uid).get();
    if (!userDoc.exists) {
      await db.collection("students").doc(result.user.uid).set({
        firstName: result.user.displayName.split(" ")[0],
        lastName: result.user.displayName.split(" ")[1] || "",
        batch: "",
        email: result.user.email,
        role: "student"
      });
    }
  } catch (err) {
    alert(err.message);
  }
}

// Login existing user
document.getElementById("login-form").addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    document.getElementById("login-message").textContent = err.message;
  }
});

// Logout user
function logout() {
  auth.signOut();
  showSection("home");
}

// Listen for auth state changes
auth.onAuthStateChanged(async user => {
  if (user) {
    const doc = await db.collection("students").doc(user.uid).get();
    if (!doc.exists) {
      alert("User profile not found. Please contact admin.");
      auth.signOut();
      showSection("home");
      return;
    }
    const data = doc.data();

    if (data.role === "admin") {
      document.getElementById("students-tab").style.display = "inline-block";
      document.getElementById("progress-tab").style.display = "inline-block";
      document.getElementById("fee-nav").style.display = "inline-block";
      document.getElementById("edit-nav").style.display = "none";
      document.getElementById("logout-nav").style.display = "inline-block";
      showSection("admin-dashboard");
      showAdminTab("students");
    } else {
      document.getElementById("students-tab").style.display = "none";
      document.getElementById("progress-tab").style.display = "none";
      document.getElementById("fee-nav").style.display = "none";
      document.getElementById("edit-nav").style.display = "inline-block";
      document.getElementById("logout-nav").style.display = "inline-block";
      showSection("student-dashboard");
    }
  } else {
    // No user logged in
    document.getElementById("students-tab").style.display = "none";
    document.getElementById("progress-tab").style.display = "none";
    document.getElementById("fee-nav").style.display = "none";
    document.getElementById("edit-nav").style.display = "none";
    document.getElementById("logout-nav").style.display = "none";
    showSection("home");
  }
});

// Show Edit Profile section and populate fields
function showEditProfile() {
  showSection("edit-profile");
  const uid = auth.currentUser.uid;
  db.collection("students")
    .doc(uid)
    .get()
    .then(doc => {
      if (doc.exists) {
        const data = doc.data();
        document.getElementById("first-name").value = data.firstName || "";
        document.getElementById("last-name").value = data.lastName || "";
        document.getElementById("batch").value = data.batch || "";
      }
    });
}

// Save profile edits
document.getElementById("profile-form").addEventListener("submit", async e => {
  e.preventDefault();
  const uid = auth.currentUser.uid;
  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const batch = document.getElementById("batch").value.trim();

  try {
    await db.collection("students").doc(uid).update({ firstName, lastName, batch });
    document.getElementById("save-message").textContent = "Profile saved successfully!";
  } catch (err) {
    document.getElementById("save-message").textContent = err.message;
  }
});

// Admin tabs switching
function showAdminTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(el => (el.style.display = "none"));
  if (tab === "students") {
    document.getElementById("admin-students").style.display = "block";
    loadStudentList();
  } else if (tab === "progress") {
    document.getElementById("admin-progress").style.display = "block";
  }
}

// Load student list for admin
function loadStudentList() {
  const container = document.getElementById("student-table-container");
  if (!container) return;
  db.collection("students")
    .where("role", "==", "student")
    .get()
    .then(snapshot => {
      let html = `<table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <thead style="background-color: #eee;">
          <tr><th>#</th><th>First Name</th><th>Last Name</th><th>Batch</th></tr>
        </thead>
        <tbody>`;
      let count = 1;
      snapshot.forEach(doc => {
        const d = doc.data();
        html += `<tr>
          <td>${count++}</td>
          <td>${d.firstName || ""}</td>
          <td>${d.lastName || ""}</td>
          <td>${d.batch || ""}</td>
        </tr>`;
      });
      html += "</tbody></table>";
      container.innerHTML = html;
    });
}



