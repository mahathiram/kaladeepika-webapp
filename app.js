// app.js

document.addEventListener("DOMContentLoaded", () => {
  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
    authDomain: "kala-deepika.firebaseapp.com",
    projectId: "kala-deepika",
    storageBucket: "kala-deepika.appspot.com",
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  function showSection(id) {
    document.querySelectorAll("section").forEach(sec => sec.style.display = "none");
    const target = document.getElementById(id);
    if (target) target.style.display = "block";
  }

  function showStudentOption(option) {
    showSection("students");
    const newEl = document.getElementById("new-student");
    const existingEl = document.getElementById("existing-student");
    const signupEl = document.getElementById("signup-section");

    if (!newEl || !existingEl || !signupEl) return;

    newEl.style.display = option === 'new' ? "block" : "none";
    existingEl.style.display = option === 'existing' ? "block" : "none";
    signupEl.style.display = option === 'existing' ? "block" : "none";
  }

  window.showStudentOption = showStudentOption;

  function signUpWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        return db.collection("students").doc(user.uid).set({
          email: user.email,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          batch: "",
          role: "student"
        }, { merge: true });
      });
  }

  window.signUpWithGoogle = signUpWithGoogle;

  document.getElementById("signup-form")?.addEventListener("submit", e => {
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

  document.getElementById("login-form")?.addEventListener("submit", e => {
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

  function checkUserRole(uid) {
    db.collection("students").doc(uid).get().then(doc => {
      if (!doc.exists) return;
      const data = doc.data();

      // Hide all nav buttons
      document.querySelectorAll("nav button").forEach(btn => btn.style.display = "none");

      if (data.role === "admin") {
        showSection("admin-dashboard");
        document.getElementById("admin-dashboard").style.display = "block";
        document.getElementById("students-tab").style.display = "inline-block";
        document.getElementById("progress-tab").style.display = "inline-block";
        document.getElementById("fee-nav").style.display = "inline-block";
        document.getElementById("logout-nav").style.display = "inline-block";
      } else {
        showSection("student-dashboard");
        document.getElementById("student-dashboard").style.display = "block";
        document.getElementById("edit-nav").style.display = "inline-block";
        document.getElementById("fee-nav").style.display = "inline-block";
        document.getElementById("logout-nav").style.display = "inline-block";
      }

      showSection("home");
    });
  }

  function logout() {
    auth.signOut().then(() => location.reload());
  }

  window.logout = logout;

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

  window.showEditProfile = showEditProfile;

  document.getElementById("profile-form")?.addEventListener("submit", e => {
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
    const tabEl = document.getElementById(`admin-${tab}`);
    if (tabEl) tabEl.style.display = "block";

    if (tab === "students") {
      const tableContainer = document.getElementById("student-table-container");
      if (!tableContainer) return;

      db.collection("students").where("role", "==", "student").get().then(snapshot => {
        let html = `<table><tr><th>#</th><th>First Name</th><th>Last Name</th><th>Batch</th></tr>`;
        let i = 1;
        snapshot.forEach(doc => {
          const data = doc.data();
          html += `<tr><td>${i++}</td><td>${data.firstName}</td><td>${data.lastName}</td><td>${data.batch}</td></tr>`;
        });
        html += `</table>`;
        tableContainer.innerHTML = html;
      }).catch(err => {
        tableContainer.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
      });
    }
  }

  window.showAdminTab = showAdminTab;

  auth.onAuthStateChanged(user => {
    if (user) checkUserRole(user.uid);
  });
});
