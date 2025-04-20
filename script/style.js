let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let isProcessing = false;  // Prevents new recording until transcription is received
let audioBlob;
window.addEventListener("load", () => console.log("✅ Page fully loaded without reload!"));

const recordButton = document.getElementById('custom-button');

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    recordButton.addEventListener('click', async function(event) {
        event.preventDefault(); // ❌ Prevents page from refreshing
        
        if (isProcessing) {
            console.warn("⚠️ Please wait, processing the last recording...");
            return;
        }

        if (!isRecording) {
            console.log("🔴 Recording started...");
            this.innerText = "Stop Recording";
            this.disabled = false;
            
            try {
                let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                    console.log("🎙️ Audio chunk recorded.");
                };

                mediaRecorder.onstop = async () => {
                    console.log("🛑 Recording stopped. Uploading audio...");
                    recordButton.disabled = true; // 🔒 Disable button until transcription is done

                    if (audioChunks.length === 0) {
                        console.error("❌ No audio recorded!");
                        resetButton();
                        return;
                    }

                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];

                    isProcessing = true; // Prevent new recording
                    uploadAudio(audioBlob);
                };

                mediaRecorder.start();
                isRecording = true;

            } catch (error) {
                console.error("❌ Error accessing microphone:", error);
                alert("Could not access microphone. Please check permissions.");
                resetButton();
            }

        } else {
            console.log("⏹️ Stopping recording...");
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
            }
        }
    });
} else {
    alert("Your browser does not support audio recording.");
    console.error("❌ Audio recording is not supported in this browser.");
}

// Function to send recorded audio to API
async function uploadAudio(audioBlob) {
    let formData = new FormData();
    formData.append("audio_file", audioBlob, "recording.wav");

    console.log("⏳ Uploading audio...");
    updateTranscript("Processing transcription... ⏳"); // Show loading message

    try {
        const response = await fetch("http://127.0.0.1:5000/transcribe", { 
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📩 Full Response:", data);

        if (data.transcription) {
            updateTranscript(data.transcription);
            // After transcription is retrieved:
            const surahKey = surahSelect.value;
            const startIndex = currentAyahIndex;
            const gradeResults = gradeRecitation(data.transcription, surahKey, startIndex, quranData);
            displayGrade(gradeResults);
            console.log("✅ Transcription displayed!");
        } else {
            throw new Error("❌ API response did not contain 'transcription' key.");
        }

    } catch (error) {
        console.error("❌ Error uploading audio:", error);
        updateTranscript("❌ Transcription failed. Try again.");
    } finally {
        isProcessing = false; // ✅ Allow new recording after transcription
        resetButton();
    }
}

// Function to update the displayed transcript
function updateTranscript(text) {
    document.getElementById('result').innerHTML = `<strong>Transcription:</strong> ${text}`;
}

// Function to reset the recording button
function resetButton() {
    recordButton.innerText = "Start Recording";
    recordButton.disabled = false;  // ✅ Enable button after transcript is displayed
    isRecording = false;
}
