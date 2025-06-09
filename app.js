// Firebase config & initialization
const firebaseConfig = {
  apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.firebasestorage.app",
  messagingSenderId: "121888927504",
  appId: "1:121888927504:web:8c11dbf7e6bdab66c97f95",
  measurementId: "G-NX0BEN41Y1"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

function clearMessages() {
  document.getElementById("login-message").textContent = "";
  document.getElementById("signup-message").textContent = "";
  document.getElementById("save-message").textContent = "";
}

// Login with email/password
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  clearMessages();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(({ user }) => {
      afterLogin(user);
    })
    .catch((error) => {
      document.getElementById("login-message").textContent = error.message;
    });
});

// Google sign-in
document.getElementById("google-signin-btn").addEventListener("click", () => {
  clearMessages();
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(({ user }) => {
      // Create Firestore doc if doesn't exist
      db.collection("students").doc(user.uid).get()
        .then(doc => {
          if (!doc.exists) {
            const names = user.displayName ? user.displayName.split(' ') : ["", ""];
            db.collection("students").doc(user.uid).set({
              firstName: names[0] || "",
              lastName: names.slice(1).join(' ') || "",
              batch: ""
            });
          }
        });
      afterLogin(user);
    })
    .catch((error) => {
      document.getElementById("signup-message").textContent = error.message;
    });
});

// Signup with email/password
document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  clearMessages();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const firstName = document.getElementById("signup-first-name").value;
  const lastName = document.getElementById("signup-last-name").value;
  const batch = document.getElementById("signup-batch").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(({ user }) => {
      return db.collection("students").doc(user.uid).set({
        firstName,
        lastName,
        batch
      }).then(() => user);
    })
    .then(user => {
      afterLogin(user);
    })
    .catch((error) => {
      document.getElementById("signup-message").textContent = error.message;
    });
});

function afterLogin(user) {
  clearMessages();

  document.getElementById("existing-student").style.display = "none";
  document.getElementById("new-student").style.display = "none";
  document.getElementById("student-dashboard").style.display = "block";

  document.getElementById("fee-nav").style.display = "inline-block";
  document.getElementById("progress-nav").style.display = "inline-block";
  document.getElementById("edit-nav").style.display = "inline-block";
  document.getElementById("logout-nav").style.display = "inline-block";

  loadProfile(user.uid);
}

function loadProfile(uid) {
  db.collection("students").doc(uid).get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      document.getElementById("first-name").value = data.firstName || "";
      document.getElementById("last-name").value = data.lastName || "";
      document.getElementById("batch").value = data.batch || "";
    }
  });
}

document.getElementById("profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  clearMessages();

  const firstName = document.getElementById("first-name").value;
  const lastName = document.getElementById("last-name").value;
  const batch = document.getElementById("batch").value;

  db.collection("students").doc(user.uid).set({
    firstName,
    lastName,
    batch
  }).then(() => {
    document.getElementById("save-message").textContent = "Profile saved successfully!";
  }).catch(error => {
    document.getElementById("save-message").textContent = "Error: " + error.message;
  });
});

function showEditProfile() {
  showSection('students');
  document.getElementById("student-dashboard").style.display = "none";
  document.getElementById("edit-profile").style.display = "block";
}

function logout() {
  auth.signOut().then(() => {
    clearMessages();

    document.getElementById("student-dashboard").style.display = "none";
    document.getElementById("existing-student").style.display = "block";
    document.getElementById("edit-profile").style.display = "none";

    document.getElementById("fee-nav").style.display = "none";
    document.getElementById("progress-nav").style.display = "none";
    document.getElementById("edit-nav").style.display = "none";
    document.getElementById("logout-nav").style.display = "none";
  });
}

// Keep showSection and showStudentOption functions consistent with your index.html script
function showSection(sectionId) {
  document.querySelectorAll("section").forEach(section => {
    section.classList.remove("visible");
  });
  document.getElementById(sectionId).classList.add("visible");
}

function showStudentOption(type) {
  showSection('students');
  document.getElementById("new-student").style.display = "none";
  document.getElementById("existing-student").style.display = "none";
  document.getElementById("student-dashboard").style.display = "none";
  document.getElementById("edit-profile").style.display = "none";

  if (type === "new") {
    document.getElementById("new-student").style.display = "block";
  } else if (type === "existing") {
    document.getElementById("existing-student").style.display = "block";
  }
}
