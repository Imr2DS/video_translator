import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from video_translator import process_video
from retranslate import retranslate_video  # 🔹 importer la fonction retranslate

app = Flask(__name__)
CORS(app)

TEMP_DIR = "temp_videos"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.route("/translate", methods=["POST"])
def translate():
    try:
        target_lang = request.form.get("target_lang", "fr")
        translation_mode = request.form.get("translation_mode", "voice")
        user_id = request.form.get("user_id", "anonymous")
        title = request.form.get("title", "video")
        original_url = request.form.get("original_url")
        video_file = request.files.get("video")

        # URL Supabase
        if original_url:
            if not original_url.startswith("http"):
                return jsonify({"error": "URL vidéo invalide"}), 400

            result = process_video(
                original_url=original_url,
                target_lang=target_lang,
                translation_mode=translation_mode,
                user_id=user_id,
                title=title
            )
            return jsonify(result), 200

        # Upload local
        if not video_file:
            return jsonify({"error": "Fichier vidéo manquant"}), 400

        filename = f"{uuid.uuid4()}_{video_file.filename}"
        temp_path = os.path.join(TEMP_DIR, filename)
        video_file.save(temp_path)

        result = process_video(
            input_path=temp_path,
            target_lang=target_lang,
            translation_mode=translation_mode,
            user_id=user_id,
            title=title
        )
        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ────────────────
# RETRADUCTION
# ────────────────
@app.route("/retranslate", methods=["POST"])
def retranslate():
    try:
        data = request.get_json()
        video_id = data.get("video_id")
        target_lang = data.get("target_lang")
        translation_mode = data.get("translation_mode", "voice")

        if not video_id or not target_lang:
            return jsonify(
                {"error": "video_id et target_lang requis"}
            ), 400

        # 🔹 Appeler la fonction retranslate
        process_result = retranslate_video(
            video_id, target_lang, translation_mode
        )
        return jsonify(process_result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
