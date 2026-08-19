const PC_URL =
    "https://guestbook-boats-courage-internet.trycloudflare.com";


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


let recognition = null;
let speaking = false;


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

    if (!text) {
        return;
    }

    if (!("speechSynthesis" in window)) {

        setStatus("VOICE UNAVAILABLE");

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

            setStatus("READY");

        };


    utterance.onerror =
        error => {

            speaking = false;

            console.error(
                "TTS ERROR:",
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


/* =========================================
   CONNECTION
   ========================================= */

async function checkConnection() {

    try {

        const response =
            await fetch(
                PC_URL + "/status",
                {
                    cache:
                        "no-store"
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


        if (data.online === true) {

            connectionText.textContent =
                "PC ONLINE";


            connectionDot.style.background =
                "#4dff9a";


            connectionDot.style.boxShadow =
                "0 0 12px #4dff9a";

        }

        else {

            throw new Error(
                "PC offline"
            );

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


/* =========================================
   PC STATS
   ========================================= */

async function updateStats() {

    try {

        const response =
            await fetch(
                PC_URL + "/stats",
                {
                    cache:
                        "no-store"
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


/* =========================================
   COMMAND
   ========================================= */

async function command(text) {

    const clean =
        String(text).trim();


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

                    method:
                        "POST",

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


        const data =
            await response.json();


        console.log(
            "NOVA RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Command failed"
            );

        }


        if (!data.response) {

            throw new Error(
                "No NOVA response"
            );

        }


        setStatus(
            data.response
        );


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


/* =========================================
   TEXT COMMAND
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
   ENTER
   ========================================= */

input.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Enter"
        ) {

            const text =
                input.value;

            input.value = "";

            command(text);

        }

    }
);


/* =========================================
   VOICE INPUT
   ========================================= */

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


/* =========================================
   BUTTONS
   ========================================= */

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


/* =========================================
   INITIALISE
   ========================================= */

setStatus(
    "READY"
);


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


if (
    "speechSynthesis" in
    window
) {

    speechSynthesis
        .addEventListener(
            "voiceschanged",
            () => {

                console.log(
                    "NOVA voices loaded:",
                    speechSynthesis
                        .getVoices()
                        .length
                );

            }
        );

}


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
);
