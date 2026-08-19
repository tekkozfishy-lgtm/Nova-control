/* =========================================================
   NOVA MOBILE CONTROLLER
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PC_URL =
    "https://grace-upgrades-subscription-strip.trycloudflare.com";


/* =========================================================
   ELEMENTS
   ========================================================= */

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

const gpu =
    document.getElementById("gpu");


/* =========================================================
   SPEECH
   ========================================================= */

const speech =
    window.speechSynthesis;

let recognition = null;


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(text, animation = "") {

    status.textContent = text;

    orb.classList.remove(
        "listening",
        "thinking",
        "speaking"
    );

    if (animation) {
        orb.classList.add(animation);
    }
}


/* =========================================================
   PREPARE TTS
   ========================================================= */

function prepareSpeech() {

    if (!speech) {

        console.error(
            "Speech synthesis is not available."
        );

        return false;
    }

    /*
     * This function is called directly
     * from a user action.
     *
     * That is important on mobile.
     */

    speech.cancel();

    speech.getVoices();

    console.log(
        "NOVA TTS READY"
    );

    return true;
}


/* =========================================================
   SPEAK
   ========================================================= */

function speak(text) {

    if (!text) {
        return;
    }

    if (!speech) {

        console.error(
            "NOVA TTS NOT AVAILABLE"
        );

        return;
    }

    console.log(
        "NOVA SPEAKING:",
        text
    );

    speech.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


    utterance.lang =
        "en-GB";

    utterance.rate =
        0.95;

    utterance.pitch =
        1.0;

    utterance.volume =
        1.0;


    /*
     * Pick an English voice if available.
     */

    const voices =
        speech.getVoices();


    const voice =
        voices.find(
            v =>
                v.lang &&
                v.lang
                    .toLowerCase()
                    .startsWith("en-gb")
        )
        ||
        voices.find(
            v =>
                v.lang &&
                v.lang
                    .toLowerCase()
                    .startsWith("en")
        );


    if (voice) {

        utterance.voice =
            voice;

        console.log(
            "NOVA VOICE:",
            voice.name
        );
    }


    utterance.onstart =
        () => {

            setStatus(
                "SPEAKING",
                "speaking"
            );

        };


    utterance.onend =
        () => {

            setStatus(
                "READY"
            );

        };


    utterance.onerror =
        event => {

            console.error(
                "TTS ERROR:",
                event.error
            );

            setStatus(
                "VOICE ERROR"
            );
        };


    speech.speak(
        utterance
    );
}


/* =========================================================
   CHECK PC CONNECTION
   ========================================================= */

async function checkConnection() {

    try {

        const response =
            await fetch(
                PC_URL + "/status?time=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "PC STATUS:",
            data
        );


        if (data.online === true) {

            connectionText.textContent =
                "PC ONLINE";


            connectionDot.style.background =
                "#4dff9a";


            connectionDot.style.boxShadow =
                "0 0 12px #4dff9a";

        }

        else {

            setOffline();

        }

    }

    catch (error) {

        console.error(
            "STATUS ERROR:",
            error
        );

        setOffline();
    }
}


/* =========================================================
   OFFLINE DISPLAY
   ========================================================= */

function setOffline() {

    connectionText.textContent =
        "PC OFFLINE";

    connectionDot.style.background =
        "#ff4d4d";

    connectionDot.style.boxShadow =
        "0 0 12px #ff4d4d";
}


/* =========================================================
   GET PC STATS
   ========================================================= */

async function updateStats() {

    try {

        const response =
            await fetch(
                PC_URL +
                "/stats?time=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "PC STATS:",
            data
        );


        if (
            typeof data.cpu ===
            "number"
        ) {

            cpu.textContent =
                Math.round(
                    data.cpu
                ) + "%";
        }


        if (
            typeof data.ram ===
            "number"
        ) {

            ram.textContent =
                Math.round(
                    data.ram
                ) + "%";
        }


        if (
            typeof data.gpu ===
            "number"
        ) {

            gpu.textContent =
                Math.round(
                    data.gpu
                ) + "%";
        }

    }

    catch (error) {

        console.error(
            "STATS ERROR:",
            error
        );
    }
}


/* =========================================================
   SEND COMMAND
   ========================================================= */

async function sendCommand(text) {

    const command =
        text.trim();


    if (!command) {
        return;
    }


    console.log(
        "NOVA COMMAND:",
        command
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

                    body:
                        JSON.stringify({
                            command:
                                command
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "NOVA RESPONSE:",
            data
        );


        if (
            !data ||
            !data.response
        ) {

            throw new Error(
                "NOVA returned no response."
            );
        }


        /*
         * Show the response.
         */

        status.textContent =
            data.response;


        /*
         * Speak the response.
         */

        speak(
            data.response
        );

    }

    catch (error) {

        console.error(
            "COMMAND ERROR:",
            error
        );


        setStatus(
            "COMMAND ERROR"
        );
    }
}


/* =========================================================
   SEND BUTTON
   ========================================================= */

send.addEventListener(
    "click",
    () => {

        prepareSpeech();

        const text =
            input.value;

        input.value = "";

        sendCommand(text);
    }
);


/* =========================================================
   ENTER KEY
   ========================================================= */

input.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            prepareSpeech();

            const text =
                input.value;

            input.value = "";

            sendCommand(text);
        }
    }
);


/* =========================================================
   VOICE INPUT
   ========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


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

            prepareSpeech();


            setStatus(
                "LISTENING",
                "listening"
            );


            try {

                recognition.start();

            }

            catch (error) {

                console.log(
                    "Speech recognition already active."
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


            sendCommand(
                text
            );
        };


    recognition.onerror =
        event => {

            console.error(
                "RECOGNITION ERROR:",
                event.error
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


/* =========================================================
   QUICK COMMAND BUTTONS
   ========================================================= */

wake.addEventListener(
    "click",
    () => {

        prepareSpeech();

        sendCommand(
            "wake pc"
        );
    }
);


volume.addEventListener(
    "click",
    () => {

        prepareSpeech();

        sendCommand(
            "volume"
        );
    }
);


media.addEventListener(
    "click",
    () => {

        prepareSpeech();

        sendCommand(
            "media"
        );
    }
);


apps.addEventListener(
    "click",
    () => {

        prepareSpeech();

        sendCommand(
            "apps"
        );
    }
);


/* =========================================================
   LOAD VOICES
   ========================================================= */

if (speech) {

    speech.addEventListener(
        "voiceschanged",
        () => {

            console.log(
                "NOVA VOICES LOADED:",
                speech
                    .getVoices()
                    .length
            );
        }
    );
}


/* =========================================================
   STARTUP
   ========================================================= */

console.log(
    "=============================="
);

console.log(
    "NOVA MOBILE ONLINE"
);

console.log(
    "PC URL:",
    PC_URL
);

console.log(
    "TTS:",
    speech
        ? "AVAILABLE"
        : "UNAVAILABLE"
);

console.log(
    "VOICE INPUT:",
    SpeechRecognition
        ? "AVAILABLE"
        : "UNAVAILABLE"
);

console.log(
    "=============================="
);


setStatus(
    "READY"
);


checkConnection();


updateStats();


/* =========================================================
   AUTOMATIC REFRESH
   ========================================================= */

setInterval(
    checkConnection,
    5000
);


setInterval(
    updateStats,
    2000
);
