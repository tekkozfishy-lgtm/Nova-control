/* =========================================================
   NOVA MOBILE CONTROLLER
   ========================================================= */

const PC_URL =
    "https://guestbook-boats-courage-internet.trycloudflare.com";


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

const cpu = document.getElementById("cpu");
const ram = document.getElementById("ram");
const disk = document.getElementById("disk");
const gpu = document.getElementById("gpu");


/* =========================================================
   STATE
   ========================================================= */

let recognition = null;
let recognitionRunning = false;
let voices = [];


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
   LOAD VOICES
   ========================================================= */

function loadVoices() {

    if (!("speechSynthesis" in window)) {
        return;
    }

    voices = window.speechSynthesis.getVoices();

    console.log(
        "NOVA voices available:",
        voices.length
    );
}


if ("speechSynthesis" in window) {

    loadVoices();

    window.speechSynthesis.onvoiceschanged =
        loadVoices;
}


/* =========================================================
   TTS
   ========================================================= */

function speak(text) {

    if (!text) {
        return;
    }

    if (!("speechSynthesis" in window)) {

        console.error(
            "Speech synthesis is unavailable."
        );

        setStatus("VOICE UNAVAILABLE");

        return;
    }

    console.log(
        "NOVA SPEAKING:",
        text
    );

    const synth =
        window.speechSynthesis;

    synth.cancel();

    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );

    utterance.lang = "en-GB";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    loadVoices();

    const britishVoice =
        voices.find(
            voice =>
                voice.lang &&
                voice.lang.toLowerCase() === "en-gb"
        );

    const englishVoice =
        voices.find(
            voice =>
                voice.lang &&
                voice.lang.toLowerCase().startsWith("en")
        );

    if (britishVoice) {

        utterance.voice =
            britishVoice;

    } else if (englishVoice) {

        utterance.voice =
            englishVoice;
    }

    utterance.onstart = () => {

        console.log(
            "NOVA TTS STARTED"
        );

        setStatus(
            "SPEAKING",
            "speaking"
        );
    };

    utterance.onend = () => {

        console.log(
            "NOVA TTS FINISHED"
        );

        setStatus("READY");
    };

    utterance.onerror = event => {

        console.error(
            "NOVA TTS ERROR:",
            event.error
        );

        setStatus("VOICE ERROR");
    };

    synth.speak(utterance);
}


/* =========================================================
   UNLOCK MOBILE AUDIO
   ========================================================= */

function unlockAudio() {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const test =
        new SpeechSynthesisUtterance("");

    test.volume = 0;

    window.speechSynthesis.speak(test);

    console.log(
        "NOVA MOBILE AUDIO UNLOCKED"
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
                "HTTP " + response.status
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

        } else {

            throw new Error(
                "PC reported offline"
            );
        }

    } catch (error) {

        console.error(
            "PC CONNECTION ERROR:",
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
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "HTTP " + response.status
            );
        }

        const data =
            await response.json();

        if (typeof data.cpu === "number") {
            cpu.textContent =
                Math.round(data.cpu) + "%";
        }

        if (typeof data.ram === "number") {
            ram.textContent =
                Math.round(data.ram) + "%";
        }

        if (typeof data.disk === "number") {
            disk.textContent =
                Math.round(data.disk) + "%";
        }

        if (typeof data.gpu === "number") {
            gpu.textContent =
                Math.round(data.gpu) + "%";
        }

    } catch (error) {

        console.error(
            "STATS ERROR:",
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
                            command: clean
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

        if (!data.response) {

            throw new Error(
                "No response from NOVA PC"
            );
        }

        status.textContent =
            data.response;

        /*
         * THIS IS WHERE THE PHONE
         * SPEAKS THE RESPONSE.
         */

        speak(data.response);

    } catch (error) {

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

        unlockAudio();

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

        if (event.key === "Enter") {

            event.preventDefault();

            unlockAudio();

            const text =
                input.value;

            input.value = "";

            command(text);
        }
    }
);


/* =========================================================
   SPEECH RECOGNITION
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


    orb.addEventListener(
        "click",
        () => {

            unlockAudio();

            if (recognitionRunning) {
                return;
            }

            setStatus(
                "LISTENING",
                "listening"
            );

            try {

                recognition.start();

                recognitionRunning =
                    true;

            } catch (error) {

                console.error(
                    "RECOGNITION START ERROR:",
                    error
                );
            }
        }
    );


    recognition.onresult =
        event => {

            const text =
                event.results[0][0]
                    .transcript;

            console.log(
                "NOVA HEARD:",
                text
            );

            command(text);
        };


    recognition.onerror =
        event => {

            console.error(
                "VOICE INPUT ERROR:",
                event.error
            );

            recognitionRunning =
                false;

            setStatus("READY");
        };


    recognition.onend =
        () => {

            recognitionRunning =
                false;

            if (
                status.textContent ===
                "LISTENING"
            ) {

                setStatus("READY");
            }
        };

} else {

    console.log(
        "Speech recognition unavailable."
    );

    orb.addEventListener(
        "click",
        () => {

            unlockAudio();

            setStatus(
                "VOICE INPUT UNAVAILABLE"
            );
        }
    );
}


/* =========================================================
   CONTROL BUTTONS
   ========================================================= */

wake.addEventListener(
    "click",
    () => {

        unlockAudio();

        command("wake pc");
    }
);


volume.addEventListener(
    "click",
    () => {

        unlockAudio();

        command("volume");
    }
);


media.addEventListener(
    "click",
    () => {

        unlockAudio();

        command("media");
    }
);


apps.addEventListener(
    "click",
    () => {

        unlockAudio();

        command("apps");
    }
);


/* =========================================================
   STARTUP
   ========================================================= */

console.log(
    "================================"
);

console.log(
    "NOVA MOBILE STARTING"
);

console.log(
    "PC URL:",
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


setStatus("READY");

checkConnection();
updateStats();


setInterval(
    checkConnection,
    5000
);

setInterval(
    updateStats,
    2000
);
