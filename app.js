/* =========================================
   NOVA MOBILE — app.js
   ========================================= */


/* =========================================
   ELEMENTS
   ========================================= */

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


/* =========================================
   CLOUDFLARE ADDRESS

   IMPORTANT:
   This is your current Quick Tunnel.
   If Cloudflare gives you a NEW address
   later, change it here.
   ========================================= */

const PC_URL =
    "https://grace-upgrades-subscription-strip.trycloudflare.com";


/* =========================================
   STATUS DISPLAY
   ========================================= */

function setStatus(text, mode = "") {

    status.textContent = text;

    orb.className = "orb";

    if (mode) {
        orb.classList.add(mode);
    }
}


/* =========================================
   NOVA SPEECH
   ========================================= */

function speak(text) {

    console.log("NOVA SPEAK:", text);

    if (!text) {
        setStatus("READY");
        return;
    }

    if (!("speechSynthesis" in window)) {

        console.log(
            "Speech synthesis unavailable."
        );

        setStatus("VOICE UNAVAILABLE");

        return;
    }


    /*
     * Stop anything NOVA was already saying.
     */

    window.speechSynthesis.cancel();


    /*
     * Create the voice.
     */

    const utterance =
        new SpeechSynthesisUtterance(
            String(text)
        );


    utterance.lang = "en-GB";

    utterance.rate = 1;

    utterance.pitch = 1;

    utterance.volume = 1;


    utterance.onstart = () => {

        console.log(
            "NOVA STARTED SPEAKING"
        );

        setStatus(
            "SPEAKING",
            "speaking"
        );
    };


    utterance.onend = () => {

        console.log(
            "NOVA FINISHED SPEAKING"
        );

        setStatus("READY");
    };


    utterance.onerror = (event) => {

        console.error(
            "NOVA SPEECH ERROR:",
            event
        );

        setStatus(
            "VOICE ERROR"
        );
    };


    /*
     * Speak.
     */

    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================
   PC CONNECTION
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
                "HTTP " + response.status
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


/* =========================================
   PC STATS
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
                "HTTP " + response.status
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
                Math.round(data.cpu) + "%";
        }


        if (
            typeof data.ram ===
            "number"
        ) {

            ram.textContent =
                Math.round(data.ram) + "%";
        }


        /*
         * GPU may not be available yet.
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


/* =========================================
   SEND COMMAND TO NOVA PC
   ========================================= */

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

        /*
         * Send command to Python.
         */

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


        console.log(
            "SERVER HTTP STATUS:",
            response.status
        );


        /*
         * Read the raw response first.
         *
         * This makes diagnosing problems
         * much easier.
         */

        const raw =
            await response.text();


        console.log(
            "SERVER RAW RESPONSE:",
            raw
        );


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );
        }


        /*
         * Convert response to JSON.
         */

        let data;


        try {

            data =
                JSON.parse(raw);

        }

        catch (error) {

            throw new Error(
                "Server returned invalid JSON."
            );
        }


        console.log(
            "NOVA RESPONSE:",
            data
        );


        /*
         * Make sure Python actually
         * sent a response.
         */

        if (
            !data ||
            !data.response
        ) {

            throw new Error(
                "NOVA received no response text."
            );
        }


        /*
         * SHOW RESPONSE ON SCREEN
         */

        status.textContent =
            data.response;


        /*
         * SPEAK RESPONSE
         */

        speak(
            data.response
        );

    }

    catch (error) {

        console.error(
            "NOVA COMMAND ERROR:",
            error
        );


        status.textContent =
            "ERROR";


        orb.className =
            "orb";


        /*
         * Try to tell the user what
         * went wrong.
         */

        setTimeout(
            () => {

                status.textContent =
                    error.message;

            },
            100
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
    (event) => {

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


    /*
     * Tap NOVA orb.
     */

    orb.addEventListener(
        "click",
        () => {

            console.log(
                "NOVA VOICE ACTIVATED"
            );


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
     * Voice result.
     */

    recognition.onresult =
        (event) => {

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
        (event) => {

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


/* =========================================
   WAKE PC
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
   VOLUME
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
   MEDIA
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
   APPS
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


checkConnection();


updateStats();


/* =========================================
   AUTOMATIC UPDATES
   ========================================= */

setInterval(
    checkConnection,
    5000
);


setInterval(
    updateStats,
    2000
);


console.log(
    "NOVA MOBILE INITIALISED"
);
