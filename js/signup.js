import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getDatabase,
  set,
  ref,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import firebaseConfig from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function checkpassword(passwordd, conpasswordd) {
  let message = document.getElementById("message");
  if (passwordd.length != 0) {
    if (passwordd == conpasswordd) {
      message.textContent = "passwords match";
      message.style.backgroundColor = "#3ae374";
      return true;
    } else {
      message.textContent = "passwords don't match";
      message.style.backgroundColor = "#ff4d4d";
      message.style.width = "200px";
      return false;
    }
  } else {
    alert("password cannot be empty");
    message.textContent = "password cannot be empty";
    message.style.backgroundColor = "#ff4d4d";
    message.style.width = "200px";
    return false;
  }
}

document.getElementById("submit").addEventListener("click", function (event) {
  event.preventDefault();

  let passwordd = document.getElementById("password").value;
  let conpasswordd = document.getElementById("conpassword").value;
  let firstName = document.getElementById("firstName").value;
  let lastName = document.getElementById("lastName").value;
  let email = document.getElementById("email").value;
  let user = null;

  var equalpass = false;
  equalpass = checkpassword(passwordd, conpasswordd);

  if (equalpass) {
    createUserWithEmailAndPassword(auth, email, passwordd)
      .then((userCredential) => {
        user = userCredential.user;
        updateProfile(auth.currentUser, {
          displayName: firstName + " " + lastName,
        })
          .then(() => {
            const db = getDatabase();
            console.log("set function");
            set(ref(db, "users/" + user.uid), {
              username: firstName + " " + lastName,
              email: email,
              totalSecondsFromInit: 0,
              numberOfRecordings: 1,
              recordings: {
                "sample Recording": [
                  {
                    key: "B2",
                    startTime: 500,
                  },
                  {
                    key: "C3",
                    startTime: 1234,
                  },
                  {
                    key: "D3",
                    startTime: 1997,
                  },
                  {
                    key: "E3",
                    startTime: 2581,
                  },
                  {
                    key: "G3",
                    startTime: 3841,
                  },
                  {
                    key: "A4",
                    startTime: 4402,
                  },
                  {
                    key: "B4",
                    startTime: 4900,
                  },
                ],
              },
            })
              .then(() => {
                console.log(user, db);
                // Profile updated!
                // ...
                window.location.assign("index.html");
              })
              .catch((error) => console.log(error));
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  } else {
    alert("Passwords do not match");
  }
});
