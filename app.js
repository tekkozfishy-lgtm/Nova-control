/* =========================================================
   NOVA MOBILE
   Complete app.js
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

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

const gpu =
    document.getElementById("gpu");


/* =========================================================
   NOVA PC ADDRESS

   This is your current Cloudflare Quick Tunnel.

   IMPORTANT:
   If Cloudflare gives you a NEW URL later,
   change this URL.
   ========================================================= */

const PC_URL =
    "https://grace-upgrades-subscription-strip.trycloudflare.com";


/* =========================================================
   STATE
   ========================================================= */

let recognition = null;

let speechReady = false;


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
   PREPARE SPEECH
   =========================================================

   Mobile browsers can be picky about speech synthesis.

   We initialise it when the user interacts with NOVA.
   ========================================================= */

function prepareSpeech() {

    if (!("speechSynthesis" in window)) {

        console.log(
            "Speech synthesis is unavailable."
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
     * Ask the browser for its available voices.
     */

    speech.getVoices();


    speechReady = true;


    console.log(
        "NOVA speech engine ready."
    );


    return true;
}


/* =========================================================
   SPEAK
   ========================================================= */

function speak(text) {

    console.log(
        "NOVA SPEAK REQUEST:",
        text
    );


    if (!text) {

        setStatus(
            "READY"
        );

        return;
    }


    if (!("speechSynthesis" in window)) {

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
     * Create the voice.
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
     * Try to select an English voice.
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
     * Speaking started.
     */

    utterance.onstart =
        () => {

            console.log(
                "NOVA SPEAKING"
            );


            setStatus(
                "SPEAKING",
                "speaking"
            );
        };


    /*
     * Speaking finished.
     */

    utterance.onend =
        () => {

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

            console.error(
                "NOVA SPEECH ERROR:",
                event.error
            );


            setStatus(
                "VOICE ERROR"
            );
        };


    /*
     * Start speech.
     */

    speech.speak(
        utterance
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


        console.log(
            "PC STATUS:",
            data
        );


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
         * GPU will stay -- until
         * the Python side provides
         * a GPU value.
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
   SEND COMMAND TO PC
   ========================================================= */

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

                    body:
                        JSON.stringify({
                            command:
                                clean
                        })
                }
            );


        console.log(
            "SERVER STATUS:",
            response.status
        );


        /*
         * Read response.
         */

        const raw =
            await response.text();


        console.log(
            "SERVER RESPONSE:",
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


        /*
         * Make sure the PC
         * actually sent text back.
         */

        if (
            !data ||
            !data.response
        ) {

            throw new Error(
                "No response received."
            );
        }


        /*
         * Show response.
         */

        status.textContent =
            data.response;


        /*
         * Speak response.
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


        console.log(
            error.message
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
         * User interaction prepares
         * the phone speech engine.
         */

        prepareSpeech();


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

            prepareSpeech();


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
     * Tap NOVA orb.
     */

    orb.addEventListener(
        "click",
        () => {

            /*
             * IMPORTANT:
             * This is a real user interaction,
             * so initialise speech here.
             */

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
                    "Recognition already active."
                );
            }
        }
    );


    /*
     * Speech recognised.
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
     * Recognition error.
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
     * Recognition finished.
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


/* =========================================================
   VOICE UNAVAILABLE
   ========================================================= */

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

        prepareSpeech();

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

        prepareSpeech();

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

        prepareSpeech();

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

        prepareSpeech();

        command(
            "apps"
        );
    }
);


/* =========================================================
   LOAD VOICES
   ========================================================= */

