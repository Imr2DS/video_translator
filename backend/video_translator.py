import os
import uuid
import tempfile
import re
from datetime import datetime
import textwrap
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeVideoClip, ImageClip
from PIL import Image, ImageDraw, ImageFont
from gtts import gTTS
from deep_translator import GoogleTranslator
import whisper

# 🔹 Arabic support
import arabic_reshaper
from bidi.algorithm import get_display

# ───────────────────
# Initialisation
# ───────────────────
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("❌ Variables Supabase manquantes")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

whisper_model = whisper.load_model("base")

# ✅ Police arabe lisible
FONT_PATH = os.path.join("fonts", "Amiri-Regular.ttf")

# ───────────────────
# Utils
# ───────────────────
def sanitize_filename(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_\-\.]", "_", name)

def download_video(url: str) -> str:
    r = requests.get(url, stream=True)
    if r.status_code != 200:
        raise Exception("Téléchargement vidéo impossible")

    path = os.path.join(
        tempfile.gettempdir(), f"video_{uuid.uuid4().hex}.mp4"
    )
    with open(path, "wb") as f:
        for chunk in r.iter_content(8192):
            f.write(chunk)
    return path

def upload_to_supabase(file_path: str, bucket: str) -> str:
    filename = sanitize_filename(os.path.basename(file_path))
    with open(file_path, "rb") as f:
        supabase.storage.from_(bucket).upload(
            filename, f.read(), {"upsert": "true"}
        )
    return supabase.storage.from_(bucket).get_public_url(filename)

def fix_arabic_text(text: str) -> str:
    reshaped = arabic_reshaper.reshape(text)
    return get_display(reshaped)

# ───────────────────
# Subtitle creation
# ───────────────────
def create_subtitle_image(text: str, video_width: int, lang: str) -> str:
    base_font_size = 40
    padding = 24
    max_width = int(video_width * 0.9)

    try:
        font = ImageFont.truetype(FONT_PATH, base_font_size)
    except:
        font = ImageFont.load_default()

    if lang == "ar":
        text = fix_arabic_text(text)

    # Auto wrap long text
    temp_img = Image.new("RGBA", (10, 10))
    draw = ImageDraw.Draw(temp_img)

    while True:
        wrapped = textwrap.fill(text, width=40)
        bbox = draw.textbbox((0, 0), wrapped, font=font)
        if bbox[2] - bbox[0] + padding * 2 <= max_width or base_font_size <= 12:
            break
        base_font_size -= 2
        font = ImageFont.truetype(FONT_PATH, base_font_size)

    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    img_w = min(text_w + padding * 2, max_width)
    img_h = text_h + padding * 2

    img = Image.new("RGBA", (img_w, img_h), (0, 0, 0, 200))
    draw = ImageDraw.Draw(img)

    x = (img_w - text_w) // 2
    y = (img_h - text_h) // 2

    draw.text((x, y), wrapped, fill="white", font=font)

    path = os.path.join(
        tempfile.gettempdir(), f"sub_{uuid.uuid4().hex}.png"
    )
    img.save(path)
    return path

def create_subtitled_video(clip, segments, target_lang):
    subtitle_clips = []
    translator = GoogleTranslator(source="auto", target=target_lang)

    for seg in segments:
        text = seg["text"].strip()
        if not text:
            continue

        try:
            translated = translator.translate(text)
        except Exception as e:
            print(f"⚠️ Traduction échouée pour segment: {e}")
            translated = text

        img_path = create_subtitle_image(translated, clip.w, target_lang)

        sub = (
            ImageClip(img_path)
            .set_start(seg["start"])
            .set_end(seg["end"])
            .set_position(("center", clip.h - 80))
        )
        subtitle_clips.append(sub)

    return CompositeVideoClip([clip] + subtitle_clips)

def generate_thumbnail(video_path: str) -> str:
    clip = VideoFileClip(video_path)
    path = os.path.join(
        tempfile.gettempdir(), f"thumb_{uuid.uuid4().hex}.jpg"
    )
    clip.save_frame(path, t=0.5)
    clip.close()
    return path

# ───────────────────
# Main video processing
# ───────────────────
def process_video(
    original_url=None,
    input_path=None,
    target_lang="fr",
    translation_mode="voice",
    user_id="anonymous",
    title="video"
):
    print(f"🎬 Mode={translation_mode} | Lang={target_lang} | User={user_id}")

    if original_url:
        input_path = download_video(original_url)

    if not input_path or not os.path.exists(input_path):
        raise Exception("Vidéo introuvable")

    clip = VideoFileClip(input_path)

    audio_path = os.path.join(
        tempfile.gettempdir(), f"audio_{uuid.uuid4().hex}.wav"
    )
    clip.audio.write_audiofile(audio_path, logger=None)

    transcription = whisper_model.transcribe(audio_path)
    segments = transcription["segments"]
    full_text = transcription["text"]

    if translation_mode == "subtitle":
        final_clip = create_subtitled_video(clip, segments, target_lang)
        out = os.path.join(
            tempfile.gettempdir(), f"{uuid.uuid4().hex}_sub.mp4"
        )

        final_clip.write_videofile(out, codec="libx264", audio_codec="aac")

        url = upload_to_supabase(out, "translated_videos")
        thumb = upload_to_supabase(
            generate_thumbnail(out), "thumbnails"
        )

        supabase.table("videos").insert({
            "user_id": user_id,
            "title": title,
            "original_url": original_url or "",
            "translated_url": url,
            "thumbnail_url": thumb,
            "target_lang": target_lang,
            "translation_mode": "subtitle",
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        clip.close()
        final_clip.close()

        return {
            "translation_mode": "subtitle",
            "translated_url": url,
            "thumbnail_url": thumb
        }

    # Voice mode
    try:
        translated = GoogleTranslator(
            source="auto", target=target_lang
        ).translate(full_text)
    except Exception as e:
        print(f"⚠️ Traduction échouée, on garde texte original: {e}")
        translated = full_text

    tts_path = os.path.join(
        tempfile.gettempdir(), f"tts_{uuid.uuid4().hex}.mp3"
    )
    gTTS(translated, lang=target_lang).save(tts_path)

    voice_clip = clip.set_audio(AudioFileClip(tts_path))
    out = os.path.join(
        tempfile.gettempdir(), f"{uuid.uuid4().hex}_voice.mp4"
    )

    voice_clip.write_videofile(out, codec="libx264", audio_codec="aac")

    url = upload_to_supabase(out, "translated_videos")
    thumb = upload_to_supabase(
        generate_thumbnail(out), "thumbnails"
    )

    supabase.table("videos").insert({
        "user_id": user_id,
        "title": title,
        "original_url": original_url or "",
        "translated_url": url,
        "thumbnail_url": thumb,
        "target_lang": target_lang,
        "translation_mode": "voice",
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    clip.close()
    voice_clip.close()

    return {
        "translation_mode": "voice",
        "translated_url": url,
        "thumbnail_url": thumb
    }
