# retranslate.py
import os
from supabase import create_client
from datetime import datetime
from video_translator import process_video

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("❌ Variables Supabase manquantes")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def retranslate_video(video_id: str, target_lang: str, translation_mode: str):
    """
    Retraduit une vidéo existante selon la nouvelle langue ou mode.
    Met à jour la ligne correspondante dans la table 'videos'.
    """

    # 🔹 Récupérer la vidéo depuis Supabase
    result = supabase.table("videos").select("*").eq("id", video_id).single().execute()
    video = result.data  # ✅ Contient la ligne si trouvée

    if not video:
        raise Exception("Vidéo introuvable")

    original_url = video.get("original_url")
    title = video.get("title")
    user_id = video.get("user_id")

    if not original_url:
        raise Exception("URL originale introuvable pour cette vidéo")

    # 🔹 Lancer la retraduction
    process_result = process_video(
        original_url=original_url,
        target_lang=target_lang,
        translation_mode=translation_mode,
        user_id=user_id,
        title=title
    )

    # 🔹 Préparer les données à mettre à jour
    update_data = {
        "translated_url": process_result.get("translated_url"),
        "thumbnail_url": process_result.get("thumbnail_url"),
        "target_lang": target_lang,
        "translation_mode": translation_mode,
    }

    # Vérifier si la colonne updated_at existe dans la table
    try:
        update_data["updated_at"] = datetime.utcnow().isoformat()
    except Exception:
        # Si la colonne n'existe pas, on ignore
        pass

    # 🔹 Mettre à jour la vidéo
    supabase.table("videos").update(update_data).eq("id", video_id).execute()

    return process_result
