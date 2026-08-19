/*
 * ============================================
 *                 NOVA MOBILE
 *             Mobile Controller
 * ============================================
 */


/*
 * PC CONNECTION
 */

const PC_URL =
  "https://grace-upgrades-subscription-strip.trycloudflare.com";


/*
 * ELEMENTS
 */

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
  document.getElementById(
    "connectionText"
  );

const connectionDot =
  document.getElementById(
    "connectionDot"
  );

const cpu =
  document.getElementById("cpu");

const ram =
  document.getElementById("ram");

const gpu =
  document.getElementById("gpu");


/*
 * ============================================
 *                 STATUS SYSTEM
 * ============================================
 */

function setStatus(
  text,
  mode = ""
) {

  status.textContent =
    text;

  orb.className =
    "orb";

  if (mode) {

    orb.classList.add(
      mode
    );

  }

}


/*
 * ============================================
 *                  SPEECH
 * ============================================
 */

function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  window.speechSynthesis.cancel();


  const voice =
    new SpeechSynthesisUtterance(
      text
    );


  voice.lang =
    "en-GB";

  voice.rate =
    1;

  voice.pitch =
    1;

  voice.volume =
    1;


  voice.onstart = () => {

    setStatus(
      "SPEAKING",
      "speaking"
    );

  };


  voice.onend = () => {

    setStatus(
      "READY"
    );

  };


  window.speechSynthesis.speak(
    voice
  );

}


/*
 * ============================================
 *              PC CONNECTION CHECK
 * ============================================
 */

async function checkConnection() {

  try {

    const response =
      await fetch(
        `${PC_URL}/status`,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "PC offline"
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

      return true;

    }

  }

  catch (error) {

    console.log(
      "NOVA PC connection:",
      error
    );

  }


  connectionText.textContent =
    "PC OFFLINE";

  connectionDot.style.background =
    "#ffb84d";

  connectionDot.style.boxShadow =
    "0 0 12px #ffb84d";

  return false;

}


/*
 * ============================================
 *                 PC STATS
 * ============================================
 */

async function updateStats() {

  try {

    const response =
      await fetch(
        `${PC_URL}/stats`,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Stats unavailable"
      );

    }


    const data =
      await response.json();


    cpu.textContent =
      `${Math.round(data.cpu)}%`;


    ram.textContent =
      `${Math.round(data.ram)}%`;


    /*
     * GPU will be connected
     * when we add GPU monitoring
     * to the Windows side.
     */

    gpu.textContent =
      "--";


  }

  catch (error) {

    console.log(
      "NOVA stats error:",
      error
    );

    cpu.textContent =
      "--";

    ram.textContent =
      "--";

    gpu.textContent =
      "--";

  }

}


/*
 * ============================================
 *              SEND COMMAND TO PC
 * ============================================
 */

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
        `${PC_URL}/command`,
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
        "Command failed"
      );

    }


    const data =
      await response.json();


    if (data.success) {

      setStatus(
        "READY"
      );


      speak(
        data.response
      );

    }

    else {

      setStatus(
        "ERROR"
      );


      speak(
        "I couldn't process that command."
      );

    }

  }

  catch (error) {

    console.error(
      "NOVA command error:",
      error
    );


    setStatus(
      "PC OFFLINE"
    );


    speak(
      "I can't connect to the NOVA PC system."
    );

  }

}


/*
 * ============================================
 *                   SEND
 * ============================================
 */

send.addEventListener(
  "click",
  () => {

    const text =
      input.value;


    input.value = "";


    command(
      text
    );

  }
);


/*
 * ============================================
 *                    ENTER
 * ============================================
 */

input.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      const text =
        input.value;


      input.value = "";


      command(
        text
      );

    }

  }
);


/*
 * ============================================
 *                 VOICE INPUT
 * ============================================
 */

const Recognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;


if (Recognition) {

  const recognition =
    new Recognition();


  recognition.lang =
    "en-GB";


  recognition.continuous =
    false;


  recognition.interimResults =
    false;


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
          "Recognition already running."
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


      command(
        text
      );

    };


  recognition.onerror =
    error => {

      console.log(
        "Voice error:",
        error
      );


      setStatus(
        "READY"
      );

    };


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


else {

  orb.addEventListener(
    "click",
    () => {

      setStatus(
        "VOICE UNAVAILABLE"
      );


      speak(
        "Voice input is not supported on this device."
      );

    }
  );

}


/*
 * ============================================
 *                 WAKE PC
 * ============================================
 */

wake.addEventListener(
  "click",
  async () => {

    setStatus(
      "CHECKING PC",
      "thinking"
    );


    const online =
      await checkConnection();


    if (online) {

      setStatus(
        "PC ONLINE"
      );


      speak(
        "The NOVA PC system is already online."
      );

    }

    else {

      setStatus(
        "PC OFFLINE"
      );


      speak(
        "The NOVA PC system is offline."
      );

    }

  }
);


/*
 * ============================================
 *                  VOLUME
 * ============================================
 */

volume.addEventListener(
  "click",
  () => {

    speak(
      "Volume controls will be connected to Windows next."
    );

  }
);


/*
 * ============================================
 *                   MEDIA
 * ============================================
 */

media.addEventListener(
  "click",
  () => {

    speak(
      "Media controls will be connected to Windows next."
    );

  }
);


/*
 * ============================================
 *                    APPS
 * ============================================
 */

apps.addEventListener(
  "click",
  () => {

    speak(
      "Application controls will be connected to Windows next."
    );

  }
);


/*
 * ============================================
 *              AUTOMATIC UPDATES
 * ============================================
 */


/*
 * Check connection immediately
 */

checkConnection();


/*
 * Get PC statistics immediately
 */

updateStats();


/*
 * Update connection every 5 seconds
 */

setInterval(
  checkConnection,
  5000
);


/*
 * Update system statistics every 3 seconds
 */

setInterval(
  updateStats,
  3000
);


/*
 * ============================================
 *                  STARTUP
 * ============================================
 */

setStatus(
  "READY"
);

console.log(
  "NOVA Mobile initialised."
);
