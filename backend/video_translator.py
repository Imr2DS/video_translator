import os
import uuid
import tempfile
import re
from dotenv import load_dotenv
from supabase import create_client, Client
from moviepy.editor import VideoFileClip, AudioFileClip
from gtts import gTTS
from deep_translator import GoogleTranslator
import whisper

# ───────────────
# Initialisation Supabase + Whisper
# ───────────────
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # clé service role

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("❌ Les variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définies dans .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
whisper_model = whisper.load_model("base")

# ───────────────
# Fonctions utilitaires
# ───────────────
def sanitize_filename(name: str) -> str:
    """Remplace les caractères spéciaux par '_' pour Supabase Storage."""
    return re.sub(r"[^a-zA-Z0-9_\-\.]", "_", name)

def upload_to_supabase(file_path: str, bucket: str, expires_sec: int = None) -> str:
    """Upload un fichier vers Supabase et retourne l'URL publique ou signée."""
    file_path = str(file_path)
    file_name = sanitize_filename(os.path.basename(file_path))

    try:
        with open(file_path, "rb") as f:
            data = f.read()
        supabase.storage.from_(bucket).upload(file_name, data)
    except Exception as e:
        raise Exception(f"⚠️ Erreur upload Supabase: {e}")

    # ✅ Récupération URL
    try:
        if expires_sec:
            resp = supabase.storage.from_(bucket).create_signed_url(file_name, expires_sec)
            if isinstance(resp, dict) and "signed_url" in resp:
                return resp["signed_url"]
            else:
                raise Exception(f"Impossible de récupérer l’URL signée pour {file_name}")
        else:
            resp = supabase.storage.from_(bucket).get_public_url(file_name)

            # 👉 Nouvelle version du SDK : `resp` est directement une chaîne
            if isinstance(resp, str) and resp.startswith("http"):
                return resp
            elif isinstance(resp, dict) and "public_url" in resp:
                return resp["public_url"]
            else:
                raise Exception(f"Impossible de récupérer l’URL publique pour {file_name}")

    except Exception as e:
        raise Exception(f"⚠️ Erreur récupération URL publique Supabase: {e}")

# ───────────────
# Fonction principale
# ───────────────
def process_video(input_path: str, target_lang: str, user_id: str, original_url: str) -> dict:
    """Transcrit, traduit, génère vidéo + miniature et ajoute une ligne dans la table 'videos'"""
    input_path = str(input_path)
    print(f"👤 User: {user_id} | Langue: {target_lang} | Fichier: {input_path}")

    clip = VideoFileClip(input_path)

    # Audio temporaire
    audio_path = os.path.join(tempfile.gettempdir(), f"temp_audio_{uuid.uuid4().hex[:8]}.wav")
    clip.audio.write_audiofile(audio_path)

    # 1️⃣ Transcription
    original_text = whisper_model.transcribe(audio_path)["text"]
    print(f"📝 Transcription: {original_text}")

    # 2️⃣ Traduction
    translated_text = GoogleTranslator(source="auto", target=target_lang).translate(original_text)
    print(f"🌐 Traduction: {translated_text}")

    # 3️⃣ Synthèse vocale
    translated_audio_path = os.path.join(tempfile.gettempdir(), f"translated_audio_{uuid.uuid4().hex[:8]}.mp3")
    gTTS(translated_text, lang=target_lang).save(translated_audio_path)

    # 4️⃣ Fusion audio + vidéo
    translated_clip = clip.set_audio(AudioFileClip(str(translated_audio_path)))

    # Nom unique vidéo traduite
    unique_id = uuid.uuid4().hex[:8]
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_filename = f"{base_name}_translated_{target_lang}_{unique_id}.mp4"
    output_path = os.path.join(tempfile.gettempdir(), output_filename)

    translated_clip.write_videofile(str(output_path), codec="libx264", audio_codec="aac")

    # 5️⃣ Miniature
    thumbnail_filename = f"{base_name}_{unique_id}_thumbnail.jpg"
    thumbnail_path = os.path.join(tempfile.gettempdir(), thumbnail_filename)
    clip.save_frame(str(thumbnail_path), t=1.0)

    # 6️⃣ Uploads Supabase
    try:
        translated_url = upload_to_supabase(str(output_path), bucket="translated_videos", expires_sec=None)
        thumbnail_url = upload_to_supabase(str(thumbnail_path), bucket="thumbnails", expires_sec=None)
    except Exception as e:
        raise Exception(f"⚠️ Erreur upload Supabase: {e}")

    print(f"✅ URL traduite: {translated_url}")
    print(f"🖼 Miniature: {thumbnail_url}")

    # 7️⃣ Enregistrement dans la table 'videos'
    video_row = {
        "user_id": user_id,
        "original_url": original_url,
        "translated_url": translated_url,
        "target_lang": target_lang,
        "thumbnail": thumbnail_url
    }

    try:
        supabase.table("videos").insert(video_row).execute()
        print("🗃️ Ligne ajoutée dans 'videos'")
    except Exception as e:
        print(f"⚠️ Erreur insertion Supabase: {e}")

    # Fermeture des clips
    clip.close()
    translated_clip.close()

    return {
        "original_url": original_url,
        "translated_url": translated_url,
        "thumbnail": thumbnail_url,
        "target_lang": target_lang
    }
