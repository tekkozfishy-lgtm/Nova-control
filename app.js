/* =========================================================
   NOVA MASTER MOBILE CONTROLLER
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PC_URL =
    "https://grace-upgrades-subscription-strip.trycloudflare.com";


const STATUS_URL =
    PC_URL + "/status";


const COMMAND_URL =
    PC_URL + "/command";


const STATS_URL =
    PC_URL + "/stats";


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
   STATE
   ========================================================= */

let recognition = null;

let recognitionRunning = false;

let speaking = false;


/* =========================================================
   UI
   ========================================================= */

function setStatus(
    text,
    mode = ""
) {

    status.textContent =
        String(text);


    orb.classList.remove(
        "listening",
        "thinking",
        "speaking"
    );


    if (mode) {

        orb.classList.add(
            mode
        );

    }

}


/* =========================================================
   CONNECTION UI
   ========================================================= */

function setOnline() {

    connectionText.textContent =
        "PC ONLINE";


    connectionDot.style.background =
        "#4dff9a";


    connectionDot.style.boxShadow =
        "0 0 12px #4dff9a";

}


function setOffline() {

    connectionText.textContent =
        "PC OFFLINE";


    connectionDot.style.background =
        "#ff4d4d";


    connectionDot.style.boxShadow =
        "0 0 12px #ff4d4d";

}


/* =========================================================
   CONNECTION CHECK
   ========================================================= */

async function checkConnection() {

    try {

        const response =
            await fetch(
                STATUS_URL +
                "?t=" +
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
            "NOVA STATUS:",
            data
        );


        if (
            data &&
            data.online === true
        ) {

            setOnline();

        }

        else {

            setOffline();

        }

    }

    catch (error) {

        console.error(
            "NOVA CONNECTION ERROR:",
            error
        );


        setOffline();

    }

}


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speak(text) {

    if (!text) {
        return;
    }


    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        console.error(
            "Speech synthesis unavailable."
        );

        return;

    }


    const speech =
        window.speechSynthesis;


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
        1;


    utterance.volume =
        1;


    const voices =
        speech.getVoices();


    const voice =
        voices.find(
            v =>
                v.lang &&
                v.lang
                    .toLowerCase()
                    .startsWith("en-gb")
        ) ||
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

    }


    utterance.onstart =
        () => {

            speaking = true;

            setStatus(
                "SPEAKING",
                "speaking"
            );

        };


    utterance.onend =
        () => {

            speaking = false;

            setStatus(
                "READY"
            );

        };


    utterance.onerror =
        error => {

            speaking = false;

            console.error(
                "NOVA TTS ERROR:",
                error
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
   COMMAND SYSTEM
   ========================================================= */

async function command(
    text
) {

    const clean =
        String(text).trim();


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
                COMMAND_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            command:
                                clean

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


        /*
         * A successful command proves
         * the PC is reachable.
         */

        setOnline();


        if (
            data &&
            data.response
        ) {

            setStatus(
                data.response
            );


            speak(
                data.response
            );

        }

        else {

            setStatus(
                "READY"
            );

        }

    }

    catch (error) {

        console.error(
            "NOVA COMMAND ERROR:",
            error
        );


        setOffline();


        setStatus(
            "CONNECTION ERROR"
        );

    }

}


/* =========================================================
   TEXT COMMAND BUTTON
   ========================================================= */

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


/* =========================================================
   ENTER KEY
   ========================================================= */

input.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();


            const text =
                input.value;


            input.value = "";


            command(
                text
            );

        }

    }
);


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

const SpeechRecognitionAPI =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognitionAPI) {

    recognition =
        new SpeechRecognitionAPI();


    recognition.lang =
        "en-GB";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.maxAlternatives =
        1;


    recognition.onstart =
        () => {

            recognitionRunning =
                true;


            setStatus(
                "LISTENING",
                "listening"
            );

        };


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


            command(
                text
            );

        };


    recognition.onerror =
        event => {

            console.error(
                "VOICE ERROR:",
                event.error
            );


            recognitionRunning =
                false;


            setStatus(
                "READY"
            );

        };


    recognition.onend =
        () => {

            recognitionRunning =
                false;


            if (!speaking) {

                setStatus(
                    "READY"
                );

            }

        };


    orb.addEventListener(
        "click",
        () => {

            if (
                recognitionRunning
            ) {

                return;

            }


            try {

                recognition.start();

            }

            catch (error) {

                console.error(
                    error
                );

            }

        }
    );

}


/* =========================================================
   BUTTON COMMANDS
   ========================================================= */

wake.addEventListener(
    "click",
    () => {

        command(
            "wake pc"
        );

    }
);


volume.addEventListener(
    "click",
    () => {

        command(
            "volume"
        );

    }
);


media.addEventListener(
    "click",
    () => {

        command(
            "media"
        );

    }
);


apps.addEventListener(
    "click",
    () => {

        command(
            "apps"
        );

    }
);


/* =========================================================
   PC STATS
   ========================================================= */

async function updateStats() {

    try {

        const response =
            await fetch(
                STATS_URL +
                "?t=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        console.log(
            "NOVA STATS:",
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
            data.gpu !== undefined &&
            data.gpu !== null
        ) {

            gpu.textContent =
                String(
                    data.gpu
                );

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
   TTS VOICES
   ========================================================= */

if (
    "speechSynthesis"
    in window
) {

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            () => {

                console.log(
                    "NOVA TTS voices loaded:",
                    window
                        .speechSynthesis
                        .getVoices()
                        .length
                );

            }
        );

}


/* =========================================================
   PWA SERVICE WORKER
   ========================================================= */

if (
    "serviceWorker"
    in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "sw.js"
                )
                .catch(
                    error => {

                        console.log(
                            "Service worker unavailable:",
                            error
                        );

                    }
                );

        }
    );

}


/* =========================================================
   INITIALISE
   ========================================================= */

console.log(
    "================================"
);

console.log(
    "NOVA MASTER SYSTEM INITIALISING"
);

console.log(
    "PC:",
    PC_URL
);

console.log(
    "TTS:",
    "speechSynthesis" in window
        ? "AVAILABLE"
        : "UNAVAILABLE"
);

console.log(
    "VOICE INPUT:",
    SpeechRecognitionAPI
        ? "AVAILABLE"
        : "UNAVAILABLE"
);

console.log(
    "================================"
);


setStatus(
    "READY"
);


setOffline();


checkConnection();


updateStats();


/* =========================================================
   AUTOMATIC SYSTEM UPDATES
   ========================================================= */

setInterval(
    checkConnection,
    5000
);


setInterval(
    updateStats,
    2000
);
