import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import {
  getDatabase,
  set,
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import firebaseConfig from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const dbRef = ref(getDatabase());

const keys = document.querySelectorAll(".key");
const regulars = document.querySelectorAll(".key.white");
const sharps = document.querySelectorAll(".key.black");
const whites = [
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
  "a",
  "s",
  "d",
  "f",
  "g",
  "h",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  "j",
  "k",
  "l",
  ";",
  ",",
  "u",
  "i",
  "o",
  "p",
  ".",
  "/",
  "0",
  "9",
  "8",
  "7",
  "6",
  "5",
];
const blacks = [
  "1",
  "2",
  "3",
  "4",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "-",
  "=",
  "+",
  "_",
  ":",
  '"',
  "?",
  "]",
  "{",
  "}",
  "[",
];
const recordButton = document.querySelector(".recordBtn");
const playButton = document.querySelector(".playBtn");
const saveButton = document.querySelector(".saveBtn");

const keyMap = [...keys].reduce((map, key) => {
  map[key.dataset.note] = key;
  return map;
}, {});
let user = null;
let timerVar;
let totalSeconds = 0;
let recordings = {};
let numberOfRecordings = 0;
let totalSecondsFromInit = 0;
let timerRunning = false;
let recordStartTime;
let song;

onAuthStateChanged(auth, (userData) => {
  if (userData) {
    user = userData;
    console.log(user);
    document.getElementById("login").style.display = "none";
    document.getElementById("signup").style.display = "none";
    document.getElementById("logout").style.display = "content";
    document.getElementById("userName").innerText = user.displayName;

    get(child(dbRef, "users/" + user.uid))
      .then((snapshot) => {
        if (snapshot.exists()) {
          numberOfRecordings = snapshot.val().numberOfRecordings;
          recordings = snapshot.val().recordings;
          totalSecondsFromInit = snapshot.val().totalSecondsFromInit;
          updateoverallTimerDisplay(totalSecondsFromInit);
          console.log(snapshot.val());

          let list = document.getElementById("recordingsList");
          Object.keys(recordings).forEach((item) => {
            let li = document.createElement("li");
            li.innerText = item;
            li.id = item;
            li.addEventListener("click", () => {
              playSong(recordings[item]);
            });
            list.appendChild(li);
          });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // User is signed out
    document.getElementById("login").style.display = "content";
    document.getElementById("signup").style.display = "content";
    document.getElementById("logout").style.display = "none";
    console.log("sign in a user");
  }
});

document.getElementById("logout").addEventListener("click", () => {
  let confirmAction = confirm("Are you sure you want to log out?");
  console.log(confirmAction);
  if (confirmAction) {
    console.log(auth.signOut);
    auth.signOut().then(() => {
      window.location.reload();
    });
  }
});

let playsound = (key) => {
  if (recordActive) {
    recordSound(key.dataset.note);
  }
  const notesound = document.getElementById(key.dataset.note);
  notesound.currentTime = 0;

  notesound.play();
  key.classList.add("active");
  setTimeout(() => {
    key.classList.remove("active");
  }, 400);
  key.classList.remove("mouseon");
};

let colour = (key) => {
  key.classList.add("mouseon");
};

let point = (key) => {
  key.classList.remove("mouseon");
};
document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const key = e.key;
  const whiteKeyIndex = whites.indexOf(key);
  const blackKeyIndex = blacks.indexOf(key);

  if (whiteKeyIndex > -1) playsound(regulars[whiteKeyIndex]);
  if (blackKeyIndex > -1) playsound(sharps[blackKeyIndex]);
});

keys.forEach((key) => {
  key.addEventListener("mouseover", () => colour(key));
  key.addEventListener("mouseout", () => point(key));
  key.addEventListener("click", () => playsound(key));
});

document.getElementById("startTimer").addEventListener("click", function () {
  if (!timerRunning) {
    timerRunning = true;
    clearInterval(timerVar);
    timerVar = setInterval(countTimer, 1000);
    function countTimer() {
      ++totalSeconds;
      var hour = Math.floor(totalSeconds / 3600);
      var minute = Math.floor((totalSeconds - hour * 3600) / 60);
      var seconds = totalSeconds - (hour * 3600 + minute * 60);
      if (hour < 10) hour = "0" + hour;
      if (minute < 10) minute = "0" + minute;
      if (seconds < 10) seconds = "0" + seconds;
      document.getElementById("timer").innerHTML =
        hour + ":" + minute + ":" + seconds;
    }
  }
});

document.getElementById("pauseTimer").addEventListener("click", function () {
  if (timerRunning) {
    clearInterval(timerVar);
    document.getElementById("startTimer").innerText = "Resume Timer";
    timerRunning = false;
  }
});

function updateoverallTimerDisplay(totalSecondsValue) {
  var hour = Math.floor(totalSecondsValue / 3600);
  var minute = Math.floor((totalSecondsValue - hour * 3600) / 60);
  var seconds = totalSecondsValue - (hour * 3600 + minute * 60);
  if (hour < 10) hour = "0" + hour;
  if (minute < 10) minute = "0" + minute;
  if (seconds < 10) seconds = "0" + seconds;
  document.getElementById("overallTimer").innerHTML =
    hour + ":" + minute + ":" + seconds;
}

document.getElementById("stopTimer").addEventListener("click", function () {
  clearInterval(timerVar);
  totalSecondsFromInit += totalSeconds;

  updateoverallTimerDisplay(totalSecondsFromInit);
  if (user) {
    set(
      child(dbRef, "users/" + user.uid + "/totalSecondsFromInit"),
      totalSecondsFromInit
    );
  }
  totalSeconds = 0;
  timerRunning = false;
  document.getElementById("timer").innerHTML = "00:00:00";
  document.getElementById("startTimer").innerText = "Start Timer";
});

let recordActive = false;
recordButton.addEventListener("click", () => {
  if (user) {
    recordState();
  } else {
    alert("Please login or signup to continue");
  }
});
saveButton.addEventListener("click", () => {
  saveNote();
});
playButton.addEventListener("click", () => {
  playSong(song);
});

function recordState() {
  // recordButton.classList.toggle('active')
  recordButton.classList.toggle("recordingOn");

  recordActive = recordStatus();
  if (recordActive) {
    // console.log("startRecord");
    startRecord();
  } else {
    // console.log("stoprecord");
    stopRecord();
  }
}
function recordStatus() {
  // return recordBtn != null && recordBtn.classList.contains('active');
  //if(recordButton.classList.contains('active'))
  if (recordButton.classList.contains("recordingOn")) {
    // console.log("returned true");
    return true;
  } else {
    return false;
  }
}
recordActive = recordStatus();
function startRecord() {
  // console.log("test start record");
  playButton.classList.remove("show");
  saveButton.classList.remove("show");
  recordStartTime = Date.now();
  document.getElementById("recordBtn").innerText = "Stop";
  song = [];
}
function stopRecord() {
  // console.log("test stop record");
  document.getElementById("recordBtn").innerText = "Record";
  playButton.classList.add("show");
  saveButton.classList.add("show");
}
function playSong(songObject) {
  console.log(songObject);
  if (songObject.length != 0) {
    // console.log("test playSong");
    songObject.forEach((note) => {
      setTimeout(() => {
        playsound(keyMap[note.key]);
      }, note.startTime);
      // console.log(recordings)
    });
  }
}

function recordSound(note) {
  //console.log("test recordSound");
  song.push({
    key: note,
    startTime: Date.now() - recordStartTime,
  });
}

function saveNote() {
  // console.log(Object.keys(recordings))
  // playSong(recordings["My first song"])
  if (song.length == 0) {
    alert("Empty recording");
  } else {
    let title = prompt(
      "Please enter title for your recording:",
      "recording - " + (numberOfRecordings + 1)
    );
    if (title) {
      numberOfRecordings++;
      if (user) {
        set(
          child(dbRef, "users/" + user.uid + "/numberOfRecordings/"),
          numberOfRecordings
        );
        set(child(dbRef, "users/" + user.uid + "/recordings/" + title), song);
      }
      recordings[title] = song;
      let listItem = document.createElement("li");
      listItem.innerText = title;
      listItem.id = title;
      listItem.addEventListener("click", () => {
        playSong(recordings[title]);
      });
      document.getElementById("recordingsList").appendChild(listItem);
    }
  }
}
