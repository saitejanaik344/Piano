import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import firebaseConfig from "./config.js";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
document.getElementById("submit").addEventListener("click", function (event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      console.log("signed in", userCredential);
    })
    .then(() => {
      window.location.assign("index.html");
    })
    .catch((error) => {
      console.log(error);
      alert("Incorrect Password or Username");
    });
});
