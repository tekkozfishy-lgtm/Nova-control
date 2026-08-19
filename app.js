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

const connectionText =
  document.getElementById(
    "connectionText"
  );


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
 * NOVA SPEECH
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

    setStatus(
      "READY"
    );

  };

  window.speechSynthesis.speak(
    voice
  );

}


/*
 * TEMPORARY COMMAND SYSTEM
 *
 * The real PC connection will
 * replace this later.
 */

function command(text) {

  const clean =
    text.trim();

  if (!clean) {

    return;

  }


  const lower =
    clean.toLowerCase();


  setStatus(
    "PROCESSING",
    "thinking"
  );


  setTimeout(
    () => {

      let response;


      if (
        lower.includes(
          "hello"
        ) ||
        lower.includes(
          "hi"
        )
      ) {

        response =
          "Hello. NOVA is online.";

      }

      else if (
        lower.includes(
          "pc"
        ) &&
        lower.includes(
          "awake"
        )
      ) {

        response =
          "The PC connection is not established yet.";

      }

      else if (
        lower.includes(
          "who are you"
        )
      ) {

        response =
          "I'm NOVA, your personal command system.";

      }

      else {

        response =
          "I'm ready. The Windows control system will be connected soon.";

      }


      setStatus(
        "READY"
      );

      speak(
        response
      );

    },
    500
  );

}


/*
 * SEND
 */

send.addEventListener(
  "click",
  () => {

    command(
      input.value
    );

    input.value = "";

  }
);


/*
 * ENTER
 */

input.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      command(
        input.value
      );

      input.value = "";

    }

  }
);


/*
 * ORB / VOICE INPUT
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

        console.log(error);

      }

    }
  );


  recognition.onresult =
    event => {

      const text =
        event
          .results[0][0]
          .transcript;

      command(text);

    };


  recognition.onerror =
    () => {

      setStatus(
        "READY"
      );

    };

}


else {

  orb.addEventListener(
    "click",
    () => {

      setStatus(
        "VOICE UNAVAILABLE"
      );

    }
  );

}


/*
 * WAKE BUTTON
 */

wake.addEventListener(
  "click",
  () => {

    setStatus(
      "WAKE REQUEST",
      "thinking"
    );


    /*
     * Wake-on-LAN will be connected
     * when we build the Windows side.
     */

    setTimeout(
      () => {

        setStatus(
          "PC NOT CONNECTED"
        );

        speak(
          "The Windows NOVA system is not connected yet."
        );

      },
      600
    );

  }
);


/*
 * PLACEHOLDER CONTROLS
 */

document
  .getElementById("volume")
  .addEventListener(
    "click",
    () => {

      speak(
        "Volume controls will be available when the PC is connected."
      );

    }
  );


document
  .getElementById("media")
  .addEventListener(
    "click",
    () => {

      speak(
        "Media controls will be available when the PC is connected."
      );

    }
  );


document
  .getElementById("apps")
  .addEventListener(
    "click",
    () => {

      speak(
        "Application controls will be available when the PC is connected."
      );

    }
  );


/*
 * STARTUP
 */

setStatus(
  "READY"
);
