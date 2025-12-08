import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from video_translator import process_video

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = tempfile.gettempdir()
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/translate", methods=["POST"])
def translate_video():
    try:
        # ────────────────
        # Vérification du fichier
        # ────────────────
        video_file = None

        # Certains clients envoient la vidéo dans `request.files`, d'autres dans `request.form`
        if "video" in request.files:
            video_file = request.files["video"]
        elif "video" in request.form:
            video_file = request.form["video"]

        if not video_file:
            return jsonify({"error": "Aucun fichier vidéo reçu"}), 400

        # ────────────────
        # Lecture des champs du formulaire
        # ────────────────
        target_lang = request.form.get("target_lang")
        user_id = request.form.get("user_id")
        original_url = request.form.get("original_url")

        # Valeurs par défaut pour éviter un crash (utile en dev)
        if not target_lang:
            target_lang = "fr"
        if not user_id:
            user_id = "anonymous_user"
        if not original_url:
            original_url = "unknown_source"

        print(f"📥 Requête reçue - Langue cible: {target_lang}, User: {user_id}")

        # ────────────────
        # Sauvegarde temporaire
        # ────────────────
        filename = secure_filename(video_file.filename)
        input_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        video_file.save(input_path)
        print(f"✅ Fichier sauvegardé : {input_path}")

        # ────────────────
        # Traitement principal
        # ────────────────
        result = process_video(input_path, target_lang, user_id, original_url)
        print("🎬 Traitement terminé avec succès")

        return jsonify(result), 200

    except Exception as e:
        print(f"❌ Erreur serveur : {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
