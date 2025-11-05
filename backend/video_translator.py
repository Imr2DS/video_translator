import os
from dotenv import load_dotenv
from supabase import create_client, Client
from moviepy.editor import VideoFileClip, AudioFileClip
from gtts import gTTS
from deep_translator import GoogleTranslator
import whisper
import tempfile

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Les variables SUPABASE_URL et SUPABASE_KEY doivent être définies.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
whisper_model = whisper.load_model("base")  # ou "small", "medium" selon tes ressources

def process_video(input_path: str, target_lang: str) -> str:
    """Transcription, traduction vocale et génération vidéo traduite"""
    clip = VideoFileClip(input_path)
    audio_path = os.path.join(tempfile.gettempdir(), "temp_audio.wav")
    clip.audio.write_audiofile(audio_path)

    # Transcription
    result = whisper_model.transcribe(audio_path)
    original_text = result["text"]
    print(f"📝 Transcription originale : {original_text}")

    # Traduction
    translated_text = GoogleTranslator(source='auto', target=target_lang).translate(original_text)
    print(f"🌐 Texte traduit : {translated_text}")

    # Génération audio traduit
    tts = gTTS(translated_text, lang=target_lang)
    translated_audio_path = os.path.join(tempfile.gettempdir(), "translated_audio.mp3")
    tts.save(translated_audio_path)

    # Remplacer audio dans la vidéo
    translated_clip = clip.set_audio(AudioFileClip(translated_audio_path))
    output_path = input_path.replace(".mp4", f"_translated_{target_lang}.mp4")
    translated_clip.write_videofile(output_path, codec="libx264", audio_codec="aac")
    clip.close()
    translated_clip.close()

    print(f"🎬 Fichier traduit : {output_path}")
    return output_path

def upload_to_supabase(file_path: str, file_name: str) -> str:
    """Upload la vidéo traduite sur Supabase et retourne l'URL publique"""
    bucket_name = "translated_videos"

    with open(file_path, "rb") as f:
        data = f.read()

    # upload renvoie Response
    response = supabase.storage.from_(bucket_name).upload(file_name, data, {"content-type": "video/mp4"})
    if response.status_code not in [200, 201, 204]:
        raise Exception(f"Erreur upload Supabase : {response.text}")

    # get_public_url v2 retourne un dict avec 'public_url'
    public_url = supabase.storage.from_(bucket_name).get_public_url(file_name)
    if isinstance(public_url, dict) and "public_url" in public_url:
        return public_url["public_url"]
    elif isinstance(public_url, str):
        return public_url
    else:
        raise Exception("Impossible de récupérer l'URL publique de la vidéo traduite.")
