# Video Translator

A mobile application that automatically translates video content by transcribing audio, translating text, generating new audio or subtitles, and producing a translated video output.

## Description

Video Translator is a full-stack mobile application that enables users to translate videos into different languages with two translation modes:
- **Voice Mode**: Replaces the original audio with AI-generated speech in the target language
- **Subtitle Mode**: Adds translated subtitles overlaid on the original video with audio preserved

The app extracts audio from videos, transcribes speech to text using Whisper AI, translates the text using Deep Translator (Google Translator), generates new audio with gTTS (Google Text-to-Speech) or creates subtitle overlays, and combines everything using MoviePy. All processed files are stored securely in Supabase with support for re-translation to different languages.

## Technologies

### Frontend
- **Expo** - React Native framework for cross-platform mobile development
- **Tamagui** - Universal UI kit for React Native and web
- **React Native** - Mobile app framework
- **@supabase/supabase-js** - Supabase client for authentication and storage
- **Expo Router** - File-based routing for React Native

### Backend
- **Flask** - Python web framework for REST API
- **Flask-CORS** - Cross-Origin Resource Sharing support
- **Whisper** - OpenAI's speech recognition model for transcription
- **Deep Translator** - Translation service with Google Translator backend
- **gTTS** - Google Text-to-Speech for audio generation
- **MoviePy** - Video editing and processing library
- **Pillow** - Image processing for subtitle generation
- **arabic-reshaper & python-bidi** - Arabic text support for subtitles

### Storage & Database
- **Supabase** - Backend-as-a-Service for file storage, database, and authentication

## Architecture

```
┌─────────────────────┐
│   Mobile App        │
│   (Expo + Tamagui)  │
│   - Video Upload    │
│   - Language Select │
│   - Mode Selection  │
└──────────┬──────────┘
           │
           │ HTTP/REST API
           │
┌──────────▼──────────┐
│   Flask Backend     │
│   - /translate      │
│   - /retranslate    │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼────┐   ┌───▼────────┐
│Whisper │   │Deep        │
│  AI    │   │Translator  │
│(Audio→ │   │(Text→Text) │
│ Text)  │   └───┬────────┘
└───┬────┘       │
    │            │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │  gTTS      │
    │ (Text→     │
    │  Audio)    │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │  MoviePy   │
    │ (Video +   │
    │  Audio/    │
    │  Subtitle) │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │ Supabase   │
    │ - Storage  │
    │ - Database │
    │ - Auth     │
    └────────────┘
```

## Features

- 🎥 **Video Upload** - Upload videos from mobile device or provide Supabase URL
- 🎤 **Audio Transcription** - Automatic speech-to-text using Whisper AI (base model)
- 🌍 **Multi-language Translation** - Translate to multiple languages via Deep Translator
- 🔊 **Voice Translation Mode** - Generate natural-sounding audio in target language and replace original audio
- 📝 **Subtitle Translation Mode** - Add translated subtitles with customizable styling and Arabic text support
- 🔄 **Re-translation** - Re-translate existing videos to different languages without re-uploading
- 🖼️ **Thumbnail Generation** - Automatic thumbnail creation from video frames
- ☁️ **Cloud Storage** - Secure file storage and retrieval with Supabase
- 👤 **User Management** - User authentication and video history tracking
- 📱 **Cross-platform** - Works on iOS and Android

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn
- pip (Python package manager)
- Supabase account with project created
- FFmpeg installed on system (required by MoviePy)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/Imr2DS/video_translator.git
cd video_translator

# Navigate to frontend directory
cd frontend_tamagui

# Install dependencies
npm install
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies from requirements.txt
pip install -r requirements.txt
```

### Font Setup (for Arabic subtitles)

Ensure the Arabic font is available:
```bash
# The font should be located at:
backend/fonts/Amiri-Regular.ttf
```

## Run Instructions

### Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run Flask server
python app.py
```

The backend server will start on `http://0.0.0.0:5000`

### Start Frontend App

```bash
# Navigate to frontend directory
cd frontend_tamagui

# Start Expo development server
npx expo start

# Options:
# - Press 'i' for iOS simulator
# - Press 'a' for Android emulator
# - Scan QR code with Expo Go app on physical device
```

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_BUCKET=translated_videos
```

**Important**: 
- Use `SUPABASE_SERVICE_ROLE_KEY` for backend operations (has full access)
- Never expose service role key in frontend code
- Create buckets in Supabase: `translated_videos` and `thumbnails`

### Frontend (.env)

Create a `.env` file in the `frontend_tamagui` directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000

# Supabase Configuration (for client-side auth)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
video_translator/
├── frontend_tamagui/          # Expo + Tamagui mobile app
│   ├── app/                   # App screens (Expo Router)
│   │   ├── index.tsx         # Landing/Login screen
│   │   ├── home.tsx          # Home screen
│   │   ├── traduire.tsx      # Translation screen
│   │   ├── videos.tsx        # Video list screen
│   │   ├── videoDetail.tsx   # Video detail screen
│   │   ├── modifierVideo.tsx # Re-translation screen
│   │   └── profile.tsx       # User profile
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── VideoPlayer.tsx
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/                  # Libraries
│   │   └── supabase.ts       # Supabase client
│   ├── constants/            # App constants
│   │   ├── languages.ts      # Language definitions
│   │   └── theme.ts          # Theme configuration
│   └── package.json
├── backend/                   # Flask API server
│   ├── app.py                # Main Flask application
│   ├── video_translator.py   # Core translation logic
│   ├── retranslate.py        # Re-translation logic
│   ├── fonts/                # Font files for subtitles
│   │   └── Amiri-Regular.ttf # Arabic font
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables
└── README.md
```

## API Endpoints

### POST /translate
Translate a new video

**Request:**
- `video` (file): Video file to upload (optional if `original_url` provided)
- `original_url` (string): Supabase URL of existing video (optional)
- `target_lang` (string): Target language code (e.g., "fr", "ar", "en")
- `translation_mode` (string): "voice" or "subtitle"
- `user_id` (string): User identifier
- `title` (string): Video title

**Response:**
```json
{
  "translation_mode": "voice",
  "translated_url": "https://supabase.co/storage/...",
  "thumbnail_url": "https://supabase.co/storage/..."
}
```

### POST /retranslate
Re-translate an existing video to a different language

**Request (JSON):**
```json
{
  "video_id": "uuid-of-video",
  "target_lang": "ar",
  "translation_mode": "subtitle"
}
```

**Response:**
```json
{
  "translation_mode": "subtitle",
  "translated_url": "https://supabase.co/storage/...",
  "thumbnail_url": "https://supabase.co/storage/..."
}
```

## Database Schema

### videos table
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  original_url TEXT,
  translated_url TEXT NOT NULL,
  thumbnail_url TEXT,
  target_lang TEXT NOT NULL,
  translation_mode TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

## Supported Languages

The app supports translation to multiple languages including:
- French (fr)
- Arabic (ar)
- English (en)
- Spanish (es)
- German (de)
- Italian (it)
- Portuguese (pt)
- And many more...

See `frontend_tamagui/constants/languages.ts` for the complete list.

## Author

**Imr2DS**
- GitHub: [@Imr2DS](https://github.com/Imr2DS)
- Repository: [video_translator](https://github.com/Imr2DS/video_translator)

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI Whisper for speech recognition
- Deep Translator for translation services
- gTTS for text-to-speech generation
- MoviePy for video processing
- Supabase for backend infrastructure
- Tamagui for beautiful UI components
- Expo for cross-platform development