if (
    "speechSynthesis" in window
) {

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            () => {

                console.log(
                    "NOVA voices loaded:",
                    window
                        .speechSynthesis
                        .getVoices()
                        .length
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
   AUTOMATIC PC UPDATES
   ========================================================= */

setInterval(
    checkConnection,
    5000
);


setInterval(
    updateStats,
    2000
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
    "================================"
);/* =========================================================
   NOVA MOBILE
   Complete app.js
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

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

const gpu =
    document.getElementById("gpu");


/* =========================================================
   NOVA PC ADDRESS

   This is your current Cloudflare Quick Tunnel.

   IMPORTANT:
   If Cloudflare gives you a NEW URL later,
   change this URL.
   ========================================================= */

const PC_URL =
    "https://grace-upgrades-subscription-strip.trycloudflare.com";


/* =========================================================
   STATE
   ========================================================= */

let recognition = null;

let speechReady = false;


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
   PREPARE SPEECH
   =========================================================

   Mobile browsers can be picky about speech synthesis.

   We initialise it when the user interacts with NOVA.
   ========================================================= */

function prepareSpeech() {

    if (!("speechSynthesis" in window)) {

        console.log(
            "Speech synthesis is unavailable."
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
     * Ask the browser for its available voices.
     */

    speech.getVoices();


    speechReady = true;


    console.log(
        "NOVA speech engine ready."
    );


    return true;
}


/* =========================================================
   SPEAK
   ========================================================= */

function speak(text) {

    console.log(
        "NOVA SPEAK REQUEST:",
        text
    );


    if (!text) {

        setStatus(
            "READY"
        );

        return;
    }


    if (!("speechSynthesis" in window)) {

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
     * Create the voice.
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
     * Try to select an English voice.
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
     * Speaking started.
     */

    utterance.onstart =
        () => {

            console.log(
                "NOVA SPEAKING"
            );


            setStatus(
                "SPEAKING",
                "speaking"
            );
        };


    /*
     * Speaking finished.
     */

    utterance.onend =
        () => {

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

            console.error(
                "NOVA SPEECH ERROR:",
                event.error
            );


            setStatus(
                "VOICE ERROR"
            );
        };


    /*
     * Start speech.
     */

    speech.speak(
        utterance
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


        console.log(
            "PC STATUS:",
            data
        );


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
         * GPU will stay -- until
         * the Python side provides
         * a GPU value.
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
   SEND COMMAND TO PC
   ========================================================= */

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

                    body:
                        JSON.stringify({
                            command:
                                clean
                        })
                }
            );


        console.log(
            "SERVER STATUS:",
            response.status
        );


        /*
         * Read response.
         */

        const raw =
            await response.text();


        console.log(
            "SERVER RESPONSE:",
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


        /*
         * Make sure the PC
         * actually sent text back.
         */

        if (
            !data ||
            !data.response
        ) {

            throw new Error(
                "No response received."
            );
        }


        /*
         * Show response.
         */

        status.textContent =
            data.response;


        /*
         * Speak response.
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


        console.log(
            error.message
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
         * User interaction prepares
         * the phone speech engine.
         */

        prepareSpeech();


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

            prepareSpeech();


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
     * Tap NOVA orb.
     */

    orb.addEventListener(
        "click",
        () => {

            /*
             * IMPORTANT:
             * This is a real user interaction,
             * so initialise speech here.
             */

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
                    "Recognition already active."
                );
            }
        }
    );


    /*
     * Speech recognised.
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
     * Recognition error.
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
     * Recognition finished.
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


/* =========================================================
   VOICE UNAVAILABLE
   ========================================================= */

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

        prepareSpeech();

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

        prepareSpeech();

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

        prepareSpeech();

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

        prepareSpeech();

        command(
            "apps"
        );
    }
);


/* =========================================================
   LOAD VOICES
   ========================================================= */

if (
    "speechSynthesis" in window
) {

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            () => {

                console.log(
                    "NOVA voices loaded:",
                    window
                        .speechSynthesis
                        .getVoices()
                        .length
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
   AUTOMATIC PC UPDATES
   ========================================================= */

setInterval(
    checkConnection,
    5000
);


setInterval(
    updateStats,
    2000
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
    "================================"
);
