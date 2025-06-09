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

// Login
document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      loadAfterLogin(userCredential.user);
    })
    .catch(error => {
      document.getElementById("login-message").textContent = error.message;
    });
});

// Signup
document.getElementById("signup-form").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const firstName = document.getElementById("signup-first-name").value;
  const lastName = document.getElementById("signup-last-name").value;
  const batch = document.getElementById("signup-batch").value;

  auth.fetchSignInMethodsForEmail(email).then(methods => {
    if (methods.length > 0) {
      document.getElementById("signup-message").textContent = "Email already in use. Try logging in.";
    } else {
      auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
          return db.collection("students").doc(cred.user.uid).set({
            firstName, lastName, batch, email
          });
        })
        .then(() => {
          document.getElementById("signup-message").textContent = "Account created! Logging in...";
          loadAfterLogin(auth.currentUser);
        })
        .catch(error => {
          document.getElementById("signup-message").textContent = error.message;
        });
    }
  });
});

// Google sign-in
function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      db.collection("students").doc(user.uid).set({
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
        batch: ""
      }, { merge: true });
      loadAfterLogin(user);
    });
}

// Password reset
function resetPassword() {
  const email = document.getElementById("email").value;
  if (!email) return alert("Enter email to reset password.");
  auth.sendPasswordResetEmail(email)
    .then(() => alert("Password reset email sent!"))
    .catch(error => alert(error.message));
}

function loadAfterLogin(user) {
  document.getElementById("existing-student").style.display = "none";
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

// Edit profile save
document.getElementById("profile-form").addEventListener("submit", e => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;
  const data = {
    firstName: document.getElementById("first-name").value,
    lastName: document.getElementById("last-name").value,
    batch: document.getElementById("batch").value,
  };
  db.collection("students").doc(user.uid).update(data)
    .then(() => document.getElementById("save-message").textContent = "Profile saved!");
});

// Navigation
function logout() {
  auth.signOut().then(() => location.reload());
}
function showEditProfile() {
  showSection('students');
  document.getElementById("student-dashboard").style.display = "none";
  document.getElementById("edit-profile").style.display = "block";
}
function showSection(id) {
  document.querySelectorAll("section").forEach(s => s.classList.remove("visible"));
  document.getElementById(id).classList.add("visible");
}
function showStudentOption(type) {
  showSection("students");
  document.getElementById("new-student").style.display = "none";
  document.getElementById("existing-student").style.display = "none";
  document.getElementById("student-dashboard").style.display = "none";
  document.getElementById("edit-profile").style.display = "none";
  if (type === "new") document.getElementById("new-student").style.display = "block";
  if (type === "existing") document.getElementById("existing-student").style.display = "block";
}
