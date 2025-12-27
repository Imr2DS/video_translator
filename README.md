# Video Translator

A mobile application that automatically translates video content by transcribing audio, translating text, generating new audio, and producing a translated video output.

## Description

Video Translator is a full-stack mobile application that enables users to translate videos into different languages. The app extracts audio from videos, transcribes speech to text using Whisper AI, translates the text using Google Translator, generates new audio with gTTS (Google Text-to-Speech), and combines it with the original video using MoviePy. All processed files are stored securely in Supabase.

## Technologies

### Frontend
- **Expo** - React Native framework for cross-platform mobile development
- **Tamagui** - Universal UI kit for React Native and web
- **React Native** - Mobile app framework

### Backend
- **Flask** - Python web framework for REST API
- **Whisper** - OpenAI's speech recognition model for transcription
- **GoogleTranslator** - Translation service for multi-language support
- **gTTS** - Google Text-to-Speech for audio generation
- **MoviePy** - Video editing and processing library

### Storage & Database
- **Supabase** - Backend-as-a-Service for file storage and database

## Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (Expo +        │
│   Tamagui)      │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│  Flask API      │
│  Backend        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼────┐
│Whisper│  │Google │
│  AI   │  │Trans. │
└───┬───┘  └──┬────┘
    │         │
    └────┬────┘
         │
    ┌────▼────┐
    │  gTTS   │
    └────┬────┘
         │
    ┌────▼────┐
    │ MoviePy │
    └────┬────┘
         │
    ┌────▼────┐
    │Supabase │
    │ Storage │
    └─────────┘
```

## Features

- 🎥 **Video Upload** - Upload videos directly from mobile device
- 🎤 **Audio Transcription** - Automatic speech-to-text using Whisper AI
- 🌍 **Multi-language Translation** - Translate to multiple languages via Google Translator
- 🔊 **Text-to-Speech** - Generate natural-sounding audio in target language
- 🎬 **Video Processing** - Combine translated audio with original video
- ☁️ **Cloud Storage** - Secure file storage and retrieval with Supabase
- 📱 **Cross-platform** - Works on iOS and Android

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Expo CLI
- pip (Python package manager)
- Supabase account

### Frontend Setup

```bash
# Clone the repository
git clone <repository-url>
cd video_translator

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g expo-cli
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

The backend server will start on `http://localhost:5000`

### Start Mobile App

```bash
# Navigate to mobile app directory
cd mobile

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
# Flask Configuration
FLASK_ENV=development
FLASK_APP=app.py
SECRET_KEY=your-secret-key-here

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key

# Optional: Whisper Model Configuration
WHISPER_MODEL=base  # Options: tiny, base, small, medium, large
```

### Frontend (.env)

Create a `.env` file in the `mobile` directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000

# Supabase Configuration (for direct client access if needed)
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
video-translator/
├── mobile/                 # Expo + Tamagui mobile app
│   ├── app/               # App screens and navigation
│   ├── components/        # Reusable UI components
│   ├── services/          # API service layer
│   └── package.json
├── backend/               # Flask API server
│   ├── app.py            # Main Flask application
│   ├── services/         # Business logic (transcription, translation, etc.)
│   ├── utils/            # Helper functions
│   └── requirements.txt
└── README.md
```

## API Endpoints

- `POST /api/upload` - Upload video file
- `POST /api/transcribe` - Transcribe video audio
- `POST /api/translate` - Translate transcribed text
- `POST /api/generate-audio` - Generate TTS audio
- `POST /api/process-video` - Combine audio with video
- `GET /api/video/:id` - Retrieve processed video

## Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI Whisper for speech recognition
- Google Translate API for translation services
- gTTS for text-to-speech generation
- Supabase for backend infrastructure
