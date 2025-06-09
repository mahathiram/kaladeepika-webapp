// Firebase config and initialization
const firebaseConfig = {
  apiKey: "YAIzaSyAD8RgBbelFsLkn1yeFTK-wKmTEOZcxzQU",
  authDomain: "kala-deepika.firebaseapp.com",
  projectId: "kala-deepika",
  storageBucket: "kala-deepika.appspot.com",
  messagingSenderId: "121888927504",
  appId: "Y1:121888927504:web:8c11dbf7e6bdab66c97f95"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      document.getElementById("login-message").textContent = "";
      document.getElementById("existing-student").style.display = "none";
      document.getElementById("student-dashboard").style.display = "block";
    })
    .catch((error) => {
      document.getElementById("login-message").textContent = error.message;
    });
});

function showEditProfile() {
  document.getElementById("student-dashboard").style.display = "none";
  document.getElementById("edit-profile").style.display = "block";
}

function logout() {
  auth.signOut().then(() => {
    document.getElementById("student-dashboard").style.display = "none";
    document.getElementById("existing-student").style.display = "block";
  });
}

document.getElementById("profile-form").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("save-message").textContent = "Profile saved!";
});
