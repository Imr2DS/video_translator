import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import tempfile

from video_translator import process_video, upload_to_supabase

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = tempfile.gettempdir()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/translate", methods=["POST"])
def translate_video():
    try:
        if "video" not in request.files:
            return jsonify({"error": "Aucun fichier vidéo reçu"}), 400

        file = request.files["video"]
        target_lang = request.form.get("target_lang", "fr")

        filename = secure_filename(file.filename)
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(input_path)
        print(f"✅ Fichier reçu : {input_path}")

        # Traduction vocale vidéo
        output_path = process_video(input_path, target_lang)

        # Upload sur Supabase
        output_filename = os.path.basename(output_path)
        public_url = upload_to_supabase(output_path, output_filename)
        print(f"🎬 URL publique : {public_url}")

        return jsonify({"translated_url": public_url})

    except Exception as e:
        print(f"❌ Erreur : {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
