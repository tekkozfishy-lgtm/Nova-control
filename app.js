/* =========================================================
   NOVA MOBILE
   COMPLETE JAVASCRIPT
   ========================================================= */


/* =========================================================
   PC CONNECTION
   ========================================================= */

const PC_URL =
    "https://grace-upgrades-subscription-strip.trycloudflare.com";


/* =========================================================
   HTML ELEMENTS
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

let speaking = false;

let speechUnlocked = false;


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
   TTS — INITIALISE
   ========================================================= */

function unlockSpeech() {

    if (!("speechSynthesis" in window)) {

        console.log(
            "Speech synthesis is not supported."
        );

        return false;
    }


    const speech =
        window.speechSynthesis;


    /*
     * Cancel anything currently queued.
     */

    speech.cancel();


    /*
     * Load available voices.
     */

    speech.getVoices();


    speechUnlocked = true;


    console.log(
        "NOVA TTS READY"
    );


    return true;
}


/* =========================================================
   TTS — SPEAK
   ========================================================= */

function speak(text) {

    if (!text) {
        return;
    }


    console.log(
        "NOVA WILL SAY:",
        text
    );


    if (!("speechSynthesis" in window)) {

        console.log(
            "TTS unavailable."
        );

        setStatus(
            "VOICE UNAVAILABLE"
        );

        return;
    }


    const speech =
        window.speechSynthesis;


    /*
     * Stop previous speech.
     */

    speech.cancel();


    /*
     * Create utterance.
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
        1;


    utterance.volume =
        1;


    /*
     * Find an English voice.
     */

    const voices =
        speech.getVoices();


    const englishVoice =
        voices.find(
            voice =>
                voice.lang &&
                voice.lang
                    .toLowerCase()
                    .startsWith("en")
        );


    if (englishVoice) {

        utterance.voice =
            englishVoice;

        console.log(
            "NOVA VOICE:",
            englishVoice.name
        );
    }


    /*
     * Started speaking.
     */

    utterance.onstart =
        () => {

            speaking = true;

            console.log(
                "NOVA SPEAKING"
            );

            setStatus(
                "SPEAKING",
                "speaking"
            );
        };


    /*
     * Finished speaking.
     */

    utterance.onend =
        () => {

            speaking = false;

            console.log(
                "NOVA FINISHED SPEAKING"
            );

            setStatus(
                "READY"
            );
        };


    /*
     * Speech error.
     */

    utterance.onerror =
        event => {

            speaking = false;

            console.error(
                "NOVA TTS ERROR:",
                event.error
            );

            setStatus(
                "VOICE ERROR"
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

    setTimeout(
        () => {

            if (
                !speech.speaking &&
                !speech.pending
            ) {

                speech.speak(
                    utterance
                );
            }

        },
        100
    );
}


/* =========================================================
   CONNECTION CHECK
   ========================================================= */

async function checkConnection() {

    try {

        console.log(
            "Checking NOVA PC..."
        );


        const response =
            await fetch(
                PC_URL + "/status",
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        console.log(
            "STATUS HTTP:",
            response.status
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
            "STATUS DATA:",
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

            connectionText.textContent =
                "PC OFFLINE";

        }

    }

    catch (error) {

        console.error(
            "CONNECTION ERROR:",
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


        /*
         * GPU will remain -- until
         * the PC server supplies GPU data.
         */

        if (
            gpu &&
            data.gpu !== undefined
        ) {

            gpu.textContent =
                data.gpu + "%";
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
   SEND COMMAND TO NOVA PC
   ========================================================= */

async function command(text) {

    const clean =
        text.trim();


    if (!clean) {
        return;
    }


    console.log(
        "================================"
    );


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


        console.log(
            "COMMAND HTTP:",
            response.status
        );


        /*
         * Read response.
         */

        const raw =
            await response.text();


        console.log(
            "COMMAND RESPONSE:",
            raw
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            JSON.parse(raw);


        console.log(
            "NOVA DATA:",
            data
        );


        if (
            !data ||
            !data.response
        ) {

            throw new Error(
                "No NOVA response received."
            );
        }


        /*
         * Display the response.
         */

        status.textContent =
            data.response;


        /*
         * Speak it.
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
            "CONNECTION ERROR"
        );
    }
}


/* =========================================================
   SEND BUTTON
   ========================================================= */

send.addEventListener(
    "click",
    () => {

        /*
         * User interaction unlocks
         * speech on many mobile browsers.
         */

        unlockSpeech();


        const text =
            input.value;


        input.value = "";


        command(text);
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

            unlockSpeech();


            const text =
                input.value;


            input.value = "";


            command(text);
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
     * Tap the NOVA orb.
     */

    orb.addEventListener(
        "click",
        () => {

            unlockSpeech();


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


    /*
     * Voice recognised.
     */

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


    /*
     * Voice error.
     */

    recognition.onerror =
        event => {

            console.error(
                "VOICE INPUT ERROR:",
                event.error
            );


            setStatus(
                "READY"
            );
        };


    /*
     * Voice finished.
     */

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

    console.log(
        "Speech recognition unavailable."
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


/* =========================================================
   WAKE PC
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


/* =========================================================
   VOLUME
   ========================================================= */

volume.addEventListener(
    "click",
    () => {

        unlockSpeech();

        command(
            "volume"
        );
    }
);


/* =========================================================
   MEDIA
   ========================================================= */

media.addEventListener(
    "click",
    () => {

        unlockSpeech();

        command(
            "media"
        );
    }
);


/* =========================================================
   APPS
   ========================================================= */

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
   LOAD TTS VOICES
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
                    "NOVA TTS VOICES:",
                    voices.length
                );
            }
        );
}


/* =========================================================
   START NOVA
   ========================================================= */

setStatus(
    "READY"
);


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
    2000
);


/* =========================================================
   DEBUG
   ========================================================= */

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
    "================================"
);
