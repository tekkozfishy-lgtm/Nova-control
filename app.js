```javascript
/* =========================================================
   NOVA MOBILE
   COMPLETE APP.JS
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PC_URL =
    "https://shot-allowed-promises-yang.trycloudflare.com";


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

const disk =
    document.getElementById("disk");

const gpu =
    document.getElementById("gpu");


/* =========================================================
   STATE
   ========================================================= */

let recognition = null;

let recognitionRunning = false;

let speechUnlocked = false;

let speaking = false;

let lastResponse = "";

let connectionFailures = 0;


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(text, mode = "") {

    status.textContent = text;

    orb.className = "orb";

    if (mode) {
        orb.classList.add(mode);
    }
}


/* =========================================================
   CONNECTION UI
   ========================================================= */

function setOnline() {

    connectionFailures = 0;

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
   SPEECH UNLOCK
   ========================================================= */

function unlockSpeech() {

    if (
        !("speechSynthesis" in window)
    ) {

        console.log(
            "Speech synthesis unavailable."
        );

        return false;
    }


    speechUnlocked = true;


    /*
     * Calling getVoices() helps mobile
     * browsers initialise their voice list.
     */

    window.speechSynthesis.getVoices();


    console.log(
        "NOVA speech unlocked."
    );


    return true;
}


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speak(text) {

    if (!text) {
        return;
    }


    if (
        !("speechSynthesis" in window)
    ) {

        console.log(
            "Speech synthesis unavailable."
        );

        return;
    }


    const speech =
        window.speechSynthesis;


    console.log(
        "NOVA TTS:",
        text
    );


    /*
     * Stop anything already speaking.
     */

    speech.cancel();


    /*
     * Create a fresh utterance.
     */

    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


    utterance.lang =
        "en-GB";


    utterance.rate =
        0.95;


    utterance.pitch =
        0.95;


    utterance.volume =
        1;


    /*
     * Select an English voice.
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

        console.log(
            "NOVA voice:",
            voice.name
        );
    }


    /*
     * Speech started.
     */

    utterance.onstart =
        () => {

            speaking = true;

            setStatus(
                "SPEAKING",
                "speaking"
            );

        };


    /*
     * Speech finished.
     */

    utterance.onend =
        () => {

            speaking = false;

            setStatus(
                "READY"
            );

        };


    /*
     * Speech failed.
     */

    utterance.onerror =
        event => {

            speaking = false;

            console.error(
                "NOVA TTS ERROR:",
                event.error
            );

            setStatus(
                "READY"
            );

        };


    /*
     * Speak.
     */

    speech.speak(
        utterance
    );


    /*
     * Some mobile browsers pause
     * speech unexpectedly.
     */

    const keepAlive =
        setInterval(
            () => {

                if (
                    !speaking
                ) {

                    clearInterval(
                        keepAlive
                    );

                    return;
                }


                if (
                    speech.paused
                ) {

                    speech.resume();

                }

            },
            500
        );

}


/* =========================================================
   PC CONNECTION
   ========================================================= */

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
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            data.online === true
        ) {

            setOnline();

        }

        else {

            connectionFailures++;


            /*
             * Only show OFFLINE after
             * several consecutive failures.
             */

            if (
                connectionFailures >= 3
            ) {

                setOffline();

            }

        }

    }

    catch (error) {

        console.log(
            "Temporary connection failure:",
            error
        );


        connectionFailures++;


        /*
         * Don't flicker OFFLINE because
         * of one temporary Cloudflare delay.
         */

        if (
            connectionFailures >= 3
        ) {

            setOffline();

        }

    }

}


/* =========================================================
   PC STATS
   ========================================================= */

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
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


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
            typeof data.disk ===
            "number"
        ) {

            disk.textContent =
                Math.round(
                    data.disk
                ) + "%";

        }


        if (
            gpu &&
            data.gpu !== undefined
        ) {

            gpu.textContent =
                data.gpu + "%";

        }


        /*
         * Stats working means the
         * PC connection is working.
         */

        setOnline();

    }

    catch (error) {

        console.log(
            "Stats unavailable:",
            error
        );

    }

}


/* =========================================================
   SEND COMMAND
   ========================================================= */

async function command(text) {

    const clean =
        String(text || "").trim();


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


        if (
            !data ||
            !data.response
        ) {

            throw new Error(
                "No response from NOVA."
            );

        }


        /*
         * PC is definitely reachable.
         */

        setOnline();


        /*
         * Show response.
         */

        status.textContent =
            data.response;


        /*
         * Prevent accidental duplicate
         * speech for the same response.
         */

        if (
            data.response !==
            lastResponse
        ) {

            lastResponse =
                data.response;

            speak(
                data.response
            );

        }

    }

    catch (error) {

        console.error(
            "COMMAND ERROR:",
            error
        );


        setStatus(
            "COMMUNICATION ERROR"
        );

    }

}


/* =========================================================
   SEND BUTTON
   ========================================================= */

send.addEventListener(
    "click",
    () => {

        unlockSpeech();


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
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            unlockSpeech();


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

const Recognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


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


    /*
     * Start listening.
     */

    function startListening() {

        unlockSpeech();


        if (
            recognitionRunning
        ) {

            return;

        }


        recognitionRunning =
            true;


        setStatus(
            "LISTENING",
            "listening"
        );


        try {

            recognition.start();

        }

        catch (error) {

            console.log(
                "Recognition start:",
                error
            );

        }

    }


    /*
     * Orb click.
     */

    orb.addEventListener(
        "click",
        startListening
    );


    /*
     * Voice result.
     */

    recognition.onresult =
        event => {

            const result =
                event.results[0];


            if (!result) {
                return;
            }


            const text =
                result[0].transcript.trim();


            console.log(
                "NOVA HEARD:",
                text
            );


            if (text) {

                command(
                    text
                );

            }

        };


    /*
     * Recognition started.
     */

    recognition.onstart =
        () => {

            recognitionRunning =
                true;

            setStatus(
                "LISTENING",
                "listening"
            );

        };


    /*
     * Recognition ended.
     */

    recognition.onend =
        () => {

            recognitionRunning =
                false;


            if (
                status.textContent ===
                "LISTENING"
            ) {

                setStatus(
                    "READY"
                );

            }

        };


    /*
     * Recognition error.
     */

    recognition.onerror =
        event => {

            recognitionRunning =
                false;


            console.log(
                "Recognition error:",
                event.error
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                setStatus(
                    "MICROPHONE BLOCKED"
                );

            }

            else {

                setStatus(
                    "READY"
                );

            }

        };

}


/* =========================================================
   CONTROL BUTTONS
   ========================================================= */

wake.addEventListener(
    "click",
    () => {

        unlockSpeech();

        command(
            "wake pc"
        );

    }
);


volume.addEventListener(
    "click",
    () => {

        unlockSpeech();

        command(
            "volume"
        );

    }
);


media.addEventListener(
    "click",
    () => {

        unlockSpeech();

        command(
            "media"
        );

    }
);


apps.addEventListener(
    "click",
    () => {

        unlockSpeech();

        command(
            "apps"
        );

    }
);


/* =========================================================
   KEYBOARD ACCESSIBILITY
   ========================================================= */

orb.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            unlockSpeech();


            if (
                recognition &&
                !recognitionRunning
            ) {

                try {

                    recognition.start();

                }

                catch (error) {

                    console.log(
                        error
                    );

                }

            }

        }

    }
);


/* =========================================================
   TTS VOICE LOADING
   ========================================================= */

if (
    "speechSynthesis" in window
) {

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            () => {

                const voices =
                    window
                        .speechSynthesis
                        .getVoices();


                console.log(
                    "NOVA voices:",
                    voices.length
                );

            }
        );

}


/* =========================================================
   INITIALISE
   ========================================================= */

setStatus(
    "READY"
);


console.log(
    "================================"
);


console.log(
    "NOVA MOBILE INITIALISED"
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
    Recognition
        ? "AVAILABLE"
        : "UNAVAILABLE"
);


console.log(
    "================================"
);


/* =========================================================
   FIRST CONNECTION CHECK
   ========================================================= */

checkConnection();


updateStats();


/* =========================================================
   AUTOMATIC UPDATES
   ========================================================= */

setInterval(
    checkConnection,
    5000
);


setInterval(
    updateStats,
    3000
);
```
