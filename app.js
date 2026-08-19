/* =========================================
   NOVA MOBILE
   app.js
   ========================================= */


/* =========================================
   ELEMENTS
   ========================================= */

const orb = document.getElementById("orb");
const status = document.getElementById("status");
const input = document.getElementById("input");
const send = document.getElementById("send");

const wake = document.getElementById("wake");
const volume = document.getElementById("volume");
const media = document.getElementById("media");
const apps = document.getElementById("apps");

const connectionText =
  document.getElementById("connectionText");

const connectionDot =
  document.getElementById("connectionDot");

const cpu =
  document.getElementById("cpu");

const ram =
  document.getElementById("ram");

const disk =
  document.getElementById("disk");


/* =========================================
   NOVA PC ADDRESS
   ========================================= */

const PC_URL =
  "https://grace-upgrades-subscription-strip.trycloudflare.com";


/* =========================================
   STATUS
   ========================================= */

function setStatus(text, mode = "") {

  status.textContent = text;

  orb.className = "orb";

  if (mode) {
    orb.classList.add(mode);
  }

}


/* =========================================
   SPEAK
   ========================================= */

function speak(text) {

  console.log("NOVA SPEAK:", text);

  if (!text) {
    console.log("No speech text received.");
    setStatus("READY");
    return;
  }


  if (!("speechSynthesis" in window)) {

    console.log(
      "Speech synthesis is not supported."
    );

    setStatus("VOICE UNAVAILABLE");

    return;
  }


  window.speechSynthesis.cancel();


  const utterance =
    new SpeechSynthesisUtterance(text);


  utterance.lang = "en-GB";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;


  utterance.onstart = () => {

    console.log("NOVA STARTED SPEAKING");

    setStatus(
      "SPEAKING",
      "speaking"
    );

  };


  utterance.onend = () => {

    console.log("NOVA FINISHED SPEAKING");

    setStatus("READY");

  };


  utterance.onerror = event => {

    console.log(
      "Speech error:",
      event
    );

    setStatus("READY");

  };


  window.speechSynthesis.speak(
    utterance
  );

}


/* =========================================
   CHECK PC CONNECTION
   ========================================= */

async function checkConnection() {

  try {

    const response =
      await fetch(
        PC_URL + "/status",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        "Status request failed"
      );
    }


    const data =
      await response.json();


    if (data.online) {

      connectionText.textContent =
        "PC ONLINE";


      connectionDot.style.background =
        "#4dff9a";


      connectionDot.style.boxShadow =
        "0 0 12px #4dff9a";

    }


  }

  catch (error) {

    console.log(
      "Connection error:",
      error
    );


    connectionText.textContent =
      "PC OFFLINE";


    connectionDot.style.background =
      "#ff4d4d";


    connectionDot.style.boxShadow =
      "0 0 12px #ff4d4d";

  }

}


/* =========================================
   PC STATS
   ========================================= */

async function updateStats() {

  try {

    const response =
      await fetch(
        PC_URL + "/stats",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        "Stats request failed"
      );
    }


    const data =
      await response.json();


    if (
      typeof data.cpu === "number"
    ) {

      cpu.textContent =
        Math.round(data.cpu) + "%";

    }


    if (
      typeof data.ram === "number"
    ) {

      ram.textContent =
        Math.round(data.ram) + "%";

    }


    if (
      typeof data.disk === "number"
    ) {

      disk.textContent =
        Math.round(data.disk) + "%";

    }

  }

  catch (error) {

    console.log(
      "Stats error:",
      error
    );

  }

}


/* =========================================
   SEND COMMAND
   ========================================= */

async function command(text) {

  const clean =
    text.trim();


  if (!clean) {
    return;
  }


  console.log(
    "NOVA COMMAND:",
    clean
  );


  setStatus(
    "PROCESSING",
    "thinking"
  );


  try {

    const response =
      await fetch(
        PC_URL + "/command",
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            command: clean
          })

        }
      );


    console.log(
      "SERVER STATUS:",
      response.status
    );


    if (!response.ok) {

      throw new Error(
        "Server returned " +
        response.status
      );

    }


    const data =
      await response.json();


    console.log(
      "SERVER RESPONSE:",
      data
    );


    /*
     * Python returns:
     *
     * {
     *   success: true,
     *   command: "hello",
     *   response: "Hello. NOVA PC is online and connected."
     * }
     */


    if (
      data &&
      data.response
    ) {

      speak(
        String(data.response)
      );

    }

    else {

      console.log(
        "Server did not provide response text."
      );

      setStatus("READY");

    }

  }

  catch (error) {

    console.error(
      "COMMAND ERROR:",
      error
    );


    setStatus(
      "CONNECTION ERROR"
    );

  }

}


/* =========================================
   SEND BUTTON
   ========================================= */

send.addEventListener(
  "click",
  () => {

    const text =
      input.value;

    input.value = "";

    command(text);

  }
);


/* =========================================
   ENTER KEY
   ========================================= */

input.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      const text =
        input.value;

      input.value = "";

      command(text);

    }

  }
);


/* =========================================
   VOICE RECOGNITION
   ========================================= */

const Recognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;


let recognition = null;


if (Recognition) {

  recognition =
    new Recognition();


  recognition.lang =
    "en-GB";


  recognition.continuous =
    false;


  recognition.interimResults =
    false;


  recognition.maxAlternatives =
    1;


  orb.addEventListener(
    "click",
    () => {

      setStatus(
        "LISTENING",
        "listening"
      );


      try {

        recognition.start();

      }

      catch (error) {

        console.log(
          "Recognition error:",
          error
        );

      }

    }
  );


  recognition.onresult =
    event => {

      const text =
        event
          .results[0][0]
          .transcript;


      console.log(
        "NOVA HEARD:",
        text
      );


      command(text);

    };


  recognition.onerror =
    event => {

      console.log(
        "VOICE ERROR:",
        event.error
      );


      setStatus("READY");

    };


  recognition.onend =
    () => {

      if (
        status.textContent ===
        "LISTENING"
      ) {

        setStatus("READY");

      }

    };

}


/* =========================================
   BUTTONS
   ========================================= */

wake.addEventListener(
  "click",
  () => {

    command("wake pc");

  }
);


volume.addEventListener(
  "click",
  () => {

    command("volume");

  }
);


media.addEventListener(
  "click",
  () => {

    command("media");

  }
);


apps.addEventListener(
  "click",
  () => {

    command("apps");

  }
);


/* =========================================
   STARTUP
   ========================================= */

setStatus("READY");

checkConnection();

updateStats();


/* =========================================
   AUTOMATIC UPDATES
   ========================================= */

setInterval(
  checkConnection,
  5000
);


setInterval(
  updateStats,
  2000
);
