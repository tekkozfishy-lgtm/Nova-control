/* =========================================
   NOVA MOBILE — app.js
   ========================================= */


/* =========================================
   ELEMENTS
   ========================================= */

const orb =
  document.getElementById("orb");

const status =
  document.getElementById("status");

const input =
  document.getElementById("input");

const send =
  document.getElementById("send");

const wake =
  document.getElementById("wake");

const volume =
  document.getElementById("volume");

const media =
  document.getElementById("media");

const apps =
  document.getElementById("apps");

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
   NOVA PC CONNECTION
   ========================================= */

/*
 * IMPORTANT:
 *
 * This must be the current Cloudflare
 * Quick Tunnel address.
 */

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
   SPEECH
   ========================================= */

function speak(text) {

  if (!("speechSynthesis" in window)) {

    console.log(
      "Speech synthesis is not supported."
    );

    return;

  }


  window.speechSynthesis.cancel();


  const voice =
    new SpeechSynthesisUtterance(text);


  voice.lang = "en-GB";

  voice.rate = 1;

  voice.pitch = 1;

  voice.volume = 1;


  voice.onstart = () => {

    setStatus(
      "SPEAKING",
      "speaking"
    );

  };


  voice.onend = () => {

    setStatus("READY");

  };


  voice.onerror = () => {

    setStatus("READY");

  };


  window.speechSynthesis.speak(
    voice
  );

}


/* =========================================
   CONNECTION CHECK
   ========================================= */

async function checkConnection() {

  try {

    const response =
      await fetch(
        PC_URL + "/status",
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "PC status request failed"
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

    else {

      throw new Error(
        "PC reported offline"
      );

    }

  }

  catch (error) {

    console.log(
      "NOVA connection error:",
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
   LIVE PC STATS
   ========================================= */

async function updateStats() {

  try {

    const response =
      await fetch(
        PC_URL + "/stats",
        {
          method: "GET",
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


    /* CPU */

    if (
      typeof data.cpu === "number"
    ) {

      cpu.textContent =
        Math.round(data.cpu) + "%";

    }


    /* RAM */

    if (
      typeof data.ram === "number"
    ) {

      ram.textContent =
        Math.round(data.ram) + "%";

    }


    /* DISK */

    if (
      typeof data.disk === "number"
    ) {

      disk.textContent =
        Math.round(data.disk) + "%";

    }

  }

  catch (error) {

    console.log(
      "NOVA stats error:",
      error
    );


    cpu.textContent = "--";

    ram.textContent = "--";

    disk.textContent = "--";

  }

}


/* =========================================
   SEND COMMAND TO PC
   ========================================= */

async function command(text) {

  const clean =
    text.trim();


  if (!clean) {

    return;

  }


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


    if (!response.ok) {

      throw new Error(
        "Command request failed"
      );

    }


    const data =
      await response.json();


    if (
      data.response
    ) {

      speak(
        data.response
      );

    }

    else {

      setStatus("READY");

    }

  }

  catch (error) {

    console.log(
      "NOVA command error:",
      error
    );


    setStatus(
      "CONNECTION ERROR"
    );


    speak(
      "I can't reach the NOVA PC system."
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


  /* -------------------------------
     START LISTENING
     ------------------------------- */

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
          "Recognition start error:",
          error
        );

      }

    }
  );


  /* -------------------------------
     SPEECH RESULT
     ------------------------------- */

  recognition.onresult =
    event => {

      const text =
        event
          .results[0][0]
          .transcript;


      console.log(
        "NOVA heard:",
        text
      );


      command(text);

    };


  /* -------------------------------
     SPEECH ERROR
     ------------------------------- */

  recognition.onerror =
    event => {

      console.log(
        "Speech recognition error:",
        event.error
      );


      setStatus(
        "READY"
      );

    };


  /* -------------------------------
     SPEECH END
     ------------------------------- */

  recognition.onend =
    () => {

      if (
        status.textContent ===
        "LISTENING"
      ) {

        setStatus(
          "READY"
        );

      }

    };

}


/* =========================================
   VOICE NOT AVAILABLE
   ========================================= */

else {

  console.log(
    "Speech recognition is not supported."
  );


  orb.addEventListener(
    "click",
    () => {

      setStatus(
        "VOICE UNAVAILABLE"
      );

    }
  );

}


/* =========================================
   WAKE PC BUTTON
   ========================================= */

wake.addEventListener(
  "click",
  () => {

    command(
      "wake pc"
    );

  }
);


/* =========================================
   VOLUME BUTTON
   ========================================= */

volume.addEventListener(
  "click",
  () => {

    command(
      "volume"
    );

  }
);


/* =========================================
   MEDIA BUTTON
   ========================================= */

media.addEventListener(
  "click",
  () => {

    command(
      "media"
    );

  }
);


/* =========================================
   APPS BUTTON
   ========================================= */

apps.addEventListener(
  "click",
  () => {

    command(
      "apps"
    );

  }
);


/* =========================================
   STARTUP
   ========================================= */

setStatus(
  "READY"
);


/* Check PC immediately */

checkConnection();


/* Get stats immediately */

updateStats();


/* =========================================
   AUTOMATIC UPDATES
   ========================================= */

/*
 * Connection:
 * every 5 seconds
 */

setInterval(
  checkConnection,
  5000
);


/*
 * PC stats:
 * every 2 seconds
 */

setInterval(
  updateStats,
  2000
);
