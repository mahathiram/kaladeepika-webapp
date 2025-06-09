// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.firebasestorage.app",
  messagingSenderId: "121888927504",
  appId: "1:121888927504:web:8c11dbf7e6bdab66c97f95",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function showSection(id) {
  document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

function showStudentOption(type) {
  showSection("students");
  document.getElementById("new-student").style.display = type === 'new' ? "block" : "none";
  document.getElementById("existing-student").style.display = type === 'existing' ? "block" : "none";
  document.getElementById("signup-section").style.display = type === 'existing' ? "block" : "none";
}

function signUpWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      db.collection("students").doc(user.uid).set({
        email: user.email,
        firstName: user.displayName.split(" ")[0],
        lastName: user.displayName.split(" ")[1] || "",
        batch: "",
        role: "student"
      }, { merge: true });
    });
}

document.getElementById("signup-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const firstName = document.getElementById("signup-first-name").value;
  const lastName = document.getElementById("signup-last-name").value;
  const batch = document.getElementById("signup-batch").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      return db.collection("students").doc(cred.user.uid).set({
        email, firstName, lastName, batch,
        role: "student"
      });
    })
    .then(() => {
      document.getElementById("signup-message").textContent = "Account created successfully!";
    })
    .catch(err => {
      document.getElementById("signup-message").textContent = err.message;
    });
});

document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(cred => {
      checkUserRole(cred.user.uid);
    })
    .catch(err => {
      document.getElementById("login-message").textContent = err.message;
    });
});

function loadAdminSummaryTable() {
  google.charts.load('current', { packages: ['corechart', 'table'] });
  google.charts.setOnLoadCallback(drawSummaryTable);

  function drawSummaryTable() {
    const query = new google.visualization.Query(
      'https://docs.google.com/spreadsheets/d/1T0V-PdffEzfdMgpjey9A5fZxr-EJ-xvHSH9gPNptuKM/gviz/tq?gid=750748256&range=K3:L5'
    );
    query.send(response => {
      const data = response.getDataTable();

      // Clear previous content
      const thead = document.querySelector("#summary-table thead");
      const tbody = document.querySelector("#summary-table tbody");
      thead.innerHTML = "";
      tbody.innerHTML = "";

      // Create header
      const headerRow = document.createElement("tr");
      for (let i = 0; i < data.getNumberOfColumns(); i++) {
        const th = document.createElement("th");
        th.textContent = data.getColumnLabel(i);
        headerRow.appendChild(th);
      }
      thead.appendChild(headerRow);

      // Create rows
      for (let i = 0; i < data.getNumberOfRows(); i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < data.getNumberOfColumns(); j++) {
          const td = document.createElement("td");
          td.textContent = data.getValue(i, j);
          row.appendChild(td);
        }
        tbody.appendChild(row);
      }
    });
  }
}

function checkUserRole(uid) {
  db.collection("students").doc(uid).get().then(doc => {
    if (!doc.exists) return;
    const data = doc.data();

    // Hide all nav buttons first
    document.querySelectorAll("nav button").forEach(btn => btn.style.display = "none");

    if (data.role === "admin") {
      // Admin-specific UI
      document.getElementById("students-tab").style.display = "inline-block";
      document.getElementById("progress-tab").style.display = "inline-block";
      document.getElementById("fee-nav").style.display = "inline-block";
      document.querySelector("nav button[onclick=\"showSection('home')\"]").style.display = "inline-block";
      document.getElementById("logout-nav").style.display = "inline-block";

      // Show admin dashboard with welcome
      showSection("admin-dashboard");
      loadAdminSummaryTable();
    } else {
      // Student-specific UI
      document.getElementById("student-dashboard").style.display = "block";
      document.getElementById("edit-nav").style.display = "inline-block";
      document.getElementById("fee-nav").style.display = "inline-block";
      document.querySelector("nav button[onclick=\"showSection('home')\"]").style.display = "inline-block";
      document.getElementById("logout-nav").style.display = "inline-block";
      document.querySelector("nav button[onclick=\"showSection('communications')\"]").style.display = "inline-block";

      showSection("home");
    }
  });
}




function logout() {
  auth.signOut().then(() => location.reload());
}

function showEditProfile() {
  showSection("students");
  document.getElementById("edit-profile").style.display = "block";
  const user = auth.currentUser;
  if (!user) return;

  db.collection("students").doc(user.uid).get().then(doc => {
    const data = doc.data();
    document.getElementById("first-name").value = data.firstName || "";
    document.getElementById("last-name").value = data.lastName || "";
    document.getElementById("batch").value = data.batch || "";
  });
}

document.getElementById("profile-form").addEventListener("submit", e => {
  e.preventDefault();
  const user = auth.currentUser;
  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const batch = document.getElementById("batch").value;

  db.collection("students").doc(user.uid).set({ firstName, lastName, batch }, { merge: true })
    .then(() => {
      document.getElementById("save-message").textContent = "Profile updated!";
    });
});

function showAdminTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(el => el.style.display = "none");
  document.getElementById(`admin-${tab}`).style.display = "block";
}

auth.onAuthStateChanged(user => {
  if (user) {
    checkUserRole(user.uid);
  }
});

