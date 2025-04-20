from flask import Flask, request, jsonify
from flask_cors import CORS
from gradio_client import Client

app = Flask(__name__)
CORS(app)

# Initialize the Hugging Face API client with your Space name
hf_client = Client("abaansohail131/QuranTranslator")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    if 'audio_file' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio_file']
    print("Received file:", audio_file.filename)
    
    temp_path = "temp_audio.wav"
    audio_file.save(temp_path)

    try:
        result = hf_client.predict(
            {
                "path": temp_path,
                "meta": {"_type": "gradio.FileData"}
            },
            api_name="/predict"
        )
        print("Transcription result:", result)
        return jsonify({'transcription': result})
    
    except Exception as e:
        print("Error:", e)
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
